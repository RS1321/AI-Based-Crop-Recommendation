import React, { useState } from 'react';
import { Leaf, Droplets, Thermometer, Wind, Sprout, Activity, Beaker, Sparkles, BookOpen, MessageSquare, Send } from 'lucide-react';

export default function App() {
  const [formData, setFormData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: ''
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // AI State
  const [aiGuide, setAiGuide] = useState('');
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  // ---------------------------------------------------------
  // GEMINI API CONFIGURATION
  // ---------------------------------------------------------
  const apiKey = ""; // The environment will inject the key here at runtime.
                     // For local development, replace this with your actual API key.

  const callGemini = async (prompt) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch from Gemini API');
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    } catch (err) {
      console.error(err);
      return "Error: Could not connect to AI service. Please check your API key.";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (prediction) {
      setPrediction(null);
      setAiGuide('');
      setChatResponse('');
    }
  };

  const simulatePrediction = (data) => {
    const N = parseFloat(data.nitrogen);
    const P = parseFloat(data.phosphorus);
    const K = parseFloat(data.potassium);
    const temp = parseFloat(data.temperature);
    const humidity = parseFloat(data.humidity);
    const ph = parseFloat(data.ph);
    const rain = parseFloat(data.rainfall);

    if (rain > 200) return { crop: 'Rice', confidence: 98, description: "Requires heavy rainfall and clayey soil." };
    if (temp < 20 && humidity < 30) return { crop: 'Chickpea', confidence: 92, description: "Winter crop, requires less water." };
    if (K > 50 && K > N) return { crop: 'Grapes', confidence: 95, description: "Requires high potassium levels." };
    if (humidity > 80 && rain > 150) return { crop: 'Jute', confidence: 94, description: "Strong fiber crop, needs high humidity." };
    if (ph < 5.5) return { crop: 'Tea', confidence: 89, description: "Prefers acidic soil and sloped land." };
    if (temp > 30 && humidity < 50) return { crop: 'Pigeonpeas', confidence: 91, description: "Drought resistant legume." };
    if (N > 100) return { crop: 'Cotton', confidence: 93, description: "Nitrogen intensive, avoids water logging." };
    if (rain < 50 && temp > 25) return { crop: 'Mothbeans', confidence: 88, description: "Extremely drought tolerant." };
    
    return { crop: 'Maize', confidence: 85, description: "Versatile crop, suitable for moderate climates." };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setAiGuide('');
    setChatResponse('');

    if (Object.values(formData).some(val => val === '')) {
      setError('Please fill in all fields to get an accurate recommendation.');
      setLoading(false);
      return;
    }

    try {
        // CALL THE FLASK API
        const response = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error('Failed to get prediction from server');
        }

        const result = await response.json();
        setPrediction(result);
    } catch (err) {
        console.error(err);
        setError("Error connecting to the server. Make sure 'python app.py' is running!");
    } finally {
        setLoading(false);
    }
  };
  
  // Feature 1: Generate AI Care Guide
  const handleGenerateGuide = async () => {
    if (!prediction) return;
    setLoadingGuide(true);
    
    const prompt = `You are an expert agronomist. The user has been recommended to grow '${prediction.crop}' based on these soil conditions: 
    Nitrogen: ${formData.nitrogen}, Phosphorus: ${formData.phosphorus}, Potassium: ${formData.potassium}, pH: ${formData.ph}, Rainfall: ${formData.rainfall}mm.
    
    Provide a concise, practical care guide (max 200 words) using these exact headings:
    1. 💧 Irrigation Strategy
    2. 🐛 Pest Control
    3. 🧪 Fertilizer Tips
    4. 🚜 Harvesting Advice
    
    Keep the tone encouraging for a farmer.`;

    const text = await callGemini(prompt);
    setAiGuide(text);
    setLoadingGuide(false);
  };

  // Feature 2: Ask specific question
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatQuery.trim() || !prediction) return;
    
    setLoadingChat(true);
    const prompt = `Context: The farmer is growing '${prediction.crop}' with soil pH ${formData.ph} and rainfall ${formData.rainfall}mm.
    User Question: "${chatQuery}"
    
    Answer as a helpful agricultural expert in 2-3 sentences.`;

    const text = await callGemini(prompt);
    setChatResponse(text);
    setLoadingChat(false);
  };

  const InputField = ({ label, name, icon: Icon, unit, min, max, placeholder }) => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="number"
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          className="block w-full pl-10 pr-12 py-3 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
          placeholder={placeholder}
          min={min}
          max={max}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-gray-500 sm:text-sm">{unit}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full shadow-lg">
              <Sprout className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            AgriSmart AI
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            Intelligent Crop Recommendation System for Modern Farming
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Input Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
              <div className="bg-green-600 py-4 px-6">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Soil & Environmental Parameters
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InputField label="Nitrogen (N)" name="nitrogen" icon={Beaker} unit="mg/kg" placeholder="e.g. 90" />
                  <InputField label="Phosphorus (P)" name="phosphorus" icon={Beaker} unit="mg/kg" placeholder="e.g. 42" />
                  <InputField label="Potassium (K)" name="potassium" icon={Beaker} unit="mg/kg" placeholder="e.g. 43" />
                  <InputField label="pH Level" name="ph" icon={Activity} unit="pH" min="0" max="14" placeholder="e.g. 6.5" />
                  <InputField label="Temperature" name="temperature" icon={Thermometer} unit="°C" placeholder="e.g. 26" />
                  <InputField label="Humidity" name="humidity" icon={Droplets} unit="%" placeholder="e.g. 80" />
                  <div className="sm:col-span-2">
                    <InputField label="Rainfall" name="rainfall" icon={Wind} unit="mm" placeholder="e.g. 200" />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white transition-all duration-200 ${
                    loading 
                      ? 'bg-green-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing Soil Data...
                    </span>
                  ) : (
                    'Get Recommendation'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: Results & AI Features */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* 1. Prediction Card */}
            <div className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 ${prediction ? 'opacity-100 translate-x-0' : 'opacity-80'}`}>
              <div className="bg-emerald-800 py-4 px-6">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Leaf className="mr-2 h-5 w-5" />
                  Recommendation
                </h2>
              </div>
              
              <div className="p-6 flex flex-col items-center justify-center text-center">
                {!prediction ? (
                  <div className="text-gray-400 py-8">
                    <Sprout className="h-24 w-24 mx-auto mb-4 opacity-20" />
                    <p>Enter soil parameters and click predict to see AI recommendations here.</p>
                  </div>
                ) : (
                  <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-green-50 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <Leaf className="h-12 w-12 text-green-600" />
                    </div>
                    
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Best Crop Match</h3>
                    <div className="text-3xl font-extrabold text-gray-900 mb-2">{prediction.crop}</div>
                    
                    <div className="flex justify-center items-center mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {prediction.confidence}% Confidence
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                        {prediction.description}
                    </p>

                    {/* AI Feature 1: Generate Guide Button */}
                    {!aiGuide && (
                      <button
                        onClick={handleGenerateGuide}
                        disabled={loadingGuide}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      >
                        {loadingGuide ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Creating Guide...
                          </span>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate AI Care Guide
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 2. AI Care Guide Result */}
            {prediction && aiGuide && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="bg-indigo-600 py-3 px-6 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-white flex items-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Gemini Care Guide
                    </h2>
                    <span className="text-xs text-indigo-200 bg-indigo-800 px-2 py-0.5 rounded">AI Generated</span>
                 </div>
                 <div className="p-6 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                    {aiGuide}
                 </div>
              </div>
            )}

            {/* 3. AI Chat Box */}
            {prediction && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-purple-600 py-3 px-6">
                  <h2 className="text-sm font-bold text-white flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Ask the AI Agronomist
                  </h2>
                </div>
                <div className="p-4">
                  {chatResponse && (
                     <div className="mb-4 bg-purple-50 p-3 rounded-lg text-sm text-purple-900 border border-purple-100">
                        <strong>AI:</strong> {chatResponse}
                     </div>
                  )}
                  <form onSubmit={handleChatSubmit} className="relative">
                    <input 
                      type="text" 
                      value={chatQuery}
                      onChange={(e) => setChatQuery(e.target.value)}
                      placeholder={`Ask about ${prediction.crop}...`}
                      className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-500 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    />
                    <button 
                      type="submit" 
                      disabled={loadingChat}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-purple-600 hover:text-purple-800"
                    >
                      {loadingChat ? (
                        <div className="h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}