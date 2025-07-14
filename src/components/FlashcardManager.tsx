import { useState } from 'react';
import { Download, Trash2, Edit3, Check, X, Zap, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  createdAt: Date;
}

interface FlashcardManagerProps {
  flashcards: Flashcard[];
  onDeleteFlashcard: (id: string) => void;
  onEditFlashcard: (id: string, question: string, answer: string) => void;
  onExportFlashcards: () => void;
  onExportAnki: () => void;
  onGenerateSessionFlashcards: (quantity: number) => void;
  hasMessages: boolean;
}

export function FlashcardManager({ 
  flashcards, 
  onDeleteFlashcard, 
  onEditFlashcard, 
  onExportFlashcards,
  onExportAnki,
  onGenerateSessionFlashcards,
  hasMessages
}: FlashcardManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [numFlashcardsToGenerate, setNumFlashcardsToGenerate] = useState(5); // Default to 5

  const startEditing = (flashcard: Flashcard) => {
    setEditingId(flashcard.id);
    setEditQuestion(flashcard.question);
    setEditAnswer(flashcard.answer);
  };

  const saveEdit = () => {
    if (editingId && editQuestion.trim() && editAnswer.trim()) {
      onEditFlashcard(editingId, editQuestion.trim(), editAnswer.trim());
      setEditingId(null);
      setEditQuestion('');
      setEditAnswer('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditQuestion('');
    setEditAnswer('');
  };

  if (flashcards.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b border-bio-border p-4 bg-bio-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Flashcards</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Create flashcards from AI responses to enhance your learning
              </p>
            </div>
            
            {hasMessages && (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={numFlashcardsToGenerate}
                  onChange={(e) => setNumFlashcardsToGenerate(parseInt(e.target.value))}
                  className="w-20 bg-background border-bio-border focus:border-primary"
                />
                <Button
                  onClick={() => onGenerateSessionFlashcards(numFlashcardsToGenerate)}
                  size="sm"
                  className="bg-primary hover:bg-primary-glow shadow-glow"
                >
                  <Zap size={16} className="mr-2" />
                  Auto-Generate
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-bio-card border border-bio-border rounded-xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Flashcards Yet</h3>
            <p className="text-muted-foreground">
              Click "Flashcard" on AI responses or auto-generate from your session
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-bio-border p-4 bg-bio-card flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Flashcards</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {flashcards.length} cards created
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {hasMessages && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                value={numFlashcardsToGenerate}
                onChange={(e) => setNumFlashcardsToGenerate(parseInt(e.target.value))}
                className="w-20 bg-background border-bio-border focus:border-primary"
              />
              <Button
                onClick={() => onGenerateSessionFlashcards(numFlashcardsToGenerate)}
                size="sm"
                className="bg-primary hover:bg-primary-glow shadow-glow"
              >
                <Zap size={16} className="mr-2" />
                Auto-Generate
              </Button>
            </div>
          )}
          
          <Button
            onClick={onExportAnki}
            size="sm"
            variant="outline"
            className="border-bio-border hover:border-primary hover:text-primary"
            disabled={flashcards.length === 0}
          >
            <FileText size={14} className="mr-1" />
            Anki
          </Button>
          
          <Button
            onClick={onExportFlashcards}
            className="bg-primary hover:bg-primary-glow shadow-glow"
            size="sm"
            disabled={flashcards.length === 0}
          >
            <Download size={16} className="mr-2" />
            Export .md
          </Button>
        </div>
      </div>

      {flashcards.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-bio-card border border-bio-border rounded-xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Flashcards Yet</h3>
            <p className="text-muted-foreground">
              Click "Flashcard" on AI responses or auto-generate from your session
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {flashcards.map((flashcard) => (
            <Card key={flashcard.id} className="bg-bio-card border-bio-border hover:border-primary/50 transition-colors duration-300 animate-slide-up">
              <CardContent className="p-4">
                {editingId === flashcard.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Question</label>
                      <Textarea
                        value={editQuestion}
                        onChange={(e) => setEditQuestion(e.target.value)}
                        className="bg-background border-bio-border focus:border-primary"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Answer</label>
                      <Textarea
                        value={editAnswer}
                        onChange={(e) => setEditAnswer(e.target.value)}
                        className="bg-background border-bio-border focus:border-primary"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={saveEdit}
                        size="sm"
                        className="bg-primary hover:bg-primary-glow"
                      >
                        <Check size={14} className="mr-1" />
                        Save
                      </Button>
                      <Button
                        onClick={cancelEdit}
                        size="sm"
                        variant="outline"
                        className="border-bio-border hover:bg-bio-border"
                      >
                        <X size={14} className="mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-3">
                      <div className="text-sm font-medium text-primary mb-1">Q:</div>
                      <div className="text-foreground">{flashcard.question}</div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm font-medium text-primary mb-1">A:</div>
                      <div className="text-foreground">{flashcard.answer}</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Created {flashcard.createdAt.toLocaleDateString()}
                      </span>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => startEditing(flashcard)}
                          size="sm"
                          variant="outline"
                          className="border-bio-border hover:border-primary hover:text-primary"
                        >
                          <Edit3 size={14} />
                        </Button>
                        <Button
                          onClick={() => onDeleteFlashcard(flashcard.id)}
                          size="sm"
                          variant="outline"
                          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}