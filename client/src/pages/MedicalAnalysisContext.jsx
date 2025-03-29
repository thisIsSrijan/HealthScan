import React, { createContext, useContext, useState } from 'react';
import MedicalAnalysisService from './MedicalAnalysisService';

const MedicalAnalysisContext = createContext();

export const useMedicalAnalysis = () => useContext(MedicalAnalysisContext);

export const MedicalAnalysisProvider = ({ children }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);
  
  const analyzeUserInput = async (userInput, userProfile) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      
      const results = await MedicalAnalysisService.analyzeMedicalText(userInput, userProfile);
      setAnalysisResults(results);
      
      return results;
    } catch (err) {
      setError(err.message || 'An error occurred during analysis');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const clearAnalysis = () => {
    setAnalysisResults(null);
    setError(null);
  };
  
  return (
    <MedicalAnalysisContext.Provider value={{
      isAnalyzing,
      analysisResults,
      error,
      analyzeUserInput,
      clearAnalysis
    }}>
      {children}
    </MedicalAnalysisContext.Provider>
  );
};