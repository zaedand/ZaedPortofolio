import Navbar from './components/layout/Navbar';
import LazySection from './components/layout/LazySection';
import Hero from './components/sections/Hero';
import SplashCursor from './components/animated/SplashCursor';

function App() {
  return (
    <>
      <SplashCursor />
      <Navbar />
      <Hero />

      <LazySection importFn={() => import('./components/sections/About')} minHeight="100vh" />

      {/* Section berikutnya tinggal ditambah dengan pola yang sama:
      <LazySection importFn={() => import('./components/sections/Experience')} minHeight="100vh" />
      <LazySection importFn={() => import('./components/sections/Projects')} minHeight="100vh" />
      */}
    </>
  );
}

export default App;