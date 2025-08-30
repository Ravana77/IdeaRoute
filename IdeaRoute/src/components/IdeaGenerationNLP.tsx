'use client';

import { useAuth } from '@/context/AuthContext';
import { useIdea } from '@/context/IdeaContext';
import React, { useEffect, useState } from 'react';
import styles from './IdeaGenerationNLP.module.css';

// Props interface for the component
interface IdeaGenerationNLPProps {
  onClose: () => void;
}

interface GeneratedContent {
  id: string;
  type: string;
  prompt: string;
  content: string;
  createdAt: Date;
}

interface IdeaRequest {
  hobbies: string[];
  careerGoal: string;
  interestedFields: string[];
  familiarTechnologies: string[];
  skillLevel: string;
}

interface IdeaResponse {
  undergraduateProject: string;
  helpedPlatformsAndWebsites: string;
}

const Tag: React.FC<{ text: string; onRemove: () => void }> = ({ text, onRemove }) => (
  <span className={styles.tag}>
    {text}
    <button onClick={onRemove} className={styles.tagButton}>
      ×
    </button>
  </span>
);

const TagInputContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.tagInputContainer}>
    {children}
  </div>
);

const IdeaGenerationNLP: React.FC<IdeaGenerationNLPProps> = ({ onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const { ideas, addIdea } = useIdea();

  const [input, setInput] = useState<IdeaRequest>({
    hobbies: [],
    careerGoal: '',
    interestedFields: [],
    familiarTechnologies: [],
    skillLevel: 'Beginner',
  });

  const [currentHobbyInput, setCurrentHobbyInput] = useState('');
  const [currentTechInput, setCurrentTechInput] = useState('');
  const [output, setOutput] = useState<IdeaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIdeaGenerated, setIsIdeaGenerated] = useState(false);
  const [lastPayload, setLastPayload] = useState<IdeaRequest | null>(null);
  const { user } = useAuth();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'careerGoal' || name === 'skillLevel') {
      setInput(prev => ({ ...prev, [name]: value }));
    }
  };

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

  const generateIdea = async () => {
    setIsLoading(true);
    setError(null);
    setOutput(null);

    const apiUrl = 'http://localhost:5000/generate_idea';

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
    
    if (!payload) {
      console.error('Payload is required to call Gemini API');
      setIsGenerating(false);
      return;
    }

    const content = `Hobbies: ${payload.hobbies}, Career Goal: ${payload.careerGoal}, Interested Fields: ${payload.interestedFields}, Familiar Technologies: ${payload.familiarTechnologies}, Skill Level: ${payload.skillLevel}`;

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
          parsedContent: parsed,
          createdAt: new Date(),
        };

        setGeneratedContent([newContent, ...generatedContent]);

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
      return data.generatedText;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return { error: 'Failed to call Gemini API' };
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.icon}>💡</span>
            Undergraduate Project Idea Generator
          </h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.content}>
          <div>
            {(!output || !isIdeaGenerated) && (
              <div className={styles.addForm}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>1. What are your hobbies?</label>
                  <div className={styles.relative}>
                    <TagInputContainer>
                      {input.hobbies.map((hobby, index) => (
                        <Tag key={index} text={hobby} onRemove={() => removeHobby(hobby)} />
                      ))}
                      <input
                        type="text"
                        value={currentHobbyInput}
                        onChange={handleHobbyInputChange}
                        onBlur={handleHobbyBlur}
                        onFocus={() => currentHobbyInput && filterHobbies(currentHobbyInput)}
                        className={styles.input}
                        placeholder={input.hobbies.length === 0 ? "e.g., Playing games, Reading, Traveling" : "Add another hobby..."}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        style={{ border: 'none', outline: 'none', flex: 1, minWidth: '120px', background: 'transparent' }}
                      />
                    </TagInputContainer>

                    {showHobbySuggestions && filteredHobbies.length > 0 && (
                      <div className={styles.suggestionList}>
                        {filteredHobbies.map((hobby, index) => (
                          <div
                            key={index}
                            onClick={() => selectHobby(hobby)}
                            className={styles.suggestionItem}
                          >
                            {hobby}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>2. What is your career goal?</label>
                  <input
                    type="text"
                    name="careerGoal"
                    value={input.careerGoal}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="e.g., Web Developer, Data Scientist, DevOps Engineer"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>3. What are your interested fields?</label>
                  <div className={styles.relative}>
                    <TagInputContainer>
                      {input.interestedFields.map((interest, index) => (
                        <Tag key={index} text={interest} onRemove={() => removeInterested(interest)} />
                      ))}
                      <input
                        type="text"
                        value={currentInterestedInput}
                        onChange={handleInterestedInputChange}
                        onBlur={handleInterestedBlur}
                        onFocus={() => currentInterestedInput && filterInterested(currentInterestedInput)}
                        className={styles.input}
                        placeholder={input.interestedFields.length === 0 ? "Software Engineer, AR, NFT" : "Add another technology..."}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        style={{ border: 'none', outline: 'none', flex: 1, minWidth: '120px', background: 'transparent' }}
                      />
                    </TagInputContainer>

                    {showInterestedSuggestions && filteredInterested.length > 0 && (
                      <div className={styles.suggestionList}>
                        {filteredInterested.map((interest, index) => (
                          <div
                            key={index}
                            onClick={() => selectInterested(interest)}
                            className={styles.suggestionItem}
                          >
                            {interest}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>4. What familiar technologies do you have?</label>
                  <div className={styles.relative}>
                    <TagInputContainer>
                      {input.familiarTechnologies.map((tech, index) => (
                        <Tag key={index} text={tech} onRemove={() => removeTechnology(tech)} />
                      ))}
                      <input
                        type="text"
                        value={currentTechInput}
                        onChange={handleTechInputChange}
                        onBlur={handleTechBlur}
                        onFocus={() => currentTechInput && filterTechnologies(currentTechInput)}
                        className={styles.input}
                        placeholder={input.familiarTechnologies.length === 0 ? "e.g., Python, React, Firebase" : "Add another technology..."}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        style={{ border: 'none', outline: 'none', flex: 1, minWidth: '120px', background: 'transparent' }}
                      />
                    </TagInputContainer>

                    {showTechSuggestions && filteredTechnologies.length > 0 && (
                      <div className={styles.suggestionList}>
                        {filteredTechnologies.map((tech, index) => (
                          <div
                            key={index}
                            onClick={() => selectTechnology(tech)}
                            className={styles.suggestionItem}
                          >
                            {tech}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>5. What is your skill level?</label>
                  <select
                    name="skillLevel"
                    value={input.skillLevel}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className={styles.formActions}>
                  <button
                    onClick={generateIdea}
                    className={styles.saveButton}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Generating...' : 'Generate Idea'}
                  </button>
                </div>
              </div>
            )}

            {output && (
              <div className={styles.addForm} style={{ marginTop: '1.5rem', display: 'block' }}>
                <h3 className={`${styles.fontBold} ${styles.textCenter}`} style={{ marginBottom: '1rem' }}>Generated Idea</h3>
                <div className={styles.blockContent} style={{ marginBottom: '1rem' }}>
                  <h4 className={styles.fontSemibold} style={{ marginBottom: '0.5rem' }}>Undergraduate Project:</h4>
                  <p>{output.undergraduateProject}</p>
                </div>
                <div className={styles.blockContent}>
                  <h4 className={styles.fontSemibold} style={{ marginBottom: '0.5rem' }}>Helpful Platforms & Websites:</h4>
                  <p>{output.helpedPlatformsAndWebsites}</p>
                </div>
                <button
                  onClick={() => promptGemini(lastPayload)}
                  className={styles.generateButton}
                  title="Call Gemini"
                >
                  {isGenerating ? 'Generating Gemini...' : 'Finalize & Save Idea'}
                </button>
              </div>
            )}

            {(isIdeaGenerated && ideas.length > 0 && !output) && (
              <div className={styles.addForm} style={{ marginTop: '1.5rem', display: 'block' }}>
                <h3 className={`${styles.fontBold} ${styles.textCenter}`} style={{ marginBottom: '1rem' }}>Generated Idea</h3>
                <div className={styles.blockContent} style={{ marginBottom: '1rem' }}>
                  <h4 className={styles.fontSemibold} style={{ marginBottom: '0.5rem' }}>Undergraduate Project:</h4>
                  <p>{ideas[ideas.length - 1].idea_name}</p>
                </div>
                <div className={styles.blockContent}>
                  <h4 className={styles.fontSemibold} style={{ marginBottom: '0.5rem' }}>Description:</h4>
                  <p>{ideas[ideas.length - 1].description}</p>
                </div>
                <div className={styles.blockContent}>
                  <h4 className={styles.fontSemibold} style={{ marginBottom: '0.5rem' }}>Helpful Platforms & Websites:</h4>
                  <p>{ideas[ideas.length - 1].platform}</p>
                </div>
              </div>
            )}

            {error && (
              <div className={`${styles.textCenter} ${styles.bgRed100} ${styles.textRed800} ${styles.p4} ${styles.roundedMd}`} style={{ marginTop: '1.5rem' }}>
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaGenerationNLP;