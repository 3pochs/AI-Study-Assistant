import { useState } from 'react';
import { Download, Eye, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Message } from './ChatMessage';

import { getAIProvider } from '@/lib/ai-providers';
import { AISettings } from './SettingsDialog';

interface NotesGeneratorProps {
  messages: Message[];
  sessionTopic: string;
  onExportNotes: (markdown: string) => void;
  aiSettings: AISettings;
}

export function NotesGenerator({ messages, sessionTopic, onExportNotes, aiSettings }: NotesGeneratorProps) {
  const [generatedNotes, setGeneratedNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMarkdownNotes = async () => {
    setIsGenerating(true);
    try {
      const aiProvider = getAIProvider(aiSettings.provider);
      const notes = await aiProvider.generateNotes(messages, aiSettings);
      setGeneratedNotes(notes);
    } catch (error) {
      console.error('Error generating notes:', error);
      // Optionally show a toast notification for the error
    } finally {
      setIsGenerating(false);
    }
  };

  

  const handleExport = () => {
    if (generatedNotes) {
      onExportNotes(generatedNotes);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b border-bio-border p-4 bg-bio-card">
          <h2 className="text-xl font-semibold text-foreground">Notes</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generate Obsidian-compatible notes from your learning session
          </p>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-bio-card border border-bio-border rounded-xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Start Chatting</h3>
            <p className="text-muted-foreground">
              Begin a conversation to generate comprehensive notes
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
          <h2 className="text-xl font-semibold text-foreground">Notes</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {generatedNotes ? 'Ready for export' : 'Generate your session notes'}
          </p>
        </div>
        
        <div className="flex gap-2">
          {!generatedNotes && (
            <Button
              onClick={generateMarkdownNotes}
              disabled={isGenerating}
              className="bg-primary hover:bg-primary-glow shadow-glow"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Code size={16} className="mr-2" />
                  Generate Notes
                </>
              )}
            </Button>
          )}
          
          {generatedNotes && (
            <Button
              onClick={handleExport}
              className="bg-primary hover:bg-primary-glow shadow-glow"
            >
              <Download size={16} className="mr-2" />
              Export .md
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        {generatedNotes ? (
          <Card className="h-full bg-bio-card border-bio-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-foreground">Generated Notes</CardTitle>
            </CardHeader>
            <CardContent className="h-full pb-4">
              <Tabs defaultValue="preview" className="h-full flex flex-col">
                <TabsList className="w-fit bg-bio-border">
                  <TabsTrigger value="preview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Eye size={16} className="mr-2" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="markdown" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Code size={16} className="mr-2" />
                    Markdown
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="flex-1 mt-4 overflow-y-auto">
                  <div className="prose prose-invert max-w-none text-foreground">
                    <div dangerouslySetInnerHTML={{ 
                      __html: generatedNotes
                        .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-primary mb-4">$1</h1>')
                        .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-foreground mt-6 mb-3">$1</h2>')
                        .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium text-foreground mt-4 mb-2">$1</h3>')
                        .replace(/^\*\*(.*?)\*\*/gm, '<strong class="text-primary">$1</strong>')
                        .replace(/^- (.*$)/gm, '<li class="ml-4 text-foreground">$1</li>')
                        .replace(/^---$/gm, '<hr class="border-bio-border my-4">')
                        .replace(/\n/g, '<br>')
                    }} />
                  </div>
                </TabsContent>
                
                <TabsContent value="markdown" className="flex-1 mt-4 overflow-y-auto">
                  <pre className="text-sm text-foreground bg-background p-4 rounded-lg border border-bio-border overflow-x-auto whitespace-pre-wrap">
                    {generatedNotes}
                  </pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mb-6 shadow-glow mx-auto">
                <Code size={32} className="text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Ready to Generate</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Click "Generate Notes" to create a comprehensive Markdown document from your learning session
              </p>
              <ul className="text-sm text-muted-foreground text-left max-w-sm mx-auto space-y-1">
                <li>✓ Formatted for Obsidian</li>
                <li>✓ Includes conversation log</li>
                <li>✓ Extracts key concepts</li>
                <li>✓ Adds study checklist</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}