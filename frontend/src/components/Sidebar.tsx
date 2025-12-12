import { MessageSquare, User, X, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { toast } = useToast();
  
  const chatHistory = [
    { id: 1, title: "Anxiety management", date: "Today" },
    { id: 2, title: "Sleep patterns", date: "Yesterday" },
    { id: 3, title: "Work-life balance", date: "2 days ago" },
    { id: 4, title: "Stress coping strategies", date: "Last week" },
  ];

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative top-0 left-0 h-full w-80 bg-card border-r border-border z-50 transform transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${!isOpen && "lg:w-0 lg:border-0"}`}
      >
        <div className={`flex flex-col h-full transition-opacity duration-300 ${!isOpen && "lg:opacity-0 lg:invisible"}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">MindSpace</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <Button className="w-full" variant="default">
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </div>

          {/* Chat History Section */}
          <div className="flex-1 overflow-hidden">
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <MessageSquare className="h-4 w-4" />
                <span>Chat History</span>
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="px-4 space-y-1">
                {chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary transition-colors group"
                  >
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">
                      {chat.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{chat.date}</p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          {/* Profile Section */}
          <div className="p-4 space-y-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">Your Profile</p>
                <p className="text-xs text-muted-foreground">Settings & preferences</p>
              </div>
            </button>

            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
              <span>Log out</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
