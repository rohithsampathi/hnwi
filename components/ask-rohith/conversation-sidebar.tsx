// components/ask-rohith/conversation-sidebar.tsx
// Sidebar component for managing conversation history

"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { CrownLoader } from "@/components/ui/crown-loader"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  MessageSquare,
  Plus,
  Search,
  Trash2,
  MoreVertical,
  Clock,
  MessageCircle,
  Share2,
  Edit2,
  Check,
  X
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Conversation } from "@/types/rohith"

interface ConversationSidebarProps {
  conversations: Conversation[]
  activeConversationId: string | null
  onConversationSelect: (conversationId: string) => void
  onNewConversation: () => void
  onDeleteConversation: (conversationId: string) => void
  onShareConversation?: (conversationId: string) => void
  onUpdateConversationTitle?: (conversationId: string, newTitle: string) => void
  onReloadConversations?: () => Promise<void>
  isLoading?: boolean
  className?: string
}

export function ConversationSidebar({
  conversations,
  activeConversationId,
  onConversationSelect,
  onNewConversation,
  onDeleteConversation,
  onShareConversation,
  onUpdateConversationTitle,
  onReloadConversations,
  isLoading = false,
  className
}: ConversationSidebarProps) {
  const { theme } = useTheme()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null)
  const [conversationToDelete, setConversationToDelete] = useState<{id: string, title: string} | null>(null)
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [isReloading, setIsReloading] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Format relative time
  const formatTime = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const handleDeleteClick = (conversationId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConversationToDelete({ id: conversationId, title })
  }

  const handleConfirmDelete = async () => {
    if (!conversationToDelete) return

    setDeletingConversationId(conversationToDelete.id)
    try {
      await onDeleteConversation(conversationToDelete.id)
      toast({
        title: "Success",
        description: "Conversation deleted successfully",
      })
      // Close the dialog after successful deletion
      setConversationToDelete(null)

      // Reload conversations after deletion
      if (onReloadConversations) {
        setIsReloading(true)
        try {
          await onReloadConversations()
        } catch (reloadError) {
          // Failed to reload conversations after deletion
        } finally {
          setIsReloading(false)
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      })
    } finally {
      setDeletingConversationId(null)
    }
  }

  const handleStartEditTitle = (conversationId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingConversationId(conversationId)
    setEditingTitle(currentTitle)
  }

  const handleSaveTitle = async (conversationId: string) => {
    if (editingTitle.trim() && onUpdateConversationTitle) {
      try {
        await onUpdateConversationTitle(conversationId, editingTitle.trim())
        toast({
          title: "Success",
          description: "Conversation title updated",
        })

        // Reload conversations after title update
        if (onReloadConversations) {
          setIsReloading(true)
          try {
            await onReloadConversations()
          } catch (reloadError) {
            // Failed to reload conversations after title update
          } finally {
            setIsReloading(false)
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update conversation title",
          variant: "destructive",
        })
      }
    }
    setEditingConversationId(null)
    setEditingTitle("")
  }

  const handleCancelEdit = () => {
    setEditingConversationId(null)
    setEditingTitle("")
  }

  useEffect(() => {
    if (editingConversationId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingConversationId])

  return (
    <div className={cn(
      "flex flex-col h-full max-h-full bg-background overflow-hidden",
      className
    )}>

      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        {/* Search and New Conversation */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Button
            onClick={onNewConversation}
            size="sm"
            className="h-9 w-9 p-0 flex-shrink-0"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Conversations List - Scrollable Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll min-h-0 max-h-full">
        <div className="p-2 space-y-2">
          {isReloading ? (
            <div className="flex items-center justify-center py-8">
              <CrownLoader size="sm" text="Updating conversations..." />
            </div>
          ) : (
            <AnimatePresence>
              {filteredConversations.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">
                    {searchQuery ? "No conversations found" : "No conversations yet"}
                  </p>
                  {!searchQuery && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onNewConversation}
                      className={cn(
                        "mt-2",
                        theme === "dark"
                          ? "hover:text-foreground hover:bg-muted"
                          : "hover:text-white hover:bg-primary"
                      )}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Start chatting with Rohith
                    </Button>
                  )}
                </motion.div>
              ) : (
                filteredConversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    layout
                    className={cn(
                      "group relative p-3 rounded-lg cursor-pointer transition-all duration-200",
                      activeConversationId === conversation.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50 border border-transparent"
                    )}
                    onClick={() => onConversationSelect(conversation.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        {editingConversationId === conversation.id ? (
                          <div className="flex items-center gap-1 mb-1" onClick={(e) => e.stopPropagation()}>
                            <Input
                              ref={editInputRef}
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveTitle(conversation.id)
                                } else if (e.key === 'Escape') {
                                  handleCancelEdit()
                                }
                              }}
                              className="h-7 text-sm"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 hover:text-white"
                              onClick={() => handleSaveTitle(conversation.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 hover:text-white"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <h3 className={cn(
                            "font-medium text-sm line-clamp-2 mb-1",
                            activeConversationId === conversation.id
                              ? "text-primary"
                              : "text-foreground"
                          )}>
                            {conversation.title}
                          </h3>
                        )}

                        {/* Last message preview */}
                        {conversation.lastMessage && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {conversation.lastMessage}
                          </p>
                        )}

                        {/* Time and message count */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(conversation.updatedAt)}</span>
                          </div>
                          {conversation.messageCount > 0 && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <MessageSquare className="h-3 w-3" />
                              <span>{conversation.messageCount}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:!text-white hover:!bg-primary/70 dark:hover:!text-white dark:hover:!bg-primary/50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onUpdateConversationTitle && (
                              <DropdownMenuItem
                                onClick={(e) => handleStartEditTitle(conversation.id, conversation.title, e)}
                                className="hover:!text-white hover:!bg-primary dark:hover:!text-white dark:hover:!bg-primary/90"
                              >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                            )}
                            {onShareConversation && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onShareConversation(conversation.id)
                                }}
                                className="hover:!text-white hover:!bg-primary dark:hover:!text-white dark:hover:!bg-primary/90"
                              >
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={(e) => handleDeleteClick(conversation.id, conversation.title, e)}
                              className="text-destructive hover:!bg-red-600 hover:!text-white dark:hover:!bg-red-600 dark:hover:!text-white"
                              disabled={deletingConversationId === conversation.id}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {deletingConversationId === conversation.id ? "Deleting..." : "Delete"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Active indicator */}
                    {activeConversationId === conversation.id && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r"
                      />
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-border bg-background">
        <div className="text-xs text-muted-foreground text-center">
          <p>Your private intelligence ally with HNWI Knowledge Base access</p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!conversationToDelete} onOpenChange={(open) => !open && setConversationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the conversation "{conversationToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConversationToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!!deletingConversationId}
            >
              {deletingConversationId ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ConversationSidebar