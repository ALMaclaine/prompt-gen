import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PromptForm from './PromptForm';
import { promptService } from '../services/promptService';

// Mock the promptService
jest.mock('../services/promptService', () => ({
  promptService: {
    generatePrompt: jest.fn(),
  },
}));

describe('PromptForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the form correctly', () => {
    render(<PromptForm />);
    expect(screen.getByLabelText(/enter your topic/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate prompt/i })).toBeInTheDocument();
  });

  it('handles input changes', () => {
    render(<PromptForm />);
    const input = screen.getByLabelText(/enter your topic/i);
    fireEvent.change(input, { target: { value: 'Test Topic' } });
    expect(input).toHaveValue('Test Topic');
  });

  it('displays an error for invalid input', async () => {
    render(<PromptForm />);
    const form = screen.getByRole('form');
    
    // Submit the form with an empty input
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid topic/i)).toBeInTheDocument();
    });
  });

  it('generates a prompt successfully', async () => {
    const mockPrompt = 'Generated prompt for testing';
    (promptService.generatePrompt as jest.Mock).mockResolvedValue(mockPrompt);

    render(<PromptForm />);
    const input = screen.getByLabelText(/enter your topic/i);
    const button = screen.getByRole('button', { name: /generate prompt/i });

    fireEvent.change(input, { target: { value: 'Test Topic' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(mockPrompt)).toBeInTheDocument();
    });
    expect(promptService.generatePrompt).toHaveBeenCalledWith('Test Topic');
  });

  it('handles errors when generating a prompt', async () => {
    const errorMessage = 'API Error';
    (promptService.generatePrompt as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<PromptForm />);
    const input = screen.getByLabelText(/enter your topic/i);
    const button = screen.getByRole('button', { name: /generate prompt/i });

    fireEvent.change(input, { target: { value: 'Test Topic' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/an error occurred while generating the prompt/i)).toBeInTheDocument();
      expect(console.error).toHaveBeenCalledWith('Error generating prompt:', expect.any(Error));
    });
  });
});