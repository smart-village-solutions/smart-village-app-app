import { useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useLayoutEffect, useMemo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Button, Chat, EmptyMessage, LoadingSpinner, Wrapper } from '../components';
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
  const { chatbotType } = (settings as any) || {};

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

  const userId = useMemo(() => {
    return '1';
  }, [chatbotConfiguration]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={retry}
          style={styles.headerButton}
          accessibilityLabel={texts.chatbot.headerButtonAccessibilityLabel}
          accessibilityHint={texts.chatbot.headerButtonAccessibilityHint}
        >
          <Icon.NamedIcon name="refresh" size={normalize(24)} color={colors.darkText} />
        </TouchableOpacity>
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
  headerButton: {
    paddingHorizontal: normalize(14)
  }
});
