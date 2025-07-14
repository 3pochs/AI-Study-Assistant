import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage, Message } from './ChatMessage';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onCreateFlashcard: (content: string) => void;
  onExpand: (content: string) => void;
  isLoading?: boolean;
}

export function ChatInterface({ 
  messages, 
  onSendMessage, 
  onCreateFlashcard, 
  onExpand, 
  isLoading = false 
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMouseUp = useCallback((e: MouseEvent) => {
    const selectedText = window.getSelection()?.toString().trim();
    if (selectedText && selectedText.length > 0) {
      const range = window.getSelection()?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        setSelection({
          text: selectedText,
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY - 40, // Position above the selection
        });
      }
    } else {
      setSelection(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseUp]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-bio-border p-4 bg-bio-card">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-glow-pulse"></div>
          AI Learning Assistant
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ask questions, learn concepts, and build knowledge together
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 shadow-glow">
              <svg className="w-8 h-8 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Ready to Learn!</h3>
            <p className="text-muted-foreground max-w-md">
              Start a conversation about any topic. I'll help you understand concepts and create study materials.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onCreateFlashcard={onCreateFlashcard}
              onExpand={onExpand}
            />
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-4 p-6 rounded-xl bg-gradient-card shadow-card mr-8 animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary shadow-glow flex items-center justify-center">
              <Loader2 size={16} className="animate-spin" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>AI is thinking</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {selection && (
        <div
          className="absolute z-10 flex gap-2 p-2 bg-bio-card border border-bio-border rounded-md shadow-lg"
          style={{ left: selection.x, top: selection.y }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onExpand(selection.text);
              setSelection(null);
            }}
          >
            Elaborate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onCreateFlashcard(selection.text);
              setSelection(null);
            }}
          >
            Make Flashcard
          </Button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-bio-border p-4 bg-bio-card">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything you'd like to learn..."
            className="flex-1 min-h-[60px] max-h-32 resize-none bg-background border-bio-border focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="self-end bg-primary hover:bg-primary-glow shadow-glow transition-all duration-300"
            size="lg"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}