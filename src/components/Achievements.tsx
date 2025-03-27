import { motion } from 'framer-motion';
import { Award, Users } from 'lucide-react';

const achievements = [
  {
    icon: <Users className="w-6 h-6 text-purple-500" />,
    title: 'Head of Student Suggestion Forum',
    organization: 'IIT Bhilai',
    period: 'Apr 2024 - Present'
  },
  {
    icon: <Award className="w-6 h-6 text-purple-500" />,
    title: 'JEE Advanced',
    description: 'Top 1%'
  },
  {
    icon: <Award className="w-6 h-6 text-purple-500" />,
    title: 'JEE Mains',
    description: 'Qualified'
  }
];

export default function Achievements() {
  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mb-16 text-gray-800"
        >
          Achievements & Leadership
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="mb-4">{achievement.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{achievement.title}</h3>
              {achievement.organization && (
                <p className="text-purple-500">{achievement.organization}</p>
              )}
              {achievement.period && (
                <p className="text-sm text-gray-500">{achievement.period}</p>
              )}
              {achievement.description && (
                <p className="text-gray-600 mt-2">{achievement.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}