AgriSmart AI 🌱 - Intelligent Crop Recommendation System

AgriSmart AI is a full-stack web application that helps farmers make data-driven decisions. By analyzing soil parameters (Nitrogen, Phosphorus, Potassium, pH) and weather conditions (Temperature, Humidity, Rainfall), the system recommends the most suitable crop to cultivate.

It also features an AI Agronomist powered by Google Gemini, providing personalized care guides and answering farming-related queries.

🚀 Features

Precision AI Model: Uses a Random Forest Classifier (99% accuracy) to predict crops.

Interactive Dashboard: Built with React and Tailwind CSS for a modern UI.

Generative AI: Generates farming tips and guides using Google Gemini API.

Real-time Prediction: Instant results via a Flask backend.

🛠️ Tech Stack

Frontend: React.js, Tailwind CSS, Lucide React

Backend: Python, Flask, Scikit-learn

AI/ML: Random Forest Classifier, Google Gemini API

💻 How to Run Locally

1. Clone the Repository

git clone [https://github.com/RS1321/AI-Based-Crop-Recommendation.git](https://github.com/RS1321/AI-Based-Crop-Recommendation.git)
cd AI-Based-Crop-Recommendation


2. Setup Backend (Python)

# Install dependencies
pip install flask flask-cors pandas numpy scikit-learn joblib

# Train the model (creates the .pkl file)
python train_model.py

# Start the server
python app.py


3. Setup Frontend (React)

Open a new terminal:

# Install dependencies
npm install

# Start the React app
npm start


The app will launch at http://localhost:3000.

Made with by Rahul