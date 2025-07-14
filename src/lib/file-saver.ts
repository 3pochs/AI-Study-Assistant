
import { saveAs } from 'file-saver';

export const saveConversation = (conversation: any) => {
  const blob = new Blob([JSON.stringify(conversation, null, 2)], { type: 'application/json' });
  saveAs(blob, 'conversation.json');
};
