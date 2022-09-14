import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar } from 'react-native-elements';
import {
  Bubble,
  Composer,
  GiftedChat,
  InputToolbar,
  MessageText,
  Send
} from 'react-native-gifted-chat';

import { colors, Icon, normalize } from '../config';
import { momentFormat } from '../helpers';

import { RegularText } from './Text';

const UserAvatar = ({ uri, title }) => (
  <Avatar
    containerStyle={styles.spacing}
    overlayContainerStyle={[styles.overlayContainerStyle, !uri && styles.border]}
    placeholderStyle={styles.placeholderStyle}
    rounded
    source={uri ? { uri } : undefined}
    renderPlaceholderContent={
      <Avatar
        containerStyle={[styles.containerStyle]}
        overlayContainerStyle={[styles.overlayContainerStyle, styles.border]}
        rounded
        title={title}
        titleStyle={styles.titleStyle}
      />
    }
  />
);

/**
 * it is the component used to realise the chat function
 * @param {array} data please make sure that the data format is as shown in the document
 *                      https://github.com/FaridSafi/react-native-gifted-chat#message-object
 * @param {object} bubbleWrapperStyleLeft  style of chat balloons on the left
 * @param {object} bubbleWrapperStyleRight style of chat balloons on the right
 * @param {object} messageTextStyleLeft    style of chat text on the left
 * @param {object} messageTextStyleRight   style of chat text on the right
 * @param {func}   onSendButton            function returning message text
 * @param {string} placeholder             placeholder text of `textInput`
 * @param {object} textInputProps          props to customise text input
 * @param {number} userId      prop to recognise whether the message is the owner
 *                                         or another user
 */
export const Chat = ({
  bubbleWrapperStyleLeft,
  bubbleWrapperStyleRight,
  data,
  messageTextStyleLeft,
  messageTextStyleRight,
  onSendButton,
  placeholder = '',
  textInputProps,
  userId
}) => {
  const [messages, setMessages] = useState(data);

  useEffect(() => {
    setMessages(data);
  }, [data]);

  return (
    <GiftedChat
      alwaysShowSend
      messages={messages}
      minInputToolbarHeight={normalize(96)}
      onSend={(messages) => {
        onSendButton(messages[0].text);
      }}
      placeholder={placeholder}
      scrollToBottom
      user={{ _id: parseInt(userId) }}
      renderAvatar={(props) => (
        <UserAvatar
          uri={props?.currentMessage?.user?.avatar}
          title={props?.currentMessage?.user?.name}
        />
      )}
      renderBubble={(props) => (
        <Bubble
          {...props}
          wrapperStyle={{
            left: bubbleWrapperStyleLeft || {
              backgroundColor: colors.gray20
            },
            right: bubbleWrapperStyleRight || {
              // TODO: added manually because there is no similar color in the colors file
              backgroundColor: '#E8F1E9'
            }
          }}
        />
      )}
      renderComposer={(props) => (
        <Composer
          {...props}
          textInputStyle={styles.textInputStyle}
          textInputProps={textInputProps}
        />
      )}
      renderInputToolbar={(props) => (
        <InputToolbar
          {...props}
          containerStyle={styles.inputToolbarContainer}
          primaryStyle={styles.inputToolbarPrimary}
        />
      )}
      renderMessageText={(props) => (
        <MessageText
          {...props}
          textStyle={{
            left: messageTextStyleLeft || { color: colors.darkText, fontSize: normalize(14) },
            right: messageTextStyleRight || { color: colors.darkText, fontSize: normalize(14) }
          }}
        />
      )}
      renderSend={(props) => (
        <Send {...props} containerStyle={styles.sendButtonContainer}>
          <Icon.NamedIcon name="send" color={colors.surface} />
        </Send>
      )}
      renderTime={(props) => (
        <View style={styles.spacingTime}>
          <RegularText smallest placeholder>
            {momentFormat(props?.currentMessage?.createdAt, 'HH:mm')}
          </RegularText>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  textInputStyle: {
    borderColor: colors.gray20,
    borderRadius: normalize(4),
    borderWidth: normalize(1),
    marginBottom: 0,
    marginLeft: normalize(20),
    marginTop: 0,
    maxHeight: normalize(200),
    minHeight: normalize(48),
    paddingHorizontal: normalize(10),
    paddingTop: normalize(16)
  },
  inputToolbarContainer: {
    paddingVertical: normalize(24)
  },
  inputToolbarPrimary: {
    minHeight: normalize(48)
  },
  sendButtonContainer: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: normalize(4),
    height: normalize(48),
    justifyContent: 'center',
    marginLeft: normalize(8),
    marginRight: normalize(20),
    width: normalize(48)
  },
  border: {
    borderColor: colors.darkText,
    borderWidth: 1
  },
  containerStyle: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  overlayContainerStyle: {
    backgroundColor: colors.surface
  },
  placeholderStyle: {
    backgroundColor: colors.surface
  },
  titleStyle: {
    color: colors.darkText,
    fontSize: normalize(12)
  },
  spacing: {
    marginVertical: normalize(5)
  },
  spacingTime: {
    paddingHorizontal: normalize(10)
  }
});

Chat.propTypes = {
  bubbleWrapperStyleLeft: PropTypes.object,
  bubbleWrapperStyleRight: PropTypes.object,
  currentMessage: PropTypes.object,
  data: PropTypes.array.isRequired,
  messageTextStyleLeft: PropTypes.object,
  messageTextStyleRight: PropTypes.object,
  onSendButton: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  textInputProps: PropTypes.object,
  userId: PropTypes.string || PropTypes.number
};

UserAvatar.propTypes = {
  uri: PropTypes.string,
  title: PropTypes.string
};
