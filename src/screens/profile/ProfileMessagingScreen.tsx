import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-apollo';
import { StyleSheet } from 'react-native';

import { Button, Chat, LoadingSpinner, SafeAreaViewFlex, Wrapper } from '../../components';
import { colors, normalize, texts } from '../../config';
import { shareMessage } from '../../helpers';
import { useProfileUser } from '../../hooks';
import { QUERY_TYPES, getQuery } from '../../queries';
import { CREATE_MESSAGE, MARK_MESSAGES_AS_READ } from '../../queries/profile';
import { ScreenName } from '../../types';

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

export const ProfileMessagingScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const query = route.params?.query;
  const [queryVariables, setQueryVariables] = useState(route.params?.queryVariables || {});
  const [messageData, setMessageData] = useState<Messages>([]);
  const { currentUserData } = useProfileUser();
  const currentUserId = currentUserData?.member?.id;
  const displayName = route.params?.displayName;

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

      !newMessageData?.conversationId &&
        data?.createMessage?.id &&
        setQueryVariables({
          ...queryVariables,
          id: data.createMessage.id
        });
    } catch (error) {
      console.error(error);
    }
  };

  const [markMessagesAsRead] = useMutation(MARK_MESSAGES_AS_READ);

  useEffect(() => {
    if (messages?.[query]?.length && !loading && !!queryVariables.id) {
      markMessagesAsRead({
        variables: { conversationId: parseInt(queryVariables.id), updateAllMessages: true }
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
    <SafeAreaViewFlex>
      <Wrapper style={styles.noPaddingBottom}>
        <Button
          invert
          notFullWidth
          title={texts.noticeboard.toRelated}
          onPress={() =>
            navigation.push(ScreenName.Detail, {
              query: QUERY_TYPES.GENERIC_ITEM,
              queryVariables: {
                id: queryVariables.conversationableId
              },
              rootRouteName: ScreenName.Noticeboard,
              shareContent: {
                message: shareMessage(
                  {
                    id: queryVariables.conversationableId,
                    title: queryVariables.title
                  },
                  QUERY_TYPES.GENERIC_ITEM
                )
              },
              suffix: ScreenName.Noticeboard,
              title: queryVariables.category,
              toRelated: true
            })
          }
        />
      </Wrapper>
      <Chat
        data={messageData}
        onSendButton={(message) =>
          onSend({
            conversationableId: queryVariables.conversationableId,
            conversationableType: queryVariables.conversationableType,
            conversationId: parseInt(queryVariables.id) || undefined,
            messageText: message.text
          }).then(refetch)
        }
        bubbleWrapperStyleRight={{
          backgroundColor: colors.lighterSecondary,
          padding: normalize(12)
        }}
        bubbleWrapperStyleLeft={{ backgroundColor: colors.lightestText, padding: normalize(12) }}
        userId={currentUserId}
      />
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  noPaddingBottom: {
    paddingBottom: 0
  }
});
