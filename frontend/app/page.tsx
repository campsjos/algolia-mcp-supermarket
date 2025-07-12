"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, ShoppingCart, Bot, User, Sparkles, Plus, Minus, Trash2, RotateCcw, Clock, MessageCircle } from "lucide-react"
import Image from "next/image"
import { AlgoliaProduct } from "@/types"
import Markdown from 'react-markdown'


// Message types
type MessageType = "user" | "bot" | "product-suggestion"

interface Message {
  id: number
  type: MessageType
  content: string
  timestamp: Date
  products?: AlgoliaProduct[]
}

interface CartItem {
  product: AlgoliaProduct
  quantity: number
}

interface ConversationInfo {
  messageCount: number
  startTime: number
}

// AI responses based on keywords
const getAIResponse = (prompt: string, sessionId?: string): Promise<{ 
  message: string; 
  products: AlgoliaProduct[];
  sessionId: string;
  conversationInfo?: ConversationInfo;
}> => {
  const body: { prompt: string; sessionId?: string } = { prompt };
  if (sessionId) {
    body.sessionId = sessionId;
  }

  return fetch("http://localhost:4242/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).then((res) => res.json())
}

const initialMessages: Message[] = [
  {
    id: 1,
    type: "bot",
    content:
      "Hello! I'm your AI shopping assistant. I can help you find products, plan meals, and make smart shopping decisions. What are you looking for today?",
    timestamp: new Date(),
  },
]

export default function AIShoppingAssistant() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [suggestedProducts, setSuggestedProducts] = useState<AlgoliaProduct[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  
  // Session management state
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [conversationInfo, setConversationInfo] = useState<ConversationInfo | null>(null)
  const [isNewSession, setIsNewSession] = useState(true)

  // Load session from localStorage on component mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('shopping-assistant-session-id')
    const savedMessages = localStorage.getItem('shopping-assistant-messages')
    const savedCart = localStorage.getItem('shopping-assistant-cart')
    
    if (savedSessionId) {
      // Check if the session is still valid on the backend
      fetch(`http://localhost:4242/api/conversations/${savedSessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.exists) {
            setSessionId(savedSessionId)
            setConversationInfo({
              messageCount: data.messageCount,
              startTime: data.startTime
            })
            setIsNewSession(false)
            
            // Restore messages if available
            if (savedMessages) {
              try {
                const parsedMessages = JSON.parse(savedMessages)
                // Add a welcome back message if restoring a session
                const welcomeBackMessage: Message = {
                  id: parsedMessages.length + 1,
                  type: "bot",
                  content: "Welcome back! I remember our conversation. How can I continue helping you with your shopping?",
                  timestamp: new Date(),
                }
                setMessages([...parsedMessages, welcomeBackMessage])
              } catch (e) {
                console.warn('Failed to parse saved messages')
              }
            }
            
            // Restore cart if available
            if (savedCart) {
              try {
                const parsedCart = JSON.parse(savedCart)
                setCart(parsedCart)
              } catch (e) {
                console.warn('Failed to parse saved cart')
              }
            }
          } else {
            // Session expired, clear localStorage
            localStorage.removeItem('shopping-assistant-session-id')
            localStorage.removeItem('shopping-assistant-messages')
            localStorage.removeItem('shopping-assistant-cart')
          }
        })
        .catch(err => {
          console.warn('Failed to check session validity:', err)
          // Clear invalid session data
          localStorage.removeItem('shopping-assistant-session-id')
          localStorage.removeItem('shopping-assistant-messages')
          localStorage.removeItem('shopping-assistant-cart')
        })
    }
  }, [])

  // Save conversation state to localStorage
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('shopping-assistant-session-id', sessionId)
    }
  }, [sessionId])

  useEffect(() => {
    if (messages.length > 1) { // Don't save just the initial message
      localStorage.setItem('shopping-assistant-messages', JSON.stringify(messages))
    }
  }, [messages])

  useEffect(() => {
    localStorage.setItem('shopping-assistant-cart', JSON.stringify(cart))
  }, [cart])

  const startNewConversation = () => {
    // Clear current session
    if (sessionId) {
      fetch(`http://localhost:4242/api/conversations/${sessionId}`, {
        method: 'DELETE'
      }).catch(err => console.warn('Failed to delete session:', err))
    }
    
    // Reset all state
    setSessionId(null)
    setConversationInfo(null)
    setIsNewSession(true)
    setMessages(initialMessages)
    setCart([])
    setSuggestedProducts([])
    
    // Clear localStorage
    localStorage.removeItem('shopping-assistant-session-id')
    localStorage.removeItem('shopping-assistant-messages')
    localStorage.removeItem('shopping-assistant-cart')
  }

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        type: "user",
        content: inputValue,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, newMessage])
      setIsTyping(true)

      const userInput = inputValue
      setInputValue("")

      try {
        const { 
          message: aiResponse, 
          products, 
          sessionId: responseSessionId, 
          conversationInfo: responseConversationInfo 
        } = await getAIResponse(userInput, sessionId || undefined)

        // Update session information
        if (responseSessionId && responseSessionId !== sessionId) {
          setSessionId(responseSessionId)
          setIsNewSession(false)
        }

        if (responseConversationInfo) {
          setConversationInfo(responseConversationInfo)
        }

        // Add bot response
        const botMessage: Message = {
          id: messages.length + 2,
          type: "bot",
          content: aiResponse,
          timestamp: new Date(),
        }

        // Add product suggestions if any found
        const productMessage: Message = {
          id: messages.length + 3,
          type: "product-suggestion",
          content: "Here are my recommendations:",
          timestamp: new Date(),
          products: products,
        }

        setMessages((prev) => [...prev, botMessage, productMessage])
        setSuggestedProducts(products.length > 0 ? products : suggestedProducts)
      } catch (error) {
        console.error('Failed to get AI response:', error)
        
        // Add error message
        const errorMessage: Message = {
          id: messages.length + 2,
          type: "bot",
          content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsTyping(false)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const handleAddToCart = (product: AlgoliaProduct) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.objectID === product.objectID)
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.objectID === product.objectID ? { ...item, quantity: item.quantity + 1 } : item,
        )
      } else {
        return [...prevCart, { product, quantity: 1 }]
      }
    })
  }

  const handleAddAllToCart = (products: AlgoliaProduct[]) => {
    products.forEach((product) => {
      handleAddToCart(product)
    })
  }

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.product.objectID !== productId))
    } else {
      setCart((prevCart) =>
        prevCart.map((item) => (item.product.objectID === productId ? { ...item, quantity: newQuantity } : item)),
      )
    }
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.objectID !== productId))
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your AI Shopping Assistant</h1>
          <p className="text-gray-600">Get personalized product recommendations through conversation</p>
          
          {/* Session Status */}
          {sessionId && conversationInfo && (
            <div className="mt-4 flex justify-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-blue-700">
                  <MessageCircle className="h-4 w-4" />
                  <span>Session Active</span>
                </div>
                <div className="flex items-center gap-1 text-blue-600">
                  <Clock className="h-4 w-4" />
                  <span>{conversationInfo.messageCount} messages</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={startNewConversation}
                  className="h-6 px-2 text-xs bg-transparent border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  New Chat
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[700px] flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-blue-600" />
                    AI Shopping Assistant
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                  </CardTitle>
                  
                  {/* Conversation Status */}
                  <div className="flex items-center gap-2">
                    {!isNewSession && sessionId && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Conversation Active
                      </Badge>
                    )}
                    {isNewSession && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        New Session
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id}>
                        {/* Regular chat messages */}
                        {message.type !== "product-suggestion" && (
                          <div className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                                }`}
                            >
                              <div className="flex items-start gap-2">
                                {message.type === "bot" && <Bot className="h-4 w-4 mt-0.5 text-blue-600" />}
                                {message.type === "user" && <User className="h-4 w-4 mt-0.5" />}
                                <div>
                                  <Markdown>{message.content}</Markdown>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Product suggestion messages */}
                        {message.type === "product-suggestion" && message.products && message.products.length > 0 && (
                          <div className="flex justify-start">
                            <div className="max-w-full bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-green-600" />
                                  <p className="text-sm font-medium text-green-800">Product Recommendations</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs bg-green-600 text-white border-green-600 hover:bg-green-700"
                                  onClick={() => handleAddAllToCart(message.products!)}
                                >
                                  <ShoppingCart className="h-3 w-3 mr-1" />
                                  Add All to Cart
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {message.products.map((product) => (
                                  <Card key={product.objectID} className="bg-white/80 hover:bg-white transition-colors">
                                    <CardContent className="p-3">
                                      <div className="flex gap-3">
                                        <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                          <Image
                                            src={product.image_url || "/placeholder.svg"}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <Badge variant="secondary" className="text-xs mb-1">
                                            {product.category}
                                          </Badge>
                                          <h4 className="font-medium text-sm text-gray-900 truncate">{product.name}</h4>
                                          <p className="text-lg font-bold text-green-600">${product.price}</p>
                                        </div>
                                      </div>
                                    </CardContent>
                                    <CardFooter className="pt-0 px-3 pb-3">
                                      <Button
                                        size="sm"
                                        className="w-full h-8 text-xs"
                                        onClick={() => handleAddToCart(product)}
                                      >
                                        <ShoppingCart className="h-3 w-3 mr-1" />
                                        Add to Cart
                                      </Button>
                                    </CardFooter>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Typing indicator */}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-blue-600" />
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              <CardFooter className="pt-4">
                <div className="flex w-full gap-2">
                  <Input
                    placeholder="Ask about products, meals, or shopping tips..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button onClick={handleSendMessage} size="icon" disabled={isTyping}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Session Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Conversation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sessionId && conversationInfo ? (
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Active Session</span>
                      </div>
                      <div className="text-xs text-green-600 space-y-1">
                        <div>Messages: {conversationInfo.messageCount}</div>
                        <div>Started: {new Date(conversationInfo.startTime).toLocaleTimeString()}</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={startNewConversation}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Start New Conversation
                    </Button>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <div className="text-blue-700 text-sm">
                      Ready to start a new conversation
                    </div>
                    <div className="text-blue-600 text-xs mt-1">
                      Your conversation will be saved automatically
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent text-left"
                  onClick={() => setInputValue("I need healthy breakfast options")}
                >
                  🥗 Healthy breakfast ideas
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent text-left"
                  onClick={() => setInputValue("Quick dinner recipes")}
                >
                  🍽️ Quick dinner options
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent text-left"
                  onClick={() => setInputValue("High protein foods")}
                >
                  💪 High protein foods
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent text-left"
                  onClick={() => setInputValue("Budget-friendly meals")}
                >
                  💰 Budget-friendly options
                </Button>
              </CardContent>
            </Card>

            {/* Shopping Cart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Shopping Cart
                  {getCartItemCount() > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {getCartItemCount()}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Your cart is empty</p>
                    <p className="text-xs">Add products from recommendations</p>
                  </div>
                ) : (
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.product.objectID} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={item.product.image_url || "/placeholder.svg"}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 truncate">{item.product.name}</h4>
                            <p className="text-sm text-green-600 font-semibold">${item.product.price}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6 bg-transparent"
                              onClick={() => updateCartQuantity(item.product.objectID, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6 bg-transparent"
                              onClick={() => updateCartQuantity(item.product.objectID, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6 ml-1 text-red-500 hover:text-red-700 bg-transparent"
                              onClick={() => removeFromCart(item.product.objectID)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
              {cart.length > 0 && (
                <CardFooter className="flex-col gap-3">
                  <div className="flex justify-between w-full text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">${getCartTotal().toFixed(2)}</span>
                  </div>
                  <Button className="w-full">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Checkout ({getCartItemCount()} items)
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
