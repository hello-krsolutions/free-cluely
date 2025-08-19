export type AIProvider = 'gemini' | 'openai' | 'claude';

export interface APIConfiguration {
  apiKey: string;
  enabled: boolean;
  model?: string;
}

export interface Settings {
  providers: {
    gemini: APIConfiguration;
    openai: APIConfiguration;
    claude: APIConfiguration;
  };
  defaultProvider: AIProvider;
  theme: 'light' | 'dark' | 'auto';
}

export interface ProviderModel {
  id: string;
  name: string;
  description?: string;
}

export const PROVIDER_MODELS: Record<AIProvider, ProviderModel[]> = {
  gemini: [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Latest multimodal model' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Advanced reasoning model' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast and efficient model' },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Latest multimodal model' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Efficient and cost-effective' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'High performance model' },
  ],
  claude: [
    { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Most capable model' },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Most powerful model' },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fast and cost-effective' },
  ],
};

export const DEFAULT_SETTINGS: Settings = {
  providers: {
    gemini: {
      apiKey: '',
      enabled: false,
      model: 'gemini-2.0-flash',
    },
    openai: {
      apiKey: '',
      enabled: false,
      model: 'gpt-4o',
    },
    claude: {
      apiKey: '',
      enabled: false,
      model: 'claude-3.5-sonnet',
    },
  },
  defaultProvider: 'gemini',
  theme: 'auto',
};
