
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, AISettings } from './SettingsDialog';

export interface AIProviderInterface {
  sendMessage(messages: any[], settings: AISettings): Promise<string>;
  generateFlashcard(content: string, settings: AISettings): Promise<{ question: string; answer: string }>;
  generateMultipleFlashcards(messages: any[], quantity: number, settings: AISettings): Promise<{ question: string; answer: string }[]>;
  generateNotes(messages: any[], settings: AISettings): Promise<string>;
}

class GeminiProvider implements AIProviderInterface {  async sendMessage(messages: any[], settings: AISettings): Promise<string> {    const genAI = new GoogleGenerativeAI(settings.apiKey);    const model = genAI.getGenerativeModel({ model: settings.model });    const chat = model.startChat({      history: messages.map(m => ({        role: m.type === 'user' ? 'user' : 'model',        parts: [{ text: m.content }],      })),      generationConfig: {        maxOutputTokens: 1000,      },    });    const result = await chat.sendMessage(messages[messages.length - 1].content);    const response = await result.response;    return response.text();  }  async generateFlashcard(content: string, settings: AISettings): Promise<{ question: string; answer: string }> {    const genAI = new GoogleGenerativeAI(settings.apiKey);    const model = genAI.getGenerativeModel({ model: settings.model });    const prompt = `Generate a single flashcard (question and answer) based on the following text. Respond only with a JSON object like this: { "question": "Your question here?", "answer": "Your answer here." }\n\nText: ${content}`;    const result = await model.generateContent(prompt);    const responseText = result.response.text();    try {      const cleanedResponse = responseText.replace(/^```json\n|\n```$/g, '');      return JSON.parse(cleanedResponse);    } catch (e) {      console.error("Failed to parse flashcard JSON from Gemini:", responseText, e);      return { question: "Error generating flashcard", answer: "Please try again." };    }  }  async generateNotes(messages: any[], settings: AISettings): Promise<string> {    const genAI = new GoogleGenerativeAI(settings.apiKey);    const model = genAI.getGenerativeModel({ model: settings.model });    const prompt = `Generate comprehensive study notes in Markdown format based on the following conversation. Focus on key concepts, definitions, and explanations. Organize the notes with headings, bullet points, and code blocks where appropriate. \n\nConversation:\n${messages.map(m => `${m.type === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n')}`;    const result = await model.generateContent(prompt);    return result.response.text();
  }

  async generateMultipleFlashcards(messages: any[], quantity: number, settings: AISettings): Promise<{ question: string; answer: string }[]> {
    const genAI = new GoogleGenerativeAI(settings.apiKey);
    const model = genAI.getGenerativeModel({ model: settings.model });
    const prompt = `Generate ${quantity} flashcards (question and answer) based on the following conversation. Respond only with a JSON array of objects like this: [ { "question": "Your question here?", "answer": "Your answer here." }, ... ]

Conversation:
${messages.map(m => `${m.type === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n')}`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    try {
      const cleanedResponse = responseText.replace(/^```json\n|\n```$/g, '');
      return JSON.parse(cleanedResponse);
    } catch (e) {
      console.error("Failed to parse multiple flashcards JSON from Gemini:", responseText, e);
      return [];
    }
  }
}


  class OpenAIProvider implements AIProviderInterface {
  async sendMessage(messages: any[], settings: AISettings): Promise<string> {
    const openai = new OpenAI({ apiKey: settings.apiKey, dangerouslyAllowBrowser: true });
    const completion = await openai.chat.completions.create({
      model: settings.model,
      messages: messages.map(m => ({ role: m.type, content: m.content })),
    });
    return completion.choices[0].message.content ?? '';
  }

  async generateFlashcard(content: string, settings: AISettings): Promise<{ question: string; answer: string }> {
    const openai = new OpenAI({ apiKey: settings.apiKey, dangerouslyAllowBrowser: true });
    const prompt = `Generate a single flashcard (question and answer) based on the following text. Respond only with a JSON object like this: { "question": "Your question here?", "answer": "Your answer here." }\n\nText: ${content}`;
    const completion = await openai.chat.completions.create({
      model: settings.model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
    });
    try {
      return JSON.parse(completion.choices[0].message.content ?? '');
    } catch (e) {
      console.error("Failed to parse flashcard JSON from OpenAI:", completion.choices[0].message.content, e);
      return { question: "Error generating flashcard", answer: "Please try again." };
    }
  }

  async generateNotes(messages: any[], settings: AISettings): Promise<string> {
    const openai = new OpenAI({ apiKey: settings.apiKey, dangerouslyAllowBrowser: true });
    const prompt = `Generate comprehensive study notes in Markdown format based on the following conversation. Focus on key concepts, definitions, and explanations. Organize the notes with headings, bullet points, and code blocks where appropriate. \n\nConversation:\n${messages.map(m => `${m.type === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n')}`;
    const completion = await openai.chat.completions.create({
      model: settings.model,
      messages: [{ role: 'user', content: prompt }],
    });
    return completion.choices[0].message.content ?? '';
  }

  async generateMultipleFlashcards(messages: any[], quantity: number, settings: AISettings): Promise<{ question: string; answer: string }[]> {
    const openai = new OpenAI({ apiKey: settings.apiKey, dangerouslyAllowBrowser: true });
    const prompt = `Generate ${quantity} flashcards (question and answer) based on the following conversation. Respond only with a JSON array of objects like this: [ { "question": "Your question here?", "answer": "Your answer here." }, ... ]\n\nConversation:\n${messages.map(m => `${m.type === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n')}`;
    const completion = await openai.chat.completions.create({
      model: settings.model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
    });
    try {
      return JSON.parse(completion.choices[0].message.content ?? '');
    } catch (e) {
      console.error("Failed to parse multiple flashcards JSON from OpenAI:", completion.choices[0].message.content, e);
      return [];
    }
  }
}

class OpenRouterProvider implements AIProviderInterface {
  async sendMessage(messages: any[], settings: AISettings): Promise<string> {
    const openai = new OpenAI({ 
      apiKey: settings.apiKey, 
      baseURL: 'https://openrouter.ai/api/v1',
      dangerouslyAllowBrowser: true 
    });
    const completion = await openai.chat.completions.create({
      model: settings.model,
      messages: messages.map(m => ({ role: m.type, content: m.content })),
    });
    return completion.choices[0].message.content ?? '';
  }

  async generateFlashcard(content: string, settings: AISettings): Promise<{ question: string; answer: string }> {
    const openai = new OpenAI({ 
      apiKey: settings.apiKey, 
      baseURL: 'https://openrouter.ai/api/v1',
      dangerouslyAllowBrowser: true 
    });
    const prompt = `Generate a single flashcard (question and answer) based on the following text. Respond only with a JSON object like this: { "question": "Your question here?", "answer": "Your answer here." }\n\nText: ${content}`;
    const completion = await openai.chat.completions.create({
      model: settings.model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
    });
    try {
      return JSON.parse(completion.choices[0].message.content ?? '');
    } catch (e) {
      console.error("Failed to parse flashcard JSON from OpenRouter:", completion.choices[0].message.content, e);
      return { question: "Error generating flashcard", answer: "Please try again." };
    }
  }

  async generateNotes(messages: any[], settings: AISettings): Promise<string> {
    const openai = new OpenAI({ 
      apiKey: settings.apiKey, 
      baseURL: 'https://openrouter.ai/api/v1',
      dangerouslyAllowBrowser: true 
    });
    const prompt = `Generate comprehensive study notes in Markdown format based on the following conversation. Focus on key concepts, definitions, and explanations. Organize the notes with headings, bullet points, and code blocks where appropriate. \n\nConversation:\n${messages.map(m => `${m.type === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n')}`;
    const completion = await openai.chat.completions.create({
      model: settings.model,
      messages: [{ role: 'user', content: prompt }],
    });
    return completion.choices[0].message.content ?? '';
  }

  async generateMultipleFlashcards(messages: any[], quantity: number, settings: AISettings): Promise<{ question: string; answer: string }[]> {
    const openai = new OpenAI({ 
      apiKey: settings.apiKey, 
      baseURL: 'https://openrouter.ai/api/v1',
      dangerouslyAllowBrowser: true 
    });
    const prompt = `Generate ${quantity} flashcards (question and answer) based on the following conversation. Respond only with a JSON array of objects like this: [ { "question": "Your question here?", "answer": "Your answer here." }, ... ]\n\nConversation:\n${messages.map(m => `${m.type === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n')}`;
    const completion = await openai.chat.completions.create({
      model: settings.model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
    });
    try {
      return JSON.parse(completion.choices[0].message.content ?? '');
    } catch (e) {
      console.error("Failed to parse multiple flashcards JSON from OpenRouter:", completion.choices[0].message.content, e);
      return [];
    }
  }
}


  class AnthropicProvider implements AIProviderInterface {
  async sendMessage(messages: any[], settings: AISettings): Promise<string> {
    const anthropic = new Anthropic({ apiKey: settings.apiKey });
    const result = await anthropic.messages.create({
      model: settings.model,
      max_tokens: 1024,
      messages: messages.map(m => ({ role: m.type, content: m.content })),
    });
    return result.content[0].text;
  }

  async generateFlashcard(content: string, settings: AISettings): Promise<{ question: string; answer: string }> {
    const anthropic = new Anthropic({ apiKey: settings.apiKey });
    const prompt = `Generate a single flashcard (question and answer) based on the following text. Respond only with a JSON object like this: { "question": "Your question here?", "answer": "Your answer here." }\n\nText: ${content}`;
    const result = await anthropic.messages.create({
      model: settings.model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    try {
      return JSON.parse(result.content[0].text);
    } catch (e) {
      console.error("Failed to parse flashcard JSON from Anthropic:", result.content[0].text, e);
      return { question: "Error generating flashcard", answer: "Please try again." };
    }
  }

  async generateNotes(messages: any[], settings: AISettings): Promise<string> {
    const anthropic = new Anthropic({ apiKey: settings.apiKey });
    const prompt = `Generate comprehensive study notes in Markdown format based on the following conversation. Focus on key concepts, definitions, and explanations. Organize the notes with headings, bullet points, and code blocks where appropriate. \n\nConversation:\n${messages.map(m => `${m.type === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n')}`;
    const result = await anthropic.messages.create({
      model: settings.model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    return result.content[0].text;
  }

  async generateMultipleFlashcards(messages: any[], quantity: number, settings: AISettings): Promise<{ question: string; answer: string }[]> {
    const anthropic = new Anthropic({ apiKey: settings.apiKey });
    const prompt = `Generate ${quantity} flashcards (question and answer) based on the following conversation. Respond only with a JSON array of objects like this: [ { "question": "Your question here?", "answer": "Your answer here." }, ... ]\n\nConversation:\n${messages.map(m => `${m.type === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n')}`;
    const result = await anthropic.messages.create({
      model: settings.model,
      max_tokens: 2048, // Increased max tokens for multiple flashcards
      messages: [{ role: 'user', content: prompt }],
    });
    try {
      return JSON.parse(result.content[0].text);
    } catch (e) {
      console.error("Failed to parse multiple flashcards JSON from Anthropic:", result.content[0].text, e);
      return [];
    }
  }
}

export const getAIProvider = (provider: AIProvider): AIProviderInterface => {
  switch (provider) {
    case 'gemini':
      return new GeminiProvider();
    case 'openai':
      return new OpenAIProvider();
    case 'openrouter':
      return new OpenRouterProvider();
    case 'anthropic':
      return new AnthropicProvider();
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
};
