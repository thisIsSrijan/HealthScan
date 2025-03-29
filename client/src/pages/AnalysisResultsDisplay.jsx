import React from 'react';
import { useMedicalAnalysis } from './MedicalAnalysisContext';

const SeverityBadge = ({ level }) => {
  let bgColor = 'bg-green-100 text-green-800';
  
  if (level === 'High') {
    bgColor = 'bg-red-100 text-red-800';
  } else if (level === 'Moderate') {
    bgColor = 'bg-yellow-100 text-yellow-800';
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${bgColor}`}>
      {level} Severity
    </span>
  );
};

const AnalysisResultsDisplay = () => {
  const { analysisResults, isAnalyzing, error } = useMedicalAnalysis();
  
  if (isAnalyzing) {
    return (
      <div className="p-6 mt-4 text-center bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="w-3/4 h-4 mx-auto mb-2 bg-gray-200 rounded"></div>
          <div className="w-1/2 h-4 mx-auto mb-2 bg-gray-200 rounded"></div>
          <div className="w-5/6 h-4 mx-auto bg-gray-200 rounded"></div>
        </div>
        <p className="mt-4 text-gray-600">Analyzing your symptoms...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 mt-4 border border-red-200 rounded-lg shadow bg-red-50">
        <h3 className="mb-2 text-lg font-semibold text-red-800">Analysis Error</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }
  
  if (!analysisResults) {
    return null;
  }
  
  return (
    <div className="mt-4 overflow-hidden bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold">Medical Analysis Results</h2>
          <SeverityBadge level={analysisResults.severityLevel} />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Analysis ID: {analysisResults.analysisId} • {new Date(analysisResults.timestamp).toLocaleString()}
        </p>
      </div>
      
      {/* Extracted Entities */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="mb-3 text-lg font-medium">Identified Medical Factors</h3>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-700">Symptoms</h4>
            {analysisResults.extractedEntities.symptoms.length > 0 ? (
              <ul className="space-y-1 text-gray-600 list-disc list-inside">
                {analysisResults.extractedEntities.symptoms.map((symptom, index) => (
                  <li key={index}>{symptom}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No specific symptoms identified</p>
            )}
          </div>
          
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-700">Medications</h4>
            {analysisResults.extractedEntities.medications.length > 0 ? (
              <ul className="space-y-1 text-gray-600 list-disc list-inside">
                {analysisResults.extractedEntities.medications.map((medication, index) => (
                  <li key={index}>{medication}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No medications identified</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Risk Analysis */}
      {(analysisResults.riskAnalysis.medicationInteractions.length > 0 ||
        analysisResults.riskAnalysis.allergyWarnings.length > 0 ||
        analysisResults.riskAnalysis.conditionConcerns.length > 0) && (
        <div className="p-6 border-b border-gray-200">
          <h3 className="mb-3 text-lg font-medium">Potential Risks</h3>
          
          {analysisResults.riskAnalysis.medicationInteractions.length > 0 && (
            <div className="mb-4">
              <h4 className="mb-2 text-sm font-medium text-gray-700">Medication Interactions</h4>
              <ul className="space-y-2 text-gray-600">
                {analysisResults.riskAnalysis.medicationInteractions.map((interaction, index) => (
                  <li key={index} className={`p-2 rounded ${interaction.severity === 'High' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                    <span className={`font-medium ${interaction.severity === 'High' ? 'text-red-800' : 'text-yellow-800'}`}>
                      {interaction.severity} risk:
                    </span> {interaction.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {analysisResults.riskAnalysis.allergyWarnings.length > 0 && (
            <div className="mb-4">
              <h4 className="mb-2 text-sm font-medium text-gray-700">Allergy Warnings</h4>
              <ul className="space-y-2 text-gray-600">
                {analysisResults.riskAnalysis.allergyWarnings.map((warning, index) => (
                  <li key={index} className="p-2 rounded bg-red-50">
                    <span className="font-medium text-red-800">
                      {warning.severity} risk:
                    </span> {warning.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {analysisResults.riskAnalysis.conditionConcerns.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-700">Condition Concerns</h4>
              <ul className="space-y-2 text-gray-600">
                {analysisResults.riskAnalysis.conditionConcerns.map((concern, index) => (
                  <li key={index} className={`p-2 rounded ${concern.severity === 'High' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                    <span className={`font-medium ${concern.severity === 'High' ? 'text-red-800' : 'text-yellow-800'}`}>
                      {concern.severity} concern:
                    </span> {concern.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Recommendations */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="mb-3 text-lg font-medium">Recommendations</h3>
        <ul className="space-y-3">
          {analysisResults.recommendations.map((recommendation, index) => {
            let priorityColor;
            
            switch (recommendation.priority) {
              case 'Urgent':
                priorityColor = 'bg-red-100 text-red-800 border-red-200';
                break;
              case 'Important':
                priorityColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
                break;
              default:
                priorityColor = 'bg-blue-100 text-blue-800 border-blue-200';
            }
            
            return (
              <li 
                key={index} 
                className={`p-3 rounded border ${priorityColor}`}
              >
                <p className="font-medium">{recommendation.action}</p>
                <p className="mt-1 text-sm">{recommendation.reasoning}</p>
              </li>
            );
          })}
        </ul>
      </div>
      
      {/* Disclaimers */}
      <div className="p-6 bg-gray-50">
        <h3 className="mb-2 text-sm font-medium text-gray-700">Disclaimers</h3>
        <div className="space-y-2 text-xs text-gray-600">
          {analysisResults.disclaimers.map((disclaimer, index) => (
            <p key={index}>{disclaimer}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultsDisplay;