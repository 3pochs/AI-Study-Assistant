import React from 'react';
import { Bot, User, Clipboard, Check, BrainCircuit, Plus, Repeat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  onCreateFlashcard: (content: string) => void;
  onExpand: (content: string) => void;
}

export function ChatMessage({ message, onCreateFlashcard, onExpand }: ChatMessageProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast({
      title: 'Copied to clipboard',
    });
  };

  const isAI = message.type === 'ai';

  return (
    <div className={`flex gap-4 p-6 rounded-xl shadow-card animate-fade-in ${isAI ? 'bg-gradient-card mr-8' : 'bg-transparent ml-8'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-glow ${isAI ? 'bg-gradient-primary' : 'bg-secondary'}`}>
        {isAI ? <Bot size={18} /> : <User size={18} />}
      </div>
      <div className="flex-1">
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={dark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(React.Children.toArray(children).map(child => typeof child === 'string' ? child : '').join('')).trim()}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        {isAI && (
          <div className="flex gap-2 mt-4">
            <Button variant="ghost" size="sm" onClick={() => onCreateFlashcard(message.content)}>
              <Plus size={14} className="mr-1" />
              Create Flashcard
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onExpand(message.content)}>
              <Repeat size={14} className="mr-1" />
              Expand
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              <Clipboard size={14} className="mr-1" />
              Copy
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
