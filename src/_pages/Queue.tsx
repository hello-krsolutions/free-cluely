import React, { useState, useEffect, useRef } from "react"
import { useQuery } from "react-query"
import ScreenshotQueue from "../components/Queue/ScreenshotQueue"
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastVariant,
  ToastMessage
} from "../components/ui/toast"
import ModernCommandBar from "../components/Queue/ModernCommandBar"

interface QueueProps {
  setView: React.Dispatch<React.SetStateAction<"queue" | "solutions" | "debug" | "settings">>
}

const Queue: React.FC<QueueProps> = ({ setView }) => {
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<ToastMessage>({
    title: "",
    description: "",
    variant: "neutral"
  })

  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const [tooltipHeight, setTooltipHeight] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState<{role: "user"|"gemini", text: string}[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const chatInputRef = useRef<HTMLInputElement>(null)

  const barRef = useRef<HTMLDivElement>(null)

  const { data: screenshots = [], refetch } = useQuery<Array<{ path: string; preview: string }>, Error>(
    ["screenshots"],
    async () => {
      if (!window.electronAPI) {
        console.warn("ElectronAPI not available, returning empty screenshots array")
        return []
      }

      try {
        const existing = await window.electronAPI.getScreenshots()
        return existing
      } catch (error) {
        console.error("Error loading screenshots:", error)
        showToast("Error", "Failed to load existing screenshots", "error")
        return []
      }
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      refetchOnWindowFocus: true,
      refetchOnMount: true
    }
  )

  const showToast = (
    title: string,
    description: string,
    variant: ToastVariant
  ) => {
    setToastMessage({ title, description, variant })
    setToastOpen(true)
  }

  const handleDeleteScreenshot = async (index: number) => {
    if (!window.electronAPI) {
      console.warn("ElectronAPI not available")
      return
    }

    const screenshotToDelete = screenshots[index]

    try {
      const response = await window.electronAPI.deleteScreenshot(
        screenshotToDelete.path
      )

      if (response.success) {
        refetch()
      } else {
        console.error("Failed to delete screenshot:", response.error)
        showToast("Error", "Failed to delete the screenshot file", "error")
      }
    } catch (error) {
      console.error("Error deleting screenshot:", error)
    }
  }

  const handleChatSend = async () => {
    if (!chatInput.trim() || !window.electronAPI) return
    setChatMessages((msgs) => [...msgs, { role: "user", text: chatInput }])
    setChatLoading(true)
    setChatInput("")
    try {
      const response = await window.electronAPI.invoke("gemini-chat", chatInput)
      setChatMessages((msgs) => [...msgs, { role: "gemini", text: response }])
    } catch (err) {
      setChatMessages((msgs) => [...msgs, { role: "gemini", text: "Error: " + String(err) }])
    } finally {
      setChatLoading(false)
      chatInputRef.current?.focus()
    }
  }

  useEffect(() => {
    const updateDimensions = () => {
      if (contentRef.current && window.electronAPI) {
        let contentHeight = contentRef.current.scrollHeight
        const contentWidth = contentRef.current.scrollWidth
        if (isTooltipVisible) {
          contentHeight += tooltipHeight
        }
        window.electronAPI.updateContentDimensions({
          width: contentWidth,
          height: contentHeight
        })
      }
    }

    const resizeObserver = new ResizeObserver(updateDimensions)
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current)
    }
    updateDimensions()

    const cleanupFunctions: (() => void)[] = []

    if (window.electronAPI) {
      cleanupFunctions.push(
        window.electronAPI.onScreenshotTaken(() => refetch()),
        window.electronAPI.onResetView(() => refetch()),
        window.electronAPI.onSolutionError((error: string) => {
          showToast(
            "Processing Failed",
            "There was an error processing your screenshots.",
            "error"
          )
          setView("queue")
          console.error("Processing error:", error)
        }),
        window.electronAPI.onProcessingNoScreenshots(() => {
          showToast(
            "No Screenshots",
            "There are no screenshots to process.",
            "neutral"
          )
        })
      )
    }

    return () => {
      resizeObserver.disconnect()
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }, [isTooltipVisible, tooltipHeight])

  // Seamless screenshot-to-LLM flow
  useEffect(() => {
    if (!window.electronAPI) return

    // Listen for screenshot taken event
    const unsubscribe = window.electronAPI.onScreenshotTaken(async (data) => {
      // Refetch screenshots to update the queue
      await refetch();
      // Show loading in chat
      setChatLoading(true);
      try {
        // Get the latest screenshot path
        const latest = data?.path || (Array.isArray(data) && data.length > 0 && data[data.length - 1]?.path);
        if (latest && window.electronAPI) {
          // Call the LLM to process the screenshot
          const response = await window.electronAPI.invoke("analyze-image-file", latest);
          setChatMessages((msgs) => [...msgs, { role: "gemini", text: response.text }]);
        }
      } catch (err) {
        setChatMessages((msgs) => [...msgs, { role: "gemini", text: "Error: " + String(err) }]);
      } finally {
        setChatLoading(false);
      }
    });
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [refetch]);

  const handleTooltipVisibilityChange = (visible: boolean, height: number) => {
    setIsTooltipVisible(visible)
    setTooltipHeight(height)
  }

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen)
  }


  return (
    <div
      ref={barRef}
      style={{
        position: "relative",
        width: "100%",
        pointerEvents: "auto"
      }}
      className="select-none"
    >
      <div className="bg-transparent w-full">
        <div className="px-2 py-1">
          <Toast
            open={toastOpen}
            onOpenChange={setToastOpen}
            variant={toastMessage.variant}
            duration={3000}
          >
            <ToastTitle>{toastMessage.title}</ToastTitle>
            <ToastDescription>{toastMessage.description}</ToastDescription>
          </Toast>
          <div className="w-fit">
            <ModernCommandBar
              screenshots={screenshots}
              onTooltipVisibilityChange={handleTooltipVisibilityChange}
              onChatToggle={handleChatToggle}
              onSettingsClick={() => setView("settings")}
            />
          </div>
          {/* Conditional Chat Interface */}
          {isChatOpen && (
            <div className="mt-4 w-full mx-auto p-4 flex flex-col">
            <div className="flex-1 overflow-y-auto mb-3 p-4 rounded-2xl bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 max-h-64 min-h-[120px] shadow-2xl">
              {chatMessages.length === 0 ? (
                <div className="text-sm text-gray-400 text-center mt-8">
                  💬 Chat with AI Assistant
                  <br />
                  <span className="text-xs text-gray-500">Take a screenshot (Cmd+H) for automatic analysis</span>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`w-full flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-3`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-lg ${
                        msg.role === "user"
                          ? "bg-blue-500 text-white ml-12"
                          : "bg-gray-700/80 text-gray-100 mr-12"
                      }`}
                      style={{ wordBreak: "break-word", lineHeight: "1.4" }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex justify-start mb-3">
                  <div className="bg-gray-700/80 text-gray-200 px-4 py-2 rounded-2xl text-sm shadow-lg mr-12">
                    <span className="inline-flex items-center">
                      <span className="animate-pulse text-blue-400">●</span>
                      <span className="animate-pulse animation-delay-200 text-blue-400">●</span>
                      <span className="animate-pulse animation-delay-400 text-blue-400">●</span>
                      <span className="ml-2">AI is thinking...</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
            <form
              className="flex gap-3 items-center"
              onSubmit={e => {
                e.preventDefault();
                handleChatSend();
              }}
            >
              <input
                ref={chatInputRef}
                className="flex-1 rounded-xl px-4 py-3 bg-gray-700/80 backdrop-blur-xl text-gray-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600/50 shadow-lg transition-all duration-200"
                placeholder="Type your message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                disabled={chatLoading}
              />
              <button
                type="submit"
                className="p-3 rounded-xl bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-all duration-200 shadow-lg disabled:opacity-50 disabled:hover:bg-blue-500"
                disabled={chatLoading || !chatInput.trim()}
                tabIndex={-1}
                aria-label="Send"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6l10 1.5-10 1.5v6z" />
                </svg>
              </button>
            </form>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Queue
