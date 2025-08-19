import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Eye, EyeOff, Check, X } from 'lucide-react';
import { Card } from '../components/ui/card';
import { type Settings, AIProvider, PROVIDER_MODELS, DEFAULT_SETTINGS } from '../types/settings';

interface SettingsProps {
  onClose?: () => void;
}

const PROVIDER_DETAILS = {
  gemini: {
    name: 'Google Gemini',
    description: 'Google\'s advanced AI model with multimodal capabilities',
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  openai: {
    name: 'OpenAI',
    description: 'GPT models from OpenAI for advanced text and multimodal tasks',
    color: 'bg-green-500',
    textColor: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  claude: {
    name: 'Anthropic Claude',
    description: 'Claude models known for helpfulness and safety',
    color: 'bg-purple-500',
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
};

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [visibleKeys, setVisibleKeys] = useState<Record<AIProvider, boolean>>({
    gemini: false,
    openai: false,
    claude: false,
  });
  const [testingProvider, setTestingProvider] = useState<AIProvider | null>(null);
  const [testResults, setTestResults] = useState<Record<AIProvider, boolean | null>>({
    gemini: null,
    openai: null,
    claude: null,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      if (window.electronAPI?.getSettings) {
        const savedSettings = await window.electronAPI.getSettings();
        if (savedSettings) {
          setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      if (window.electronAPI?.saveSettings) {
        await window.electronAPI.saveSettings(newSettings);
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const updateProviderSettings = (provider: AIProvider, field: string, value: any) => {
    const newSettings = {
      ...settings,
      providers: {
        ...settings.providers,
        [provider]: {
          ...settings.providers[provider],
          [field]: value,
        },
      },
    };
    
    if (field === 'enabled' && value === false) {
      setTestResults(prev => ({ ...prev, [provider]: null }));
    }
    
    saveSettings(newSettings);
  };

  const toggleKeyVisibility = (provider: AIProvider) => {
    setVisibleKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const testConnection = async (provider: AIProvider) => {
    if (!settings.providers[provider].apiKey) {
      return;
    }

    setTestingProvider(provider);
    setTestResults(prev => ({ ...prev, [provider]: null }));

    try {
      if (window.electronAPI?.testAiConnection) {
        const result = await window.electronAPI.testAiConnection({
          provider,
          apiKey: settings.providers[provider].apiKey,
          model: settings.providers[provider].model,
        });
        setTestResults(prev => ({ ...prev, [provider]: result.success }));
      }
    } catch (error) {
      console.error(`Failed to test ${provider} connection:`, error);
      setTestResults(prev => ({ ...prev, [provider]: false }));
    } finally {
      setTestingProvider(null);
    }
  };

  const setDefaultProvider = (provider: AIProvider) => {
    if (settings.providers[provider].enabled && settings.providers[provider].apiKey) {
      saveSettings({ ...settings, defaultProvider: provider });
    }
  };

  const renderProviderCard = (provider: AIProvider) => {
    const details = PROVIDER_DETAILS[provider];
    const config = settings.providers[provider];
    const testResult = testResults[provider];
    const isTesting = testingProvider === provider;

    return (
      <Card key={provider} className={`p-6 border-2 transition-all duration-200 ${
        settings.defaultProvider === provider && config.enabled 
          ? `border-${details.color.split('-')[1]}-300 ${details.bgColor}` 
          : 'border-gray-200 hover:border-gray-300'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${details.color}`}></div>
              <h3 className="text-lg font-semibold text-gray-900">{details.name}</h3>
              {settings.defaultProvider === provider && config.enabled && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">Default</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{details.description}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => updateProviderSettings(provider, 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {config.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <div className="relative">
                <input
                  type={visibleKeys[provider] ? "text" : "password"}
                  value={config.apiKey}
                  onChange={(e) => updateProviderSettings(provider, 'apiKey', e.target.value)}
                  placeholder={`Enter your ${details.name} API key`}
                  className="w-full px-3 py-2 pr-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <button
                    onClick={() => toggleKeyVisibility(provider)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {visibleKeys[provider] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {config.apiKey && (
                    <button
                      onClick={() => testConnection(provider)}
                      disabled={isTesting}
                      className={`p-1 rounded ${
                        testResult === true
                          ? 'text-green-600'
                          : testResult === false
                          ? 'text-red-600'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {isTesting ? (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : testResult === true ? (
                        <Check size={16} />
                      ) : testResult === false ? (
                        <X size={16} />
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                      )}
                    </button>
                  )}
                </div>
              </div>
              {testResult === false && (
                <p className="text-sm text-red-600 mt-1">Connection failed. Please check your API key.</p>
              )}
              {testResult === true && (
                <p className="text-sm text-green-600 mt-1">Connection successful!</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
              <select
                value={config.model}
                onChange={(e) => updateProviderSettings(provider, 'model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {PROVIDER_MODELS[provider].map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                    {model.description && ` - ${model.description}`}
                  </option>
                ))}
              </select>
            </div>

            {config.apiKey && testResult === true && (
              <button
                onClick={() => setDefaultProvider(provider)}
                disabled={settings.defaultProvider === provider}
                className={`w-full py-2 px-4 rounded-lg transition-colors ${
                  settings.defaultProvider === provider
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : `${details.textColor} border border-current hover:bg-current hover:text-white`
                }`}
              >
                {settings.defaultProvider === provider ? 'Default Provider' : 'Set as Default'}
              </button>
            )}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Done
            </button>
          )}
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Providers</h2>
            <p className="text-gray-600 mb-6">
              Configure your AI providers and API keys. Enable multiple providers to have fallback options.
            </p>
            <div className="grid gap-6">
              {Object.keys(PROVIDER_DETAILS).map((provider) => 
                renderProviderCard(provider as AIProvider)
              )}
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Getting API Keys:</strong>
                </p>
                <ul className="text-sm text-blue-600 mt-2 space-y-1">
                  <li>• <strong>Google Gemini:</strong> Visit <a href="https://makersuite.google.com/app/apikey" className="underline">Google AI Studio</a></li>
                  <li>• <strong>OpenAI:</strong> Visit <a href="https://platform.openai.com/api-keys" className="underline">OpenAI Platform</a></li>
                  <li>• <strong>Anthropic Claude:</strong> Visit <a href="https://console.anthropic.com/" className="underline">Anthropic Console</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
