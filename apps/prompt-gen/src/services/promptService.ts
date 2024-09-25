import { AIService, openAIService } from './aiService';

class PromptService {
  private aiService: AIService;

  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  private analyzeComplexity(topic: string): 'simple' | 'moderate' | 'complex' {
    const words = topic.split(' ');
    if (words.length <= 3) return 'simple';
    if (words.length <= 7) return 'moderate';
    return 'complex';
  }

  private extractSubtopics(topic: string): string[] {
    const words = topic.toLowerCase().split(' ');
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    // Remove stop words and short words
    const filteredWords = words.filter(word => word.length > 3 && !stopWords.has(word));
    
    // Identify potential compound phrases (2-3 word combinations)
    const compoundPhrases = [];
    for (let i = 0; i < words.length - 1; i++) {
      if (!stopWords.has(words[i]) && !stopWords.has(words[i+1])) {
        compoundPhrases.push(`${words[i]} ${words[i+1]}`);
      }
      if (i < words.length - 2 && !stopWords.has(words[i]) && !stopWords.has(words[i+2])) {
        compoundPhrases.push(`${words[i]} ${words[i+1]} ${words[i+2]}`);
      }
    }

    // Combine individual words and compound phrases, remove duplicates
    const allPotentialSubtopics = [...new Set([...filteredWords, ...compoundPhrases])];

    // Prioritize longer phrases and important keywords
    const prioritizedSubtopics = allPotentialSubtopics.sort((a, b) => {
      const aScore = a.split(' ').length + (this.isImportantKeyword(a) ? 2 : 0);
      const bScore = b.split(' ').length + (this.isImportantKeyword(b) ? 2 : 0);
      return bScore - aScore;
    });

    // Select top 3-5 subtopics
    return prioritizedSubtopics.slice(0, Math.min(5, Math.max(3, prioritizedSubtopics.length)));
  }

  private isImportantKeyword(word: string): boolean {
    const importantKeywords = ['compare', 'contrast', 'analyze', 'evaluate', 'impact', 'effect', 'cause', 'relationship', 'future', 'past', 'present', 'decade', 'year', 'century'];
    return importantKeywords.some(keyword => word.includes(keyword));
  }

  private identifyComparativeAspects(topic: string): string[] {
    const comparativeWords = ['compare', 'contrast', 'versus', 'vs', 'difference', 'similarity', 'advantages', 'disadvantages'];
    return comparativeWords.filter(word => topic.toLowerCase().includes(word));
  }

  private identifyTimeFrames(topic: string): string[] {
    const timeFrameWords = ['year', 'decade', 'century', 'future', 'past', 'present', 'current', 'next', 'previous', 'upcoming'];
    return timeFrameWords.filter(word => topic.toLowerCase().includes(word));
  }

  private async generateComplexPrompt(topic: string): Promise<string> {
    const subtopics = this.extractSubtopics(topic);
    const comparativeAspects = this.identifyComparativeAspects(topic);
    const timeFrames = this.identifyTimeFrames(topic);

    let prompt = `Generate a comprehensive prompt for the topic: "${topic}". Consider the following aspects:\n\n`;

    for (const subtopic of subtopics) {
      prompt += `- ${subtopic}\n`;
    }

    if (comparativeAspects.length > 0) {
      prompt += `\nInclude comparative analysis considering: ${comparativeAspects.join(', ')}\n`;
    }

    if (timeFrames.length > 0) {
      prompt += `\nAddress the following time frames: ${timeFrames.join(', ')}\n`;
    }

    prompt += '\nProvide a thought-provoking and comprehensive prompt that encourages in-depth exploration of the topic.';

    return this.aiService.generatePrompt(prompt);
  }

  async generatePrompt(topic: string): Promise<string> {
    if (!topic || topic.trim().length === 0) {
      throw new Error('Invalid topic provided');
    }

    try {
      const complexity = this.analyzeComplexity(topic);
      let prompt: string;

      switch (complexity) {
        case 'simple':
          prompt = await this.aiService.generatePrompt(`Generate a simple prompt about: ${topic}`);
          break;
        case 'moderate':
          prompt = await this.aiService.generatePrompt(`Generate a moderate complexity prompt about: ${topic}. Consider various aspects of the topic.`);
          break;
        case 'complex':
          prompt = await this.generateComplexPrompt(topic);
          break;
      }

      return prompt;
    } catch (error) {
      console.error('Error generating prompt:', error);
      throw new Error('Failed to generate prompt. Please try again.');
    }
  }
}

// Use the openAIService. In the future, this can be easily swapped with a different AI service.
const promptService = new PromptService(openAIService);

export { promptService };