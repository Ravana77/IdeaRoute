'use client';

import { useAuth } from '@/context/AuthContext';
import { useIdea } from '@/context/IdeaContext';
import React, { useEffect, useState } from 'react';

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
  hobbies: string[];
  careerGoal: string;
  interestedFields: string[];
  familiarTechnologies: string[];
  skillLevel: string;
}





// Interface for the response received from the backend
interface IdeaResponse {
  undergraduateProject: string;
  helpedPlatformsAndWebsites: string;
}


const Tag: React.FC<{ text: string; onRemove: () => void }> = ({ text, onRemove }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'var(--accent-blue)',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--radius-md)',
    margin: '0.125rem',
    fontSize: '0.875rem',
  }}>
    {text}
    <button
      onClick={onRemove}
      style={{
        background: 'none',
        border: 'none',
        color: 'white',
        marginLeft: '0.5rem',
        cursor: 'pointer',
        fontSize: '1rem',
      }}
    >
      ×
    </button>
  </span>
);

const TagInputContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--surface-color)',
    minHeight: '2.75rem',
  }}>
    {children}
  </div>
);

// Main component, now accepting the onClose prop again.
const IdeaGenerationNLP: React.FC<IdeaGenerationNLPProps> = ({ onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const { ideas, addIdea } = useIdea();

  // State for the user's input to the five questions
  const [input, setInput] = useState<IdeaRequest>({
    hobbies: [],
    careerGoal: '',
    interestedFields: [],
    familiarTechnologies: [],
    skillLevel: 'Beginner',
  });

  // Add states for current input values
  const [currentHobbyInput, setCurrentHobbyInput] = useState('');
  const [currentTechInput, setCurrentTechInput] = useState('');


  // State for the generated output from the backend
  const [output, setOutput] = useState<IdeaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIdeaGenerated, setIsIdeaGenerated] = useState(false);
  const [lastPayload, setLastPayload] = useState<IdeaRequest | null>(null);
  const { user } = useAuth();

  //For Autocomplete, States
  const [currentInterestedInput, setCurrentInterestedInput] = useState('');
  const [availableInterestedFields, setAvailableInterestedFields] = useState<string[]>([]);
  const [filteredInterested, setFilteredInterested] = useState<string[]>([]);
  const [showInterestedSuggestions, setShowInterestedSuggestions] = useState(false);
  const [availableHobbies, setAvailableHobbies] = useState<string[]>([]);
  const [availableTechnologies, setAvailableTechnologies] = useState<string[]>([]);
  const [filteredHobbies, setFilteredHobbies] = useState<string[]>([]);
  const [filteredTechnologies, setFilteredTechnologies] = useState<string[]>([]);
  const [showHobbySuggestions, setShowHobbySuggestions] = useState(false);
  const [showTechSuggestions, setShowTechSuggestions] = useState(false);

  useEffect(() => {
    fetchDatasetTags();
  }, []);

  // Handle changes to the form inputs
  // Updates the state when the user types or selects something in the form.
  const fetchDatasetTags = async () => {
    try {
      const response = await fetch('http://localhost:5000/get_dataset_tags');
      if (response.ok) {
        const data = await response.json();
        setAvailableHobbies(data.hobbies || []);
        setAvailableTechnologies(data.technologies || []);
        setAvailableInterestedFields(data.interested_fields || []);
      }
    } catch (error) {
      console.error('Error fetching dataset tags:', error);
    }
  };

  const filterInterested = (query: string) => {
    if (!query) {
      setFilteredInterested([]);
      return;
    }
    const filtered = availableInterestedFields.filter(field =>
      field.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredInterested(filtered);
  };

  // Add these filter functions
  const filterHobbies = (query: string) => {
    if (!query) {
      setFilteredHobbies([]);
      return;
    }
    const filtered = availableHobbies.filter(hobby =>
      hobby.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredHobbies(filtered);
  };

  const filterTechnologies = (query: string) => {
    if (!query) {
      setFilteredTechnologies([]);
      return;
    }
    const filtered = availableTechnologies.filter(tech =>
      tech.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredTechnologies(filtered);
  };

  // Update the handleInputChange function
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'careerGoal' || name === 'skillLevel') {
      setInput(prev => ({ ...prev, [name]: value }));
    }
  };

  // Add handlers for array fields
  const handleHobbyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentHobbyInput(value);
    filterHobbies(value);
    setShowHobbySuggestions(value.length > 0);
  };

  const handleTechInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentTechInput(value);
    filterTechnologies(value);
    setShowTechSuggestions(value.length > 0);
  };

  const handleInterestedInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentInterestedInput(value);
    filterInterested(value);
    setShowInterestedSuggestions(value.length > 0);
  };

  // Update selection handlers
  const selectHobby = (hobby: string) => {
    if (!input.hobbies.includes(hobby)) {
      setInput(prev => ({ ...prev, hobbies: [...prev.hobbies, hobby] }));
    }
    setCurrentHobbyInput('');
    setShowHobbySuggestions(false);
    setFilteredHobbies([]);
  };

  const selectInterested = (v: string) => {
    if (!input.interestedFields.includes(v))
      setInput(p => ({ ...p, interestedFields: [...p.interestedFields, v] }));
    setCurrentInterestedInput('');
    setShowInterestedSuggestions(false);
  }

  const selectTechnology = (tech: string) => {
    if (!input.familiarTechnologies.includes(tech)) {
      setInput(prev => ({ ...prev, familiarTechnologies: [...prev.familiarTechnologies, tech] }));
    }
    setCurrentTechInput('');
    setShowTechSuggestions(false);
    setFilteredTechnologies([]);
  };

  // Add remove handlers
  const removeHobby = (hobbyToRemove: string) => {
    setInput(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter(hobby => hobby !== hobbyToRemove)
    }));
  };

  const removeTechnology = (techToRemove: string) => {
    setInput(prev => ({
      ...prev,
      familiarTechnologies: prev.familiarTechnologies.filter(tech => tech !== techToRemove)
    }));
  };

  const removeInterested = (interestedToRemove: string) => {
    setInput(prev => ({
      ...prev,
      interestedFields: prev.interestedFields.filter(interested => interested !== interestedToRemove)
    }));
  };

  // Add these functions to handle blur events
  const handleHobbyBlur = () => {
    setTimeout(() => {
      setShowHobbySuggestions(false);
    }, 200);
  };

  const handleTechBlur = () => {
    setTimeout(() => {
      setShowTechSuggestions(false);
    }, 200);
  };

  const handleInterestedBlur = () => {
    setTimeout(() => {
      setShowInterestedSuggestions(false);
    }, 200);
  };

  // Function to call the Python backend API
  // Sends the user's answers to the backend and receives a suggested project and resources.
  const generateIdea = async () => {
    setIsLoading(true);
    setError(null);
    setOutput(null);

    const apiUrl = 'http://localhost:5000/generate_idea';

    // Convert arrays to comma-separated strings for the backend
    const payload = {
      hobbies: input.hobbies.join(', '),
      career_goal: input.careerGoal,
      interested_fields: input.interestedFields.join(', '),
      familiar_technologies: input.familiarTechnologies.join(', '),
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
    else {
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
                  <div style={{ position: 'relative' }}>
                    <TagInputContainer>
                      {/* Display selected hobbies as tags */}
                      {input.hobbies.map((hobby, index) => (
                        <Tag key={index} text={hobby} onRemove={() => removeHobby(hobby)} />
                      ))}
                      {/* Input for adding new hobbies */}
                      <input
                        type="text"
                        value={currentHobbyInput}
                        onChange={handleHobbyInputChange}
                        onBlur={handleHobbyBlur}
                        onFocus={() => currentHobbyInput && filterHobbies(currentHobbyInput)}
                        className="input"
                        placeholder={input.hobbies.length === 0 ? "e.g., Playing games, Reading, Traveling" : "Add another hobby..."}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        style={{
                          border: 'none',
                          outline: 'none',
                          flex: 1,
                          minWidth: '120px',
                          background: 'transparent',
                        }}
                      />
                    </TagInputContainer>

                    {showHobbySuggestions && filteredHobbies.length > 0 && (
                      <div className="suggestionList">
                        {filteredHobbies.map((hobby, index) => (
                          <div
                            key={index}
                            onClick={() => selectHobby(hobby)}
                            className="suggestionItem"
                          >
                            {hobby}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                  <div style={{ position: 'relative' }}>
                    <TagInputContainer>
                      {/* Display selected technologies as tags */}
                      {input.interestedFields.map((interest, index) => (
                        <Tag key={index} text={interest} onRemove={() => removeInterested(interest)} />
                      ))}
                      {/* Input for adding new technologies */}
                      <input
                        type="text"
                        value={currentInterestedInput}
                        onChange={handleInterestedInputChange}
                        onBlur={handleInterestedBlur}
                        onFocus={() => currentInterestedInput && filterInterested(currentInterestedInput)}
                        className="input"
                        placeholder={input.interestedFields.length === 0 ? "Software Engineer, AR, NFT" : "Add another technology..."}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        style={{
                          border: 'none',
                          outline: 'none',
                          flex: 1,
                          minWidth: '120px',
                          background: 'transparent',
                        }}
                      />
                    </TagInputContainer>

                    {showInterestedSuggestions && filteredInterested.length > 0 && (
                      <div className="suggestionList">
                        {filteredInterested.map((interest, index) => (
                          <div
                            key={index}
                            onClick={() => selectInterested(interest)}
                            className="suggestionItem"
                          >
                            {interest}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="formGroup">
                  <label className="label">4. What familiar technologies do you have?</label>
                  <div style={{ position: 'relative' }}>
                    <TagInputContainer>
                      {/* Display selected technologies as tags */}
                      {input.familiarTechnologies.map((tech, index) => (
                        <Tag key={index} text={tech} onRemove={() => removeTechnology(tech)} />
                      ))}
                      {/* Input for adding new technologies */}
                      <input
                        type="text"
                        value={currentTechInput}
                        onChange={handleTechInputChange}
                        onBlur={handleTechBlur}
                        onFocus={() => currentTechInput && filterTechnologies(currentTechInput)}
                        className="input"
                        placeholder={input.familiarTechnologies.length === 0 ? "e.g., Python, React, Firebase" : "Add another technology..."}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        style={{
                          border: 'none',
                          outline: 'none',
                          flex: 1,
                          minWidth: '120px',
                          background: 'transparent',
                        }}
                      />
                    </TagInputContainer>

                    {showTechSuggestions && filteredTechnologies.length > 0 && (
                      <div className="suggestionList">
                        {filteredTechnologies.map((tech, index) => (
                          <div
                            key={index}
                            onClick={() => selectTechnology(tech)}
                            className="suggestionItem"
                          >
                            {tech}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                    {isLoading ? 'Generating...' : 'Source from Dataset'}
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
                  {isGenerating ? 'Generating with Gemini...' : 'Generate with Gemini'}
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

        .tagInputContainer {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background-color: var(--surface-color);
          min-height: 2.75rem;
        }

        .tagInputContainer input {
          border: none;
          outline: none;
          flex: 1;
          min-width: 120px;
          background: transparent;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          background-color: var(--accent-blue);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-md);
          margin: 0.125rem;
          font-size: 0.875rem;
        }

        .tag button {
          background: none;
          border: none;
          color: white;
          margin-left: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
        }
        .suggestionItem {
            padding: 0.5rem;
            cursor: pointer;
            border-bottom: 1px solid var(--border-light);
            transition: background-color 0.2s ease;
          }

          .suggestionItem:hover {
            background-color: var(--bg-tertiary);
          }

          .suggestionList {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: var(--surface-color);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            margin-top: 4px;
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

