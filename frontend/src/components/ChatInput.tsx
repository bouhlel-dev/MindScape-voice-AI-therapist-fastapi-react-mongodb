import { useState } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-card">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex gap-2 items-end">
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
            disabled={disabled}
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind..."
              disabled={disabled}
              className="min-h-[60px] max-h-[200px] resize-none pr-12 bg-secondary/50 border-border focus:border-primary"
              rows={1}
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            size="icon"
            className="flex-shrink-0 h-[60px] w-[60px]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2 text-center">
          This is a simulated environment. For real mental health support, please consult a licensed professional.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
