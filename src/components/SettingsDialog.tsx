
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export type AIProvider = 'gemini' | 'openai' | 'openrouter' | 'anthropic';

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AISettings) => void;
  currentSettings: AISettings;
}

export function SettingsDialog({ isOpen, onClose, onSave, currentSettings }: SettingsDialogProps) {
  const [provider, setProvider] = useState<AIProvider>(currentSettings.provider);
  const [apiKey, setApiKey] = useState(currentSettings.apiKey);
  const [model, setModel] = useState(currentSettings.model);
  const { toast } = useToast();

  useEffect(() => {
    setProvider(currentSettings.provider);
    setApiKey(currentSettings.apiKey);
    setModel(currentSettings.model);
  }, [currentSettings]);

  const handleSave = () => {
    if (!apiKey.trim() || !model.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide an API key and a model name.',
        variant: 'destructive',
      });
      return;
    }
    onSave({ provider, apiKey, model });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Provider Settings</DialogTitle>
          <DialogDescription>
            Choose your AI provider and enter your credentials. Your API key is stored locally.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="provider" className="text-right">
              Provider
            </Label>
            <Select value={provider} onValueChange={(value) => setProvider(value as AIProvider)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Gemini</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="openrouter">OpenRouter</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-key" className="text-right">
              API Key
            </Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="col-span-3"
              placeholder="Enter your API key"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">
              Model
            </Label>
            <Input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="col-span-3"
              placeholder="e.g., gemini-pro, gpt-4"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
