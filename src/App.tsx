import { Routes, Route } from 'react-router-dom';
import { LenisProvider } from './context/LenisContext';
import Home from './pages/Home';
import { SmoothCursor } from './components/ui/smooth-cursor';
import ProjectDetail from './pages/ProjectDetail';
import { IntroProvider } from '@/context/IntroContext';
import SplashScreen from '@/components/splash/SplashScreen';

function App() {
  return (
    <LenisProvider>
      <IntroProvider>
      <SmoothCursor />
      <SplashScreen />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
      </Routes>
      </IntroProvider>
    </LenisProvider>
  );
}

export default App;