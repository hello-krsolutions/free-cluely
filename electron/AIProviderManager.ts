import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { AIProvider, Settings } from "../src/types/settings";
import fs from "fs";

export interface AIResponse {
  text: string;
  timestamp: number;
  provider: AIProvider;
  model: string;
}

export interface AIAnalysisResult {
  problem_statement: string;
  context: string;
  suggested_responses: string[];
  reasoning: string;
}

export interface AISolutionResult {
  solution: {
    code: string;
    problem_statement: string;
    context: string;
    suggested_responses: string[];
    reasoning: string;
  };
}

abstract class BaseAIProvider {
  protected apiKey: string;
  protected model: string;
  protected provider: AIProvider;

  constructor(apiKey: string, model: string, provider: AIProvider) {
    this.apiKey = apiKey;
    this.model = model;
    this.provider = provider;
  }

  protected async fileToBase64(imagePath: string): Promise<string> {
    const imageData = await fs.promises.readFile(imagePath);
    return imageData.toString("base64");
  }

  protected cleanJsonResponse(text: string): string {
    text = text.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '');
    return text.trim();
  }

  abstract testConnection(): Promise<boolean>;
  abstract extractProblemFromImages(imagePaths: string[]): Promise<AIAnalysisResult>;
  abstract generateSolution(problemInfo: any): Promise<AISolutionResult>;
  abstract debugSolutionWithImages(problemInfo: any, currentCode: string, debugImagePaths: string[]): Promise<AISolutionResult>;
  abstract analyzeAudioFile(audioPath: string): Promise<AIResponse>;
  abstract analyzeAudioFromBase64(data: string, mimeType: string): Promise<AIResponse>;
  abstract analyzeImageFile(imagePath: string): Promise<AIResponse>;
  abstract chatWithAI(message: string): Promise<string>;
}

class GeminiProvider extends BaseAIProvider {
  private client: GenerativeModel;
  private readonly systemPrompt = `You are Wingman AI, a helpful, proactive assistant for any kind of problem or situation (not just coding). For any user input, analyze the situation, provide a clear problem statement, relevant context, and suggest several possible responses or actions the user could take next. Always explain your reasoning. Present your suggestions as a list of options or next steps.`;

  constructor(apiKey: string, model: string) {
    super(apiKey, model, 'gemini');
    const genAI = new GoogleGenerativeAI(apiKey);
    this.client = genAI.getGenerativeModel({ model });
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.client.generateContent("Hello");
      const response = await result.response;
      return !!response.text();
    } catch (error) {
      console.error("Gemini connection test failed:", error);
      return false;
    }
  }

  private async fileToGenerativePart(imagePath: string) {
    const imageData = await fs.promises.readFile(imagePath);
    return {
      inlineData: {
        data: imageData.toString("base64"),
        mimeType: "image/png"
      }
    };
  }

  async extractProblemFromImages(imagePaths: string[]): Promise<AIAnalysisResult> {
    const imageParts = await Promise.all(imagePaths.map(path => this.fileToGenerativePart(path)));
    
    const prompt = `${this.systemPrompt}\n\nYou are a wingman. Please analyze these images and extract the following information in JSON format:\n{
  "problem_statement": "A clear statement of the problem or situation depicted in the images.",
  "context": "Relevant background or context from the images.",
  "suggested_responses": ["First possible answer or action", "Second possible answer or action", "..."],
  "reasoning": "Explanation of why these suggestions are appropriate."
}\nImportant: Return ONLY the JSON object, without any markdown formatting or code blocks.`;

    const result = await this.client.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = this.cleanJsonResponse(response.text());
    return JSON.parse(text);
  }

  async generateSolution(problemInfo: any): Promise<AISolutionResult> {
    const prompt = `${this.systemPrompt}\n\nGiven this problem or situation:\n${JSON.stringify(problemInfo, null, 2)}\n\nPlease provide your response in the following JSON format:\n{
  "solution": {
    "code": "The code or main answer here.",
    "problem_statement": "Restate the problem or situation.",
    "context": "Relevant background/context.",
    "suggested_responses": ["First possible answer or action", "Second possible answer or action", "..."],
    "reasoning": "Explanation of why these suggestions are appropriate."
  }
}\nImportant: Return ONLY the JSON object, without any markdown formatting or code blocks.`;

    const result = await this.client.generateContent(prompt);
    const response = await result.response;
    const text = this.cleanJsonResponse(response.text());
    return JSON.parse(text);
  }

  async debugSolutionWithImages(problemInfo: any, currentCode: string, debugImagePaths: string[]): Promise<AISolutionResult> {
    const imageParts = await Promise.all(debugImagePaths.map(path => this.fileToGenerativePart(path)));
    
    const prompt = `${this.systemPrompt}\n\nYou are a wingman. Given:\n1. The original problem or situation: ${JSON.stringify(problemInfo, null, 2)}\n2. The current response or approach: ${currentCode}\n3. The debug information in the provided images\n\nPlease analyze the debug information and provide feedback in this JSON format:\n{
  "solution": {
    "code": "The code or main answer here.",
    "problem_statement": "Restate the problem or situation.",
    "context": "Relevant background/context.",
    "suggested_responses": ["First possible answer or action", "Second possible answer or action", "..."],
    "reasoning": "Explanation of why these suggestions are appropriate."
  }
}\nImportant: Return ONLY the JSON object, without any markdown formatting or code blocks.`;

    const result = await this.client.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = this.cleanJsonResponse(response.text());
    return JSON.parse(text);
  }

  async analyzeAudioFile(audioPath: string): Promise<AIResponse> {
    const audioData = await fs.promises.readFile(audioPath);
    const audioPart = {
      inlineData: {
        data: audioData.toString("base64"),
        mimeType: "audio/mp3"
      }
    };
    const prompt = `${this.systemPrompt}\n\nDescribe this audio clip in a short, concise answer. In addition to your main answer, suggest several possible actions or responses the user could take next based on the audio. Do not return a structured JSON object, just answer naturally as you would to a user.`;
    const result = await this.client.generateContent([prompt, audioPart]);
    const response = await result.response;
    const text = response.text();
    return { text, timestamp: Date.now(), provider: this.provider, model: this.model };
  }

  async analyzeAudioFromBase64(data: string, mimeType: string): Promise<AIResponse> {
    const audioPart = { inlineData: { data, mimeType } };
    const prompt = `${this.systemPrompt}\n\nDescribe this audio clip in a short, concise answer. In addition to your main answer, suggest several possible actions or responses the user could take next based on the audio. Do not return a structured JSON object, just answer naturally as you would to a user and be concise.`;
    const result = await this.client.generateContent([prompt, audioPart]);
    const response = await result.response;
    const text = response.text();
    return { text, timestamp: Date.now(), provider: this.provider, model: this.model };
  }

  async analyzeImageFile(imagePath: string): Promise<AIResponse> {
    const imagePart = await this.fileToGenerativePart(imagePath);
    const prompt = `${this.systemPrompt}\n\nDescribe the content of this image in a short, concise answer. In addition to your main answer, suggest several possible actions or responses the user could take next based on the image. Do not return a structured JSON object, just answer naturally as you would to a user. Be concise and brief.`;
    const result = await this.client.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    return { text, timestamp: Date.now(), provider: this.provider, model: this.model };
  }

  async chatWithAI(message: string): Promise<string> {
    const result = await this.client.generateContent(message);
    const response = await result.response;
    return response.text();
  }
}

class OpenAIProvider extends BaseAIProvider {
  private client: OpenAI;

  constructor(apiKey: string, model: string) {
    super(apiKey, model, 'openai');
    this.client = new OpenAI({ apiKey });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 5
      });
      return true;
    } catch (error) {
      console.error("OpenAI connection test failed:", error);
      return false;
    }
  }

  async extractProblemFromImages(imagePaths: string[]): Promise<AIAnalysisResult> {
    const imageContents = await Promise.all(
      imagePaths.map(async (path) => ({
        type: "image_url" as const,
        image_url: { url: `data:image/png;base64,${await this.fileToBase64(path)}` }
      }))
    );

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: `You are Wingman AI. Please analyze these images and extract the following information in JSON format:
{
  "problem_statement": "A clear statement of the problem or situation depicted in the images.",
  "context": "Relevant background or context from the images.",
  "suggested_responses": ["First possible answer or action", "Second possible answer or action", "..."],
  "reasoning": "Explanation of why these suggestions are appropriate."
}
Important: Return ONLY the JSON object, without any markdown formatting or code blocks.`
          },
          ...imageContents
        ]
      }]
    });

    const text = this.cleanJsonResponse(response.choices[0].message.content || "{}");
    return JSON.parse(text);
  }

  async generateSolution(problemInfo: any): Promise<AISolutionResult> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{
        role: "user",
        content: `Given this problem or situation:
${JSON.stringify(problemInfo, null, 2)}

Please provide your response in the following JSON format:
{
  "solution": {
    "code": "The code or main answer here.",
    "problem_statement": "Restate the problem or situation.",
    "context": "Relevant background/context.",
    "suggested_responses": ["First possible answer or action", "Second possible answer or action", "..."],
    "reasoning": "Explanation of why these suggestions are appropriate."
  }
}
Important: Return ONLY the JSON object, without any markdown formatting or code blocks.`
      }]
    });

    const text = this.cleanJsonResponse(response.choices[0].message.content || "{}");
    return JSON.parse(text);
  }

  async debugSolutionWithImages(problemInfo: any, currentCode: string, debugImagePaths: string[]): Promise<AISolutionResult> {
    const imageContents = await Promise.all(
      debugImagePaths.map(async (path) => ({
        type: "image_url" as const,
        image_url: { url: `data:image/png;base64,${await this.fileToBase64(path)}` }
      }))
    );

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: `Given:
1. The original problem or situation: ${JSON.stringify(problemInfo, null, 2)}
2. The current response or approach: ${currentCode}
3. The debug information in the provided images

Please analyze the debug information and provide feedback in this JSON format:
{
  "solution": {
    "code": "The code or main answer here.",
    "problem_statement": "Restate the problem or situation.",
    "context": "Relevant background/context.",
    "suggested_responses": ["First possible answer or action", "Second possible answer or action", "..."],
    "reasoning": "Explanation of why these suggestions are appropriate."
  }
}
Important: Return ONLY the JSON object, without any markdown formatting or code blocks.`
          },
          ...imageContents
        ]
      }]
    });

    const text = this.cleanJsonResponse(response.choices[0].message.content || "{}");
    return JSON.parse(text);
  }

  async analyzeAudioFile(audioPath: string): Promise<AIResponse> {
    // Note: OpenAI Whisper doesn't analyze audio content semantically like Gemini
    // This is a simplified implementation for audio transcription
    throw new Error("Audio analysis not fully supported by OpenAI in this implementation");
  }

  async analyzeAudioFromBase64(data: string, mimeType: string): Promise<AIResponse> {
    throw new Error("Audio analysis not fully supported by OpenAI in this implementation");
  }

  async analyzeImageFile(imagePath: string): Promise<AIResponse> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: "Describe the content of this image in a short, concise answer. In addition to your main answer, suggest several possible actions or responses the user could take next based on the image. Be concise and brief."
          },
          {
            type: "image_url",
            image_url: { url: `data:image/png;base64,${await this.fileToBase64(imagePath)}` }
          }
        ]
      }]
    });

    const text = response.choices[0].message.content || "";
    return { text, timestamp: Date.now(), provider: this.provider, model: this.model };
  }

  async chatWithAI(message: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: message }]
    });

    return response.choices[0].message.content || "";
  }
}

class ClaudeProvider extends BaseAIProvider {
  private client: Anthropic;

  constructor(apiKey: string, model: string) {
    super(apiKey, model, 'claude');
    this.client = new Anthropic({ apiKey });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: this.model,
        max_tokens: 5,
        messages: [{ role: "user", content: "Hello" }]
      });
      return true;
    } catch (error) {
      console.error("Claude connection test failed:", error);
      return false;
    }
  }

  async extractProblemFromImages(imagePaths: string[]): Promise<AIAnalysisResult> {
    const imageContents = await Promise.all(
      imagePaths.map(async (path) => ({
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: "image/png" as const,
          data: await this.fileToBase64(path)
        }
      }))
    );

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: `You are Wingman AI. Please analyze these images and extract the following information in JSON format:
{
  "problem_statement": "A clear statement of the problem or situation depicted in the images.",
  "context": "Relevant background or context from the images.",
  "suggested_responses": ["First possible answer or action", "Second possible answer or action", "..."],
  "reasoning": "Explanation of why these suggestions are appropriate."
}
Important: Return ONLY the JSON object, without any markdown formatting or code blocks.`
          },
          ...imageContents
        ]
      }]
    });

    const text = this.cleanJsonResponse(response.content[0].type === 'text' ? response.content[0].text : "{}");
    return JSON.parse(text);
  }

  async generateSolution(problemInfo: any): Promise<AISolutionResult> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `Given this problem or situation:
${JSON.stringify(problemInfo, null, 2)}

Please provide your response in the following JSON format:
{
  "solution": {
    "code": "The code or main answer here.",
    "problem_statement": "Restate the problem or situation.",
    "context": "Relevant background/context.",
    "suggested_responses": ["First possible answer or action", "Second possible answer or action", "..."],
    "reasoning": "Explanation of why these suggestions are appropriate."
  }
}
Important: Return ONLY the JSON object, without any markdown formatting or code blocks.`
      }]
    });

    const text = this.cleanJsonResponse(response.content[0].type === 'text' ? response.content[0].text : "{}");
    return JSON.parse(text);
  }

  async debugSolutionWithImages(problemInfo: any, currentCode: string, debugImagePaths: string[]): Promise<AISolutionResult> {
    const imageContents = await Promise.all(
      debugImagePaths.map(async (path) => ({
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: "image/png" as const,
          data: await this.fileToBase64(path)
        }
      }))
    );

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: `Given:
1. The original problem or situation: ${JSON.stringify(problemInfo, null, 2)}
2. The current response or approach: ${currentCode}
3. The debug information in the provided images

Please analyze the debug information and provide feedback in this JSON format:
{
  "solution": {
    "code": "The code or main answer here.",
    "problem_statement": "Restate the problem or situation.",
    "context": "Relevant background/context.",
    "suggested_responses": ["First possible answer or action", "Second possible answer or action", "..."],
    "reasoning": "Explanation of why these suggestions are appropriate."
  }
}
Important: Return ONLY the JSON object, without any markdown formatting or code blocks.`
          },
          ...imageContents
        ]
      }]
    });

    const text = this.cleanJsonResponse(response.content[0].type === 'text' ? response.content[0].text : "{}");
    return JSON.parse(text);
  }

  async analyzeAudioFile(audioPath: string): Promise<AIResponse> {
    throw new Error("Audio analysis not supported by Claude in this implementation");
  }

  async analyzeAudioFromBase64(data: string, mimeType: string): Promise<AIResponse> {
    throw new Error("Audio analysis not supported by Claude in this implementation");
  }

  async analyzeImageFile(imagePath: string): Promise<AIResponse> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 300,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: "Describe the content of this image in a short, concise answer. In addition to your main answer, suggest several possible actions or responses the user could take next based on the image. Be concise and brief."
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/png",
              data: await this.fileToBase64(imagePath)
            }
          }
        ]
      }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : "";
    return { text, timestamp: Date.now(), provider: this.provider, model: this.model };
  }

  async chatWithAI(message: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1000,
      messages: [{ role: "user", content: message }]
    });

    return response.content[0].type === 'text' ? response.content[0].text : "";
  }
}

export class AIProviderManager {
  private providers: Map<AIProvider, BaseAIProvider> = new Map();
  private settings: Settings;

  constructor(settings: Settings) {
    this.settings = settings;
    this.initializeProviders();
  }

  updateSettings(newSettings: Settings) {
    this.settings = newSettings;
    this.initializeProviders();
  }

  private initializeProviders() {
    this.providers.clear();

    if (this.settings.providers.gemini.enabled && this.settings.providers.gemini.apiKey) {
      this.providers.set('gemini', new GeminiProvider(
        this.settings.providers.gemini.apiKey,
        this.settings.providers.gemini.model || 'gemini-2.0-flash'
      ));
    }

    if (this.settings.providers.openai.enabled && this.settings.providers.openai.apiKey) {
      this.providers.set('openai', new OpenAIProvider(
        this.settings.providers.openai.apiKey,
        this.settings.providers.openai.model || 'gpt-4o'
      ));
    }

    if (this.settings.providers.claude.enabled && this.settings.providers.claude.apiKey) {
      this.providers.set('claude', new ClaudeProvider(
        this.settings.providers.claude.apiKey,
        this.settings.providers.claude.model || 'claude-3.5-sonnet'
      ));
    }
  }

  getProvider(provider?: AIProvider): BaseAIProvider {
    const targetProvider = provider || this.settings.defaultProvider;
    const providerInstance = this.providers.get(targetProvider);
    
    if (!providerInstance) {
      // Fallback to first available provider
      const firstProvider = this.providers.values().next().value;
      if (!firstProvider) {
        throw new Error("No AI providers are configured or enabled");
      }
      return firstProvider;
    }
    
    return providerInstance;
  }

  async testConnection(provider: AIProvider, apiKey: string, model: string): Promise<{ success: boolean; error?: string }> {
    try {
      let testProvider: BaseAIProvider;
      
      switch (provider) {
        case 'gemini':
          testProvider = new GeminiProvider(apiKey, model);
          break;
        case 'openai':
          testProvider = new OpenAIProvider(apiKey, model);
          break;
        case 'claude':
          testProvider = new ClaudeProvider(apiKey, model);
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }

      const success = await testProvider.testConnection();
      return { success };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.keys());
  }
}
