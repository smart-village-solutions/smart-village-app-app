import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, Icon, texts } from '../../config';
import { storageHelper } from '../../helpers';
import { DELETE_CONVERSATION, GET_CONVERSATIONS } from '../../queries/profile';
import { SettingsContext } from '../../SettingsProvider';

export const ConversationActions = ({ conversationId }: { conversationId: string | number }) => {
  const { conversationSettings, setConversationSettings } = useContext(SettingsContext);
  const [isPinned, setIsPinned] = useState(
    conversationSettings?.pinned?.includes(conversationId) || false
  );
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
    // if `isPinned` is true, it gets unpinned, so remove conversation from pinned conversations.
    // if `isPinned` is false, it gets pinned, so add conversation to pinned conversations.
    const updatedPinnedConversations = isPinned
      ? conversationSettings?.pinned?.filter((id: string | number) => id !== conversationId)
      : [...(conversationSettings?.pinned || []), conversationId];

    const updatedConversationSettings = {
      ...conversationSettings,
      pinned: updatedPinnedConversations
    };

    setIsPinned(!isPinned);
    setConversationSettings(updatedConversationSettings);
    storageHelper.setConversationSettings(updatedConversationSettings);
  }, [isPinned, conversationSettings]);

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
