export interface StyleOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string; // Tailwind class color for highlight
  bgGradient: string; // CSS or Tailwind gradient
}

export interface RewriteResult {
  text: string;
  explanation: string;
}

export interface FavoriteItem {
  id: string;
  originalText: string;
  rewrittenText: string;
  styleId: string;
  vibe: string;
  timestamp: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}
