// import { motion } from 'framer-motion';

// const skills = {
//   "Programming & Scripting": ["Python", "C", "C++", "SQL", "HTML", "CSS"],
//   "Tools & Libraries": ["Git", "PyTorch", "TensorFlow", "Scikit-learn", "Keras", "Matplotlib", "MySQL", "OpenCV", "Linux", "Docker"],
//   "Non Technical": ["Event Management", "Team Work", "Presentation Skills"]
// };

// export default function Skills() {
//   return (
//     <section className="py-20 bg-gray-50">
//       <div className="max-w-4xl mx-auto px-4">
//         <motion.h2 
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="text-4xl font-bold text-center mb-12"
//         >
//           Skills
//         </motion.h2>
        
//         <div className="space-y-8">
//           {Object.entries(skills).map(([category, skillList], index) => (
//             <motion.div
//               key={category}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: index * 0.1 }}
//             >
//               <h3 className="text-2xl font-semibold mb-4">{category}</h3>
//               <div className="flex flex-wrap gap-3">
//                 {skillList.map((skill) => (
//                   <motion.span
//                     key={skill}
//                     className="px-4 py-2 bg-white rounded-full shadow-md text-gray-800"
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                   >
//                     {skill}
//                   </motion.span>
//                 ))}
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

























// import { motion } from 'framer-motion';

// const skills = {
//   "Programming & Scripting": ["Python", "C", "C++", "SQL", "HTML", "CSS"],
//   "Tools & Libraries": ["Git", "PyTorch", "TensorFlow", "Scikit-learn", "Keras", "Matplotlib", "MySQL", "OpenCV", "Linux", "Docker"],
//   "Soft Skills": ["Event Management", "Team Work", "Presentation Skills"]
// };

// export default function Skills() {
//   return (
//     <section className="py-20 bg-gradient-to-b from-gray-100 to-gray-300">
//       <div className="max-w-6xl mx-auto px-6 lg:px-12">
//         <motion.h2
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.7, ease: 'easeOut' }}
//           className="text-5xl font-extrabold text-center text-gray-900 mb-16 tracking-tight"
//         >
//           My Skills
//         </motion.h2>

//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
//           {Object.entries(skills).map(([category, skillList], index) => (
//             <motion.div
//               key={category}
//               initial={{ opacity: 0, scale: 0.9 }}
//               whileInView={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.6, delay: index * 0.2, ease: 'easeOut' }}
//               className="bg-white rounded-3xl shadow-lg p-8 hover:shadow-2xl transform hover:-translate-y-2 transition-all"
//             >
//               <h3 className="text-3xl font-semibold text-gray-800 mb-6">{category}</h3>
//               <div className="flex flex-wrap gap-4">
//                 {skillList.map((skill) => (
//                   <motion.span
//                     key={skill}
//                     whileHover={{ scale: 1.1, backgroundColor: '#2563eb', color: '#ffffff' }}
//                     className="px-5 py-2 rounded-full bg-gray-200 text-gray-700 text-lg font-medium transition-transform cursor-pointer"
//                   >
//                     {skill}
//                   </motion.span>
//                 ))}
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }



















import { motion } from 'framer-motion';
import { Code2, PenTool as Tool, Users } from 'lucide-react';

const skills = {
  "Programming & Scripting": {
    icon: Code2,
    skills: ["Python", "C", "C++", "SQL", "HTML", "CSS"]
  },
  "Tools & Libraries": {
    icon: Tool,
    skills: ["Git", "PyTorch", "TensorFlow", "Scikit-learn", "Keras", "Matplotlib", "MySQL", "OpenCV", "Linux", "Docker"]
  },
  "Soft Skills": {
    icon: Users,
    skills: ["Event Management", "Team Work", "Presentation Skills"]
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const skillVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.4
    }
  }
};

export default function Skills() {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-black mb-4">
            My Skills
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid lg:grid-cols-3 gap-8"
        >
          {Object.entries(skills).map(([category, { icon: Icon, skills: skillList }], index) => (
            <motion.div
              key={category}
              variants={cardVariants}
              className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-blue-100">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{category}</h3>
                </div>
                
                <motion.div 
                  className="flex flex-wrap gap-3"
                  variants={containerVariants}
                >
                  {skillList.map((skill) => (
                    <motion.span
                      key={skill}
                      variants={skillVariants}
                      whileHover={{ 
                        scale: 1.05,
                        backgroundColor: '#3b82f6',
                        color: '#ffffff'
                      }}
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium text-sm
                        hover:shadow-lg transition-all duration-200 cursor-pointer"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}