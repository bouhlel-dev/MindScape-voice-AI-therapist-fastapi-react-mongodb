const API_BASE_URL = "http://127.0.0.1:8000";

export interface ChatResponse {
  message: string;
  response: string;
  audio_url?: string;
  session_id?: string;
}

export interface TextOnlyResponse {
  message: string;
  response: string;
  session_id?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
}

export interface Message {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  session_id?: string;
}

export interface Session {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Send text message to the AI (text only, no audio)
export async function sendTextMessage(userId: string, inputText: string, sessionId?: string): Promise<TextOnlyResponse> {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("input_text", inputText);
  if (sessionId) {
    formData.append("session_id", sessionId);
  }

  const response = await fetch(`${API_BASE_URL}/chat/text`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
}

// Send audio message to the AI
export async function sendAudioMessage(userId: string, audioBlob: Blob, sessionId?: string): Promise<ChatResponse> {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("file", audioBlob, "recording.wav");
  if (sessionId) {
    formData.append("session_id", sessionId);
  }

  const response = await fetch(`${API_BASE_URL}/chat/audio`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to send audio message");
  }

  return response.json();
}

// Create a new user (register)
export async function registerUser(name: string, email: string, password: string): Promise<UserResponse> {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Registration failed" }));
    throw new Error(error.detail || "Failed to create user");
  }

  return response.json();
}

// Login user
export async function loginUser(email: string, password: string): Promise<UserResponse> {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Invalid credentials" }));
    throw new Error(error.detail || "Invalid credentials");
  }

  return response.json();
}

// Save user to localStorage
export function saveUser(user: UserResponse): void {
  localStorage.setItem("therapist_user", JSON.stringify(user));
  localStorage.setItem("therapist_user_id", user.id);
}

// Get user from localStorage
export function getStoredUser(): UserResponse | null {
  const user = localStorage.getItem("therapist_user");
  return user ? JSON.parse(user) : null;
}

// Clear user from localStorage
export function clearStoredUser(): void {
  localStorage.removeItem("therapist_user");
  localStorage.removeItem("therapist_user_id");
}

// Backend message response (uses sender/message)
interface BackendMessage {
  id: string;
  user_id: string;
  sender: "user" | "assistant";
  message: string;
  timestamp: string;
  session_id?: string;
}

// Get user's message history
export async function getMessageHistory(userId: string): Promise<Message[]> {
  const response = await fetch(`${API_BASE_URL}/messages/history/${userId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch message history");
  }

  const data: BackendMessage[] = await response.json();
  return data.map((msg) => ({
    id: msg.id,
    user_id: msg.user_id,
    role: msg.sender,
    content: msg.message,
    timestamp: msg.timestamp,
    session_id: msg.session_id,
  }));
}

// Get messages for a specific session
export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  const response = await fetch(`${API_BASE_URL}/messages/session/${sessionId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch session messages");
  }

  const data: BackendMessage[] = await response.json();
  return data.map((msg) => ({
    id: msg.id,
    user_id: msg.user_id,
    role: msg.sender,
    content: msg.message,
    timestamp: msg.timestamp,
    session_id: msg.session_id,
  }));
}

// Session API functions
export async function createSession(userId: string, title: string = "New Session"): Promise<Session> {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId, title }),
  });

  if (!response.ok) {
    throw new Error("Failed to create session");
  }

  return response.json();
}

export async function getUserSessions(userId: string): Promise<Session[]> {
  const response = await fetch(`${API_BASE_URL}/sessions/user/${userId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch sessions");
  }

  return response.json();
}

export async function getSession(sessionId: string): Promise<Session> {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch session");
  }

  return response.json();
}

export async function updateSession(sessionId: string, title: string): Promise<Session> {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new Error("Failed to update session");
  }

  return response.json();
}

export async function deleteSession(sessionId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete session");
  }
}

// Play audio from URL
export function playAudio(audioUrl: string): HTMLAudioElement {
  const audio = new Audio(audioUrl);
  audio.play().catch((error) => {
    console.error("Error playing audio:", error);
  });
  return audio;
}

// Generate a simple user ID (for demo purposes)
export function getOrCreateUserId(): string {
  let userId = localStorage.getItem("therapist_user_id");
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("therapist_user_id", userId);
  }
  return userId;
}
