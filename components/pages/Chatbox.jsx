import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Mic, MicOff, Bot, User, Sparkles, AlertCircle } from 'lucide-react'
import Button from '../Button'
import Card from '../Card'
import { aiAPI } from '../utils/api'

const Chatbot = ({ user }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hello ${user.name}! I'm your AI Health Assistant powered by Google Gemini. I can help you with medical queries, symptom checking, medication information, and general health advice. How can I assist you today?`,
      sender: 'bot',
      timestamp: new Date().toISOString()
    }
  ])
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (input.trim()) {
      const currentInput = input
      
      // Create user message
      const userMessage = {
        id: Date.now(),
        text: currentInput,
        sender: 'user',
        timestamp: new Date().toISOString()
      }
      
      // Add user message to chat
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, userMessage]
        return updatedMessages
      })
      
      setInput('') // Clear input immediately
      setIsTyping(true)
      setError('')

      try {
        // Call AI API
        const response = await aiAPI.chat({
          message: currentInput
        })

        // Extract bot response
        let botMessage = ''
        if (response.data?.data?.message) {
          botMessage = response.data.data.message
        } else if (response.data?.message) {
          botMessage = response.data.message
        }

        if (botMessage) {
          const botResponse = {
            id: Date.now() + 1,
            text: botMessage,
            sender: 'bot',
            timestamp: new Date().toISOString()
          }
          
          setMessages(prev => [...prev, botResponse])
        }
      } catch (err) {
        console.error('AI Chat Error:', err)
        setError('Failed to get AI response. Please try again.')
        
        // Fallback response
        const fallbackResponse = {
          id: Date.now() + 2,
          text: 'I apologize, but I\'m having trouble connecting right now. Please try again or consult with a healthcare professional for immediate concerns.',
          sender: 'bot',
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, fallbackResponse])
      } finally {
        setIsTyping(false)
      }
    }
  }

  const handleVoice = () => {
    if (!isListening) {
      setIsListening(true)
      setTimeout(() => {
        setInput('What are the symptoms of flu?')
        setIsListening(false)
      }, 2000)
    } else {
      setIsListening(false)
    }
  }

  const quickQuestions = [
    'What are common cold symptoms?',
    'How to reduce fever?',
    'Tips for better sleep',
    'Healthy diet recommendations',
    'When should I see a doctor?',
    'Explain my blood pressure reading'
  ]

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-heading font-bold text-gray-900">AI Health Assistant</h1>
            <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-lg text-gray-600">Powered by Google Gemini AI - Ask me anything about your health</p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </motion.div>

        <Card className="p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-accent p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Bot className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-white">Virtual Health Assistant</h2>
                <p className="text-sm text-blue-100">Online • Powered by AI</p>
              </div>
            </div>
          </div>

          <div className="h-96 overflow-y-auto p-6 bg-gray-50">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start space-x-3 mb-4 ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'bot' ? 'bg-primary' : 'bg-accent'
                }`}>
                  {message.sender === 'bot' ? (
                    <Bot className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className={`max-w-xs lg:max-w-md ${
                  message.sender === 'user' ? 'items-end' : 'items-start'
                }`}>
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.sender === 'bot'
                      ? 'bg-white text-gray-900'
                      : 'bg-primary text-black'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words max-w-sm">
                      {message.text}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 px-2">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start space-x-3 mb-4"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex flex-wrap gap-2 mb-4">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="px-3 py-2 bg-secondary text-gray-900 rounded-full text-sm hover:bg-primary hover:text-white transition-colors duration-200"
                >
                  {question}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your health question..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                onClick={handleVoice}
                className={`p-3 rounded-lg transition-colors duration-200 ${
                  isListening
                    ? 'bg-danger text-white'
                    : 'bg-secondary text-gray-900 hover:bg-primary hover:text-white'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <Button onClick={handleSend} className="px-6">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Chatbot