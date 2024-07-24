import 'dayjs/locale/de';
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { MediaTypeOptions } from 'expo-image-picker';
import * as ScreenOrientation from 'expo-screen-orientation';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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

import { colors, consts, device, Icon, normalize, texts } from '../config';
import { deleteArrayItem, momentFormat, openLink } from '../helpers';
import { useSelectDocument, useSelectImage } from '../hooks';

import { Image } from './Image';
import { RegularText } from './Text';
import { VolunteerAvatar } from './volunteer';
import { Wrapper } from './Wrapper';

const { IMAGE_TYPE_REGEX, VIDEO_TYPE_REGEX } = consts;

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
  messageTextStyleLeft,
  messageTextStyleRight,
  onSendButton,
  placeholder = '',
  showActionButton = false,
  textInputProps,
  userId
}) => {
  const [messages, setMessages] = useState(data);
  const [medias, setMedias] = useState([]);

  useEffect(() => {
    // this screen is set to portrait mode because half of the screen is visible in landscape
    // mode when viewing pictures in large screen mode
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  useEffect(() => {
    setMessages(data);
  }, [data]);

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

  const errorHandler = async (uri) => {
    const { size } = await FileSystem.getInfoAsync(uri);
    const errorText = size > 10485760 && {
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

  return (
    <GiftedChat
      alwaysShowSend
      bottomOffset={device.platform === 'ios' && normalize(96)}
      keyboardShouldPersistTaps="handled"
      locale="de"
      messages={messages}
      minInputToolbarHeight={normalize(96)}
      placeholder={placeholder}
      scrollToBottom
      scrollToBottomComponent={() => <Icon.ArrowDown />}
      user={{ _id: parseInt(userId) }}
      renderActions={(props) => {
        const mediaActionSheet = {
          'Foto wählen': async () => {
            const { uri, type } = await selectImage();
            const mediaType = (IMAGE_TYPE_REGEX.exec(uri) || VIDEO_TYPE_REGEX.exec(uri))[1];

            try {
              await errorHandler(uri);
            } catch (error) {
              console.error(error);
              return;
            }

            setMedias((prev) => [...prev, { mimeType: `${type}/${mediaType}`, type, uri }]);
          },
          'Dokument wählen': async () => {
            const { mimeType, uri } = await selectDocument();

            try {
              await errorHandler(uri);
            } catch (error) {
              console.error(error);
              return;
            }

            setMedias((prev) => [...prev, { mimeType, type: 'pdf', uri }]);
          },
          Abbrechen: () => null
        };

        if (!showActionButton) return null;

        return (
          <Actions
            {...props}
            options={mediaActionSheet}
            containerStyle={styles.actionButtonContainer}
            icon={() => <Icon.Plus color={colors.darkText} />}
          />
        );
      }}
      renderAvatar={(props) => <VolunteerAvatar item={{ user: props?.currentMessage?.user }} />}
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
          multiline
          textInputStyle={styles.textInputStyle}
          textInputProps={textInputProps}
        />
      )}
      renderCustomView={(props) =>
        props?.currentMessage?.pdf?.map(({ uri }, index) => (
          <TouchableOpacity
            key={`pdf-${index}`}
            onPress={() => openLink(uri)}
            style={styles.pdfBubble}
          >
            <Icon.Document size={normalize(50)} />
          </TouchableOpacity>
        ))
      }
      renderDay={(props) => <Day {...props} dateFormat="D. MMMM YYYY" />}
      renderFooter={() => !!medias.length && renderFooter(medias, setMedias)}
      renderInputToolbar={(props) => (
        <InputToolbar
          {...props}
          containerStyle={styles.inputToolbarContainer}
          primaryStyle={styles.inputToolbarPrimary}
        />
      )}
      renderMessageImage={(props) =>
        props?.currentMessage?.image?.map(({ uri }, index) => (
          <MessageImage
            {...props}
            key={`image-${index}`}
            currentMessage={{ image: uri }}
            lightboxProps={{ springConfig: { useNativeDriver: false } }}
          />
        ))
      }
      renderMessageVideo={(props) =>
        props?.currentMessage?.video?.map(({ uri }, index) => (
          <Video
            key={`video-${index}`}
            resizeMode="cover"
            source={{ uri }}
            style={styles.videoBubble}
            useNativeControls
          />
        ))
      }
      renderMessageText={(props) => (
        <MessageText
          {...props}
          textStyle={{
            left: messageTextStyleLeft || styles.textStyle,
            right: messageTextStyleRight || styles.textStyle
          }}
        />
      )}
      renderSend={({ onSend, text, sendButtonProps, ...props }) => (
        <Send
          {...props}
          containerStyle={styles.sendButtonContainer}
          sendButtonProps={{ ...sendButtonProps, onPress: () => onSendMessages(text, onSend) }}
        >
          <Icon.Send color={colors.lightestText} size={normalize(20)} />
        </Send>
      )}
      renderTime={(props) => (
        <View style={styles.spacingTime}>
          <RegularText small>{momentFormat(props?.currentMessage?.createdAt, 'HH:mm')}</RegularText>
        </View>
      )}
    />
  );
};

const renderFooter = (medias, setMedias) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.footerStyle}>
    {medias.map(({ uri, type }, index) => {
      return (
        <Wrapper key={index}>
          {type === 'image' && (
            <Image
              borderRadius={normalize(4)}
              resizeMode="cover"
              source={{ uri }}
              childrenContainerStyle={styles.mediaPreview}
            />
          )}
          {type === 'video' && (
            <Video
              resizeMode="cover"
              source={{ uri }}
              style={[styles.mediaBorder, styles.mediaPreview]}
              useNativeControls
            />
          )}
          {type === 'pdf' && (
            <TouchableOpacity
              onPress={() => openLink(uri)}
              style={[styles.mediaBorder, styles.mediaPreview, styles.pdfPreview]}
            >
              <Icon.Document size={normalize(50)} />
            </TouchableOpacity>
          )}
          <View style={styles.mediaDeleteButton}>
            <TouchableOpacity onPress={() => setMedias(deleteArrayItem(medias, index))}>
              <Icon.CloseCircleOutline color={colors.surface} />
            </TouchableOpacity>
          </View>
        </Wrapper>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  actionButtonContainer: {
    alignItems: 'center',
    height: normalize(30),
    justifyContent: 'center'
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
    paddingHorizontal: normalize(10)
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
    color: colors.darkText,
    fontFamily: 'regular',
    fontSize: normalize(14)
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
