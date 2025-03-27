import { motion } from 'framer-motion';
import ProjectCard from './ProjectCard';

const projects = [
  {
    title: "Invoice Extraction Using LLaMA 3.2",
    description: "AI-powered invoice extraction system using LLaMA 3.2 Vision Model",
    details: [
      "Developed an AI-powered invoice extraction system using LLaMA 3.2 Vision Model and Groq API for OCR-based text extraction.",
      "Built a Streamlit-based web app that processes invoice images and exports structured data in JSON CSV formats.",
      "Designed robust data validation pipelines using Pydantic, ensuring clean and correctly formatted invoice details.",
      "Implemented batch processing for multiple invoices via ZIP file uploads, enhancing scalability and efficiency.",
      "Successfully deployed the application on Render, making it accessible online for real-world usage."
    ],
    github: "https://github.com/Deepak-IITBh/Ai-agent-for-Invoice-Gneration",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2071"
  },
  {
    title: "ZeroShot Text-to-Image Generator",
    description: "Deep learning model for generating high-quality images from textual descriptions",
    details: [
      "Developed a deep learning model for generating high-quality images from textual descriptions using Stable Diffusion.",
      "Integrated a transformer-based text encoder with GANs for zero-shot text-to-image synthesis.",
      "Optimized image generation pipeline using CLIP ViT-L/14 encoder, U-Net, and VAE with OpenVINO.",
      "Achieved semantic consistency and high FID scores, enabling realistic outputs.",
      "Deployed a prototype on Hugging Face for real-time testing and interactive user demos."
    ],
    github: "https://github.com/Deepak-IITBh/Zeroshot-Text-to-ImageAI",
    image: "https://images.unsplash.com/photo-1561736778-92e52a7769ef?q=80&w=2070"
  },
  {
    title: "Transfer Learning COVID-19 Classification",
    description: "Fine-tuned MobileNetV2 for COVID-19 chest X-ray classification",
    details: [
      "Project Objective: Fine-tuned MobileNetV2 to classify Chest X-ray images (Normal, COVID-19, Viral Pneumonia).",
      "Dataset: 1823 PA Chest X-rays: 536 COVID-19, 619 viral pneumonia, 668 normal cases (ages 18-75).",
      "Metrics: Accuracy (95%), Precision (95%), Recall (95%), F1-Score (95%).",
      "Evaluated performance on training/validation sets."
    ],
    github: "https://github.com/deep-dsai/transfer-learning-covid-19-cxr-classification/blob/main/transfer-learning-covid-19-cxr-classification.ipynb",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070"
  }
];

export default function Projects() {
  return (
    <section className="py-20 bg-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mb-12"
        >
          Projects
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}