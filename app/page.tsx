"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ImageIcon, Send, Sparkles } from "lucide-react"
import Image from "next/image"
import { fetchImageDescription } from "@/lib/api"


type Message = {
  role: "user" | "assistant"
  content: {
    type: "text" | "image_url"
    text?: string
    image_url?: {
      url: string
    }
  }[]
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setImagePreview(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && !imagePreview) return

    const userContent: Message["content"] = []

    if (input.trim()) {
      userContent.push({ type: "text", text: input })
    }

    if (imagePreview) {
      userContent.push({
        type: "image_url",
        image_url: { url: imagePreview },
      })
    }

    const userMessage: Message = {
      role: "user",
      content: userContent,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setInput("")
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""

    setTimeout(scrollToBottom, 100)

    try {
      const response = await fetchImageDescription(userMessage)

      const assistantMessage: Message = {
        role: "assistant",
        content: [
          {
            type: "text",
            text: response.choices[0].message.content,
          },
        ],
      }

      setMessages((prev) => [...prev, assistantMessage])
      setTimeout(scrollToBottom, 100)
    } catch (error) {
      console.error("Error fetching response:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: [
          {
            type: "text",
            text: "Sorry, there was an error processing your request.",
          },
        ],
      }
      setMessages((prev) => [...prev, errorMessage])
      setTimeout(scrollToBottom, 100)
    } finally {
      setIsLoading(false)
    }
  }

  const clearImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 relative ">
      <div className="absolute top-7 left-0 right-0 w-full">
        <div className="flex items-center h-full gap-2 text-xl w-full justify-center">
          <Sparkles className="h-full text-pink-500" />
          <span className="text-transparent bg-gradient-to-l  font-bold from-purple-400 to-pink-500 bg-clip-text text-3xl">AI m1tra chat</span>
        </div>
      </div>
      <div className="w-full max-w-3xl">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm py-0">


          <CardContent className="h-[60vh] overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 my-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-white" />
                </div>
                <p className="text-lg">Send a message or upload an image to start the conversation</p>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                      : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800"
                  }`}
                >
                  {message.content.map((content, contentIndex) => (
                    <div key={contentIndex} className="mb-2 last:mb-0">
                      {content.type === "text" && content.text}
                      {content.type === "image_url" && content.image_url && (
                        <div className="mt-3">
                          <div className="rounded-lg overflow-hidden border-2 border-white/50">
                            <Image
                              src={content.image_url.url || "/placeholder.svg"}
                              alt="Uploaded image"
                              width={300}
                              height={200}
                              className="max-w-full object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-4 flex items-center space-x-3 shadow-md">
                  <div className="relative w-6 h-6">
                    <div className="absolute top-0 w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-ping"></div>
                    <div className="absolute top-0 w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
                  </div>
                  <span className="text-gray-700">AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {imagePreview && (
            <div className="px-6 pb-3">
              <div className="relative inline-block">
                <div className="rounded-lg overflow-hidden border-2 border-purple-300 shadow-md">
                  <Image
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    width={120}
                    height={120}
                    className="object-cover"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                  onClick={clearImage}
                >
                  ×
                </Button>
              </div>
            </div>
          )}

          <CardFooter className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-lg">
            <form onSubmit={handleSubmit} className="flex w-full space-x-2">
              <Button
                type="button"
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-md"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow border-2 border-gray-200 focus:border-purple-300 shadow-sm ring-0 text-background"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || (!input.trim() && !imagePreview)}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 shadow-md"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

