import { Routes, Route } from 'react-router-dom';
import { LenisProvider } from './context/LenisContext';
import Home from './pages/Home';
import { SmoothCursor } from './components/ui/smooth-cursor';
import ProjectDetail from './pages/ProjectDetail';

function App() {
  return (
    <LenisProvider>
      <SmoothCursor />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
      </Routes>
    </LenisProvider>
  );
}

export default App;