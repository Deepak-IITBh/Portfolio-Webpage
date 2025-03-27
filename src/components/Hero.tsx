import { motion } from 'framer-motion';
import { Github, Linkedin, Mail } from 'lucide-react';
import ResumeDownload from './Resume';
import ProfilePhoto from "../assets/DSC_0108-removebg-preview.png";


export default function Hero() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center">
      <div className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={ ProfilePhoto }
              alt="Professional headshot"
              className="rounded-2xl shadow-2xl h-[420px]"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-100">
              Deepak – Data Scientist & AI Enthusiast
            </h1>
            
            <p className="text-lg mb-8 text-gray-100">
              I'm a 3rd-year BTech student at IIT Bhilai specializing in Data Science and AI, 
              passionate about solving problems with Machine Learning, Computer Vision, and 
              innovative technologies.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-purple-600 rounded-full font-semibold transition-all duration-300"
            >
              <ResumeDownload />
            </motion.button>

            <div className="flex gap-6 mt-8">
              <motion.a
                href="https://www.linkedin.com/in/deepak-kumar-4767a525b/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-white hover:text-gray-200"
              >
                <Linkedin size={24} />
              </motion.a>
              <motion.a
                href="https://github.com/Deepak-IITBh"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-white hover:text-gray-200"
              >
                <Github size={24} />
              </motion.a>
              <motion.a
                href="mailto:deepakde@iitbhilai.ac.in"
                whileHover={{ scale: 1.1 }}
                className="text-white hover:text-gray-200"
              >
                <Mail size={24} />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}