'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, User, Bot, Loader2, Copy, ExternalLink, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAIAssistant } from '@/hooks/useAIAssistant'

interface MessageType {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  data?: any
  isError?: boolean
  debugInfo?: any
}



const Message = ({ message }: { message: MessageType }) => {
  const isUser = message.sender === 'user'

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 max-w-full`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-500' : message.isError ? 'bg-red-500' : 'bg-gray-200'
        }`}>
          {isUser ? (
            <User size={16} className="text-white" />
          ) : message.isError ? (
            <AlertTriangle size={16} className="text-white" />
          ) : (
            <Bot size={16} className="text-gray-700" />
          )}
        </div>
        
        <div className={`max-w-[85%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : message.isError
              ? 'bg-red-100 text-red-800 rounded-bl-none'
              : 'bg-gray-100 text-gray-800 rounded-bl-none dark:bg-slate-700 dark:text-white'
        }`}>
          <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
          
          {message.data && (
            <div className="mt-3 p-2 bg-white/10 rounded">
              <h4 className="font-medium mb-1">Transfer Details:</h4>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>From:</span>
                  <div className="flex items-center">
                    <span className="font-mono">{message.data.from?.substring(0, 8)}...</span>
                    <button 
                      onClick={() => copyToClipboard(message.data.from)}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>To:</span>
                  <div className="flex items-center">
                    <span className="font-mono">{message.data.to?.substring(0, 8)}...</span>
                    <button 
                      onClick={() => copyToClipboard(message.data.to)}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Value:</span>
                  <span>{message.data.value}</span>
                </div>
                <div className="flex justify-between">
                  <span>Token:</span>
                  <div className="flex items-center">
                    <span className="font-mono">{message.data.tokenAddress?.substring(0, 8)}...</span>
                    <button 
                      onClick={() => copyToClipboard(message.data.tokenAddress)}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
                {/* <div className="pt-1 mt-1 border-t border-gray-200 dark:border-gray-600">
                  <a 
                    href={`https://etherscan.io/tx/${message.data.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-xs text-blue-500 hover:underline"
                  >
                    <ExternalLink size={12} className="mr-1" />
                    View on Etherscan
                  </a>
                </div> */}
                <div className="pt-1 mt-1 border-t border-gray-200 dark:border-gray-600">
                <span className="flex items-center text-xs text-gray-500">
                  <ExternalLink size={12} className="mr-1" />
                  Transaction Hash: Not Available
                </span>
              </div>
              </div>
            </div>
          )}

          {/* Debug information for developers */}
          {message.debugInfo && (
            <div className="mt-3 p-2 bg-gray-200 text-gray-800 rounded text-xs font-mono">
              <h4 className="font-bold mb-1">Debug Info:</h4>
              <div>Status: {message.debugInfo.status}</div>
              <div>Content-Type: {message.debugInfo.contentType || 'none'}</div>
              <div className="mt-2">
                <h5 className="font-semibold">Response Preview:</h5>
                <div className="overflow-x-auto max-h-40 bg-gray-100 p-1 mt-1">
                  {message.debugInfo.responsePreview}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ChatBox({ 
  setAiTransactions, 
  setEndpoint 
}: { 
  setAiTransactions: (transactions: any) => void,
  setEndpoint: (endpoint: any) => void 
}){
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: '1',
      text: "Hello! I'm the Base Blockchain Assistant. You can ask me about transactions, addresses, or tokens on the blockchain.",
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { sendQuery, isLoading, processResults, debugInfo } = useAIAssistant()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() === '' || isLoading) return

    const userMessage: MessageType = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      const response = await sendQuery(input)
      console.log(response)

      if (response.success) {
        // --- ADD THIS BLOCK ---
        if (Array.isArray(response.data) && response.data.length === 0) {
          setMessages(prev => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              text: "No results found for your query.",
              sender: 'ai',
              timestamp: new Date(),
            }
          ]);
          setAiTransactions([]);
          setEndpoint(response.endPoint || null);
          return;
        }
        // --- END BLOCK ---

        const processed = processResults(response)
        const aiResponse: MessageType = {
          id: (Date.now() + 1).toString(),
          text: processed.text,
          sender: 'ai',
          timestamp: new Date(),
          data: processed.data,
        }

        setAiTransactions(Array.isArray(response.data) ? response.data : []);
        setEndpoint(response.endPoint || null)
        setMessages(prev => [...prev, aiResponse])
      } else {
        // Handle error response with debug info
        const errorResponse: MessageType = {
          id: (Date.now() + 1).toString(),
          text: response.message || "Sorry, I couldn't process your request.",
          sender: 'ai',
          timestamp: new Date(),
          isError: true,
          debugInfo: debugInfo
        }
        setMessages(prev => [...prev, errorResponse])
        setAiTransactions([]);
      }
    } catch (error) {
      const errorResponse: MessageType = {
        id: (Date.now() + 1).toString(),
        text: error instanceof Error ? error.message : "Request failed",
        sender: 'ai',
        timestamp: new Date(),
        isError: true,
        debugInfo: debugInfo
      }
      setMessages(prev => [...prev, errorResponse])
      setAiTransactions([]);
    } finally {
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  const clearChat = () => {
    setMessages([{
      id: '1',
      text: "Hello! I'm the Base Blockchain Assistant. You can ask me about transactions, addresses, or tokens on the blockchain.",
      sender: 'ai',
      timestamp: new Date()
    }])
  }

  return (
    <div className="flex flex-col h-full border rounded-lg shadow-lg bg-white dark:bg-slate-800">
      <div className="px-4 py-3 border-b flex justify-between items-center bg-gray-50 dark:bg-slate-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Blockchain Assistant</h2>
        <button 
          onClick={clearChat}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Clear Chat
        </button>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Message message={message} />
          </motion.div>
        ))}
        
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing your request...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="border-t p-4 bg-gray-50 dark:bg-slate-700">
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about blockchain data or transactions..."
            className="flex-1 border rounded-l-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || input.trim() === ''}
            className={`rounded-r-lg p-2 h-full ${
              isLoading || input.trim() === ''
                ? 'bg-gray-300 cursor-not-allowed dark:bg-slate-600'
                : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
            }`}
          >
            <Send size={18} className="text-white" />
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Try: "Show transfers for 0x123...", "What is Base blockchain?", or "Recent token transfers"
        </div>
      </form>
    </div>
  )
}