import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { Ask } from './components/Ask';
import { Work } from './components/Work';
import { Experience } from './components/Experience';
import { Capabilities } from './components/Capabilities';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Palette } from './components/Palette';
import { useReveal } from './hooks/useReveal';

function App() {
  useReveal();

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Nav />
      <main id="main">
        <Hero />
        <Ask />
        <Work />
        <Experience />
        <Capabilities />
        <About />
        <Contact />
      </main>
      <Footer />
      <Palette />
    </>
  );
}

export default App;
