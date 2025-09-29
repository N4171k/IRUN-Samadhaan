
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


function App() {
  if (!APPWRITE_CONFIG_READY) {
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
            maxWidth: '540px',
            width: '100%',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '24px',
            padding: '2.5rem',
            boxShadow: '0 40px 80px rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Configuration needed</h1>
          <p style={{ lineHeight: 1.6, color: '#cbd5f5', marginBottom: '1.25rem' }}>
            {APPWRITE_CONFIG_ERROR || 'The deployment is missing required Appwrite credentials.'}
          </p>
          {APPWRITE_MISSING_KEYS.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginBottom: '1.5rem'
              }}
            >
              {APPWRITE_MISSING_KEYS.map((key) => (
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
          <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
            Add these variables in your Vercel Project Settings &rarr; Environment Variables and redeploy. If
            you already set them, trigger a fresh deploy so the updated values are embedded in the client bundle.
          </p>
        </div>
      </div>
    );
  }

  return (
    <NELEProvider>
      <BrowserRouter>
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
    </BrowserRouter>
    </NELEProvider>
  );
}

export default App;
