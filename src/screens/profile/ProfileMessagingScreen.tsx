import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-apollo';

import { Chat, LoadingSpinner } from '../../components';
import { colors, normalize } from '../../config';
import { useProfileUser } from '../../hooks';
import { getQuery } from '../../queries';
import { CREATE_MESSAGE } from '../../queries/profile';

type TMessage = {
  conversationableId: number;
  conversationableType: string;
  conversationId: number;
  messageText: string;
};

export const ProfileMessagingScreen = ({ route }: StackScreenProps<any>) => {
  const query = route.params?.query;
  const queryVariables = route.params?.queryVariables;
  const [messageData, setMessageData] = useState([]);
  const { currentUserData } = useProfileUser();
  const currentUserId = currentUserData?.member?.id;
  const displayName = route.params?.displayName;
  const { conversationableId, conversationableType, id: conversationId } = route.params?.details;

  const { data: messages, loading } = useQuery(getQuery(query), { variables: queryVariables });

  useEffect(() => {
    const messageArray: {
      _id: number;
      text: string;
      createdAt: string;
      user?: { _id: number; display_name: string };
    }[] = [];

    if (messages?.[query].length) {
      messages[query].forEach((message) => {
        const { id: _id, senderId, messageText: content, createdAt } = message || {};

        messageArray.push({
          _id,
          text: content,
          createdAt,
          user: {
            _id: parseInt(senderId),
            display_name: displayName
          }
        });
      });

      setMessageData(messageArray);
    }
  }, [messages]);

  const [sendMessage] = useMutation(CREATE_MESSAGE);

  const onSend = async (newMessageData: TMessage) => {
    sendMessage({ variables: newMessageData });
  };

  if (loading || !currentUserId || !messageData.length) {
    return <LoadingSpinner loading />;
  }

  return (
    <Chat
      data={messageData}
      userId={currentUserId}
      onSendButton={(message) =>
        onSend({
          conversationableId,
          conversationableType,
          conversationId: parseInt(conversationId),
          messageText: message.text
        }).then(async () => await refetch())
      }
      bubbleWrapperStyleRight={{ backgroundColor: colors.primary, padding: normalize(12) }}
      bubbleWrapperStyleLeft={{ backgroundColor: colors.gray10, padding: normalize(12) }}
      messageTextStyleRight={{ color: colors.lighterPrimary }}
      messageTextStyleLeft={{ color: colors.darkText }}
    />
  );
};
