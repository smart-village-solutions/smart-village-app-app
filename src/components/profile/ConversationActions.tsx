import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import { consts, Icon, texts } from '../../config';

export const ConversationActions = () => {
  const [isPinned, setIsPinned] = useState(false);

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
          onPress: () => {},
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
        <Icon.Trash />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8
  }
});
