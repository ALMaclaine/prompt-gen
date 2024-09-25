'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PromptForm: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateTopic = (value: string): boolean => {
    return value.trim().length > 0 && value.trim().length <= 200;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGeneratedPrompt('');

    if (!validateTopic(topic)) {
      setError('Please enter a valid topic (1-200 characters).');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/api/generate-prompt', { topic });
      setGeneratedPrompt(response.data.prompt);
    } catch (error) {
      console.error('Error generating prompt:', error);
      setError('An error occurred while generating the prompt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      console.log('Error state updated:', error);
    }
  }, [error]);

  return (
    <div>
      <form onSubmit={handleSubmit} className="mt-4" role="form">
        <div className="mb-4">
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
            Enter your topic
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
              error ? 'border-red-500' : ''
            }`}
            placeholder="Enter a topic for prompt generation (up to 200 characters)"
            maxLength={200}
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Prompt'}
        </button>
      </form>
      {error && (
        <p className="mt-2 text-sm text-red-600" data-testid="error-message">
          {error}
        </p>
      )}
      {generatedPrompt && !error && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Generated Prompt:</h3>
          <p className="mt-2 text-gray-600" data-testid="generated-prompt">
            {generatedPrompt}
          </p>
        </div>
      )}
    </div>
  );
};

export default PromptForm;