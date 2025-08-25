'use client';

import React, { useState } from 'react';

// Props interface for the component
interface IdeaGenerationNLPProps {
  onClose: () => void;
}

// Interface for the input data sent to the backend
interface IdeaRequest {
  hobbies: string;
  careerGoal: string;
  interestedFields: string;
  familiarTechnologies: string;
  skillLevel: string;
}

// Interface for the response received from the backend
interface IdeaResponse {
  undergraduateProject: string;
  helpedPlatformsAndWebsites: string;
}

// Main component, now accepting the onClose prop again.
const IdeaGenerationNLP: React.FC<IdeaGenerationNLPProps> = ({ onClose }) => {
  // State for the user's input to the five questions
  const [input, setInput] = useState<IdeaRequest>({
    hobbies: '',
    careerGoal: '',
    interestedFields: '',
    familiarTechnologies: '',
    skillLevel: 'Beginner', // Default skill level
  });

  // State for the generated output from the backend
  const [output, setOutput] = useState<IdeaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle changes to the form inputs
  // Updates the state when the user types or selects something in the form.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInput(prev => ({ ...prev, [name]: value }));
  };

  // Function to call the Python backend API
  // Sends the user's answers to the backend and receives a suggested project and resources.
  const generateIdea = async () => {
    setIsLoading(true);
    setError(null);
    setOutput(null);

    // The URL of the Flask backend API you are running
    const apiUrl = 'http://localhost:5000/generate_idea';

    // The data payload, formatted to match the backend's expected JSON
    const payload = {
      hobbies: input.hobbies,
      career_goal: input.careerGoal,
      interested_fields: input.interestedFields,
      familiar_technologies: input.familiarTechnologies,
      skill_level: input.skillLevel,
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate idea from the backend.');
      }

      const result: IdeaResponse = await response.json();
      setOutput(result);
      
    } catch (e: any) {
      console.error('Error generating idea:', e);
      setError(e.message || 'Failed to generate idea. Please ensure the backend is running and accessible.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // The overlay is now a modal, so it should close when the user clicks outside or on a close button.
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}> {/* Prevent clicks inside the modal from closing it */}
        <div className="header">
          <h2 className="title">
            <span className="icon">💡</span>
            Undergraduate Project Idea Generator
          </h2>
          <button className="closeButton" onClick={onClose}>&times;</button>
        </div>
        <div className="content">
          <p className="blockDescription text-center">
            Fill out the form to receive a personalized undergraduate project idea and helpful resources.
          </p>
          <div className="addForm">
            <div className="formGroup">
              <label className="label">1. What are your hobbies?</label>
              <input
                type="text"
                name="hobbies"
                value={input.hobbies}
                onChange={handleInputChange}
                className="input"
                placeholder="e.g., Playing games, Reading, Traveling"
              />
            </div>
            <div className="formGroup">
              <label className="label">2. What is your career goal?</label>
              <input
                type="text"
                name="careerGoal"
                value={input.careerGoal}
                onChange={handleInputChange}
                className="input"
                placeholder="e.g., Web Developer, Data Scientist, DevOps Engineer"
              />
            </div>
            <div className="formGroup">
              <label className="label">3. What are your interested fields?</label>
              <input
                type="text"
                name="interestedFields"
                value={input.interestedFields}
                onChange={handleInputChange}
                className="input"
                placeholder="e.g., E-commerce, Gaming, Sustainable Tourism"
              />
            </div>
            <div className="formGroup">
              <label className="label">4. What familiar technologies do you have?</label>
              <input
                type="text"
                name="familiarTechnologies"
                value={input.familiarTechnologies}
                onChange={handleInputChange}
                className="input"
                placeholder="e.g., Python, React, Firebase"
              />
            </div>
            <div className="formGroup">
              <label className="label">5. What is your skill level?</label>
              <select
                name="skillLevel"
                value={input.skillLevel}
                onChange={handleInputChange}
                className="select"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            
            <div className="formActions">
              <button
                onClick={generateIdea}
                className="saveButton"
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate Idea'}
              </button>
            </div>
          </div>
          
          {output && (
            <div className="addForm" style={{ marginTop: '1.5rem', display: 'block' }}>
              <h3 className="text-lg font-bold text-center" style={{ marginBottom: '1rem' }}>Generated Idea</h3>
              <div className="blockContent" style={{ marginBottom: '1rem' }}>
                <h4 className="font-semibold" style={{ marginBottom: '0.5rem' }}>Undergraduate Project:</h4>
                <p>{output.undergraduateProject}</p>
              </div>
              <div className="blockContent">
                <h4 className="font-semibold" style={{ marginBottom: '0.5rem' }}>Helpful Platforms & Websites:</h4>
                <p>{output.helpedPlatformsAndWebsites}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center bg-red-100 text-red-800 p-4 rounded-md" style={{ marginTop: '1.5rem' }}>
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        /* Global styles */
        :root {
          --accent-orange: #f59e0b;
          --accent-orange-dark: #d97706;
          --accent-blue: #3b82f6;
          --accent-blue-dark: #2563eb;
          --success: #10b981;
          --danger: #ef4444;
          --warning: #f59e0b;
          --surface-color: #ffffff;
          --bg-secondary: #f8fafc;
          --bg-tertiary: #f1f5f9;
          --border-color: #e2e8f0;
          --border-light: #e2e8f0;
          --text-primary: #1f2937;
          --text-secondary: #4b5563;
          --shadow-large: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --radius-md: 0.5rem;
          --font-family: 'Inter', sans-serif;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --surface-color: #1f2937;
            --bg-secondary: #111827;
            --bg-tertiary: #1f2937;
            --border-color: #374151;
            --border-light: #374151;
            --text-primary: #f9fafb;
            --text-secondary: #d1d5db;
          }
        }
      `}</style>
      <style jsx>{`
        /* Component-specific styles */
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(21, 21, 21, 0.8);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        
        .modal {
          background: var(--surface-color);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-large);
          max-width: 900px;
          height: auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .closeButton {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 2rem;
          cursor: pointer;
          line-height: 1;
        }
        
        .title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .icon {
          font-size: 1.75rem;
          background: linear-gradient(to bottom right, var(--accent-orange), var(--accent-orange-dark));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .content {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }
        
        .blockDescription {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0 0 1rem 0;
          line-height: 1.4;
        }

        .addForm {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(2, 1fr);
        }
        
        @media (max-width: 768px) {
          .addForm {
            grid-template-columns: 1fr;
          }
        }
        
        .formGroup {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .input, .select {
          padding: 0.75rem;
          background: var(--surface-color);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 1rem;
          transition: all 0.2s ease;
          outline: none;
        }

        .input::placeholder {
            color: var(--text-secondary);
            opacity: 0.7;
        }
        
        .input:focus, .select:focus {
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1rem;
        }
        
        .formActions {
          grid-column: span 2;
          display: flex;
          justify-content: center;
        }
        
        @media (max-width: 768px) {
          .formActions {
            grid-column: span 1;
          }
        }
        
        .saveButton {
          padding: 0.75rem 2rem;
          background: var(--success);
          color: white;
          font-weight: 600;
          border-radius: var(--radius-md);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .saveButton:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 8px -2px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .saveButton:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .blockContent {
          background: var(--surface-color);
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
        }

        .text-center {
          text-align: center;
        }

        .font-semibold {
          font-weight: 600;
        }

        .font-bold {
          font-weight: 700;
        }

        .p-4 { padding: 1rem; }
        .text-red-800 { color: #991b1b; }
        .bg-red-100 { background-color: #fee2e2; }
        .rounded-md { border-radius: 0.375rem; }

        @media (prefers-color-scheme: dark) {
          .bg-white { background-color: #1f2937; }
          .dark\\:bg-slate-800 { background-color: #1f2937; }
          .dark\\:bg-slate-900 { background-color: #111827; }
        }
      `}</style>
    </div>
  );
};

export default IdeaGenerationNLP;
