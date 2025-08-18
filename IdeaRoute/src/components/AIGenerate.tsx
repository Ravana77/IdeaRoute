'use client';

import React, { useState } from 'react';
import styles from './AIGenerate.module.css';
import projectsData from '../components/Json Dataset/IdeaRoute dataset  Original.json';

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

// Data questions to be asked one by one
const questions = [
  'Hobbies',
  'Career goal',
  'Interested  fields',
  'Familiar technologies',
  'Skill level'
];

const AIGenerate: React.FC<AIGenerateProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Function to handle input changes for each question
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { value } = e.target;
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questions[currentStep]]: value
    }));
  };

  // Function to move to the next question
  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prevStep => prevStep + 1);
    } else {
      // Last question answered, now find and generate content
      generateContent();
    }
  };

  // A simple matching function to find the best project from the JSON file
  const findBestMatch = (userAnswers: Record<string, string>) => {
    let bestMatch = null;
    let highestScore = -1;

    for (const project of projectsData) {
      let score = 0;
      
      // Calculate a score based on field matches
      if (project['Skill level'] && userAnswers['Skill level'] && project['Skill level'].toLowerCase().includes(userAnswers['Skill level'].toLowerCase())) {
        score += 2; // Weight skill level highly
      }
      if (project['Career goal'] && userAnswers['Career goal'] && project['Career goal'].toLowerCase().includes(userAnswers['Career goal'].toLowerCase())) {
        score += 2; // Weight career goal highly
      }
      if (project['Hobbies'] && userAnswers['Hobbies'] && project['Hobbies'].toLowerCase().includes(userAnswers['Hobbies'].toLowerCase())) {
        score += 1;
      }
      if (project['Interested  fields'] && userAnswers['Interested  fields'] && project['Interested  fields'].toLowerCase().includes(userAnswers['Interested  fields'].toLowerCase())) {
        score += 1;
      }
      if (project['Familiar technologies'] && userAnswers['Familiar technologies'] && project['Familiar technologies'].toLowerCase().includes(userAnswers['Familiar technologies'].toLowerCase())) {
        score += 1;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = project;
      }
    }
    return bestMatch;
  };

  // This function now uses the local JSON data to find a match
  const generateContent = async () => {
    setIsGenerating(true);

    // Find the best matching project from your JSON data
    const matchedProject = findBestMatch(answers);

    if (matchedProject) {
      const projectIdea = matchedProject['Undergraduate project'];
      const helpedPlatforms = matchedProject['Helped platforms and  websites'];
      
      const newContent = {
        id: Date.now().toString(),
        type: 'project',
        prompt: `Based on your profile, here's a project idea and resources:`,
        content: `Project: ${projectIdea}\nPlatforms & Websites: ${helpedPlatforms}`,
        createdAt: new Date(),
      };
      
      setGeneratedContent([newContent, ...generatedContent]);
    } else {
      // Handle the case where no match is found
      const noMatchContent = {
        id: Date.now().toString(),
        type: 'project',
        prompt: 'No match found',
        content: 'We could not find a suitable project idea based on your answers. Please try again with different inputs.',
        createdAt: new Date(),
      };
      setGeneratedContent([noMatchContent, ...generatedContent]);
    }
    
    setIsGenerating(false);
    setIsCompleted(true); // Mark questionnaire as complete
  };

  // Copy to clipboard function remains the same
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  // Delete content function remains the same
  const deleteContent = (id: string) => {
    setGeneratedContent(generatedContent.filter(item => item.id !== id));
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            <span>💡</span>
            <span>AI Project Generator</span>
          </h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </header>
        <div className={styles.main}>
          <div className={styles.inputContainer}>
            {isCompleted ? (
              <div className={styles.resultsMessage}>
                <h3>Here are your project ideas!</h3>
                <p>Based on your input, we've found a great project idea and helpful resources for you.</p>
              </div>
            ) : (
              <>
                <div className={styles.promptArea}>
                  <h3 className={styles.promptLabel}>Question {currentStep + 1} of {questions.length}</h3>
                  <p className={styles.promptText}>{questions[currentStep]}</p>
                  {questions[currentStep] === 'Skill level' ? (
                    <select
                      value={answers['Skill level'] || ''}
                      onChange={handleInputChange}
                      className={styles.promptInput}
                      disabled={isGenerating}
                    >
                      <option value="" disabled>Select your skill level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={answers[questions[currentStep]] || ''}
                      onChange={handleInputChange}
                      className={styles.promptInput}
                      placeholder={`Enter your ${questions[currentStep].toLowerCase()}...`}
                      disabled={isGenerating}
                    />
                  )}
                  <div className={styles.actionButtons}>
                    <button
                      onClick={handleNext}
                      className={styles.generateButton}
                      disabled={isGenerating || !answers[questions[currentStep]]}
                    >
                      {currentStep < questions.length - 1 ? 'Next' : 'Generate'}
                    </button>
                  </div>
                </div>
              </>
            )}
            
            {isGenerating && (
              <div className={styles.loadingSpinner}>
                <div className={styles.spinner}></div>
                <p>Generating project ideas...</p>
              </div>
            )}
            
            {generatedContent.length > 0 && (
              <div className={styles.contentList}>
                {generatedContent.map((item) => (
                  <div key={item.id} className={styles.contentItem}>
                    <div className={styles.contentHeader}>
                      <div className={styles.contentInfo}>
                        <span className={styles.contentDate}>
                          {item.createdAt.toLocaleDateString()} at {item.createdAt.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className={styles.contentActions}>
                        <button
                          onClick={() => copyToClipboard(item.content)}
                          className={styles.actionButton}
                          title="Copy to clipboard"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => deleteContent(item.id)}
                          className={styles.actionButton}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className={styles.contentPrompt}>
                      <strong>Prompt:</strong> {item.prompt}
                    </div>
                    <div className={styles.contentText}>
                      {item.content.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          {index < item.content.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGenerate;