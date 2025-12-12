import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div
      className={`flex gap-4 p-6 animate-fade-in ${
        isUser ? "bg-secondary/50" : "bg-background"
      }`}
    >
      <div
        className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-primary" : "bg-accent"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-accent-foreground" />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <p className="text-sm font-medium text-foreground">
          {isUser ? "You" : "AI Therapist"}
        </p>
        <p className="text-sm text-foreground/90 leading-relaxed">{content}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
