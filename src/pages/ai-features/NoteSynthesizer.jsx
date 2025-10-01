import React, { useRef, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useLoaderTask } from '../../contexts/LoaderContext';
import * as pdfjsLib from 'pdfjs-dist/webpack';

function NoteSynthesizer() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [synthesizedNotes, setSynthesizedNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const runWithLoader = useLoaderTask();
  const fileInputRef = useRef(null);

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
      const extracted = await runWithLoader(async () => extractTextFromPDF(file));
      if (!extracted) {
        throw new Error('No readable text found in the PDF.');
      }

      setNotes(prev => {
        const prefix = prev.trim() ? `${prev.trim()}\n\n` : '';
        return `${prefix}${extracted}`;
      });

      setSynthesizedNotes('');
    } catch (error) {
      console.error('PDF extraction failed:', error);
      setPdfError(error.message || 'Failed to extract text from the PDF. Please try another file.');
      setUploadedFileName('');
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSynthesize = async () => {
    if (!notes.trim()) return;
    
    setIsLoading(true);
    try {
      await runWithLoader(async () => new Promise((resolve) => {
        setTimeout(() => {
          setSynthesizedNotes(
            'Synthesized Notes Summary\n\n' +
            'Key Points:\n' +
            '• Main concepts extracted from your notes\n' +
            '• Important details highlighted\n' +
            '• Structured format for better understanding\n\n' +
            'Quick Review:\n' +
            '• Bullet points for easy scanning\n' +
            '• Connections between topics identified\n' +
            '• Action items highlighted\n\n' +
            'Study Tips:\n' +
            '• Focus areas identified\n' +
            '• Memory techniques suggested\n' +
            '• Review schedule recommended'
          );
          resolve();
        }, 2000);
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    navigate('/login');
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
          <h1 className="feature-title">Note Synthesizer</h1>
          <p className="feature-description">
            Transform your scattered notes into organized, structured summaries using AI
          </p>
        </div>

        <div className="synthesizer-workspace">
          <div className="input-section">
            <h3>Your Notes</h3>
            <label className="pdf-upload">
              <span className="pdf-upload__label">Upload a PDF to auto-fill notes</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                ref={fileInputRef}
                disabled={isExtracting || isLoading}
              />
            </label>
            {uploadedFileName && !pdfError && (
              <p className="pdf-upload__status">Loaded: {uploadedFileName}</p>
            )}
            {pdfError && (
              <p className="pdf-upload__error">{pdfError}</p>
            )}
            <textarea
              className="notes-input"
              placeholder="Paste your notes here... The AI will help organize and synthesize them into a structured format."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={12}
            />
            <button 
              className={`synthesize-btn ${!notes.trim() ? 'disabled' : ''}`}
              onClick={handleSynthesize}
              disabled={!notes.trim() || isLoading || isExtracting}
            >
              {isLoading ? 'Synthesizing...' : 'Synthesize Notes'}
            </button>
            {isExtracting && (
              <div className="pdf-upload__progress">
                <div className="loading-spinner"></div>
                <span>Extracting text from PDF...</span>
              </div>
            )}
          </div>

          <div className="output-section">
            <h3>Synthesized Output</h3>
            <div className="notes-output">
              {isLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>AI is analyzing and organizing your notes...</p>
                </div>
              ) : synthesizedNotes ? (
                <pre className="synthesized-content">{synthesizedNotes}</pre>
              ) : (
                <div className="empty-state">
                  <p>Your synthesized notes will appear here</p>
                  <p>Add some notes and click "Synthesize Notes" to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoteSynthesizer;