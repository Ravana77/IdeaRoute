'use client';

import { useAuth } from '@/context/AuthContext';
import { useIdea } from '@/context/IdeaContext';
import React, { useState } from 'react';

// Props interface for the component
interface IdeaGenerationNLPProps {
  onClose: () => void;
}

interface AIGenerateProps {
  onClose: () => void;
}

interface GeneratedContent {
  id: string;
  type: string;
  prompt: string;
  content: string;
  createdAt: Date;
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const { ideas, addIdea } = useIdea();
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
  const [geminiOutput, setgeminiOutput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIdeaGenerated, setIsIdeaGenerated] = useState(false);
  const [lastPayload, setLastPayload] = useState<IdeaRequest | null>(null);
  const { user } = useAuth();

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

    setLastPayload(payload);

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
      setIsIdeaGenerated(true);


    } catch (e: any) {
      console.error('Error generating idea:', e);
      setError(e.message || 'Failed to generate idea. Please ensure the backend is running and accessible.');
    } finally {
      setIsLoading(false);
    }
  };

  const promptGemini = async (payload: IdeaRequest | null) => {
    setIsGenerating(true);
    const content = ""
    if (!payload) {
      // create custom payload
      // const content = `Hobbies: Healthcare, 
      // Career Goal: Software Engineer, 
      // Interested Fields: Gaming, 
      // Familiar Technologies: React, Firebase, Figma, 
      // Skill Level: Intermediate`;

      console.error('Payload is required to call Gemini API');
      setIsGenerating(false);
      return;
    }
    else{
const content = `Hobbies: ${payload.hobbies}, Career Goal: ${payload.careerGoal}, Interested Fields: ${payload.interestedFields}, Familiar Technologies: ${payload.familiarTechnologies}, Skill Level: ${payload.skillLevel}`;

    }
    // Construct content string from payload

    
    // prompt: Rules for Gemini API call
    // This prompt is designed to guide Gemini in generating a project idea based on the provided content

    const ExampleFormat = `
      {
        "projectName": "string",
        "description": "string",
        "platforms": ["string"],
        "timePlanner": {
          "sprint1": "string",
          "sprint2": "string",
          "sprint3": "string"
      }
    `;
    const prompt = `
      You are an AI assistant that generate a JSON object describing a project idea based on user input, including a project name, description, 
      suggested platforms, and a basic sprint task list with sprint tasks.
      INPUT: ${content}.
      EXAMPLE FORMAT: ${ExampleFormat}.
      RULES:
      1. Output must be a valid JSON object matching the EXAMPLE FORMAT exactly.
      2. projectName: A clear, concise project name (e.g., "AI Vehicle Trading Platform").
      3. description: A brief project concept in 1–2 sentences, suitable for undergraduates.
      4. platforms: An array of 3–5 relevant platforms or websites (e.g., "GitHub", "W3Schools", "React").
      5. timePlanner: An object with up to 7 key sprint tasks, each a short string describing a simple task (e.g., "Design UI", "Set up database").
      6. sprint tasks should be ordered by dependency priority, with the most critical tasks first.
      7. Use only simple, beginner-friendly platforms and tasks suitable for undergraduates.
      8. Do not include fields like waterfall, agile, or any other fields outside the EXAMPLE FORMAT.
      9. For description and sprint fields, use clear, concise language (no more than 20 words per field).
      10. Do not overcomplicate the project idea or tasks—keep it achievable for undergraduates.
      11. Output only the JSON object, with no additional commentary or markdown.
      OUTPUT: Generate a JSON object adhering to the EXAMPLE FORMAT and RULES based on the provided input.
        `;


    try {
      const geminiResponse = await geminiAPICall(prompt);

      if (typeof geminiResponse === 'string') {
        let parsed;
        try {
          // Remove ```json or ``` at start/end
          const cleaned = geminiResponse
            .trim()
            .replace(/^```json\s*/, '')
            .replace(/^```\s*/, '')
            .replace(/```$/, '');

          parsed = JSON.parse(cleaned);
        } catch (err) {
          console.error("Invalid JSON from Gemini:", geminiResponse);
          return;
        }

        const newContent = {
          id: Date.now().toString(),
          type: 'gemini',
          prompt: 'Gemini-generated content:',
          content: parsed.projectName + `\n` + parsed.description + `\nPlatforms: ${parsed.platforms.join(', ')}`,
          parsedContent: parsed,   // store parsed object separately for saving
          createdAt: new Date(),
        };

        setGeneratedContent([newContent, ...generatedContent]);

        // Construct idea object from parsed fields
        const newIdea = {
          id: Date.now().toString(),
          idea_name: parsed.projectName,
          description: parsed.description,
          platform: parsed.platforms.join(', '),
          status: 'finalized',
          user_id: user?.uid || 'anonymous',
          createdAt: new Date(),
          updatedAt: new Date(),
          tasks: parsed.timePlanner,
          waterfall: [],
          agile: [],
        };


        addIdea(newIdea);
        console.log(newIdea)
        setOutput(null);

        console.log('Idea added successfully:', newIdea);

      } else {
        console.error('Gemini API call returned an error:', geminiResponse.error);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const geminiAPICall = async (content: string) => {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to call Gemini API');
      }

      const data = await response.json();
      console.log('Gemini API response:', data);
      // You can now use data.generatedText to update your component state
      return data.generatedText;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      // Handle the error as needed
      return { error: 'Failed to call Gemini API' };
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
          <div>
          
          {(!output || !isIdeaGenerated) && (
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
          )}

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
              <button
              onClick={() => promptGemini(lastPayload)}
              className="generateButton"
              title="Call Gemini"
            >
              Generate with Gemini
            </button>
            </div>
            
          )}

          {(isIdeaGenerated && ideas.length > 0 && !output) && (
            <div className="addForm" style={{ marginTop: '1.5rem', display: 'block' }}>
              <h3 className="text-lg font-bold text-center" style={{ marginBottom: '1rem' }}>Generated Idea</h3>
              <div className="blockContent" style={{ marginBottom: '1rem' }}>
                <h4 className="font-semibold" style={{ marginBottom: '0.5rem' }}>Undergraduate Project:</h4>
                <p>{ideas[ideas.length - 1].idea_name}</p>
              </div>
              <div className="blockContent">
                <h4 className="font-semibold" style={{ marginBottom: '0.5rem' }}>Description:</h4>
                <p>{ideas[ideas.length - 1].description}</p>
              </div>
              <div className="blockContent">
                <h4 className="font-semibold" style={{ marginBottom: '0.5rem' }}>Helpful Platforms & Websites:</h4>
                <p>{ideas[ideas.length - 1].platform}</p>
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

        .generateButton {
          padding: 0.75rem 2rem;
          background: var(--accent-blue);
          color: white;
          font-weight: 600;
          border-radius: var(--radius-md);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .generateButton:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 8px -2px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .generateButton:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
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

