import { useState, useCallback, useEffect } from 'react';
import { Settings, Plus, BookOpen, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ChatInterface } from './ChatInterface';
import { FlashcardManager, Flashcard } from './FlashcardManager';
import { NotesGenerator } from './NotesGenerator';
import { PomodoroTimer } from './PomodoroTimer';
import { SidebarTabs } from './SidebarTabs';
import { Message } from './ChatMessage';
import { saveConversation } from '@/lib/file-saver';
import { SettingsDialog, AISettings, AIProvider } from './SettingsDialog';
import { getAIProvider } from '@/lib/ai-providers';

interface Session {
  id: string;
  topic: string;
  messages: Message[];
  flashcards: Flashcard[];
  createdAt: Date;
  updatedAt: Date;
}

export function LearningAssistant() {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newSessionTopic, setNewSessionTopic] = useState('');
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    const savedSettings = localStorage.getItem('ai-settings');
    return savedSettings ? JSON.parse(savedSettings) : { provider: 'gemini', apiKey: '', model: '' };
  });
  const { toast } = useToast();

  useEffect(() => {
    const savedConversation = localStorage.getItem('conversation');
    if (savedConversation) {
      const parsedSession = JSON.parse(savedConversation, (key, value) => {
        if (key === 'createdAt' || key === 'updatedAt' || key === 'timestamp') {
          return new Date(value);
        }
        return value;
      });
      setCurrentSession(parsedSession);
    }
  }, []);

  const handleSaveConversation = () => {
    if (currentSession) {
      saveConversation(currentSession);
      toast({
        title: "Conversation Saved",
        description: "Your conversation has been saved locally.",
      });
    }
  };

  const handleSaveSettings = (settings: AISettings) => {
    setAiSettings(settings);
    localStorage.setItem('ai-settings', JSON.stringify(settings));
    toast({
      title: 'Settings Saved',
      description: `Switched to ${settings.provider} with model ${settings.model}`,
    });
  };

  const handleLoadConversation = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const loadedSession = JSON.parse(e.target?.result as string, (key, value) => {
            if (key === 'createdAt' || key === 'updatedAt' || key === 'timestamp') {
              return new Date(value);
            }
            return value;
          });
          setCurrentSession(loadedSession);
          toast({
            title: "Conversation Loaded",
            description: `Successfully loaded conversation for ${loadedSession.topic}.`,
          });
        } catch (error) {
          console.error("Error loading conversation:", error);
          toast({
            title: "Error Loading Conversation",
            description: "Failed to load conversation. Please ensure it's a valid JSON file.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  

  const startNewSession = () => {
    if (!newSessionTopic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your learning session.",
        variant: "destructive",
      });
      return;
    }

    const session: Session = {
      id: Date.now().toString(),
      topic: newSessionTopic.trim(),
      messages: [],
      flashcards: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCurrentSession(session);
    setNewSessionTopic('');
    setIsNewSessionOpen(false);
    
    toast({
      title: "Session Started",
      description: `Ready to learn about ${session.topic}!`,
    });
  };

  const handleSendMessage = useCallback(async (content: string) => {
    if (!currentSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    };

    setCurrentSession(prev => {
      const newState = prev ? {
        ...prev,
        messages: [...prev.messages, userMessage],
        updatedAt: new Date(),
      } : null;
      if (newState) {
        localStorage.setItem('conversation', JSON.stringify(newState));
      }
      return newState;
    });

    setIsLoading(true);

    try {
      const aiProvider = getAIProvider(aiSettings.provider);
      const aiResponseContent = await aiProvider.sendMessage(
        [...currentSession.messages, userMessage],
        aiSettings
      );

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponseContent,
        timestamp: new Date(),
      };

      setCurrentSession(prev => {
        const newState = prev ? {
          ...prev,
          messages: [...prev.messages, aiResponse],
          updatedAt: new Date(),
        } : null;
        if (newState) {
          localStorage.setItem('conversation', JSON.stringify(newState));
        }
        return newState;
      });

    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: 'AI Error',
        description: 'Could not get a response from the AI. Please check your settings.',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  }, [currentSession, aiSettings, toast]);

  const handleCreateFlashcard = useCallback(async (content: string) => {
    if (!currentSession) return;

    setIsLoading(true);
    try {
      const aiProvider = getAIProvider(aiSettings.provider);
      const { question, answer } = await aiProvider.generateFlashcard(content, aiSettings);

      const flashcard: Flashcard = {
        id: Date.now().toString(),
        question,
        answer,
        createdAt: new Date(),
      };

      setCurrentSession(prev => {
        const newState = prev ? {
          ...prev,
          flashcards: [...prev.flashcards, flashcard],
          updatedAt: new Date(),
        } : null;
        if (newState) {
          localStorage.setItem('conversation', JSON.stringify(newState));
        }
        return newState;
      });

      toast({
        title: "Flashcard Created",
        description: "Added to your study deck!",
      });
    } catch (error) {
      console.error('Error generating flashcard:', error);
      toast({
        title: 'Flashcard Error',
        description: 'Could not generate flashcard. Please check your AI settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, aiSettings, toast]);

  const handleExpand = useCallback(async (content: string) => {
    if (!currentSession) return;

    const expandPrompt = `Can you elaborate more on: "${content}"`;
    handleSendMessage(expandPrompt);
  }, [currentSession, handleSendMessage]);

  const handleDeleteFlashcard = useCallback((id: string) => {
    setCurrentSession(prev => {
      const newState = prev ? {
        ...prev,
        flashcards: prev.flashcards.filter(card => card.id !== id),
        updatedAt: new Date(),
      } : null;
      if (newState) {
        localStorage.setItem('conversation', JSON.stringify(newState));
      }
      return newState;
    });

    toast({
      title: "Flashcard Deleted",
      description: "Removed from your study deck.",
    });
  }, [toast]);

  const handleEditFlashcard = useCallback((id: string, question: string, answer: string) => {
    setCurrentSession(prev => {
      const newState = prev ? {
        ...prev,
        flashcards: prev.flashcards.map(card => 
          card.id === id ? { ...card, question, answer } : card
        ),
        updatedAt: new Date(),
      } : null;
      if (newState) {
        localStorage.setItem('conversation', JSON.stringify(newState));
      }
      return newState;
    });

    toast({
      title: "Flashcard Updated",
      description: "Your changes have been saved.",
    });
  }, [toast]);

  const handleExportFlashcards = useCallback(() => {
    if (!currentSession || currentSession.flashcards.length === 0) return;

    const markdown = currentSession.flashcards.map(card => 
      `Q: ${card.question}\nA: ${card.answer}\n`
    ).join('\n');

    console.log("Exporting Markdown Flashcards:", markdown);

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSession.topic}_flashcards.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Flashcards Exported",
      description: "Downloaded as Markdown file.",
    });
  }, [currentSession, toast]);

  const handleExportAnki = useCallback(() => {
    if (!currentSession || currentSession.flashcards.length === 0) return;

    // Create Anki-compatible format (CSV or TXT that can be imported)
    const ankiFormat = currentSession.flashcards.map(card => 
      `"${card.question.replace(/"/g, '""')}","${card.answer.replace(/"/g, '""')}"`
    ).join('\n');

    console.log("Exporting Anki Flashcards:", ankiFormat);

    const header = '"Front","Back"\n';
    const content = header + ankiFormat;

    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSession.topic}_anki_flashcards.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Anki Flashcards Exported",
      description: "Import the CSV file into Anki.",
    });
  }, [currentSession, toast]);

  const handleGenerateSessionFlashcards = useCallback(async (quantity: number) => {
    if (!currentSession || currentSession.messages.length === 0) return;

    setIsLoading(true);
    try {
      const aiProvider = getAIProvider(aiSettings.provider);
      const generatedCards = await aiProvider.generateMultipleFlashcards(
        currentSession.messages,
        quantity,
        aiSettings
      );

      if (generatedCards.length > 0) {
        setCurrentSession(prev => {
          const newState = prev ? {
            ...prev,
            flashcards: [...prev.flashcards, ...generatedCards.map(card => ({
              ...card,
              id: Date.now().toString() + Math.random(), // Ensure unique ID
              createdAt: new Date(),
            }))],
            updatedAt: new Date(),
          } : null;
          if (newState) {
            localStorage.setItem('conversation', JSON.stringify(newState));
          }
          return newState;
        });

        toast({
          title: "Session Flashcards Generated",
          description: `Created ${generatedCards.length} flashcards from your conversation.`,
        });
      } else {
        toast({
          title: "No Flashcards Generated",
          description: "Not enough content to create flashcards. Continue the conversation!",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating session flashcards:', error);
      toast({
        title: 'Flashcard Generation Error',
        description: 'Could not generate flashcards from session. Please check your AI settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, aiSettings, toast]);

  const handleExportNotes = useCallback((markdown: string) => {
    if (!currentSession) return;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSession.topic}_notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Notes Exported",
      description: "Downloaded as Markdown file for Obsidian.",
    });
  }, [currentSession, toast]);

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mb-8 mx-auto shadow-glow animate-glow-pulse">
            <BookOpen size={40} className="text-primary-foreground" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4">AI Learning Assistant</h1>
          <p className="text-muted-foreground mb-8">
            Start a personalized learning session with AI. Create notes, flashcards, and export everything to Obsidian.
          </p>

          <Dialog open={isNewSessionOpen} onOpenChange={setIsNewSessionOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-primary hover:bg-primary-glow shadow-glow">
                <Plus size={20} className="mr-2" />
                Start Learning Session
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-bio-card border-bio-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">New Learning Session</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Choose a topic you'd like to explore and learn about with AI assistance.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    What would you like to learn about?
                  </label>
                  <Input
                    value={newSessionTopic}
                    onChange={(e) => setNewSessionTopic(e.target.value)}
                    placeholder="e.g., Biology, React Hooks, Machine Learning..."
                    className="bg-background border-bio-border focus:border-primary"
                    onKeyDown={(e) => e.key === 'Enter' && startNewSession()}
                  />
                </div>
                <Button 
                  onClick={startNewSession}
                  className="w-full bg-primary hover:bg-primary-glow shadow-glow"
                  disabled={!newSessionTopic.trim()}
                >
                  Start Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="absolute bottom-4 right-4 text-sm text-muted-foreground">
            Made by <a href="https://zahidnassoro.com" target="_blank" rel="noopener noreferrer" className="text-bio-green hover:underline">Zahid</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-bio-border bg-bio-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
              <BookOpen size={18} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{currentSession.topic}</h1>
              <p className="text-sm text-muted-foreground">
                {currentSession.messages.length} messages • {currentSession.flashcards.length} flashcards
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentSession(null)}
              className="border-bio-border hover:bg-bio-border"
            >
              New Session
            </Button>
            <label htmlFor="load-conversation" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-bio-border bg-background hover:bg-bio-border h-8 px-3 cursor-pointer">
              Load Conversation
              <Input
                id="load-conversation"
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleLoadConversation}
              />
            </label>
            <Button
              variant="outline"
              size="sm"
              className="border-bio-border hover:bg-bio-border"
              onClick={handleSaveConversation}
            >
              <Save size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-bio-border hover:bg-bio-border"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings size={16} />
            </Button>
          </div>
        </div>
      </header>

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentSettings={aiSettings}
      />

      {/* Main Layout */}
      <div className="h-[calc(100vh-73px)] flex">
        {/* Chat Section */}
        <div className="flex-1 border-r border-bio-border">
          <ChatInterface
            messages={currentSession.messages}
            onSendMessage={handleSendMessage}
            onCreateFlashcard={handleCreateFlashcard}
            onExpand={handleExpand}
            isLoading={isLoading}
          />
        </div>

        {/* Right Sidebar with Tabs */}
        <div className="w-96">
          <SidebarTabs
            messages={currentSession.messages}
            sessionTopic={currentSession.topic}
            flashcards={currentSession.flashcards}
            onExportNotes={handleExportNotes}
            onDeleteFlashcard={handleDeleteFlashcard}
            onEditFlashcard={handleEditFlashcard}
            onExportFlashcards={handleExportFlashcards}
            onExportAnki={handleExportAnki}
            onGenerateSessionFlashcards={handleGenerateSessionFlashcards}
            onPomodoroComplete={() => {
              toast({
                title: "Focus Session Complete!",
                description: "Take a moment to review what you've learned.",
              });
            }}
            aiSettings={aiSettings}
          />
        </div>
      </div>
    </div>
  );
}