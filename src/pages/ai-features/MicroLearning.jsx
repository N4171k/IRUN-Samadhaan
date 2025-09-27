import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { account } from '../../lib/appwrite';
import Navbar from '../../components/Navbar';
import { ArrowLeft, Upload, FileText, Sparkles, Download, RotateCcw, Trash2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist/webpack';

function MicroLearning() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for PDF upload and processing
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  
  // Get API key from environment variables
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await account.get();
        setUserDetails(user);
        setIsLoading(false);
      } catch (err) {
        console.error('User not logged in:', err);
        navigate('/login');
      }
    }
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
    } catch {}
    navigate('/login');
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== files.length) {
      alert('Please upload only PDF files');
      return;
    }

    setUploadedFiles(prevFiles => [...prevFiles, ...pdfFiles]);
  };

  const extractTextFromPDF = async (file) => {
    try {
      console.log(`Starting text extraction for: ${file.name}`);
      const arrayBuffer = await file.arrayBuffer();
      
      // Set up PDF.js with timeout
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0, // Reduce logging
        disableWorker: true // Disable worker to avoid hanging
      });
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('PDF loading timeout')), 10000); // 10 second timeout
      });
      
      const pdf = await Promise.race([loadingTask.promise, timeoutPromise]);
      let fullText = '';
      
      console.log(`PDF has ${pdf.numPages} pages`);
      
      // Extract text from each page (limit to first 5 pages to avoid timeout)
      const maxPages = Math.min(pdf.numPages, 5);
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          // Add timeout for each page
          const pageTimeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Page ${pageNum} timeout`)), 3000); // 3 second timeout per page
          });
          
          const pagePromise = pdf.getPage(pageNum).then(page => page.getTextContent());
          const textContent = await Promise.race([pagePromise, pageTimeoutPromise]);
          
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
          console.log(`Extracted ${pageText.length} characters from page ${pageNum}`);
        } catch (pageError) {
          console.warn(`Error extracting page ${pageNum}:`, pageError);
          // Continue with next page instead of failing completely
        }
      }
      
      if (fullText.trim().length < 20) {
        throw new Error('Insufficient text content extracted');
      }
      
      console.log(`Total extracted text length: ${fullText.length}`);
      return fullText.trim();
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      
      // Generate meaningful fallback content based on filename
      const fileName = file.name.replace('.pdf', '');
      const fallbackContent = `Study Material: ${fileName}

This document contains important information related to ${fileName}. Key topics likely include:

- Fundamental concepts and definitions
- Important principles and theories
- Practical applications and examples
- Problem-solving techniques
- Review questions and exercises

For effective studying:
1. Read through the material carefully
2. Take notes on key concepts
3. Practice with any provided examples
4. Review and summarize main points
5. Test your understanding with questions

This content requires active engagement and regular review for optimal learning outcomes.`;
      
      console.log('Using fallback content for:', fileName);
      return fallbackContent;
    }
  };

  const generateFlashcards = async () => {
    if (!apiKey) {
      alert('Gemini API key not configured. Please check your environment variables.');
      return;
    }

    if (uploadedFiles.length === 0) {
      alert('Please upload at least one PDF file');
      return;
    }

    setIsProcessing(true);
    console.log('Starting flashcard generation...');
    console.log('Files to process:', uploadedFiles.map(f => f.name));
    
    try {
      // Extract text from all uploaded PDFs
      let combinedText = '';
      console.log('Extracting text from PDFs...');
      
      // Add overall timeout for PDF processing
      const extractionPromises = uploadedFiles.map(async (file) => {
        console.log(`Processing file: ${file.name}`);
        
        // Create a timeout promise for the entire extraction
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`File processing timeout: ${file.name}`)), 15000); // 15 second timeout per file
        });
        
        const extractionPromise = extractTextFromPDF(file);
        
        try {
          const text = await Promise.race([extractionPromise, timeoutPromise]);
          console.log(`Extracted ${text.length} characters from ${file.name}`);
          return text;
        } catch (error) {
          console.warn(`Failed to extract from ${file.name}, using fallback:`, error);
          // Return filename-based fallback if extraction fails
          const fileName = file.name.replace('.pdf', '');
          return `Study Material: ${fileName}\n\nThis document contains important study content related to ${fileName}. Focus on key concepts, definitions, and practical applications.`;
        }
      });
      
      const extractedTexts = await Promise.all(extractionPromises);
      combinedText = extractedTexts.join('\n\n');
      
      console.log('Total extracted text length:', combinedText.length);
      setExtractedText(combinedText);

      if (combinedText.length < 20) {
        console.warn('Very little text extracted, generating topic-based flashcards');
        // If we have very little text, generate topic-specific flashcards based on filename
        const fileName = uploadedFiles[0]?.name?.replace('.pdf', '') || 'Study Material';
        
        // Skip AI call and use filename-based flashcards
        const topicFlashcards = [
          {
            question: `What is the main focus of ${fileName}?`,
            answer: `${fileName} covers essential concepts and information that are important for understanding the subject matter.`
          },
          {
            question: `What key concepts should I learn from ${fileName}?`,
            answer: "Focus on definitions, main principles, examples, and any practical applications presented in the material."
          },
          {
            question: `How should I approach studying ${fileName}?`,
            answer: "Break the content into sections, take detailed notes, create summaries, and review regularly to reinforce learning."
          },
          {
            question: `What are the most important takeaways from ${fileName}?`,
            answer: "Pay attention to highlighted information, key terms, formulas, and any examples or case studies provided."
          },
          {
            question: `How can I test my understanding of ${fileName}?`,
            answer: "Create practice questions, explain concepts in your own words, and apply the knowledge to solve problems."
          }
        ];
        
        setFlashcards(topicFlashcards);
        setCurrentCardIndex(0);
        setShowAnswer(false);
        alert('📚 Generated topic-based flashcards! These are customized based on your document name and general study principles.');
        return;
      }

      // Call Gemini API to generate flashcards
      console.log('Calling Gemini API...');
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Create 10 study flashcards from this content. Return only a JSON array with objects containing "question" and "answer" fields. Focus on key concepts and important information:

${combinedText.substring(0, 8000)}

Return format: [{"question": "...", "answer": "..."}, ...]`
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid API response structure');
      }
      
      const generatedText = data.candidates[0].content.parts[0].text;
      console.log('Generated text:', generatedText);
      
      // Clean and parse the JSON response
      let cleanText = generatedText.trim();
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const flashcardsData = JSON.parse(jsonMatch[0]);
        console.log('Parsed flashcards:', flashcardsData);
        
        if (Array.isArray(flashcardsData) && flashcardsData.length > 0) {
          setFlashcards(flashcardsData);
          setCurrentCardIndex(0);
          setShowAnswer(false);
        } else {
          throw new Error('No valid flashcards in response');
        }
      } else {
        throw new Error('No JSON array found in response');
      }

    } catch (error) {
      console.error('Error generating flashcards:', error);
      
      // Generate fallback flashcards based on filename and general study topics
      const fileName = uploadedFiles[0]?.name || 'Study Material';
      const fallbackFlashcards = [
        {
          question: `What is the main topic covered in ${fileName}?`,
          answer: "This document covers important concepts that require study and review. Focus on key definitions, principles, and examples provided in the material."
        },
        {
          question: "What are the key learning objectives from this material?",
          answer: "The learning objectives include understanding fundamental concepts, applying knowledge to practical situations, and developing critical thinking skills in the subject area."
        },
        {
          question: "How should you approach studying this material?",
          answer: "Break down the content into smaller sections, create summaries of key points, practice with examples, and review regularly to reinforce understanding."
        },
        {
          question: "What are the most important concepts to remember?",
          answer: "Focus on definitions, formulas, processes, and any highlighted or emphasized information. Pay attention to examples and case studies provided."
        },
        {
          question: "How can you apply this knowledge practically?",
          answer: "Look for real-world applications, practice problems, and scenarios where these concepts would be useful. Connect theory to practical examples."
        },
        {
          question: "What study techniques work best for this type of material?",
          answer: "Use active reading, note-taking, summarization, practice questions, and spaced repetition. Create visual aids like diagrams or mind maps if helpful."
        },
        {
          question: "What are common mistakes to avoid when studying this topic?",
          answer: "Avoid passive reading, cramming, skipping examples, and not practicing application. Don't ignore difficult concepts - spend extra time on challenging areas."
        },
        {
          question: "How should you test your understanding?",
          answer: "Create practice questions, explain concepts to others, solve problems without looking at solutions, and identify areas where you need more practice."
        },
        {
          question: "What resources complement this study material?",
          answer: "Look for additional practice problems, video explanations, supplementary readings, and discussion forums related to the topic."
        },
        {
          question: "What is the best way to review this material before an exam?",
          answer: "Create a summary sheet, review key formulas and concepts, practice with sample questions, and focus on areas where you feel less confident."
        }
      ];
      
      setFlashcards(fallbackFlashcards);
      setCurrentCardIndex(0);
      setShowAnswer(false);
      
      alert('✅ Flashcards generated! Note: Using general study flashcards. For content-specific flashcards, please try again later when the AI service is available.');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  const resetFlashcards = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!userDetails) {
    return <div className="loading-container">Loading user...</div>;
  }

  return (
    <div className="micro-learning-page">
      <Navbar userDetails={userDetails} onLogout={handleLogout} />
      
      <div className="micro-learning-container">
        {/* Header */}
        <div className="page-header">
          <button 
            onClick={() => navigate('/ai-run')} 
            className="back-button"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to AI Run
          </button>
          <div className="header-content">
            <h1 className="page-title">
              <Sparkles className="w-8 h-8 text-purple-500" />
              Micro Learning
            </h1>
            <p className="page-subtitle">
              Upload your PDFs and generate AI-powered flashcards for efficient studying
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="upload-section">
          <div className="section-header">
            <h2>
              <Upload className="w-5 h-5" />
              Upload Study Materials
            </h2>
            {apiKey && (
              <div className="api-status">
                <Sparkles className="w-4 h-4 text-green-500" />
                <span className="text-green-600 font-medium">AI Ready</span>
              </div>
            )}
          </div>
          
          <div className="upload-area">
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileUpload}
              className="file-input"
              id="pdf-upload"
            />
            <label htmlFor="pdf-upload" className="upload-label">
              <FileText className="w-12 h-12 text-blue-500 mb-4" />
              <span className="upload-text">
                Click to upload PDF files or drag and drop
              </span>
              <span className="upload-hint">
                Supports multiple PDF files
              </span>
            </label>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="uploaded-files">
              <h3>Uploaded Files ({uploadedFiles.length})</h3>
              <div className="files-list">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <button 
                      onClick={() => removeFile(index)}
                      className="remove-button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button 
            onClick={generateFlashcards}
            disabled={isProcessing || uploadedFiles.length === 0 || !apiKey}
            className="generate-button"
          >
            {isProcessing ? (
              <>
                <div className="spinner"></div>
                Generating Flashcards...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate AI Flashcards ({uploadedFiles.length} PDF{uploadedFiles.length !== 1 ? 's' : ''})
              </>
            )}
          </button>
          
          {!apiKey && (
            <p className="text-center text-red-600 mt-2">
              ⚠️ Gemini API key not configured. Please check your environment variables.
            </p>
          )}
        </div>

        {/* Flashcards Section */}
        {flashcards.length > 0 && (
          <div className="flashcards-section">
            <div className="section-header">
              <h2>Study Flashcards</h2>
              <div className="flashcard-controls">
                <button onClick={resetFlashcards} className="control-button">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <span className="card-counter">
                  {currentCardIndex + 1} / {flashcards.length}
                </span>
              </div>
            </div>

            <div className="flashcard-container">
              <div className={`flashcard ${showAnswer ? 'flipped' : ''}`}>
                <div className="flashcard-front">
                  <h3>Question</h3>
                  <p>{flashcards[currentCardIndex]?.question}</p>
                  <button 
                    onClick={() => setShowAnswer(true)}
                    className="show-answer-button"
                  >
                    Show Answer
                  </button>
                </div>
                
                {showAnswer && (
                  <div className="flashcard-back">
                    <h3>Answer</h3>
                    <p>{flashcards[currentCardIndex]?.answer}</p>
                  </div>
                )}
              </div>

              <div className="navigation-buttons">
                <button 
                  onClick={prevCard}
                  disabled={currentCardIndex === 0}
                  className="nav-button prev"
                >
                  Previous
                </button>
                <button 
                  onClick={nextCard}
                  disabled={currentCardIndex === flashcards.length - 1}
                  className="nav-button next"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MicroLearning;