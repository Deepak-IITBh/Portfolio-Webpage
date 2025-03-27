import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Github } from 'lucide-react';

interface Project {
  title: string;
  description: string;
  details: string[];
  github: string;
  image: string;
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.div
        layoutId={`card-${project.title}`}
        onClick={() => setIsOpen(true)}
        className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform"
      >
        <img src={project.image} alt={project.title} className="w-full h-48 object-cover" />
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2">{project.title}</h3>
          <p className="text-gray-600">{project.description}</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />
            <motion.div
              layoutId={`card-${project.title}`}
              className="fixed inset-0 m-auto w-full max-w-2xl h-auto max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl z-50 p-8"
            >
              <h2 className="text-3xl font-bold mb-4">{project.title}</h2>
              <img src={project.image} alt={project.title} className="w-full h-64 object-cover rounded-lg mb-6" />
              
              <div className="space-y-4">
                {project.details.map((detail, index) => (
                  <p key={index} className="text-gray-600">{detail}</p>
                ))}
              </div>

              <div className="mt-6 flex justify-between items-center">
                <a 
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <Github size={20} />
                  View on GitHub
                </a>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}