import React, { useState, useEffect, useRef } from "react"
import { Mic, MessageSquare, Settings, Eye, EyeOff, HelpCircle, X } from "lucide-react"

interface ModernCommandBarProps {
  onTooltipVisibilityChange: (visible: boolean, height: number) => void
  screenshots: Array<{ path: string; preview: string }>
  onChatToggle: () => void
  onSettingsClick?: () => void
}

const ModernCommandBar: React.FC<ModernCommandBarProps> = ({
  onTooltipVisibilityChange,
  screenshots,
  onChatToggle,
  onSettingsClick
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioResult, setAudioResult] = useState<string | null>(null)
  const chunks = useRef<Blob[]>([])
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let tooltipHeight = 0
    if (tooltipRef.current && showTooltip) {
      tooltipHeight = tooltipRef.current.offsetHeight + 10
    }
    onTooltipVisibilityChange(showTooltip, tooltipHeight)
  }, [showTooltip, onTooltipVisibilityChange])

  const handleRecordClick = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const recorder = new MediaRecorder(stream)
        recorder.ondataavailable = (e) => chunks.current.push(e.data)
        recorder.onstop = async () => {
          const blob = new Blob(chunks.current, { type: chunks.current[0]?.type || 'audio/webm' })
          chunks.current = []
          const reader = new FileReader()
          reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1]
            try {
              if (window.electronAPI) {
                const result = await window.electronAPI.analyzeAudioFromBase64(base64Data, blob.type)
                setAudioResult(result.text)
              } else {
                setAudioResult('ElectronAPI not available.')
              }
            } catch (err) {
              setAudioResult('Audio analysis failed.')
            }
          }
          reader.readAsDataURL(blob)
        }
        setMediaRecorder(recorder)
        recorder.start()
        setIsRecording(true)
      } catch (err) {
        setAudioResult('Could not start recording.')
      }
    } else {
      mediaRecorder?.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  const handleToggleVisibility = () => {
    setIsVisible(!isVisible)
    // You might want to implement actual window hiding logic here
  }

  return (
    <div className="w-fit relative">
      {/* Main Command Bar */}
      <div className="flex items-center gap-3 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl px-4 py-3 shadow-2xl">
        
        {/* Listen Button */}
        <button
          onClick={handleRecordClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            isRecording 
              ? 'bg-red-500 text-white shadow-lg transform scale-105' 
              : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:transform hover:scale-105'
          }`}
        >
          <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
          {isRecording ? 'Stop' : 'Listen'}
        </button>

        {/* Ask Question Button */}
        <button
          onClick={onChatToggle}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-700/80 hover:bg-gray-600/80 text-gray-200 transition-all duration-200 hover:transform hover:scale-105 shadow-lg"
        >
          <MessageSquare className="w-4 h-4" />
          Ask question
        </button>

        {/* Settings Button */}
        <button
          onClick={onSettingsClick}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-700/80 hover:bg-gray-600/80 text-gray-200 transition-all duration-200 hover:transform hover:scale-105 shadow-lg"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-600/50" />

        {/* Hide Button */}
        <button
          onClick={handleToggleVisibility}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-700/80 hover:bg-gray-600/80 text-gray-200 transition-all duration-200 hover:transform hover:scale-105 shadow-lg"
        >
          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          Hide
        </button>

        {/* Help Button */}
        <button
          onClick={() => setShowTooltip(!showTooltip)}
          className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-700/80 hover:bg-gray-600/80 text-gray-200 transition-all duration-200 hover:transform hover:scale-105 shadow-lg"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Keyboard Shortcuts Tooltip */}
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="absolute top-full right-0 mt-3 w-80 z-50"
        >
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowTooltip(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Take Screenshot</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 text-xs bg-gray-700/80 text-gray-200 rounded-lg">⌘</kbd>
                  <kbd className="px-2 py-1 text-xs bg-gray-700/80 text-gray-200 rounded-lg">H</kbd>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Toggle Window</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 text-xs bg-gray-700/80 text-gray-200 rounded-lg">⌘</kbd>
                  <kbd className="px-2 py-1 text-xs bg-gray-700/80 text-gray-200 rounded-lg">B</kbd>
                </div>
              </div>
              
              {screenshots.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Solve Problem</span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 text-xs bg-gray-700/80 text-gray-200 rounded-lg">⌘</kbd>
                    <kbd className="px-2 py-1 text-xs bg-gray-700/80 text-gray-200 rounded-lg">↵</kbd>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Center Window</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 text-xs bg-gray-700/80 text-gray-200 rounded-lg">⌘</kbd>
                  <kbd className="px-2 py-1 text-xs bg-gray-700/80 text-gray-200 rounded-lg">⇧</kbd>
                  <kbd className="px-2 py-1 text-xs bg-gray-700/80 text-gray-200 rounded-lg">Space</kbd>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-700/50">
              <p className="text-xs text-gray-400">
                Take screenshots to analyze problems, then use AI chat for assistance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Audio Result Display */}
      {audioResult && (
        <div className="absolute top-full left-0 mt-3 max-w-md">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <Mic className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Audio Transcription</h4>
                <p className="text-sm text-gray-300 leading-relaxed">{audioResult}</p>
              </div>
              <button
                onClick={() => setAudioResult(null)}
                className="text-gray-400 hover:text-white transition-colors ml-auto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModernCommandBar
