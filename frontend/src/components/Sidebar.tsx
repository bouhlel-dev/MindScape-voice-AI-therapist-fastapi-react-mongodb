import { User, X, Plus, LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@/services/api";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: Session[];
  currentSessionId: string | null;
  onNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onLogout: () => void;
  userName: string;
  isLoading?: boolean;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const Sidebar = ({ 
  isOpen, 
  onClose, 
  sessions, 
  currentSessionId,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  onLogout,
  userName,
  isLoading 
}: SidebarProps) => {
  const { toast } = useToast();

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    onDeleteSession(sessionId);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative top-0 left-0 h-full z-50 transform transition-all duration-300 ease-in-out p-3 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${!isOpen && "lg:w-0 lg:p-0"}`}
      >
        <div className={`floating-card h-full w-72 flex flex-col transition-all duration-300 ${!isOpen && "lg:opacity-0 lg:invisible lg:w-0"}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-5">
            <h2 className="text-lg font-medium text-foreground tracking-tight">MindSpace</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="px-4 pb-4">
            <Button className="w-full rounded-xl h-11 font-medium" variant="default" onClick={onNewSession}>
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </div>

          {/* Chat History Section */}
          <div className="flex-1 overflow-hidden">
            <div className="px-5 py-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">History</p>
            </div>

            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="px-3 space-y-1">
                {isLoading ? (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    Loading...
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-8 px-4">
                    No sessions yet
                  </div>
                ) : (
                  sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => onSelectSession(session.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl hover:bg-secondary/80 transition-all duration-200 group flex items-center justify-between gap-2 ${
                        currentSessionId === session.id ? "bg-secondary" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-sm text-foreground truncate max-w-[180px]">
                          {session.title}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          {formatDate(session.created_at)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDeleteSession(e, session.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Profile Section */}
          <div className="p-4 space-y-1 border-t border-border/50">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">{userName}</p>
              </div>
            </div>

            <Button
              onClick={onLogout}
              variant="ghost"
              className="w-full justify-start gap-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Log out</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
