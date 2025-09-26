
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


function App() {
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
