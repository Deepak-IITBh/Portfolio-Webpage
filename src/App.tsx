import React from 'react';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Skills from './components/Skills';
import ResumeDownload from './components/Resume';
import Achievements from './/components/Achievements';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <Achievements />
    </div>
  );
}

export default App;