import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';

const experiences = [
  {
    title: "Computer Vision Intern",
    company: "IIT Bhilai",
    duration: "May 2024 - Jul 2024",
    details: [
      "Collaborated on crater detection using the Segment Anything Model (SAM) and YOLOv8",
      "Applied advanced deep learning techniques for precise segmentation",
      "Focused on optimizing model performance for universal applicability"
    ]
  },
  {
    title: "Data Science Intern",
    company: "Encryptix",
    duration: "May 2024 - Jun 2024",
    details: [
      "Data preprocessing, feature engineering, model building",
      "Evaluation with Random Forest and Gradient Boosting",
      "Deployed models on AWS (S3, EC2)"
    ]
  }
];

export default function Experience() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mb-12"
        >
          Experience
        </motion.h2>
        
        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg p-6 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{exp.title}</h3>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-500 mb-4">{exp.duration}</p>
                  <ul className="list-disc list-inside space-y-2">
                    {exp.details.map((detail, i) => (
                      <li key={i} className="text-gray-700">{detail}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}