
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NELEProvider } from './contexts/NELEContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Community from './pages/Community';
import SSBDrills from './pages/SSBDrills';
import TestPrep from './pages/TestPrep';
import AIRun from './pages/AIRun';
import NoteSynthesizer from './pages/ai-features/NoteSynthesizer';
import MicroLearning from './pages/ai-features/MicroLearning';
import StudyPlanGenerator from './pages/ai-features/StudyPlanGenerator';
import EmotionAnalysis from './pages/EmotionAnalysis';
import ThematicApperceptionTest from './components/ThematicApperceptionTest';
import WordAssociationTest from './components/WordAssociationTest';
import OIR from './components/OIR';
import { NELEToast } from './components/NELEToast';
import PPDT from './components/PPDT';
import GroupDiscussion from './components/GroupDiscussion';
import SRT from './components/SRT';
import SDT from './components/SDT';
import GTO from './components/GTO';
import PI from './components/PI';
import ConferenceTips from './components/ConferenceTips';
import { APPWRITE_CONFIG_READY, APPWRITE_CONFIG_ERROR, APPWRITE_MISSING_KEYS } from './lib/appwrite';
import { API_CONFIG_USING_FALLBACK, API_BASE_URL, API_CONFIG_FALLBACK_REASON, API_DEFAULT_BASE_URL } from './config/env';
import { LoaderProvider } from './contexts/LoaderContext';



function App() {
  const isBrowser = typeof window !== 'undefined';
  const isProductionHost = isBrowser && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  const issues = [];

  if (!APPWRITE_CONFIG_READY) {
    issues.push({
      title: 'Appwrite configuration needed',
      message: APPWRITE_CONFIG_ERROR || 'The deployment is missing required Appwrite credentials.',
      keys: APPWRITE_MISSING_KEYS
    });
  }

  if (API_CONFIG_USING_FALLBACK && isProductionHost) {
    let apiMessage = `Set VITE_API_BASE_URL (and optionally VITE_SOCKET_URL) to your deployed backend before building. The app is currently pointing to ${API_BASE_URL}, which is only meant for development.`;

    if (API_CONFIG_FALLBACK_REASON === 'missing') {
      apiMessage = `VITE_API_BASE_URL isn't defined in your environment, so the app fell back to ${API_BASE_URL}. Update the variable to point at your backend (for example ${API_DEFAULT_BASE_URL}) and rebuild.`;
    } else if (API_CONFIG_FALLBACK_REASON === 'invalid-url') {
      apiMessage = `VITE_API_BASE_URL is set but the value isn't a valid URL. The app defaulted to ${API_BASE_URL}. Replace it with your backend URL (e.g., ${API_DEFAULT_BASE_URL}) and rebuild.`;
    } else if (API_CONFIG_FALLBACK_REASON === 'same-as-frontend-origin') {
      const origin = isBrowser ? window.location.origin : 'this site';
      apiMessage = `VITE_API_BASE_URL currently points to ${origin}, which serves the front-end HTML instead of JSON. The app automatically switched to ${API_BASE_URL}, but you must configure the environment variable to your backend (for example ${API_DEFAULT_BASE_URL}) and rebuild.`;
    }

    issues.push({
      title: 'Backend API URL required',
      message: apiMessage,
      keys: ['VITE_API_BASE_URL', 'VITE_SOCKET_URL']
    });
  }

  if (issues.length > 0) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          color: '#f8fafc',
          padding: '2rem'
        }}
      >
        <div
          style={{
            maxWidth: '620px',
            width: '100%',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '24px',
            padding: '2.5rem',
            boxShadow: '0 40px 80px rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Configuration needed</h1>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {issues.map(({ title, message, keys }) => (
              <div key={title} style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)', borderRadius: '18px', padding: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>{title}</h2>
                <p style={{ lineHeight: 1.6, color: '#cbd5f5', marginBottom: keys?.length ? '1.25rem' : 0 }}>{message}</p>
                {keys?.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}
                  >
                    {keys.map((key) => (
                      <span
                        key={key}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '9999px',
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          border: '1px solid rgba(96, 165, 250, 0.45)',
                          color: '#bfdbfe',
                          fontSize: '0.85rem'
                        }}
                      >
                        {key}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.95rem', color: '#94a3b8', marginTop: '2rem' }}>
            Update these values in your hosting provider&apos;s Environment Variables, then trigger a fresh build so the
            updated values are embedded in the client bundle.
          </p>
        </div>
      </div>
    );
  }

  return (
    <NELEProvider>
      <BrowserRouter>
        <LoaderProvider>
          <NELEToast />
          <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/community" element={<Community />} />
        <Route path="/ssb-drills" element={<SSBDrills />} />
        <Route path="/test-prep" element={<TestPrep />} />
        <Route path="/ai-run" element={<AIRun />} />
        <Route path="/ai-run/note-synthesizer" element={<NoteSynthesizer />} />
        <Route path="/ai-run/micro-learning" element={<MicroLearning />} />
        <Route path="/ai-run/study-plan" element={<StudyPlanGenerator />} />
        <Route path="/emotion-analysis" element={<EmotionAnalysis />} />

        <Route path="/tat" element={<ThematicApperceptionTest />} />
        <Route path="/wat" element={<WordAssociationTest />} />
        <Route path="/oir" element={<OIR />} />
        <Route path="/ppdt" element={<PPDT />} />
        <Route path="/gd" element={<GroupDiscussion />} />
        <Route path="/srt" element={<SRT />} />
        <Route path="/sdt" element={<SDT />} />
        <Route path="/gto" element={<GTO />} />
        <Route path="/pi" element={<PI />} />
        <Route path="/conference-tips" element={<ConferenceTips />} />
          </Routes>
        </LoaderProvider>
    </BrowserRouter>
    </NELEProvider>
  );
}

export default App;
