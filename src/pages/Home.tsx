import Navbar from '../components/layout/Navbar';
import LazySection from '../components/layout/LazySection';
import Hero from '../components/sections/Hero';

import Footer from '../components/sections/Footer';

const Home = () => {
  return (
    <>

      <Navbar />
      <Hero />

      <LazySection
        id="about"
        importFn={() => import('../components/sections/About')}
        minHeight="100vh"
        bgColor="#0d151a"
      />
      <LazySection
        id="experience"
        importFn={() => import('../components/sections/Experience')}
        minHeight="100vh"
        bgColor="#0B0D10"
      />
      <LazySection
        id="projects"
        importFn={() => import('../components/sections/Projects')}
        minHeight="100vh"
        bgColor="#0d151a"
      />
      <LazySection
        id="certificates"
        importFn={() => import('../components/sections/Certificates')}
        minHeight="100vh"
        bgColor="#0B0D10"
      />

      <Footer />
    </>
  );
};

export default Home;