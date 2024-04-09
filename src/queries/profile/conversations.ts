import gql from 'graphql-tag';

export const GET_CONVERSATIONS = gql`
  query {
    getConversations {
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
