"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, ShoppingCart, Bot, User, Sparkles, Plus, Minus, Trash2 } from "lucide-react"
import Image from "next/image"

// Product database
const allProducts = [
  {
    id: 1,
    name: "Fresh Bananas",
    price: 2.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Fruits",
    keywords: ["fruit", "banana", "breakfast", "healthy", "potassium"],
  },
  {
    id: 2,
    name: "Organic Apples",
    price: 4.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Fruits",
    keywords: ["fruit", "apple", "organic", "healthy", "snack"],
  },
  {
    id: 3,
    name: "Mixed Berries",
    price: 6.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Fruits",
    keywords: ["fruit", "berry", "antioxidant", "healthy", "breakfast"],
  },
  {
    id: 4,
    name: "Greek Yogurt",
    price: 3.49,
    image: "/placeholder.svg?height=200&width=200",
    category: "Dairy",
    keywords: ["yogurt", "protein", "breakfast", "healthy", "dairy"],
  },
  {
    id: 5,
    name: "Whole Grain Bread",
    price: 3.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Bakery",
    keywords: ["bread", "whole grain", "breakfast", "fiber", "healthy"],
  },
  {
    id: 6,
    name: "Almond Milk",
    price: 3.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Dairy Alternatives",
    keywords: ["milk", "almond", "dairy-free", "healthy", "breakfast"],
  },
  {
    id: 7,
    name: "Chicken Breast",
    price: 8.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Meat",
    keywords: ["chicken", "protein", "meat", "dinner", "healthy"],
  },
  {
    id: 8,
    name: "Salmon Fillet",
    price: 12.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Seafood",
    keywords: ["salmon", "fish", "omega-3", "protein", "healthy", "dinner"],
  },
  {
    id: 9,
    name: "Pasta",
    price: 2.49,
    image: "/placeholder.svg?height=200&width=200",
    category: "Pantry",
    keywords: ["pasta", "carbs", "dinner", "italian", "quick"],
  },
  {
    id: 10,
    name: "Olive Oil",
    price: 7.99,
    image: "/placeholder.svg?height=200&width=200",
    category: "Pantry",
    keywords: ["oil", "olive", "cooking", "healthy", "mediterranean"],
  },
]

// Message types
type MessageType = "user" | "bot" | "product-suggestion"

interface Message {
  id: number
  type: MessageType
  content: string
  timestamp: Date
  products?: typeof allProducts
}

interface CartItem {
  product: (typeof allProducts)[0]
  quantity: number
}

// AI responses based on keywords
const getAIResponse = (userMessage: string) => {
  const message = userMessage.toLowerCase()

  if (message.includes("breakfast") || message.includes("morning")) {
    return {
      text: "Great choice for breakfast! I've found some nutritious options that will give you energy for the day. Here are my top recommendations:",
      keywords: ["breakfast", "healthy", "fruit"],
    }
  } else if (message.includes("dinner") || message.includes("evening") || message.includes("cook")) {
    return {
      text: "Perfect for dinner! Let me suggest some delicious options for a satisfying evening meal:",
      keywords: ["dinner", "protein", "cooking"],
    }
  } else if (message.includes("healthy") || message.includes("diet") || message.includes("nutrition")) {
    return {
      text: "I love helping with healthy choices! Here are some nutritious options that will support your wellness goals:",
      keywords: ["healthy", "protein", "fruit"],
    }
  } else if (message.includes("quick") || message.includes("fast") || message.includes("easy")) {
    return {
      text: "I understand you need something quick and easy! Here are some convenient options:",
      keywords: ["quick", "pasta", "bread"],
    }
  } else if (message.includes("protein")) {
    return {
      text: "Excellent! Protein is essential for a balanced diet. Here are some high-quality protein sources:",
      keywords: ["protein", "chicken", "salmon", "yogurt"],
    }
  } else {
    return {
      text: "I'd be happy to help you find what you're looking for! Based on your request, here are some great options:",
      keywords: ["healthy", "breakfast"],
    }
  }
}

// Function to find relevant products
const findRelevantProducts = (keywords: string[]) => {
  return allProducts
    .filter((product) =>
      keywords.some((keyword) =>
        product.keywords.some((productKeyword) => productKeyword.includes(keyword) || keyword.includes(productKeyword)),
      ),
    )
    .slice(0, 4) // Limit to 4 products per suggestion
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
  const [suggestedProducts, setSuggestedProducts] = useState(allProducts.slice(0, 6))
  const [cart, setCart] = useState<CartItem[]>([])

  const handleSendMessage = () => {
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

      // Simulate AI processing time
      setTimeout(() => {
        const aiResponse = getAIResponse(userInput)
        const relevantProducts = findRelevantProducts(aiResponse.keywords)

        // Add bot response
        const botMessage: Message = {
          id: messages.length + 2,
          type: "bot",
          content: aiResponse.text,
          timestamp: new Date(),
        }

        // Add product suggestions if any found
        const productMessage: Message = {
          id: messages.length + 3,
          type: "product-suggestion",
          content: "Here are my recommendations:",
          timestamp: new Date(),
          products: relevantProducts,
        }

        setMessages((prev) => [...prev, botMessage, productMessage])
        setSuggestedProducts(relevantProducts.length > 0 ? relevantProducts : suggestedProducts)
        setIsTyping(false)
      }, 1500)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const handleAddToCart = (product: (typeof allProducts)[0]) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id)
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      } else {
        return [...prevCart, { product, quantity: 1 }]
      }
    })
  }

  const handleAddAllToCart = (products: typeof allProducts) => {
    products.forEach((product) => {
      handleAddToCart(product)
    })
  }

  const updateCartQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId))
    } else {
      setCart((prevCart) =>
        prevCart.map((item) => (item.product.id === productId ? { ...item, quantity: newQuantity } : item)),
      )
    }
  }

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId))
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
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[700px] flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  AI Shopping Assistant
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                </CardTitle>
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
                              className={`max-w-[80%] rounded-lg p-3 ${
                                message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {message.type === "bot" && <Bot className="h-4 w-4 mt-0.5 text-blue-600" />}
                                {message.type === "user" && <User className="h-4 w-4 mt-0.5" />}
                                <p className="text-sm">{message.content}</p>
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
                                  <Card key={product.id} className="bg-white/80 hover:bg-white transition-colors">
                                    <CardContent className="p-3">
                                      <div className="flex gap-3">
                                        <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                          <Image
                                            src={product.image || "/placeholder.svg"}
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
                        <div key={item.product.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={item.product.image || "/placeholder.svg"}
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
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6 bg-transparent"
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6 ml-1 text-red-500 hover:text-red-700 bg-transparent"
                              onClick={() => removeFromCart(item.product.id)}
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
