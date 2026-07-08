import { useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import {
  AccessibilityHeader,
  Button,
  Chat,
  EmptyMessage,
  LoadingSpinner,
  Wrapper,
  WrapperRow
} from '../components';
import { HEADER_RIGHT_ICON_STROKE_WIDTH } from '../components/headerIconConfig';
import { colors, Icon, normalize, texts } from '../config';
import { useChatbot, useStaticContent } from '../hooks';
import { NetworkContext } from '../NetworkProvider';
import { SettingsContext } from '../SettingsProvider';
import { ChatbotConfig, ChatbotConnectionState } from '../types';

export const ChatbotScreen = () => {
  const navigation = useNavigation();
  const { isConnected: isNetworkConnected } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { settings } = globalSettings;
  const chatbotType = (settings as { chatbotType?: string } | undefined)?.chatbotType;

  const { data: chatbotConfiguration, loading: configLoading } = useStaticContent<ChatbotConfig>({
    name: `${chatbotType}-chatbotSettings`,
    refreshTimeKey: `${chatbotType}-publicJsonFile`,
    skip: !chatbotType,
    type: 'json'
  });

  const { connect, connectionState, disconnect, error, isTyping, messages, retry, sendMessage } =
    useChatbot(chatbotConfiguration as ChatbotConfig, isNetworkConnected);

  const handleSendMessage = (message: { text: string; medias?: unknown[] }) => {
    if (message.text) {
      sendMessage(message.text);
    }
  };

  useEffect(() => {
    if (
      chatbotConfiguration &&
      isNetworkConnected &&
      connectionState === ChatbotConnectionState.Disconnected
    ) {
      connect();
    }
  }, [chatbotConfiguration, isNetworkConnected, connectionState, connect]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const userId = '1';

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <WrapperRow style={styles.headerRight}>
          <AccessibilityHeader style={styles.icon} />
          <TouchableOpacity
            onPress={retry}
            style={styles.headerButton}
            accessibilityLabel={texts.chatbot.headerButtonAccessibilityLabel}
            accessibilityHint={texts.chatbot.headerButtonAccessibilityHint}
          >
            <Icon.NamedIcon
              name="refresh"
              size={normalize(24)}
              color={colors.darkText}
              strokeWidth={HEADER_RIGHT_ICON_STROKE_WIDTH}
            />
          </TouchableOpacity>
        </WrapperRow>
      )
    });
  }, [navigation, retry]);

  if (configLoading) {
    return <LoadingSpinner loading />;
  }

  if (!chatbotConfiguration) {
    return <EmptyMessage title={texts.chatbot.configurationMissing} />;
  }

  if (!isNetworkConnected) {
    return <EmptyMessage title={texts.chatbot.offline} />;
  }

  if (error && connectionState === ChatbotConnectionState.Error) {
    return (
      <Wrapper>
        <EmptyMessage title={error.message} />
        <Wrapper>
          <Button
            big={false}
            disabled={false}
            icon={undefined}
            onPress={retry}
            small={false}
            smallest={false}
            title={texts.chatbot.retry}
          />
        </Wrapper>
      </Wrapper>
    );
  }

  if (connectionState === ChatbotConnectionState.Connecting) {
    return (
      <Wrapper>
        <EmptyMessage title={texts.chatbot.connecting} showIcon={false} />
        <LoadingSpinner loading />
      </Wrapper>
    );
  }

  return (
    <Chat
      data={messages}
      isTyping={isTyping}
      onSendButton={handleSendMessage}
      placeholder={chatbotConfiguration.inputHint || texts.chatbot.defaultPlaceholder}
      showAvatar={chatbotConfiguration.showAvatar ?? true}
      userId={userId}
    />
  );
};

const styles = StyleSheet.create({
  headerRight: {
    alignItems: 'center',
    paddingRight: normalize(8)
  },
  headerButton: {
    paddingHorizontal: normalize(10)
  },
  icon: {
    paddingHorizontal: normalize(6)
  }
});
