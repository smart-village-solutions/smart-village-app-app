# Chatbot Module Integration Guide

## Overview

The Smart Village App includes a real-time chatbot feature that connects to a Viind SDP (Software Development Platform) chatbot server via WebSockets. This module provides an interactive chat interface for users to communicate with an AI-powered bot.

## Architecture

The chatbot module consists of three main components:

1. **ChatbotScreen** ([src/screens/ChatbotScreen.tsx](../src/screens/ChatbotScreen.tsx)) - The main screen component that renders the chat interface
2. **useChatbot Hook** ([src/hooks/chatbot.ts](../src/hooks/chatbot.ts)) - Custom hook managing WebSocket connection, message handling, and state
3. **Chat Component** ([src/components/Chat.js](../src/components/Chat.js)) - Reusable chat UI component based on react-native-gifted-chat

### Technology Stack

- **WebSocket Client**: `socket.io-client` for real-time bidirectional communication
- **Chat UI**: `react-native-gifted-chat` for the messaging interface
- **State Management**: React hooks (`useState`, `useRef`, `useCallback`)
- **Network Awareness**: Integration with `NetworkContext` for offline handling

## Navigation Setup

### Route Configuration

The chatbot screen is already configured in the app's navigation stack. The route is defined in [src/config/navigation/defaultStackConfig.tsx](../src/config/navigation/defaultStackConfig.tsx):

```typescript
{
  initialParams: initialParams || { title: texts.screenTitles.chatbot },
  routeName: ScreenName.Chatbot,
  screenComponent: ChatbotScreen
}
```

### Screen Name Enum

The screen identifier is defined in [src/types/Navigation.ts](../src/types/Navigation.ts):

```typescript
export enum ScreenName {
  // ... other screens
  Chatbot = 'Chatbot'
  // ... other screens
}
```

### Navigating to Chatbot

To navigate to the chatbot screen from anywhere in the app:

```typescript
import { ScreenName } from '../types';

// In your component
navigation.navigate(ScreenName.Chatbot);
```

Or with custom parameters:

```typescript
navigation.navigate({
  name: ScreenName.Chatbot,
  params: {
    title: 'Custom Chatbot Title' // Optional: override default title
  }
});
```

## Configuration

### Global Settings

The chatbot requires a `chatbotType` setting in the global settings to determine which configuration to load. This is typically configured through the app's settings interface or server-side configuration.

**Location**: Settings are accessed via `SettingsContext`:

```typescript
const { globalSettings } = useContext(SettingsContext);
const { settings } = globalSettings;
const { chatbotType } = settings || {};
```

### JSON Configuration File

The chatbot loads its configuration from a static JSON file. The file name is dynamically constructed based on the `chatbotType` setting:

**File naming pattern**: `${chatbotType}-chatbotSettings.json`

For example, if `chatbotType` is `"viind"`, the app will look for:

- `viind-chatbotSettings.json`

**Configuration Schema** ([src/types/chatbot.ts](../src/types/chatbot.ts)):

```typescript
{
  "customerId": "string",        // Unique identifier for the customer
  "initPayload": "string",       // Initial message to send when connection is established
  "inputHint": "string",         // Placeholder text for the input field
  "showAvatar": boolean,         // Optional: Show/hide user avatars (default: true)
  "socketPath": "string",        // WebSocket path (e.g., "/socket.io")
  "socketUrl": "string",         // WebSocket server URL (e.g., "https://chatbot.example.com")
  "subtitle": "string",          // Chatbot subtitle (currently unused in UI)
  "title": "string"              // Chatbot display name shown in messages
}
```

**Example configuration**:

```json
{
  "customerId": "my-village-123",
  "initPayload": "/get_started",
  "inputHint": "Schreiben Sie Ihre Nachricht...",
  "showAvatar": true,
  "socketPath": "/socket.io",
  "socketUrl": "https://chatbot.example.com",
  "subtitle": "Ihr virtueller Assistent",
  "title": "Village Bot"
}
```

### Configuration Loading

The configuration is loaded using the `useStaticContent` hook:

```typescript
const { data: chatbotConfiguration, loading: configLoading } = useStaticContent<ChatbotConfig>({
  name: `${chatbotType}-chatbotSettings`,
  refreshTimeKey: `${chatbotType}-publicJsonFile`,
  skip: !chatbotType,
  type: 'json'
});
```

## Implementation Details

### WebSocket Connection Flow

1. **Initialization**: When the screen mounts and network is available, the `connect()` function is called
2. **Session Request**: Client sends a `session_request` event with a session ID
3. **Session Confirmation**: Server responds with `session_confirm` to validate the session
4. **Initial Payload**: App sends the `initPayload` message automatically to start the conversation
5. **Message Exchange**:
   - User messages are sent via `user_uttered` events
   - Bot responses arrive via `bot_uttered` events
   - Each bot message is paired with a `message_id` event for tracking

### Message Format

**User Message** (sent to server):

```typescript
{
  message: "string",              // The actual message text
  customData: {
    customer_id: "string",        // From chatbotConfig.customerId
    second_window_url: "string"   // Optional: external URL reference
  },
  session_id: "string"            // Unique session identifier
}
```

**Bot Message** (received from server):

```typescript
{
  text: "string",                 // The bot's response text
  attachment?: "string",          // Optional: media attachment
  quick_replies?: [               // Optional: suggested quick replies
    {
      content_type: "text",
      payload: "string",          // Action payload to send back
      title: "string"             // Display text for the button
    }
  ]
}
```

### Connection States

The hook manages four connection states ([src/types/chatbot.ts](../src/types/chatbot.ts)):

- `Disconnected`: Initial state or after disconnection
- `Connecting`: Attempting to establish connection
- `Connected`: Successfully connected and ready to exchange messages
- `Error`: Connection failed or error occurred

### Error Handling

The module handles several error scenarios:

- **No Configuration**: Displays message when `chatbotConfiguration` is missing
- **No Network**: Shows offline message when `isNetworkConnected` is false
- **Connection Error**: Displays error with retry button
- **Invalid Messages**: Validates message format and logs errors without crashing

## User Interface Features

### Chat Interface

The chat interface includes:

- **Message Bubbles**: Different styling for user and bot messages
- **Quick Replies**: Interactive buttons for predefined responses
- **Typing Indicator**: Shows when bot is processing a response
- **Timestamps**: Display time for each message
- **Avatars**: Optional user avatars (configurable via `showAvatar`)
- **Scroll to Bottom**: Button to quickly jump to latest messages

### Header Controls

- **Refresh Button**: Resets the conversation and reconnects (top-right corner)
  - Accessibility label: "Chatbot zurücksetzen"
  - Accessibility hint: "Setzt die Konversation zurück und startet neu"

### Markdown Support

Bot messages support basic markdown formatting:

- **Bold text**: `**bold text**` renders as bold
- **Links**: `[Link text](https://example.com)` creates clickable links

## Text Localization

All user-facing text is defined in [src/config/texts.js](../src/config/texts.js) under the `chatbot` key:

```javascript
chatbot: {
  configurationMissing: 'Chatbot-Konfiguration nicht verfügbar...',
  connecting: 'Verbindung wird hergestellt...',
  connectionError: 'Verbindungsfehler. Bitte versuchen Sie es erneut.',
  defaultPlaceholder: 'Nachricht eingeben...',
  disconnected: 'Verbindung unterbrochen.',
  headerButtonAccessibilityHint: 'Setzt die Konversation zurück und startet neu',
  headerButtonAccessibilityLabel: 'Chatbot zurücksetzen',
  offline: 'Keine Internetverbindung. Der Chatbot ist offline nicht verfügbar.',
  retry: 'Erneut versuchen',
  sendError: 'Fehler beim Senden der Nachricht.'
}
```

The screen title is defined separately:

```javascript
screenTitles: {
  chatbot: 'Chatbot';
}
```

## Integration Checklist

To enable the chatbot feature in a new municipality/instance:

- [ ] **Configure Server**: Set up Viind SDP chatbot server with WebSocket support
- [ ] **Create JSON Config**: Prepare chatbot configuration JSON file with all required fields
- [ ] **Upload Config**: Make JSON file available via the app's static content system
- [ ] **Set chatbotType**: Configure `chatbotType` in global settings (via server settings or app config)
- [ ] **Test Connection**: Verify WebSocket connectivity and message exchange
- [ ] **Customize Text**: Update German text strings if needed (optional)
- [ ] **Add Navigation**: Add navigation link/button to access chatbot screen (e.g., in drawer menu or home screen)

## Testing

### Manual Testing

1. Navigate to the chatbot screen
2. Verify connection indicator shows "Connecting" then "Connected"
3. Send a test message and verify bot response
4. Test quick reply buttons (if configured)
5. Test retry/refresh functionality
6. Test offline behavior (disable network)
7. Verify markdown rendering in bot messages

### Network Scenarios

- **Online**: Full functionality
- **Offline**: Displays offline message, blocks interaction
- **Reconnection**: Automatically reconnects when network is restored

## Dependencies

Required npm packages:

```json
{
  "socket.io-client": "^4.x.x",
  "react-native-gifted-chat": "^2.x.x"
}
```

## Troubleshooting

### Chatbot doesn't connect

- Verify `chatbotType` is set in global settings
- Check JSON configuration file exists and is accessible
- Verify `socketUrl` and `socketPath` are correct
- Check network connectivity
- Review console logs for WebSocket errors

### Messages not appearing

- Verify server is sending `message_id` after each `bot_uttered` event
- Check message format matches expected schema
- Review console logs for validation errors

### Session issues

- Ensure server accepts the session ID format
- Verify `customerId` in configuration matches server expectations
- Check server logs for session-related errors

## Future Enhancements

Potential improvements for the chatbot module:

- Message persistence (save chat history)
- Multi-language support
- Rich media messages (images, videos)
- File upload capability
- Push notifications for new messages
- Chat history export
- User feedback/rating system

## Related Documentation

- [React Navigation Documentation](https://reactnavigation.org/)
- [Socket.IO Client Documentation](https://socket.io/docs/v4/client-api/)
- [React Native Gifted Chat](https://github.com/FaridSafi/react-native-gifted-chat)
- [App Index Documentation](./INDEX.md)

## Support

For issues or questions regarding the chatbot module:

1. Check application logs for WebSocket errors
2. Verify configuration settings
3. Review server-side chatbot logs
4. Contact the Viind SDP support team for server-related issues
