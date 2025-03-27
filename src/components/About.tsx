// import { motion } from 'framer-motion';

// export default function About() {
//   return (
//     <motion.section 
//       initial={{ opacity: 0 }}
//       whileInView={{ opacity: 1 }}
//       transition={{ duration: 0.8 }}
//       className="py-20 bg-gray-50"
//     >
//       <div className="max-w-4xl mx-auto px-4">
//         <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">About Me</h2>
//         <motion.p 
//           className="text-lg text-gray-600 leading-relaxed"
//           initial={{ y: 20 }}
//           whileInView={{ y: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           Hi, I'm Deepak from 3rd-year BTech student at IIT Bhilai, specializing in Data Science and Artificial Intelligence. 
//           My passion lies in the fields of Data Science, Machine Learning, AI, and Computer Vision, where I enjoy solving 
//           problems and building innovative solutions.
//         </motion.p>
//       </div>
//     </motion.section>
//   );
// }


"use client";
import { useState } from "react";
import { motion } from "framer-motion";
// import axios from "axios";
import Together from "together-ai";

export default function About() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const SYSTEM_PROMPT = `You are an AI assistant specialized in answering resume-based questions. Your responses should be professional, concise, and directly relevant to the user's career and resume-related inquiries.

  ## Response Guidelines:
  1. Be Direct & Straightforward:
    - Provide clear and precise answers to career-related questions.
    - Avoid unnecessary details that do not add value.

  2. Keep It Professional & Informative:
    - Use a formal yet approachable tone.
    - Avoid overly casual language while keeping the response engaging.

  3. Expertise & Relevance:
    - Offer insights based on resume content, job search, and career growth.
    - Address user queries with expertise in resume formatting, skills assessment, and job application strategies.

  ## Important Instruction:
  Always give a clear, accurate, and relevant answer to resume and career-related queries.`

  const PDF_CONTEXT = `Deepak
Passionate Data Scientist
B.Tech- Data Science & Artificial Intelligence
Indian Institute Of Technology, Bhilai
+91-9760843775
deepakde@iitbhilai.ac.in
deepsingh010104@gmail.com
Github | linkedin.com
Education
Degree/Certificate
B.Tech. Major
Senior Secondary
Institute/Board
Indian Institute of Technology, Bhilai
UP Board
CGPA/Percentage
6.90 (Till 5th Sem)
71.20 %
Year
2022-2026
2021
Projects
•
ZeroShot Text-to-Image Generator
Aug. 2024 - nov. 2024
Github
Course Project, CS550 Machine Learning
– Developed a deep learning model for generating high-quality images from textual descriptions using Stable Diffusion.
– Integrated a transformer-based text encoder with GANs for zero-shot text-to-image synthesis.
– Optimized image generation pipeline using CLIP ViT-L/14 encoder, U-Net, and VAE with OpenVINO.
– Achieved semantic consistency and high FID scores, enabling realistic outputs.
– Deployed a prototype on Hugging Face for real-time testing and interactive user demos.
•
Transfer-Learning-Covid-19-cxr-Classification
Jun. 2024 - may. 2024
Github
Under by - DR. subhajit sidhanta
– Project Objective: Fine-tuned MobileNetV2 to classify Chest X-ray images (Normal, COVID-19, Viral Pneumonia).
Evaluated performance on training/validation sets.
– Dataset: 1823 PA Chest X-rays: 536 COVID-19, 619 viral pneumonia, 668 normal cases (ages 18-75).
– Metrics: Accuracy (95%), Precision (95%), Recall (95%), F1-Score (95%).
•
Invoice Extraction Using LLaMA 3.2 Vision Model
Dec. 2024 - Feb. 2025
Github
– Developed an AI-powered invoice extraction system using LLaMA 3.2 Vision Model and Groq API for OCR-based
text extraction.
– Built a Streamlit-based web app that processes invoice images and exports structured data in JSON CSV formats.
– Designed robust data validation pipelines using Pydantic, ensuring clean and correctly formatted invoice details.
– Implemented batch processing for multiple invoices via ZIP file uploads, enhancing scalability and efficiency.
– Successfully deployed the application on Render, making it accessible online for real-world usage.
Technical Skills
Programming & Scripting Languages: Python*,C, C++,SQL, HTML, CSS
Tools Libraries:: Git,Pytorch,Tensorflow,Scikit-learn,Keras,Matplotlib,MySQL,OpenCV,Linux,Docker
• Non Technical: Event Management*, Team Work, Presentation Skills*
* Elementary proficiency
•
•
Work Experience & Internship
Computer Vision Intern | IIT Bhilai Under by Dr. Nitin Khanna May. 2024 - Jul. 2024
Collaborated on crater detection using the Segment Anything Model (SAM) and YOLOv8 to enhance accuracy and
efficiency.
Applied advanced deep learning techniques for precise segmentation and recognition of craters in planetary imagery.
Focused on optimizing model performance for universal applicability across diverse terrains.
Intern(Data Science)| Encryptix May 2024 - Jun. 2024
Data preprocessing, feature engineering, model building, and evaluation with Random Forest and Gradient Boosting.
Deployed models on AWS (S3, EC2)
Positions of Responsibility
•Head ,of Student Suggestion Forum, IIT BhilaiApr. 2024 - present
•Head , of Management Committee CoSA 2024-25 IIT BhilaiApr. 2024 - present
•Member,of DesignX Club, IIT Bhilai
May. 2023 - Mar . 2024
Achievements
•JEE Advanced 2022, Secured Top 1 % in JEE(Advanced), Joint Entrance Examination for IITs2022
•JEE Mains 2022, Secured qualified among 2.2 million candidates appearing for the test2022
Extracurriculars
•Student Volunteer,Student Mentorship Program (SMP) IIT Bhilai
•Cordinater, Meraz 4.0 Informals, Event IIT Bhilai
•Convenor, Meraz 5.0 Informals Convenor, IIT Bhilai`

  const together = new Together({
    apiKey: "6241261e3ba0e424720421874778ee5a42e8247b1273ca754cbf06a513f7d3cd",
  });


  const handleAskQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await together.chat.completions.create({
        model: "meta-llama/Meta-Llama-3-8B-Instruct-Turbo",
        messages: [{"role": "system", "content": SYSTEM_PROMPT},
          { role: "user", content: `Question: ${query}, Context: ${PDF_CONTEXT}` },
        ],
      });

      setResponse(response.choices[0]?.message?.content || "No response available.");

      // const res = await axios.post("http://localhost:8000/ask", { query });
      // setResponse(res.data.response);
    } catch (error) {
      setResponse("Error fetching response. Please try again.");
    }
    setLoading(false);
  };

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="py-20 bg-gray-50"
    >
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">About Me</h2>

        <motion.p 
          className="text-lg text-gray-600 leading-relaxed"
          initial={{ y: 20 }}
          whileInView={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Hi, I'm Deepak, a 3rd-year BTech student at IIT Bhilai, specializing in Data Science and Artificial Intelligence. 
          My passion lies in Data Science, Machine Learning, AI, and Computer Vision, where I enjoy solving 
          problems and building innovative solutions.
        </motion.p>

        {/* Query Input and Button */}
        <div className="mt-6">
          <input
            type="text"
            placeholder="Ask a question about my resume..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleAskQuery}
            className="mt-3 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Fetching response..." : "Ask"}
          </button>
        </div>

        {/* AI Response Display */}
        {response && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-6 p-4 border rounded-lg bg-white shadow"
          >
            <h3 className="text-lg font-semibold text-gray-800">AI Response:</h3>
            <p className="text-gray-600 mt-2">{response}</p>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}