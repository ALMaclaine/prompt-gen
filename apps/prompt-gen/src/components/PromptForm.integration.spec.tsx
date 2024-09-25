import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PromptForm from './PromptForm';
import { openAIService } from '../services/aiService';

// Mock the openAIService
jest.mock('../services/aiService', () => ({
  openAIService: {
    generatePrompt: jest.fn(),
  },
}));

describe('PromptForm Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('submits the form and displays the generated prompt for a simple topic', async () => {
    const mockPrompt = 'This is a generated prompt for a simple topic';
    (openAIService.generatePrompt as jest.Mock).mockResolvedValue(mockPrompt);

    render(<PromptForm />);

    const input = screen.getByLabelText('Enter your topic');
    const submitButton = screen.getByRole('button', { name: /generate prompt/i });

    fireEvent.change(input, { target: { value: 'Simple Topic' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(openAIService.generatePrompt).toHaveBeenCalledWith('Generate a simple prompt about: Simple Topic');
      expect(screen.getByTestId('generated-prompt')).toHaveTextContent(mockPrompt);
    });
  });

  it('handles and displays the generated prompt for a moderate topic', async () => {
    const mockPrompt = 'This is a generated prompt for a moderate topic with multiple aspects';
    (openAIService.generatePrompt as jest.Mock).mockResolvedValue(mockPrompt);

    render(<PromptForm />);

    const input = screen.getByLabelText('Enter your topic');
    const submitButton = screen.getByRole('button', { name: /generate prompt/i });

    fireEvent.change(input, { target: { value: 'Moderate Topic with Multiple Words' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(openAIService.generatePrompt).toHaveBeenCalledWith('Generate a moderate complexity prompt about: Moderate Topic with Multiple Words. Consider various aspects of the topic.');
      expect(screen.getByTestId('generated-prompt')).toHaveTextContent(mockPrompt);
    });
  });

  it('handles and displays the generated prompt for a complex topic', async () => {
    const complexTopic = 'The role of artificial intelligence in climate change mitigation strategies';
    const mockPrompt = 'This is a comprehensive prompt for a complex topic';
    (openAIService.generatePrompt as jest.Mock).mockResolvedValue(mockPrompt);

    render(<PromptForm />);

    const input = screen.getByLabelText('Enter your topic');
    const submitButton = screen.getByRole('button', { name: /generate prompt/i });

    fireEvent.change(input, { target: { value: complexTopic } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(openAIService.generatePrompt).toHaveBeenCalledWith(expect.stringContaining(complexTopic));
      expect(screen.getByTestId('generated-prompt')).toHaveTextContent(mockPrompt);
    });
  });

  it('allows input up to 200 characters', () => {
    render(<PromptForm />);

    const input = screen.getByLabelText('Enter your topic');
    const longTopic = 'A'.repeat(200);

    fireEvent.change(input, { target: { value: longTopic } });

    expect(input).toHaveValue(longTopic);
  });

  it('displays an error message when openAIService throws an error', async () => {
    (openAIService.generatePrompt as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<PromptForm />);

    const input = screen.getByLabelText('Enter your topic');
    const submitButton = screen.getByRole('button', { name: /generate prompt/i });

    fireEvent.change(input, { target: { value: 'Test Topic' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(openAIService.generatePrompt).toHaveBeenCalled();
      expect(screen.getByTestId('error-message')).toHaveTextContent('An error occurred while generating the prompt. Please try again.');
    });
  });

  it('validates the input and displays an error for invalid input', async () => {
    render(<PromptForm />);

    const input = screen.getByLabelText('Enter your topic');
    const submitButton = screen.getByRole('button', { name: /generate prompt/i });

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter a valid topic (1-200 characters).');
      expect(openAIService.generatePrompt).not.toHaveBeenCalled();
    });
  });

  it('disables the submit button while loading and re-enables it after completion', async () => {
    (openAIService.generatePrompt as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('Prompt'), 1000)));

    render(<PromptForm />);

    const input = screen.getByLabelText('Enter your topic');
    const submitButton = screen.getByRole('button', { name: /generate prompt/i });

    fireEvent.change(input, { target: { value: 'Test Topic' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Generating...');

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent('Generate Prompt');
    }, { timeout: 2000 });
  });
});