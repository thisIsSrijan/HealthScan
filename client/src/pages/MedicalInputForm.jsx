import React, { useState } from 'react';
import { useMedicalAnalysis } from './MedicalAnalysisContext';

const MedicalInputForm = ({ userProfile }) => {
  const [userInput, setUserInput] = useState('');
  const { analyzeUserInput, isAnalyzing } = useMedicalAnalysis();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    
    await analyzeUserInput(userInput, userProfile);
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="mb-4 text-xl font-semibold">Describe Your Symptoms</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label 
            htmlFor="medicalInput" 
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            What symptoms are you experiencing?
          </label>
          <textarea
            id="medicalInput"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe your symptoms, duration, severity, and any medications you've taken..."
            rows={4}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isAnalyzing}
          className={`px-4 py-2 rounded-md text-white font-medium 
            ${isAnalyzing 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Symptoms'}
        </button>
      </form>
    </div>
  );
};

export default MedicalInputForm;