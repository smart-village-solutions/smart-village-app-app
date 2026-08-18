import { useNavigation } from 'expo-router/react-navigation';
import 'dayjs/locale/de';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useVideoPlayer, VideoView } from 'expo-video';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { Keyboard, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
  Actions,
  Bubble,
  Composer,
  Day,
  GiftedChat,
  InputToolbar,
  MessageImage,
  MessageText,
  Send
} from 'react-native-gifted-chat';
import { QuickReplies } from 'react-native-gifted-chat/lib/QuickReplies';

import { consts, device, Icon, normalize, texts } from '../config';
import { deleteArrayItem, getFileSize, momentFormat, openLink } from '../helpers';
import { MediaTypeOptions, useSelectDocument, useSelectImage } from '../hooks';
import { useTheme } from '../hooks/useTheme';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { ScreenName } from '../types';

import { DotsAnimation } from './DotsAnimation';
import { Image } from './Image';
import { RegularText } from './Text';
import { VolunteerAvatar } from './volunteer';
import { Wrapper } from './Wrapper';

const MessageVideo = ({ styles, uri }) => {
  const player = useVideoPlayer(uri, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.play();
  });

  return (
    <VideoView player={player} resizeMode="cover" style={styles.videoBubble} useNativeControls />
  );
};

MessageVideo.propTypes = {
  styles: PropTypes.object.isRequired,
  uri: PropTypes.string.isRequired
};

const { IMAGE_TYPE_REGEX, MB_TO_BYTES, VIDEO_TYPE_REGEX } = consts;

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
 * @param {bool}   showActionButton           prop to render the action buttons
 * @param {object} textInputProps          props to customise text input
 * @param {number} userId      prop to recognise whether the message is the owner
 *                                         or another user
 */
export const Chat = ({
  bubbleWrapperStyleLeft,
  bubbleWrapperStyleRight,
  data,
  isTyping = false,
  messageTextStyleLeft,
  messageTextStyleRight,
  onSendButton,
  placeholder = '',
  showActionButton = false,
  showAvatar = true,
  textInputProps,
  userId
}) => {
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const navigation = useNavigation();
  const [messages, setMessages] = useState(data);
  const [medias, setMedias] = useState([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    // this screen is set to portrait mode because half of the screen is visible in landscape
    // mode when viewing pictures in large screen mode
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  useEffect(() => {
    setMessages(data);
  }, [data]);

  const messageTextMatchers = useMemo(
    () => [
      {
        type: 'hashtag',
        pattern: /\*\*([^*]+)\*\*/g,
        getLinkText: (text) => text.replace(/^\*\*|\*\*$/g, ''),
        renderLink: (text, _url, index) => (
          <Text key={`bold-${index}`} style={styles.boldText}>
            {text}
          </Text>
        )
      },
      {
        type: 'mention',
        pattern: /\[([^\]]+)\]\(([^)]+)\)/g,
        getLinkText: (text) => text.match(/\[([^\]]+)\]/)?.[1] || text,
        getLinkUrl: (text) => text.match(/\(([^)]+)\)/)?.[1] || '',
        onPress: (url) => {
          const webUrl = url.startsWith('http') ? url : `https://${url}`;

          navigation.navigate(ScreenName.Web, { webUrl });
        }
      }
    ],
    [navigation]
  );

  const onSendMessages = (text, onSend) => {
    const message = { text, medias };

    if ((medias.length || text) && onSend) {
      onSendButton(message);
      onSend({ text: text.trim() }, true);
      setMedias([]);
    } else {
      return false;
    }
  };

  const onQuickReply = (replies) => {
    // Send the quick reply as a regular message
    if (replies?.length) {
      // For radio type, we get a single reply
      // For checkbox type, we can get multiple replies
      const replyText = replies.map((reply) => reply.title).join(', ');

      onSendButton({ text: replyText, medias: [] });
    }
  };

  const errorHandler = async (uri) => {
    const size = getFileSize(uri);
    const errorText = size > MB_TO_BYTES[10] && {
      title: texts.errors.image.title,
      message: texts.volunteer.mediaGreater10MBError
    };

    if (errorText) {
      throw errorText;
    }
  };
  const { selectImage } = useSelectImage({
    allowsEditing: false,
    mediaTypes: MediaTypeOptions.All
  });

  const { selectDocument } = useSelectDocument();

  // thx to: https://github.com/FaridSafi/react-native-gifted-chat/issues/2544#issuecomment-2398233334
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <GiftedChat
      isSendButtonAlwaysVisible
      isScrollToBottomEnabled
      isTyping={isTyping}
      locale="de"
      messages={messages}
      minInputToolbarHeight={normalize(96)}
      dateFormatCalendar={{ sameDay: '[Heute]' }}
      scrollToBottomComponent={() => <Icon.ArrowDown />}
      listProps={{
        contentContainerStyle: {
          paddingBottom: keyboardHeight
        },
        keyboardShouldPersistTaps: 'handled'
      }}
      textInputProps={{ ...textInputProps, placeholder }}
      user={{ _id: parseInt(userId) }}
      onQuickReply={onQuickReply}
      renderActions={(props) => {
        if (!showActionButton) return null;

        const mediaActions = [
          {
            title: 'Foto wählen',
            action: async () => {
              const { uri, type } = await selectImage();
              const mediaType = (IMAGE_TYPE_REGEX.exec(uri) || VIDEO_TYPE_REGEX.exec(uri))[1];

              try {
                await errorHandler(uri);
              } catch (error) {
                console.error(error);
                return;
              }

              setMedias((prev) => [...prev, { mimeType: `${type}/${mediaType}`, type, uri }]);
            }
          },
          {
            title: 'Dokument wählen',
            action: async () => {
              const { mimeType, uri } = await selectDocument();

              try {
                await errorHandler(uri);
              } catch (error) {
                console.error(error);
                return;
              }

              setMedias((prev) => [...prev, { mimeType, type: 'pdf', uri }]);
            }
          },
          { title: 'Abbrechen', action: () => null }
        ];

        return (
          <Actions
            {...props}
            options={mediaActionSheet}
            containerStyle={styles.actionButtonContainer}
            icon={() => <Icon.Plus color={colors.text} />}
          />
        );
      }}
      renderAvatar={(props) =>
        showAvatar && <VolunteerAvatar item={{ user: props?.currentMessage?.user }} />
      }
      renderBubble={(props) => (
        <Bubble
          {...props}
          wrapperStyle={{
            left: bubbleWrapperStyleLeft || {
              backgroundColor: colors.gray20
            },
            right: bubbleWrapperStyleRight || {
              // TODO: added manually because there is no similar color in the colors file
              backgroundColor: colors.lighterPrimaryRgba
            }
          }}
        />
      )}
      renderComposer={(props) => (
        <Composer
          {...props}
          textInputProps={{
            ...props.textInputProps,
            multiline: true,
            style: styles.textInputStyle
          }}
        />
      )}
      renderCustomView={(props) =>
        props?.currentMessage?.pdf?.map(({ uri }, index) => (
          <TouchableOpacity
            accessibilityLabel={texts.accessibilityLabels.actions.openPdf}
            key={`pdf-${index}`}
            onPress={() => openLink(uri)}
            style={styles.pdfBubble}
          >
            <Icon.Document size={normalize(50)} />
          </TouchableOpacity>
        ))
      }
      renderDay={(props) => <Day {...props} dateFormat="D. MMMM YYYY" />}
      renderFooter={() => {
        const hasMedias = medias.length > 0;

        // If we have neither medias nor typing, return null
        if (!hasMedias && !isTyping) {
          return null;
        }

        return (
          <View>
            {/* Show typing indicator if typing */}
            {isTyping && (
              <View style={styles.typingContainer}>
                <View style={styles.typingBubble}>
                  <DotsAnimation />
                </View>
              </View>
            )}
            {/* Show media preview if there are medias */}
            {hasMedias && renderFooter(medias, setMedias, colors, styles)}
          </View>
        );
      }}
      renderInputToolbar={(props) => (
        <InputToolbar
          {...props}
          containerStyle={styles.inputToolbarContainer}
          primaryStyle={styles.inputToolbarPrimary}
        />
      )}
      renderMessageImage={(props) =>
        props?.currentMessage?.image?.map(({ uri }, index) => (
          <MessageImage {...props} key={`image-${index}`} currentMessage={{ image: uri }} />
        ))
      }
      renderMessageVideo={(props) =>
        props?.currentMessage?.video?.map(({ uri }, index) => (
          <MessageVideo key={`video-${index}`} styles={styles} uri={uri} />
        ))
      }
      renderMessageText={(props) => (
        <MessageText
          {...props}
          textStyle={{
            left: [styles.textStyle, messageTextStyleLeft],
            right: [styles.textStyle, messageTextStyleRight]
          }}
          matchers={messageTextMatchers}
        />
      )}
      renderSend={({ onSend, text, sendButtonProps, ...props }) => (
        <Send
          {...props}
          containerStyle={styles.sendButtonContainer}
          sendButtonProps={{ ...sendButtonProps, onPress: () => onSendMessages(text, onSend) }}
        >
          <Icon.Send color={colors.onPrimary} size={normalize(20)} />
        </Send>
      )}
      renderTime={(props) => (
        <View style={styles.spacingTime}>
          <RegularText small>{formatMessageTime(props?.currentMessage?.createdAt)}</RegularText>
        </View>
      )}
      renderQuickReplies={(props) => (
        <QuickReplies
          {...props}
          quickReplyStyle={{
            backgroundColor: colors.primary,
            borderRadius: normalize(8),
            borderWidth: 0
          }}
          quickReplyTextStyle={{ color: colors.onPrimary }}
        />
      )}
    />
  );
};

const formatMessageTime = (createdAt) =>
  momentFormat(createdAt, 'HH:mm', typeof createdAt === 'number' ? 'x' : undefined);

const renderFooter = (medias, setMedias, colors, styles) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.footerStyle}>
    {medias.map(({ uri, type }, index) => {
      return (
        <Wrapper key={index}>
          {type === 'image' && (
            <Image
              borderRadius={normalize(4)}
              resizeMode="cover"
              source={{ uri }}
              style={styles.mediaPreview}
            />
          )}
          {type === 'video' && (
            <VideoView
              resizeMode="cover"
              source={{ uri }}
              style={[styles.mediaBorder, styles.mediaPreview]}
              useNativeControls
            />
          )}
          {type === 'pdf' && (
            <TouchableOpacity
              accessibilityLabel={texts.accessibilityLabels.actions.openPdf}
              onPress={() => openLink(uri)}
              style={[styles.mediaBorder, styles.mediaPreview, styles.pdfPreview]}
            >
              <Icon.Document size={normalize(50)} />
            </TouchableOpacity>
          )}
          <View style={styles.mediaDeleteButton}>
            <TouchableOpacity
              accessibilityLabel={texts.accessibilityLabels.actions.deleteMedium}
              onPress={() => setMedias(deleteArrayItem(medias, index))}
            >
              <Icon.CloseCircleOutline color={colors.surface} />
            </TouchableOpacity>
          </View>
        </Wrapper>
      );
    })}
  </ScrollView>
);

const createStyles = (colors) => ({
  actionButtonContainer: {
    alignItems: 'center',
    height: normalize(30),
    justifyContent: 'center'
  },
  boldText: {
    fontFamily: 'bold',
    fontWeight: 'bold'
  },
  footerStyle: {
    borderTopWidth: normalize(1),
    borderTopColor: colors.gray20
  },
  inputToolbarContainer: {
    backgroundColor: colors.surface,
    paddingVertical: normalize(24)
  },
  inputToolbarPrimary: {
    minHeight: normalize(48)
  },
  mediaBorder: {
    borderRadius: normalize(4)
  },
  mediaDeleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: normalize(20),
    top: normalize(20),
    zIndex: 1
  },
  mediaPreview: {
    height: normalize(86),
    width: normalize(86)
  },
  pdfBubble: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: normalize(13),
    height: normalize(86),
    justifyContent: 'center',
    marginBottom: normalize(10),
    width: '100%'
  },
  pdfPreview: {
    alignItems: 'center',
    backgroundColor: colors.gray40,
    justifyContent: 'center'
  },
  sendButtonContainer: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: normalize(4),
    height: normalize(48),
    justifyContent: 'center',
    marginLeft: normalize(8),
    marginRight: normalize(10),
    width: normalize(48)
  },
  spacingTime: {
    paddingHorizontal: normalize(10),
    paddingBottom: normalize(8)
  },
  textInputStyle: {
    borderColor: colors.gray20,
    borderRadius: normalize(4),
    borderWidth: normalize(1),
    fontFamily: 'regular',
    fontSize: normalize(16),
    lineHeight: normalize(24),
    marginBottom: 0,
    marginLeft: normalize(10),
    marginTop: 0,
    maxHeight: normalize(200),
    minHeight: normalize(48),
    paddingBottom: normalize(10),
    paddingHorizontal: normalize(10),
    paddingTop: normalize(10)
  },
  textStyle: {
    color: colors.text,
    fontFamily: 'regular',
    fontSize: normalize(14),
    lineHeight: normalize(20)
  },
  typingContainer: {
    paddingBottom: normalize(10),
    paddingLeft: normalize(15),
    paddingRight: normalize(60)
  },
  typingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gray20,
    borderRadius: normalize(18),
    minHeight: normalize(56),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12)
  },
  videoBubble: {
    alignSelf: 'center',
    borderRadius: normalize(13),
    height: normalize(86),
    marginBottom: normalize(10),
    width: '100%'
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
  showActionButton: PropTypes.bool,
  textInputProps: PropTypes.object,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
