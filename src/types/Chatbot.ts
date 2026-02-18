export enum ChatbotConnectionState {
  Connected = 'connected',
  Connecting = 'connecting',
  Disconnected = 'disconnected',
  Error = 'error'
}

export interface ChatbotConfig {
  customerId: string;
  initPayload: string;
  inputHint: string;
  showAvatar?: boolean;
  socketPath: string;
  socketUrl: string;
  subtitle: string;
  title: string;
}

export interface QuickReply {
  content_type: 'text';
  payload: string;
  title: string;
}

export interface BotUttered {
  attachment?: string;
  quick_replies?: QuickReply[];
  text: string;
}

export interface UserUttered {
  customData: {
    customer_id: string;
    second_window_url?: string;
  };
  message: string;
  session_id: string;
}

export interface SessionRequest {
  session_id: string;
}

export interface ChatbotMessage {
  _id: string | number;
  createdAt: Date;
  text: string;
  user?: {
    _id: number;
    avatar?: string;
    display_name?: string;
  };
  quickReplies?: {
    type: 'radio' | 'checkbox';
    values: Array<{
      title: string;
      value: string;
    }>;
  };
}

export interface ChatbotError {
  code?: string;
  message: string;
  originalError?: Error;
}

export interface UseChatbotResult {
  connect: () => void;
  connectionState: ChatbotConnectionState;
  disconnect: () => void;
  error: ChatbotError | null;
  isTyping: boolean;
  messages: ChatbotMessage[];
  retry: () => void;
  sendMessage: (text: string) => void;
}
