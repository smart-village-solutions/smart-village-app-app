import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

import {
  BotUttered,
  ChatbotConfig,
  ChatbotConnectionState,
  ChatbotError,
  ChatbotMessage,
  SessionRequest,
  UseChatbotResult,
  UserUttered
} from '../types';

/**
 * Custom hook for managing Viind SDP chatbot WebSocket connection
 *
 * Handles:
 * - WebSocket connection lifecycle (connect, disconnect, reconnect)
 * - Session management with Viind SDP
 * - Message exchange (bot_uttered, user_uttered)
 * - Message ID assignment
 * - Connection state tracking
 * - Error handling and retry mechanism
 * - Network status awareness
 *
 * @param config - Chatbot configuration from server
 * @param isNetworkConnected - Network connectivity status from NetworkContext
 * @returns Hook result with messages, connection state, and control functions
 */
export const useChatbot = (
  config: ChatbotConfig | null,
  isNetworkConnected: boolean
): UseChatbotResult => {
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [connectionState, setConnectionState] = useState<ChatbotConnectionState>(
    ChatbotConnectionState.Disconnected
  );
  const [error, setError] = useState<ChatbotError | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const sessionIdRef = useRef<string | undefined>(undefined);
  const messageQueueRef = useRef<Array<BotUttered & { timestamp: number }>>([]);
  const isInitPayloadSentRef = useRef(false);

  // Convert Viind bot_uttered message to GiftedChat format
  const convertBotMessageToChatMessage = useCallback(
    (botMessage: BotUttered, messageId: string): ChatbotMessage => {
      return {
        _id: messageId,
        text: botMessage.text,
        createdAt: new Date(),
        user: {
          _id: 2,
          display_name: config?.title || 'Bot'
        },
        // Convert quick replies to GiftedChat format if present
        ...(botMessage.quick_replies?.length
          ? {
              quickReplies: {
                type: 'radio' as const,
                values: botMessage.quick_replies.map((qr) => ({
                  title: qr.title,
                  value: qr.payload
                }))
              }
            }
          : {})
      };
    },
    [config?.title]
  );

  const sendMessage = useCallback(
    (text: string) => {
      if (!socketRef.current || connectionState !== ChatbotConnectionState.Connected) {
        console.error('Cannot send message: socket not connected');
        return;
      }

      if (!config || !sessionIdRef.current) {
        console.error('Cannot send message: missing configuration or session ID');
        return;
      }

      const trimmedText = text.trim();
      if (!trimmedText) {
        return;
      }

      setIsTyping(true);

      const userMessage: ChatbotMessage = {
        _id: Date.now().toString(),
        text: trimmedText,
        createdAt: new Date(),
        user: {
          _id: 1
        }
      };

      setMessages((prevMessages) => [...prevMessages, userMessage]);

      const userUtteredMessage: UserUttered = {
        message: trimmedText,
        customData: {
          customer_id: config.customerId
        },
        session_id: sessionIdRef.current
      };

      socketRef.current.emit('user_uttered', userUtteredMessage);
    },
    [config, connectionState]
  );

  const connect = useCallback(() => {
    if (!config || !isNetworkConnected) {
      return;
    }

    try {
      setConnectionState(ChatbotConnectionState.Connecting);
      setError(null);

      const socket = io(config.socketUrl, {
        path: config.socketPath,
        transports: ['websocket'],
        autoConnect: false,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        const sessionId = sessionIdRef.current || socket.id || '';

        if (!sessionId) {
          console.error('Chatbot: Unable to establish session ID');
          return;
        }

        const sessionRequest: SessionRequest = {
          session_id: sessionId
        };

        socket.emit('session_request', sessionRequest);
        sessionIdRef.current = sessionId;
      });

      socket.on('session_confirm', (sessionId: unknown) => {
        if (typeof sessionId !== 'string') {
          console.error('Chatbot: Invalid session_confirm format');
          return;
        }

        if (sessionId !== sessionIdRef.current) {
          console.error('Chatbot: Session ID mismatch');
          return;
        }

        setConnectionState(ChatbotConnectionState.Connected);

        if (config.initPayload && !isInitPayloadSentRef.current) {
          isInitPayloadSentRef.current = true;

          const userMessage: ChatbotMessage = {
            _id: Date.now().toString(),
            text: config.initPayload,
            createdAt: new Date(),
            user: {
              _id: 1
            }
          };

          setMessages((prevMessages) => [...prevMessages, userMessage]);

          const initMessage: UserUttered = {
            message: config.initPayload,
            customData: {
              customer_id: config.customerId
            },
            session_id: sessionIdRef.current
          };

          socket.emit('user_uttered', initMessage);
        }
      });

      socket.on('bot_uttered', (botMessage: unknown) => {
        if (botMessage === undefined) {
          return;
        }

        if (
          typeof botMessage !== 'object' ||
          botMessage === null ||
          !('text' in botMessage) ||
          typeof (botMessage as { text: unknown }).text !== 'string'
        ) {
          console.error('Chatbot: Invalid bot_uttered format', botMessage);
          return;
        }

        const validatedMessage = botMessage as BotUttered;

        messageQueueRef.current.push({
          ...validatedMessage,
          timestamp: Date.now()
        });
      });

      socket.on('message_id', (messageId: unknown) => {
        if (typeof messageId !== 'string') {
          console.error('Chatbot: Invalid message_id format');
          return;
        }

        const queuedMessage = messageQueueRef.current.shift();

        if (!queuedMessage) {
          console.error('Chatbot: Received message_id but queue is empty');
          return;
        }

        const chatMessage = convertBotMessageToChatMessage(queuedMessage, messageId);
        setMessages((prevMessages) => [...prevMessages, chatMessage]);
        setIsTyping(false);
      });

      socket.on('disconnect', (reason: string) => {
        if (reason === 'io server disconnect') {
          socket.connect();
        } else {
          setConnectionState(ChatbotConnectionState.Disconnected);
        }
      });

      socket.on('connect_error', (err: Error) => {
        console.error('Chatbot: Connection error:', err.message);
        setConnectionState(ChatbotConnectionState.Error);
        setError({
          message: 'Verbindung zum Chatbot fehlgeschlagen',
          originalError: err
        });
      });

      socket.on('error', (err: Error) => {
        console.error('Chatbot: Socket error:', err);
      });

      socket.connect();
    } catch (err) {
      console.error('Chatbot: Failed to initialize:', err);
      setConnectionState(ChatbotConnectionState.Error);
      setError({
        message: 'Fehler beim Initialisieren des Chatbots',
        originalError: err instanceof Error ? err : undefined
      });
    }
  }, [config, isNetworkConnected, convertBotMessageToChatMessage]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    messageQueueRef.current = [];
    setConnectionState(ChatbotConnectionState.Disconnected);
  }, []);

  const retry = useCallback(() => {
    disconnect();
    sessionIdRef.current = undefined;
    isInitPayloadSentRef.current = false;
    setMessages([]);
    connect();
  }, [disconnect, connect]);

  useEffect(() => {
    if (!isNetworkConnected && socketRef.current) {
      disconnect();
    } else if (
      isNetworkConnected &&
      config &&
      connectionState === ChatbotConnectionState.Disconnected
    ) {
      connect();
    }
  }, [isNetworkConnected, config, connectionState, disconnect, connect]);

  return {
    connect,
    connectionState,
    disconnect,
    error,
    isTyping,
    messages: [...messages].reverse(),
    retry,
    sendMessage
  };
};
