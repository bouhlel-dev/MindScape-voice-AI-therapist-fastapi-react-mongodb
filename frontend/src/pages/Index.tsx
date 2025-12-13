import { useState, useRef, useEffect, useCallback } from "react";
import { Menu, MessageSquare, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/ThemeToggle";
import Sidebar from "@/components/Sidebar";
import LiquidSphere from "@/components/LiquidSphere";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import Auth from "@/pages/Auth";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { 
  sendTextMessage, 
  sendAudioMessage, 
  getUserSessions,
  createSession,
  getSessionMessages,
  deleteSession,
  getStoredUser,
  clearStoredUser,
  Session,
  Message as ApiMessage,
  UserResponse
} from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

type ChatMode = "voice" | "text";

const Index = () => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [chatMode, setChatMode] = useState<ChatMode>("voice");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hello, I'm here to listen and support you. How are you feeling today?",
    },
  ]);
  
  // Session state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  
  // Check for stored user on mount
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setAuthChecked(true);
  }, []);

  const { isRecording, startRecording, stopRecording } = useVoiceRecorder();
  const { toast } = useToast();
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  // Load sessions when user is set
  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const loadSessions = async () => {
    if (!user) return;
    try {
      setSessionsLoading(true);
      const userSessions = await getUserSessions(user.id);
      setSessions(userSessions);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleNewSession = async () => {
    if (!user) return;
    try {
      const newSession = await createSession(user.id, "New Session");
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setMessages([
        {
          id: 1,
          role: "assistant",
          content: "Hello, I'm here to listen and support you. How are you feeling today?",
        },
      ]);
      toast({
        title: "New Session",
        description: "Started a new therapy session.",
      });
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Error",
        description: "Failed to create new session.",
        variant: "destructive",
      });
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      setCurrentSessionId(sessionId);
      
      const sessionMessages = await getSessionMessages(sessionId);
      
      if (sessionMessages.length === 0) {
        setMessages([
          {
            id: 1,
            role: "assistant",
            content: "Hello, I'm here to listen and support you. How are you feeling today?",
          },
        ]);
      } else {
        setMessages(
          sessionMessages.map((msg: ApiMessage, index: number) => ({
            id: index + 1,
            role: msg.role,
            content: msg.content,
          }))
        );
      }
      
      // Switch to text mode when loading a session with messages
      if (sessionMessages.length > 0) {
        setChatMode("text");
      }
    } catch (error) {
      console.error("Error loading session messages:", error);
      toast({
        title: "Error",
        description: "Failed to load session messages.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([
          {
            id: 1,
            role: "assistant",
            content: "Hello, I'm here to listen and support you. How are you feeling today?",
          },
        ]);
      }
      
      toast({
        title: "Session Deleted",
        description: "The session has been deleted.",
      });
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        title: "Error",
        description: "Failed to delete session.",
        variant: "destructive",
      });
    }
  };

  // Create session if needed and return session ID
  const ensureSession = async (): Promise<string> => {
    if (!user) throw new Error("User not authenticated");
    
    if (currentSessionId) {
      return currentSessionId;
    }
    
    const newSession = await createSession(user.id, "New Session");
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  };

  // Cleanup audio analysis on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Audio visualization function
  const startAudioVisualization = useCallback((audio: HTMLAudioElement) => {
    try {
      // Create audio context if not exists
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      const audioContext = audioContextRef.current;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateLevel = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const normalizedLevel = Math.min(average / 128, 1);
        setAudioLevel(normalizedLevel);
        
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      
      updateLevel();
    } catch (error) {
      console.error("Error setting up audio visualization:", error);
    }
  }, []);

  const stopAudioVisualization = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  const playAudioWithVisualization = useCallback((audioUrl: string) => {
    const audio = new Audio(audioUrl);
    currentAudioRef.current = audio;
    
    audio.addEventListener('play', () => {
      setIsPlaying(true);
      startAudioVisualization(audio);
    });
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      stopAudioVisualization();
    });
    
    audio.addEventListener('error', () => {
      setIsPlaying(false);
      stopAudioVisualization();
    });
    
    // Need to handle cross-origin audio
    audio.crossOrigin = "anonymous";
    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
      // Fallback without visualization
      const fallbackAudio = new Audio(audioUrl);
      fallbackAudio.play();
      setIsPlaying(true);
      
      fallbackAudio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
    });
    
    return audio;
  }, [startAudioVisualization, stopAudioVisualization]);

  const handleSphereClick = async () => {
    // If audio is playing, stop it and allow new recording
    if (isPlaying && currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setIsPlaying(false);
      stopAudioVisualization();
      return;
    }

    if (isRecording) {
      // Stop recording and send to backend
      try {
        setIsLoading(true);
        const audioBlob = await stopRecording();
        
        if (audioBlob) {
          // Ensure we have a session
          const sessionId = await ensureSession();
          
          // Send audio to backend with session ID
          const response = await sendAudioMessage(user!.id, audioBlob, sessionId);
          
          // Update session title in local state if it changed
          await loadSessions();
          
          // Play audio response with visualization
          if (response.audio_url) {
            playAudioWithVisualization(response.audio_url);
          }
        }
      } catch (error) {
        console.error("Error processing voice message:", error);
        toast({
          title: "Error",
          description: "Failed to process voice message. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Start recording
      try {
        await startRecording();
      } catch (error) {
        console.error("Error starting recording:", error);
        toast({
          title: "Microphone Access Required",
          description: "Please allow microphone access to use voice input.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSendMessage = async (content: string) => {
    // Switch to text mode when sending a text message
    if (chatMode === "voice") {
      setChatMode("text");
    }

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Ensure we have a session
      const sessionId = await ensureSession();
      
      const response = await sendTextMessage(user!.id, content, sessionId);

      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.response,
      };
      setMessages((prev) => [...prev, aiMessage]);
      
      // Reload sessions to get updated title
      await loadSessions();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      
      // Remove user message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const switchToVoiceMode = () => {
    setChatMode("voice");
  };

  const switchToTextMode = () => {
    setChatMode("text");
  };

  const handleLogout = () => {
    clearStoredUser();
    setUser(null);
    setSessions([]);
    setCurrentSessionId(null);
    setMessages([
      {
        id: 1,
        role: "assistant",
        content: "Hello, I'm here to listen and support you. How are you feeling today?",
      },
    ]);
  };

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show auth page if not logged in
  if (!user) {
    return <Auth onAuthSuccess={(user) => setUser(user)} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewSession={handleNewSession}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        isLoading={sessionsLoading}
        onLogout={handleLogout}
        userName={user.name}
      />

      <main className="flex-1 flex flex-col h-full relative">
        {/* Floating Header */}
        <header className="sticky top-4 mx-4 z-30">
          <div className="max-w-4xl mx-auto">
            <div className="floating-card px-3 py-2 flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-full h-9 w-9"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <h1 className="text-base font-medium text-foreground">MindSpace</h1>
              <div className="flex items-center gap-1">
                {/* Mode Toggle */}
                <Button
                  variant={chatMode === "voice" ? "default" : "ghost"}
                  size="icon"
                  onClick={switchToVoiceMode}
                  title="Voice Mode"
                  className="rounded-full h-9 w-9"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              <Button
                variant={chatMode === "text" ? "default" : "ghost"}
                size="icon"
                onClick={switchToTextMode}
                title="Text Mode"
                className="rounded-full h-9 w-9"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <ThemeToggle />
            </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden mt-4">
          {chatMode === "voice" ? (
            // Voice mode - always show sphere
            <div className="flex-1 flex items-center justify-center">
              <LiquidSphere 
                isActive={isRecording} 
                onClick={handleSphereClick}
                isLoading={isLoading}
                isPlaying={isPlaying}
                audioLevel={audioLevel}
              />
            </div>
          ) : (
            // Text mode - show messages
            <>
              <ScrollArea className="flex-1">
                <div className="max-w-4xl mx-auto pt-4">
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      role={message.role}
                      content={message.content}
                    />
                  ))}
                  {isLoading && (
                    <div className="p-4 text-center text-muted-foreground">
                      <div className="inline-flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                        Thinking...
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Chat Input - only in text mode */}
              <ChatInput onSend={handleSendMessage} disabled={isLoading} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
