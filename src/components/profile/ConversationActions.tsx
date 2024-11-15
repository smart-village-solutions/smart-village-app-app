import React, { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, Icon, texts } from '../../config';
import { DELETE_CONVERSATION, GET_CONVERSATIONS } from '../../queries/profile';

export const ConversationActions = ({ conversationId }: { conversationId: string | number }) => {
  const [isPinned, setIsPinned] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [deleteConversation, { data }] = useMutation(DELETE_CONVERSATION, {
    refetchQueries: [{ query: GET_CONVERSATIONS }]
  });

  useEffect(() => {
    if (data?.deleteConversation?.status === 200) {
      setIsDeleting(false);
    }
  }, [data]);

  const onPressPin = useCallback(() => {
    setIsPinned(!isPinned);
  }, [isPinned]);

  const onPressTrash = useCallback(() => {
    Alert.alert(
      texts.noticeboard.alerts.hint,
      texts.noticeboard.alerts.deleteConversation,
      [
        {
          text: texts.noticeboard.abort,
          style: 'cancel'
        },
        {
          text: texts.noticeboard.alerts.deleteButton,
          onPress: () => {
            setIsDeleting(true);
            deleteConversation({
              variables: { conversationId }
            });
          },
          style: 'destructive'
        }
      ],
      { cancelable: false }
    );
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPressPin}
        accessibilityLabel={consts.a11yLabel.backIcon}
        accessibilityHint={consts.a11yLabel.backIconHint}
      >
        {isPinned ? <Icon.PinFilled strokeWidth={0.1} /> : <Icon.Pin />}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onPressTrash}
        accessibilityLabel={consts.a11yLabel.backIcon}
        accessibilityHint={consts.a11yLabel.backIconHint}
      >
        {isDeleting ? <ActivityIndicator color={colors.refreshControl} /> : <Icon.Trash />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8
  }
});
