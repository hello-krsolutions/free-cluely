import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/card';

interface AuthProps {
  onComplete: () => void;
}

const Auth: React.FC<AuthProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'welcome' | 'setup'>('welcome');
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'claude'>('gemini');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const [hasExistingSettings, setHasExistingSettings] = useState(false);

  useEffect(() => {
    checkExistingSettings();
  }, []);

  const checkExistingSettings = async () => {
    try {
      if (window.electronAPI?.getSettings) {
        const settings = await window.electronAPI.getSettings();
        const hasValidProvider = Object.values(settings.providers || {}).some(
          (p: any) => p.enabled && p.apiKey
        );
        setHasExistingSettings(hasValidProvider);
        if (hasValidProvider) {
          setStep('welcome');
        }
      } else {
        // In web environment, check localStorage
        const webSettings = localStorage.getItem('kanapadadu-settings');
        if (webSettings) {
          const settings = JSON.parse(webSettings);
          const hasValidProvider = Object.values(settings.providers || {}).some(
            (p: any) => p.enabled && p.apiKey
          );
          setHasExistingSettings(hasValidProvider);
        }
      }
    } catch (error) {
      console.error('Error checking existing settings:', error);
    }
  };

  const handleGetStarted = () => {
    if (hasExistingSettings) {
      onComplete();
    } else {
      setStep('setup');
    }
  };

  const validateApiKeyWeb = async (provider: string, apiKey: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (provider === 'gemini') {
        // Test Gemini API directly
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello' }] }]
          })
        });

        if (response.ok) {
          return { success: true };
        } else {
          const error = await response.text();
          return { success: false, error: 'Invalid API key or quota exceeded' };
        }
      } else if (provider === 'openai') {
        // Test OpenAI API
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        if (response.ok) {
          return { success: true };
        } else {
          return { success: false, error: 'Invalid OpenAI API key' };
        }
      } else if (provider === 'claude') {
        // Test Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'Hello' }]
          })
        });

        if (response.ok) {
          return { success: true };
        } else {
          return { success: false, error: 'Invalid Claude API key' };
        }
      }

      return { success: false, error: 'Unknown provider' };
    } catch (error) {
      return { success: false, error: 'Network error or CORS issue' };
    }
  };

  const validateApiKey = async () => {
    if (!apiKey.trim()) return;

    console.log(`[Auth] Starting validation for ${provider} with key: ${apiKey.substring(0, 10)}...`);
    setIsValidating(true);
    setValidationResult(null);
    setValidationError('');

    try {
      let result;

      if (window.electronAPI?.testAiConnection) {
        // Use Electron API if available
        console.log('[Auth] Using Electron API validation...');
        result = await window.electronAPI.testAiConnection({
          provider,
          apiKey: apiKey.trim(),
          model: getDefaultModel(provider)
        });
      } else {
        // Use web validation if in browser
        console.log('[Auth] Using web API validation...');
        result = await validateApiKeyWeb(provider, apiKey.trim());
      }

      console.log('[Auth] Test result:', result);
      setValidationResult(result.success);

      if (result.success) {
        console.log('[Auth] Validation successful, saving settings...');
        // Save the settings
        const settings = {
          providers: {
            gemini: { apiKey: '', enabled: false, model: 'gemini-2.0-flash' },
            openai: { apiKey: '', enabled: false, model: 'gpt-4o' },
            claude: { apiKey: '', enabled: false, model: 'claude-3.5-sonnet' }
          },
          defaultProvider: provider,
          theme: 'auto'
        };

        settings.providers[provider] = {
          apiKey: apiKey.trim(),
          enabled: true,
          model: getDefaultModel(provider)
        };

        if (window.electronAPI?.saveSettings) {
          const saveResult = await window.electronAPI.saveSettings(settings);
          console.log('[Auth] Settings saved to Electron:', saveResult);
        } else {
          // Save to localStorage in web environment
          localStorage.setItem('kanapadadu-settings', JSON.stringify(settings));
          console.log('[Auth] Settings saved to localStorage');
        }

        // Complete setup after a brief delay
        setTimeout(() => {
          console.log('[Auth] Completing setup...');
          onComplete();
        }, 1000);
      } else {
        const errorMsg = result.error || 'Invalid API key or network error';
        console.log('[Auth] Validation failed:', errorMsg);
        setValidationError(errorMsg);
      }
    } catch (error) {
      console.error('[Auth] API key validation failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Connection failed';
      setValidationError(errorMsg);
      setValidationResult(false);
    } finally {
      setIsValidating(false);
    }
  };

  const getDefaultModel = (provider: string) => {
    switch (provider) {
      case 'gemini': return 'gemini-2.0-flash';
      case 'openai': return 'gpt-4o';
      case 'claude': return 'claude-3.5-sonnet';
      default: return 'gemini-2.0-flash';
    }
  };

  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case 'gemini':
        return {
          name: 'Google Gemini',
          description: 'Multimodal AI with vision and audio capabilities',
          keyUrl: 'https://makersuite.google.com/app/apikey',
          placeholder: 'AIzaSy...'
        };
      case 'openai':
        return {
          name: 'OpenAI',
          description: 'GPT models for advanced reasoning',
          keyUrl: 'https://platform.openai.com/api-keys',
          placeholder: 'sk-...'
        };
      case 'claude':
        return {
          name: 'Anthropic Claude',
          description: 'Safe and helpful AI assistant',
          keyUrl: 'https://console.anthropic.com/',
          placeholder: 'sk-ant-...'
        };
      default:
        return {
          name: 'AI Provider',
          description: '',
          keyUrl: '',
          placeholder: ''
        };
    }
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 bg-white shadow-xl">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">AI</span>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-gray-900">Welcome to kanapadadu</h1>
              <p className="text-gray-600 leading-relaxed">
                Your AI-powered coding assistant for interview preparation and problem solving
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm">Key Features:</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  Screenshot analysis with AI vision
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  Multiple AI providers (Gemini, OpenAI, Claude)
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  Voice input and audio analysis
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  Real-time chat assistance
                </li>
              </ul>
            </div>

            <button
              onClick={handleGetStarted}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {hasExistingSettings ? 'Continue' : 'Get Started'}
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.75 6.75L19.25 12L13.75 17.25M19 12H4.75"/>
              </svg>
            </button>

            <p className="text-xs text-gray-500">
              {hasExistingSettings ? 'Continue with your existing settings' : 'Configure your AI provider to begin'}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const providerInfo = getProviderInfo(provider);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 bg-white shadow-xl">
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-lg font-bold text-white">⚙️</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Setup AI Provider</h1>
            <p className="text-gray-600 text-sm">
              Choose and configure your preferred AI provider to get started
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Provider
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['gemini', 'openai', 'claude'].map((p) => {
                  const info = getProviderInfo(p);
                  return (
                    <button
                      key={p}
                      onClick={() => setProvider(p as any)}
                      className={`p-3 text-xs rounded-lg border-2 transition-all ${
                        provider === p
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <div className="font-medium">{info.name.split(' ')[0]}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 text-sm">{providerInfo.name}</h4>
              <p className="text-xs text-gray-600 mt-1">{providerInfo.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setValidationResult(null);
                    setValidationError('');
                  }}
                  placeholder={providerInfo.placeholder}
                  className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {validationResult !== null && (
                    <div className={`p-1 ${validationResult ? 'text-green-600' : 'text-red-600'}`}>
                      {validationResult ? <Check size={16} /> : <AlertCircle size={16} />}
                    </div>
                  )}
                </div>
              </div>
              
              {validationResult === false && (
                <p className="text-sm text-red-600 mt-1">
                  {validationError || 'Invalid API key. Please check and try again.'}
                </p>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                Get your API key from{' '}
                <a
                  href={providerInfo.keyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {providerInfo.name}
                </a>
              </p>

              {/* Debug Info */}
              <div className="text-xs text-gray-400 mt-2 p-2 bg-gray-50 rounded">
                <div>ElectronAPI: {window.electronAPI ? '✅ Available' : '❌ Not Available'}</div>
                <div>testAiConnection: {window.electronAPI && 'testAiConnection' in window.electronAPI ? '✅ Available' : '❌ Not Available'}</div>
                <div>getSettings: {window.electronAPI && 'getSettings' in window.electronAPI ? '✅ Available' : '❌ Not Available'}</div>
                <div>saveSettings: {window.electronAPI && 'saveSettings' in window.electronAPI ? '✅ Available' : '❌ Not Available'}</div>
                <div>Provider: {provider}</div>
                <div>Model: {getDefaultModel(provider)}</div>
                {validationError && <div className="text-red-500">Error: {validationError}</div>}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('welcome')}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Back
              </button>
              <button
                onClick={validateApiKey}
                disabled={!apiKey.trim() || isValidating}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 text-sm disabled:cursor-not-allowed"
              >
                {isValidating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Validating...
                  </div>
                ) : validationResult === true ? (
                  'Completed ✓'
                ) : (
                  'Validate & Continue'
                )}
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
