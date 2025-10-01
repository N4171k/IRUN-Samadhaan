import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useLoaderTask } from '../../contexts/LoaderContext';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { jsPDF } from 'jspdf';

const MAX_EXTRACT_PAGES = 12;
const PREVIEW_CHAR_LIMIT = 1100;
const WORDS_PER_MINUTE = 200;

function NoteSynthesizer() {
  const navigate = useNavigate();
  const runWithLoader = useLoaderTask();
  const fileInputRef = useRef(null);

  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [extractedPreview, setExtractedPreview] = useState('');
  const [extractedLength, setExtractedLength] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [extractedStats, setExtractedStats] = useState({
    processedPages: 0,
    totalPages: 0,
    words: 0,
    minutes: 0
  });

  const numberFormatter = useMemo(() => new Intl.NumberFormat(), []);

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

  useEffect(() => {
    if (!statusMessage) {
      return undefined;
    }

    const timeout = setTimeout(() => setStatusMessage(''), 4000);
    return () => clearTimeout(timeout);
  }, [statusMessage]);

  const extractTextFromPDF = useCallback(async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer, disableWorker: true, verbosity: 0 });
    const pdf = await loadingTask.promise;

    const totalPages = pdf.numPages;
    const processedPages = Math.min(totalPages, MAX_EXTRACT_PAGES);
    let combinedText = '';

    for (let pageNumber = 1; pageNumber <= processedPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str || '').join(' ');
      combinedText += `${pageText.trim()}\n\n`;
    }

    return {
      text: combinedText.trim(),
      processedPages,
      totalPages
    };
  }, []);

  const summariseText = useCallback(async (text) => {
    if (!text.trim()) {
      throw new Error('Nothing to summarise. The PDF appears to be empty.');
    }

    if (!apiKey) {
      const excerpt = text
        .slice(0, 1200)
        .split('\n')
        .filter(Boolean)
        .slice(0, 5)
        .join('\n');

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini summarisation error:', errorText);
      throw new Error('AI summarisation failed. Please try again later.');
    }

    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('Received an empty response from Gemini.');
    }

    return generatedText.trim();
  }, [apiKey]);

  const resetExtraction = useCallback(() => {
    setExtractedText('');
    setExtractedPreview('');
    setExtractedLength(0);
    setUploadedFileName('');
    setExtractedStats({ processedPages: 0, totalPages: 0, words: 0, minutes: 0 });
    setLastUpdated(null);
  }, []);

  const handleSummarise = useCallback(
    async (textOverride) => {
      const source = textOverride ?? extractedText;

      if (!source?.trim()) {
        setPdfError('Upload a PDF before requesting a summary.');
        return;
      }

      setIsSummarizing(true);
      setPdfError('');
      setStatusMessage('');

      try {
        const generatedSummary = await runWithLoader(() => summariseText(source));
        setSummary(generatedSummary);
        setLastUpdated(new Date());
        setStatusMessage('AI summary updated.');
      } catch (error) {
        console.error('Summarisation failed:', error);
        setPdfError(error.message || 'Unable to summarise the document. Please try again.');
      } finally {
        setIsSummarizing(false);
      }
    },
    [extractedText, runWithLoader, summariseText]
  );

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;

      setStatusMessage('');
      setPdfError('');
      setIsExtracting(true);
      setUploadedFileName(file.name);

      try {
        const { text, processedPages, totalPages } = await runWithLoader(() => extractTextFromPDF(file));

        if (!text.trim()) {
          throw new Error('No readable text found in the PDF.');
        }

        const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
        const readingMinutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
        const preview = text.slice(0, PREVIEW_CHAR_LIMIT);

        setExtractedText(text);
        setExtractedPreview(preview + (text.length > PREVIEW_CHAR_LIMIT ? '…' : ''));
        setExtractedLength(text.length);
        setExtractedStats({
          processedPages,
          totalPages,
          words: wordCount,
          minutes: readingMinutes
        });
        setSummary('');
        setLastUpdated(null);

        setIsExtracting(false);
        await handleSummarise(text);
      } catch (error) {
        console.error('PDF extraction failed:', error);
        setPdfError(error.message || 'Failed to extract text from the PDF. Please try another file.');
        resetExtraction();
      } finally {
        setIsExtracting(false);
        setDragActive(false);

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [extractTextFromPDF, handleSummarise, resetExtraction, runWithLoader]
  );

  const handlePdfUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setPdfError('Please upload a PDF file.');
      event.target.value = '';
      return;
    }

    await handleFile(file);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    if (isExtracting || isSummarizing) return;

    setDragActive(false);
    const file = event.dataTransfer?.files?.[0];

    if (!file) return;
    if (file.type !== 'application/pdf') {
      setStatusMessage('');
      setPdfError('Please upload a PDF file.');
      return;
    }

    await handleFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    if (isExtracting || isSummarizing) return;
    setDragActive(true);
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }
    setDragActive(false);
  };

  const handleExportPdf = () => {
    if (!summary.trim()) return;

    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const marginX = 48;
      const marginY = 64;
      const contentWidth = doc.internal.pageSize.getWidth() - marginX * 2;
      const lines = doc.splitTextToSize(summary, contentWidth);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('PDF Summary', marginX, marginY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);

      let cursorY = marginY + 28;
      const lineHeight = 18;

      lines.forEach((line) => {
        if (cursorY > doc.internal.pageSize.getHeight() - marginY) {
          doc.addPage();
          cursorY = marginY;
        }
        doc.text(line, marginX, cursorY);
        cursorY += lineHeight;
      });

      const baseName = uploadedFileName?.replace(/\.pdf$/i, '') || 'ai-summary';
      doc.save(`${baseName}-summary.pdf`);
      setPdfError('');
      setStatusMessage('Summary exported as PDF.');
    } catch (error) {
      console.error('PDF export failed:', error);
      setPdfError('Unable to export summary. Please try again.');
    }
  };

  const handleCopySummary = async () => {
    if (!summary.trim()) return;

    try {
      await navigator.clipboard.writeText(summary);
      setPdfError('');
      setStatusMessage('Summary copied to clipboard.');
    } catch (error) {
      console.error('Clipboard copy failed:', error);
      setPdfError('Clipboard access was denied. Try copying manually.');
    }
  };

  const handleReset = () => {
    setSummary('');
    setPdfError('');
    setStatusMessage('Workspace cleared.');
    resetExtraction();

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) return '';

    return lastUpdated.toLocaleString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    });
  }, [lastUpdated]);

  const hasDocument = Boolean(extractedText.trim());
  const hasSummary = Boolean(summary.trim());
  const dropDisabled = isExtracting || isSummarizing;
  const processedPagesLabel = extractedStats.processedPages
    ? `${extractedStats.processedPages}${
        extractedStats.totalPages && extractedStats.totalPages !== extractedStats.processedPages
          ? ` / ${extractedStats.totalPages}`
          : ''
      }`
    : '—';
  const wordsLabel = extractedStats.words ? numberFormatter.format(extractedStats.words) : '—';
  const readingLabel = extractedStats.minutes ? `${extractedStats.minutes} min` : '—';
  const charLabel = extractedLength ? numberFormatter.format(extractedLength) : '—';

  const handleDropZoneKeyDown = (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && !dropDisabled) {
      event.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="ai-feature-page summarizer-page">
      <Navbar userDetails={{ name: 'User' }} onLogout={handleLogout} />

      <div className="ai-feature-container summarizer-container">
        <div className="summarizer-header-card">
          <div className="summarizer-header-content">
            <span className="summarizer-pill">PDF Summarizer</span>
            <h1 className="summarizer-title">Transform dense documents into crisp, actionable study notes.</h1>
            <p className="summarizer-subtitle">
              Drag in a PDF and let Gemini craft a briefing with key insights, actions, and glossary highlights.
              We scan up to {MAX_EXTRACT_PAGES} pages to keep things swift.
            </p>
            <div className="summarizer-shortcuts">
              <button
                type="button"
                className="summary-action tertiary"
                onClick={() => navigate('/ai-run')}
              >
                ← Back to AI-Run
              </button>
              <button
                type="button"
                className="summary-action tertiary"
                onClick={handleReset}
                disabled={!hasDocument && !hasSummary && !pdfError}
              >
                Reset workspace
              </button>
            </div>
          </div>
            <div className="summarizer-header-insights">
            <div className="insight-chip">
              <span className="insight-label">Summary status</span>
              <strong className="insight-value">
                {isSummarizing ? 'Generating…' : hasSummary ? 'Ready to export' : 'Awaiting upload'}
              </strong>
            </div>
            <div className="insight-chip">
              <span className="insight-label">Last updated</span>
              <strong className="insight-value">{lastUpdatedLabel || '—'}</strong>
            </div>
            <div className="insight-chip">
              <span className="insight-label">Words parsed</span>
                <strong className="insight-value">{wordsLabel}</strong>
            </div>
          </div>
        </div>

        <div className="summarizer-grid">
          <section className="upload-panel">
            <header className="panel-header">
              <h2>Document intake</h2>
              <p>Upload a PDF or drop it below — we’ll extract clean text automatically.</p>
            </header>

            <div
              className={`upload-dropzone${dragActive ? ' is-dragging' : ''}${
                isExtracting ? ' is-loading' : ''
              }`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onKeyDown={handleDropZoneKeyDown}
              role="button"
              tabIndex={dropDisabled ? -1 : 0}
              aria-disabled={dropDisabled}
            >
              <div className="dropzone-icon" aria-hidden="true">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 16V4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 9l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 16v2.5a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 18.5V16" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="dropzone-content">
                <p className="dropzone-title">Drop your PDF here</p>
                <p className="dropzone-subtitle">
                  or
                  <button
                    type="button"
                    className="dropzone-browse"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isExtracting || isSummarizing}
                  >
                    browse files
                  </button>
                </p>
                <p className="dropzone-hint">We analyse up to {MAX_EXTRACT_PAGES} pages • Ideal for guides, reports, and lecture notes.</p>
              </div>
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                ref={fileInputRef}
                hidden
              />
            </div>

            {pdfError && <div className="error-banner">{pdfError}</div>}
            {!pdfError && statusMessage && <div className="status-banner">{statusMessage}</div>}

            {uploadedFileName && (
              <div className="document-meta">
                <div>
                  <span className="meta-label">Current document</span>
                  <strong className="meta-value">{uploadedFileName}</strong>
                </div>
                <div className="meta-stats">
                  <span>
                    {processedPagesLabel !== '—' ? `${processedPagesLabel} pages analysed` : '— pages analysed'}
                  </span>
                  <span>{charLabel !== '—' ? `${charLabel} characters` : '— characters'}</span>
                  <span>{readingLabel !== '—' ? `≈ ${readingLabel} read` : '— estimated read'}</span>
                </div>
              </div>
            )}

            <div className="insight-grid">
              <div className="insight-item">
                <span className="insight-label">Pages processed</span>
                <strong className="insight-value">{processedPagesLabel}</strong>
                <span className="insight-hint">Capped at {MAX_EXTRACT_PAGES} pages per upload</span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Words detected</span>
                <strong className="insight-value">{wordsLabel}</strong>
                <span className="insight-hint">Used to tailor summary depth</span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Estimated read time</span>
                <strong className="insight-value">{readingLabel}</strong>
                <span className="insight-hint">Based on {WORDS_PER_MINUTE} wpm</span>
              </div>
            </div>

            {extractedPreview && (
              <div className="preview-card">
                <div className="preview-header">
                  <h3>Quick text preview</h3>
                  <span>{charLabel !== '—' ? `${charLabel} characters` : ''}</span>
                </div>
                <div className="preview-scroll">
                  <pre>{extractedPreview}</pre>
                </div>
              </div>
            )}

            {isExtracting && (
              <div className="inline-progress">
                <div className="loading-spinner" />
                <span>Extracting text from the PDF…</span>
              </div>
            )}

            {!apiKey && (
              <p className="api-warning">
                ⚠️ No Gemini API key detected. Add VITE_GEMINI_API_KEY (or VITE_GEMINI_API_KEY_1-4) to enable AI-powered summaries.
              </p>
            )}
          </section>

          <section className="summary-panel">
            <header className="panel-header">
              <h2>AI summary</h2>
              <div className="summary-meta">
                {lastUpdatedLabel && <span className="summary-meta__item">Updated {lastUpdatedLabel}</span>}
                {isSummarizing && <span className="summary-meta__tag">Processing…</span>}
              </div>
            </header>

            <div className="summary-card">
              {isSummarizing ? (
                <div className="summary-placeholder">
                  <div className="loading-spinner" />
                  <p>Gemini is analysing your document…</p>
                  <p className="placeholder-hint">Hang tight while we craft executive highlights and action items.</p>
                </div>
              ) : hasSummary ? (
                <div className="summary-scroll">
                  <pre className="summary-text">{summary}</pre>
                </div>
              ) : (
                <div className="summary-placeholder">
                  <p>Your AI summary will appear here.</p>
                  <p className="placeholder-hint">Upload a PDF or drop it on the left to get a personalised briefing.</p>
                </div>
              )}
            </div>

            <div className="summary-actions">
              <button
                type="button"
                className="summary-action primary"
                onClick={() => handleSummarise()}
                disabled={isSummarizing || !hasDocument}
              >
                {isSummarizing ? 'Summarising…' : hasSummary ? 'Regenerate summary' : 'Generate summary'}
              </button>
              <button
                type="button"
                className="summary-action secondary"
                onClick={handleExportPdf}
                disabled={!hasSummary || isSummarizing}
              >
                Export summary as PDF
              </button>
              <button
                type="button"
                className="summary-action secondary"
                onClick={handleCopySummary}
                disabled={!hasSummary || isSummarizing}
              >
                Copy summary
              </button>
              <button
                type="button"
                className="summary-action tertiary"
                onClick={handleReset}
                disabled={isExtracting || isSummarizing || (!hasDocument && !hasSummary && !pdfError)}
              >
                Clear workspace
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default NoteSynthesizer;