"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type Message = { role: "user" | "assistant"; content: string }

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    }, 100)
    return () => clearTimeout(timer)
  }, [isOpen, messages, isLoading])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMessage: Message = { role: "user", content: text }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              data.error ||
              "Something went wrong. Please try again.",
          },
        ])
        return
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content ?? "" },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Could not reach the assistant. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating open button - only when chat is closed */}
      {!isOpen && (
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 size-14 rounded-full shadow-lg bg-lime text-foreground hover:bg-lime/90"
          aria-label="Open chat"
        >
          <MessageCircle className="size-6" />
        </Button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 flex h-[500px] max-h-[70vh] w-[380px] max-w-[calc(100vw-3rem)] flex-col rounded-xl border bg-card shadow-xl"
        >
          <div className="flex shrink-0 items-start justify-between gap-2 border-b px-4 py-3">
            <div>
              <h3 className="font-semibold">Ask about your plan</h3>
              <p className="text-xs text-muted-foreground">
                UAC, fees, benefits, unis & more
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="shrink-0 rounded-full border border-lime text-foreground hover:bg-lime/20 hover:text-foreground"
              aria-label="Close chat"
            >
              <X className="size-5" />
            </Button>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="p-3">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Ask a question about university, UAC, fees, or benefits. I’ll
                  do my best to help — for official decisions, check UAC and
                  Services Australia.
                </p>
              ) : (
                <div className="space-y-3">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex",
                        m.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words",
                          m.role === "user"
                            ? "bg-lime text-foreground"
                            : "bg-muted"
                        )}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
                        <Loader2 className="size-4 animate-spin" />
                        <span>Thinking…</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="shrink-0 border-t p-3">
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your question…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                rows={2}
                className="min-h-0 resize-none"
                disabled={isLoading}
              />
              <Button
                type="button"
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="shrink-0 bg-lime text-foreground hover:bg-lime/90"
              >
                <Send className="size-4" />
              </Button>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Answers are indicative. Check UAC, universities and Services
              Australia for official information.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
