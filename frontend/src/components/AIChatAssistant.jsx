import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2, Copy } from 'lucide-react';

const AIChatAssistant = ({ currentView = 'studio', onUsePrompt, onUseStory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Determine mode based on current view
  const isSequenceMode = currentView === 'sequence';
  const mode = isSequenceMode ? 'Story Creator' : 'Video Studio';

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message to chat
    const newUserMessage = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setIsSending(true);

    // Add placeholder for thinking/streaming message
    const thinkingMessageId = Date.now();
    const thinkingMessage = {
      role: 'assistant',
      content: '',
      thinking: '',
      action: '',
      isStreaming: true,
      id: thinkingMessageId
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000';
      const endpoint = `${backendUrl}/api/chat/stream`;

      console.log('💬 Sending streaming chat request to:', endpoint);

      // Add context-specific system instruction
      const contextInstruction = isSequenceMode
        ? `[CONTEXT: You are helping with sequential 60-second video story creation. Focus on developing narrative arcs, character consistency across scenes, and cinematic storytelling for multi-scene videos (4-8 scenes × 8 seconds each). When creating stories, include rich details about characters, settings, camera work, and emotional progression.]`
        : `[CONTEXT: You are helping with single video prompt creation (4-8 seconds). Focus on concise, visual descriptions with camera angles, lighting, action, and atmosphere for standalone video clips.]`;

      const contextualMessage = `${contextInstruction}\n\n${userMessage}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: contextualMessage,
          conversation_history: messages
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              setMessages(prev =>
                prev.map(msg =>
                  msg.id === thinkingMessageId
                    ? {
                        ...msg,
                        thinking: data.type === 'thinking' ? data.content : msg.thinking,
                        action: data.type === 'action' ? data.content : msg.action,
                        content: data.type === 'content' ? (msg.content + data.content) : msg.content,
                        isStreaming: data.type !== 'done' && data.type !== 'error'
                      }
                    : msg
                )
              );

              if (data.type === 'content') {
                fullResponse += data.content;
              }

              if (data.type === 'done') {
                // Final update - remove thinking/action states
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === thinkingMessageId
                      ? {
                          role: 'assistant',
                          content: data.content || fullResponse,
                          isStreaming: false
                        }
                      : msg
                  )
                );
              }

              if (data.type === 'error') {
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === thinkingMessageId
                      ? {
                          role: 'assistant',
                          content: `❌ ${data.content}`,
                          isStreaming: false
                        }
                      : msg
                  )
                );
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

    } catch (error) {
      console.error('❌ Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: `❌ Sorry, I encountered an error: ${error.message}`
      };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUsePrompt = (promptText) => {
    // Call appropriate handler based on current mode
    if (isSequenceMode && onUseStory) {
      onUseStory(promptText);
      // Show feedback
      const feedbackMessage = {
        role: 'assistant',
        content: '✅ Story added to the Story Composer!'
      };
      setMessages(prev => [...prev, feedbackMessage]);
    } else if (!isSequenceMode && onUsePrompt) {
      onUsePrompt(promptText);
      // Show feedback
      const feedbackMessage = {
        role: 'assistant',
        content: '✅ Prompt added to the video generation form!'
      };
      setMessages(prev => [...prev, feedbackMessage]);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const clearChat = () => {
    if (confirm('Clear chat history?')) {
      setMessages([]);
    }
  };

  // Floating chat button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 group"
        title="AI Assistant"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          AI
        </span>
      </button>
    );
  }

  // Chat panel
  return (
    <div
      className={`fixed bottom-6 right-6 bg-gray-900 rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`}
      style={{ maxHeight: '80vh' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-white" />
          <div className="flex flex-col">
            <h3 className="text-white font-semibold text-sm">AI Video Assistant</h3>
            <span className="text-white/80 text-xs">
              {isSequenceMode ? '📖 Story Mode' : '🎬 Studio Mode'}
            </span>
          </div>
          <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
            Gemini
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white/80 hover:text-white transition-colors"
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Container */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800"
            style={{ scrollBehavior: 'smooth' }}
          >
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm mb-2">
                  👋 Hi! I'm your AI {isSequenceMode ? 'story' : 'video'} assistant.
                </p>
                <p className="text-xs mb-4">
                  {isSequenceMode ? '📖 Story Mode - Ask me to:' : '🎬 Studio Mode - Ask me to:'}
                </p>
                <div className="text-xs space-y-1 text-left max-w-xs mx-auto">
                  {isSequenceMode ? (
                    <>
                      <p>• Create multi-scene story narratives</p>
                      <p>• Develop character arcs & consistency</p>
                      <p>• Structure 4-8 scene progressions</p>
                      <p>• Enhance story details & atmosphere</p>
                    </>
                  ) : (
                    <>
                      <p>• Create video prompts (4-8s clips)</p>
                      <p>• Suggest camera angles & lighting</p>
                      <p>• Brainstorm visual ideas</p>
                      <p>• Optimize prompt details</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  {/* Show thinking/action steps for streaming messages */}
                  {msg.isStreaming && (
                    <div className="mb-3 space-y-2">
                      {msg.thinking && (
                        <div className="flex items-start space-x-2 text-xs text-purple-300">
                          <div className="mt-0.5">
                            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                          <span className="italic">{msg.thinking}</span>
                        </div>
                      )}
                      {msg.action && (
                        <div className="flex items-start space-x-2 text-xs text-blue-300">
                          <span className="mt-0.5">⚡</span>
                          <span>{msg.action}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message content */}
                  {msg.content && (
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  )}

                  {/* Streaming cursor */}
                  {msg.isStreaming && msg.content && (
                    <span className="inline-block w-1 h-4 ml-1 bg-purple-400 animate-pulse"></span>
                  )}

                  {/* Action buttons for AI responses */}
                  {msg.role === 'assistant' && !msg.isStreaming && msg.content && !msg.content.startsWith('❌') && !msg.content.startsWith('✅') && (
                    <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-600">
                      <button
                        onClick={() => handleUsePrompt(msg.content)}
                        className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg transition-colors"
                        title={isSequenceMode ? "Use this as story" : "Use this as video prompt"}
                      >
                        {isSequenceMode ? 'Use Story' : 'Use Prompt'}
                      </button>
                      <button
                        onClick={() => copyToClipboard(msg.content)}
                        className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded-lg transition-colors flex items-center space-x-1"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator removed - now using streaming messages with thinking/action steps */}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-gray-900 rounded-b-2xl border-t border-gray-700">
            <div className="flex items-end space-x-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isSequenceMode
                    ? "Ask me to create a story for your video sequence..."
                    : "Ask me anything about video generation..."
                }
                className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows="2"
                disabled={isSending}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isSending}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-3 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="text-xs text-gray-400 hover:text-gray-300 mt-2 transition-colors"
              >
                Clear chat
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AIChatAssistant;
