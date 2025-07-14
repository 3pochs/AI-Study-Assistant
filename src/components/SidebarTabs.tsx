import { useState } from 'react';
import { FileText, Brain, Timer, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotesGenerator } from './NotesGenerator';
import { FlashcardManager, Flashcard } from './FlashcardManager';
import { PomodoroTimer } from './PomodoroTimer';
import { Message } from './ChatMessage';
import { AISettings } from './SettingsDialog';

interface SidebarTabsProps {
  messages: Message[];
  sessionTopic: string;
  flashcards: Flashcard[];
  onExportNotes: (markdown: string) => void;
  onDeleteFlashcard: (id: string) => void;
  onEditFlashcard: (id: string, question: string, answer: string) => void;
  onExportFlashcards: () => void;
  onExportAnki: () => void;
  onGenerateSessionFlashcards: (quantity: number) => void;
  onPomodoroComplete: () => void;
  aiSettings: AISettings;
}

export function SidebarTabs({
  messages,
  sessionTopic,
  flashcards,
  onExportNotes,
  onDeleteFlashcard,
  onEditFlashcard,
  onExportFlashcards,
  onExportAnki,
  onGenerateSessionFlashcards,
  onPomodoroComplete,
  aiSettings
}: SidebarTabsProps) {
  const [activeTab, setActiveTab] = useState('notes');

  return (
    <div className="h-full bg-bio-card">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="border-b border-bio-border bg-bio-card">
          <TabsList className="w-full justify-start bg-transparent p-0 h-auto">
            <TabsTrigger 
              value="notes" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent text-muted-foreground hover:text-foreground transition-colors py-3"
            >
              <FileText size={16} className="mr-2" />
              <span className="hidden sm:inline">Notes</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="flashcards" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent text-muted-foreground hover:text-foreground transition-colors py-3 relative"
            >
              <Brain size={16} className="mr-2" />
              <span className="hidden sm:inline">Cards</span>
              {flashcards.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {flashcards.length}
                </span>
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="timer" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent text-muted-foreground hover:text-foreground transition-colors py-3"
            >
              <Clock size={16} className="mr-2" />
              <span className="hidden sm:inline">Focus</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="notes" className="h-full m-0 focus-visible:outline-none">
            <NotesGenerator
              messages={messages}
              sessionTopic={sessionTopic}
              onExportNotes={onExportNotes}
              aiSettings={aiSettings}
            />
          </TabsContent>

          <TabsContent value="flashcards" className="h-full m-0 focus-visible:outline-none">
            <FlashcardManager
              flashcards={flashcards}
              onDeleteFlashcard={onDeleteFlashcard}
              onEditFlashcard={onEditFlashcard}
              onExportFlashcards={onExportFlashcards}
              onExportAnki={onExportAnki}
              onGenerateSessionFlashcards={(quantity) => onGenerateSessionFlashcards(quantity)}
              hasMessages={messages.length > 0}
            />
          </TabsContent>

          <TabsContent value="timer" className="h-full m-0 p-4 focus-visible:outline-none">
            <div className="h-full flex flex-col">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-2">Focus Timer</h2>
                <p className="text-sm text-muted-foreground">
                  Use the Pomodoro technique to maintain focus during your learning session
                </p>
              </div>
              
              <div className="flex-1 flex items-start">
                <PomodoroTimer onSessionComplete={onPomodoroComplete} />
              </div>

              <div className="mt-6 p-4 bg-bio-border/50 rounded-lg">
                <h3 className="text-sm font-medium text-foreground mb-2">📚 Study Tips</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Focus on one concept at a time</li>
                  <li>• Take notes during AI conversations</li>
                  <li>• Review flashcards during breaks</li>
                  <li>• Ask follow-up questions</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}