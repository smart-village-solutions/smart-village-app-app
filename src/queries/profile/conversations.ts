import gql from 'graphql-tag';

export const GET_CONVERSATIONS = gql`
  query GetConversations($conversationableId: ID, $conversationableType: String) {
    getConversations(
      conversationableId: $conversationableId
      conversationableType: $conversationableType
    ) {
      conversationableId
      conversationableType
      id
      participantsCount
      totalMessagesCount
      unreadMessagesCount
      latestMessage {
        createdAt
        id
        messageText
        senderId
        senderName
      }
    }
  }
`;

export const GET_MESSAGES = gql`
  query GetMessages($conversationId: ID!) {
    getMessages(conversationId: $conversationId) {
      conversationId
      createdAt
      id
      messageText
      senderId
      senderName
    }
  }
`;

export const CREATE_MESSAGE = gql`
  mutation CreateMessage(
    $conversationableId: ID
    $conversationableType: String
    $conversationId: ID
    $messageText: String!
  ) {
    createMessage(
      conversationableId: $conversationableId
      conversationableType: $conversationableType
      conversationId: $conversationId
      messageText: $messageText
    ) {
      id
      status
      statusCode
    }
  }
`;

export const MARK_MESSAGES_AS_READ = gql`
  mutation MarkMessagesAsRead($messageId: ID, $updateAllMessages: Boolean, $conversationId: ID) {
    markMessagesAsRead(
      messageId: $messageId
      updateAllMessages: $updateAllMessages
      conversationId: $conversationId
    ) {
      id
      status
      statusCode
    }
  }
`;
