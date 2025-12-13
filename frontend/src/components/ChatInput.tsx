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
    <div className="p-4 pb-6">
      <div className="max-w-3xl mx-auto">
        <div className="floating-card p-2 flex gap-2 items-end">
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 rounded-full h-10 w-10 hover:bg-secondary/80"
            disabled={disabled}
          >
            <Paperclip className="h-4 w-4 text-muted-foreground" />
          </Button>

          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind..."
              disabled={disabled}
              className="min-h-[44px] max-h-[160px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm py-3"
              rows={1}
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            size="icon"
            className="flex-shrink-0 h-10 w-10 rounded-full floating-btn"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground/70 mt-3 text-center">
          This is a simulated environment. For real mental health support, please consult a licensed professional.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
