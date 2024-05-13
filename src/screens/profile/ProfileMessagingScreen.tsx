import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-apollo';

import { Chat, LoadingSpinner } from '../../components';
import { colors, normalize } from '../../config';
import { useProfileUser } from '../../hooks';
import { getQuery } from '../../queries';
import { CREATE_MESSAGE, MARK_MESSAGES_AS_READ } from '../../queries/profile';

type Message = {
  createdAt: string;
  id: number;
  messageText: string;
  senderId: string;
  senderName: string;
};

type Messages = {
  createdAt: string;
  _id: number;
  text: string;
  user?: { _id: number; display_name: string };
}[];

export const ProfileMessagingScreen = ({ route }: StackScreenProps<any>) => {
  const query = route.params?.query;
  const [queryVariables, setQueryVariables] = useState(route.params?.queryVariables || {});
  const [messageData, setMessageData] = useState<Messages>([]);
  const { currentUserData } = useProfileUser();
  const currentUserId = currentUserData?.member?.id;
  const displayName = route.params?.displayName;
  const { conversationableId, conversationableType, id } = queryVariables;

  const {
    data: messages,
    loading,
    refetch
  } = useQuery(getQuery(query), {
    variables: { conversationId: queryVariables.id },
    pollInterval: 10000,
    skip: !queryVariables.id
  });

  useEffect(() => {
    const newMessageData: Messages = [];

    messages?.[query]?.forEach((message: Message) => {
      const { createdAt, id: _id, messageText: text, senderId, senderName } = message || {};

      newMessageData.push({
        _id,
        createdAt,
        text,
        user: {
          _id: parseInt(senderId),
          display_name: senderName || displayName
        }
      });
    });

    if (newMessageData?.length) {
      setMessageData(newMessageData);
    }
  }, [messages]);

  const [sendMessage] = useMutation(CREATE_MESSAGE);

  const onSend = async (newMessageData: {
    conversationableId: number;
    conversationableType: string;
    conversationId?: number;
    messageText: string;
  }) => {
    try {
      const { data } = await sendMessage({ variables: newMessageData });

      data?.createMessage?.id && setQueryVariables({ id: data.createMessage.id });
    } catch (error) {
      console.error(error);
    }
  };

  const [markMessagesAsRead] = useMutation(MARK_MESSAGES_AS_READ);

  useEffect(() => {
    if (messages?.[query]?.length && !loading && !!id) {
      markMessagesAsRead({
        variables: { conversationId: parseInt(id), updateAllMessages: true }
      });
    }
  }, [messages, loading]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  if (loading || !currentUserId) {
    return <LoadingSpinner loading />;
  }

  return (
    <Chat
      data={messageData}
      onSendButton={(message) =>
        onSend({
          conversationableId,
          conversationableType,
          conversationId: parseInt(id) || undefined,
          messageText: message.text
        }).then(refetch)
      }
      bubbleWrapperStyleRight={{ backgroundColor: colors.lighterSecondary, padding: normalize(12) }}
      bubbleWrapperStyleLeft={{ backgroundColor: colors.lightestText, padding: normalize(12) }}
      messageTextStyleRight={{ color: colors.darkText }}
      messageTextStyleLeft={{ color: colors.darkText }}
      userId={currentUserId}
    />
  );
};
