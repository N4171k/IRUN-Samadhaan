import React, { useMemo, useRef, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useLoaderTask } from '../../contexts/LoaderContext';
import * as pdfjsLib from 'pdfjs-dist/webpack';

function NoteSynthesizer() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [extractedPreview, setExtractedPreview] = useState('');
  const [extractedLength, setExtractedLength] = useState(0);
  const runWithLoader = useLoaderTask();
  const fileInputRef = useRef(null);

  const apiKey = useMemo(
    () => [
      import.meta.env.VITE_GEMINI_API_KEY,
      import.meta.env.VITE_GEMINI_API_KEY_1,
      import.meta.env.VITE_GEMINI_API_KEY_2,
      import.meta.env.VITE_GEMINI_API_KEY_3,
      import.meta.env.VITE_GEMINI_API_KEY_4
    ].find(Boolean),
    []
  );

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer, disableWorker: true, verbosity: 0 });
    const pdf = await loadingTask.promise;

    let combinedText = '';
    const maxPages = Math.min(pdf.numPages, 8);

    for (let pageNumber = 1; pageNumber <= maxPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      combinedText += pageText + '\n\n';
    }

    return combinedText.trim();
  };

  const handlePdfUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setPdfError('Please upload a PDF file.');
      return;
    }

    setPdfError('');
    setIsExtracting(true);
    setUploadedFileName(file.name);

    try {
      const extracted = await runWithLoader(() => extractTextFromPDF(file));
      if (!extracted) {
        throw new Error('No readable text found in the PDF.');
      }

      setExtractedText(extracted);
      setExtractedPreview(extracted.slice(0, 600) + (extracted.length > 600 ? '...' : ''));
      setExtractedLength(extracted.length);
      setSummary('');
      setIsExtracting(false);
      await handleSummarise(extracted);
    } catch (error) {
      console.error('PDF extraction failed:', error);
      setPdfError(error.message || 'Failed to extract text from the PDF. Please try another file.');
      setUploadedFileName('');
      setExtractedText('');
      setExtractedPreview('');
      setExtractedLength(0);
    } finally {
  setIsExtracting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const summariseText = async (text) => {
    if (!text.trim()) {
      throw new Error('Nothing to summarise. The PDF appears to be empty.');
    }

    if (!apiKey) {
      // Fallback summary when API is unavailable
      const excerpt = text.slice(0, 1200).split('\n').filter(Boolean).slice(0, 4).join('\n');
      return [
        '⚠️ Gemini API key not configured. Showing a quick manual summary instead:',
        '',
        excerpt.length ? excerpt : 'No readable text could be extracted from the PDF.'
      ].join('\n');
    }

    const trimmedContent = text.length > 12000 ? `${text.slice(0, 12000)}...` : text;
    const prompt = `You are a professional study assistant. Carefully read the following document and produce a concise yet comprehensive summary.

Requirements:
1. Start with a two-sentence executive overview.
2. Provide 4-6 key takeaways as bullet points.
3. Highlight action items or recommendations, if any.
4. List unfamiliar terms with one-line explanations when relevant.
5. Keep the entire response under 400 words.

Document content:
"""
${trimmedContent}
"""`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('Received an empty response from Gemini.');
    }

    return generatedText.trim();
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleSummarise = async (text = extractedText) => {
    if (!text?.trim()) {
      setPdfError('Upload a PDF before requesting a summary.');
      return;
    }

    setIsSummarizing(true);
    setSummary('');
    setPdfError('');
    try {
      const generatedSummary = await runWithLoader(() => summariseText(text));
      setSummary(generatedSummary);
    } catch (error) {
      console.error(error);
      setPdfError(error.message || 'Unable to summarise the document.');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="ai-feature-page">
      <Navbar 
        userDetails={{ name: 'User' }} 
        onLogout={handleLogout}
      />
      
      <div className="ai-feature-container">
        <div className="feature-header">
          <button className="back-btn" onClick={() => navigate('/ai-run')}>
            ← Back to AI-Run
          </button>
          <h1 className="feature-title">PDF Summarizer</h1>
          <p className="feature-description">
            Upload a PDF and let AI deliver an actionable study summary in seconds.
          </p>
        </div>

        <div className="synthesizer-workspace">
          <div className="input-section">
            <h3>Upload Document</h3>
            <label className="pdf-upload">
              <span className="pdf-upload__label">Choose a PDF to summarise</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                ref={fileInputRef}
                disabled={isExtracting || isSummarizing}
              />
            </label>
            {uploadedFileName && !pdfError && (
              <p className="pdf-upload__status">Loaded: {uploadedFileName}</p>
            )}
            {pdfError && (
              <p className="pdf-upload__error">{pdfError}</p>
            )}
            {extractedPreview && (
              <div className="extracted-preview">
                <div className="extracted-preview__header">
                  <h4>Extracted preview</h4>
                  <span>{extractedLength.toLocaleString()} characters</span>
                </div>
                <p>{extractedPreview}</p>
              </div>
            )}
            {isExtracting && (
              <div className="pdf-upload__progress">
                <div className="loading-spinner"></div>
                <span>Extracting text from PDF...</span>
              </div>
            )}
            {!apiKey && (
              <p className="api-warning">
                ⚠️ No Gemini API key detected. Add VITE_GEMINI_API_KEY (or VITE_GEMINI_API_KEY_1-4) to enable AI-powered summaries.
              </p>
            )}
          </div>

          <div className="output-section">
            <h3>Summary</h3>
            <div className="notes-output">
              {isSummarizing ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>AI is digesting the document...</p>
                </div>
              ) : summary ? (
                <pre className="synthesized-content">{summary}</pre>
              ) : (
                <div className="empty-state">
                  <p>Your summary will appear here.</p>
                  <p>Upload a PDF to get started.</p>
                </div>
              )}
            </div>
            {summary && (
              <button
                className="synthesize-btn"
                onClick={() => handleSummarise()}
                disabled={isSummarizing || !extractedText}
              >
                {isSummarizing ? 'Summarising...' : 'Refresh Summary'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoteSynthesizer;