import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/ThemeToggle";
import Sidebar from "@/components/Sidebar";
import LiquidSphere from "@/components/LiquidSphere";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hello, I'm here to listen and support you. How are you feeling today?",
    },
  ]);

  const handleSphereClick = () => {
    setIsListening(!isListening);
    // TODO: Implement actual voice recording logic
  };

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now(),
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, newMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Thank you for sharing that with me. I'm here to help. Can you tell me more about how this makes you feel?",
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const showSphere = messages.length <= 1;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className={`flex-1 flex flex-col h-full transition-all duration-300 ${sidebarOpen ? "lg:ml-0" : "lg:ml-0"}`}>
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-foreground">MindSpace AI</h1>
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {showSphere ? (
            // Show sphere for initial state
            <div className="flex-1 flex items-center justify-center">
              <LiquidSphere isActive={isListening} onClick={handleSphereClick} />
            </div>
          ) : (
            // Show messages when chat has started
            <ScrollArea className="flex-1">
              <div className="max-w-4xl mx-auto">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                  />
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Chat Input */}
          <ChatInput onSend={handleSendMessage} disabled={isListening} />
        </div>
      </main>
    </div>
  );
};

export default Index;
