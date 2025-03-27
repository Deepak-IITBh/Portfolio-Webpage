import { motion } from 'framer-motion';

const skills = {
  "Programming & Scripting": ["Python", "C", "C++", "SQL", "HTML", "CSS"],
  "Tools & Libraries": ["Git", "PyTorch", "TensorFlow", "Scikit-learn", "Keras", "Matplotlib", "MySQL", "OpenCV", "Linux", "Docker"],
  "Non Technical": ["Event Management", "Team Work", "Presentation Skills"]
};

export default function Skills() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mb-12"
        >
          Skills
        </motion.h2>
        
        <div className="space-y-8">
          {Object.entries(skills).map(([category, skillList], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h3 className="text-2xl font-semibold mb-4">{category}</h3>
              <div className="flex flex-wrap gap-3">
                {skillList.map((skill) => (
                  <motion.span
                    key={skill}
                    className="px-4 py-2 bg-white rounded-full shadow-md text-gray-800"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}