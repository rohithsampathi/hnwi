"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { secureApi } from "@/lib/secure-api"
import { Loader2, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "@/contexts/theme-context"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface ChatInterfaceProps {
  conversationId: string
}

export function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { theme } = useTheme()

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: ChatMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const data = await secureApi.post(`/api/chat/message/${conversationId}`, { 
        message: input 
      })
      if (!data || !data.response) {
        throw new Error("Invalid response format from server")
      }

      const assistantMessage: ChatMessage = { role: "assistant", content: data.response }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to send message: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
      // Add error message to chat
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error while processing your message. Please try again.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={`mt-6 ${theme === "dark" ? "bg-[#1A1A1A] text-white" : "bg-white text-[#121212]"}`}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">Strategy Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea
          className={`h-[400px] mb-4 p-4 border rounded-md font-body ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-2 mb-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <Avatar>
                  <AvatarImage src="/ai-avatar.png" alt="AI" />
                  <AvatarFallback className="font-heading">AI</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : theme === "dark"
                      ? "bg-[#2A2A2A] text-white"
                      : "bg-gray-100 text-[#121212]"
                }`}
              >
                <p className="text-sm font-body">{message.content}</p>
              </div>
              {message.role === "user" && (
                <Avatar>
                  <AvatarImage src="/user-avatar.png" alt="User" />
                  <AvatarFallback className="font-heading">U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src="/ai-avatar.png" alt="AI" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-[#2A2A2A]" : "bg-gray-100"}`}>
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className={`flex-grow ${theme === "dark" ? "bg-[#2A2A2A] text-white" : "bg-white text-[#121212]"}`}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

