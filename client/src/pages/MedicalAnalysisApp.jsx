import React from 'react';
import { MedicalAnalysisProvider } from './MedicalAnalysisContext';
import MedicalInputForm from './MedicalInputForm';
import AnalysisResultsDisplay from './AnalysisResultsDisplay';

const MedicalAnalysisApp = () => {
  // This would normally come from your authentication/user context
  const userProfile = {
    name: "John Doe",
    email: "john@example.com",
    age: 45,
    gender: "Male",
    height: [175], // cm
    weight: [80], // kg
    allergies: ["penicillin", "aspirin"],
    medicalConditions: ["hypertension", "asthma"],
    medications: ["lisinopril", "albuterol", "warfarin"],
    ABHA_Id: 1234567890
  };
  
  return (
    <MedicalAnalysisProvider>
      <div className="max-w-3xl px-4 py-8 mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Medical Symptom Analysis</h1>
          <p className="text-gray-600">Analyze your symptoms and receive preliminary recommendations</p>
        </header>
        
        <MedicalInputForm userProfile={userProfile} />
        <AnalysisResultsDisplay />
      </div>
    </MedicalAnalysisProvider>
  );
};

export default MedicalAnalysisApp;