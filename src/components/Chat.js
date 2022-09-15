import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { MediaTypeOptions } from 'expo-image-picker';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
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

import { colors, consts, Icon, normalize, texts } from '../config';
import { deleteArrayItem, momentFormat, openLink } from '../helpers';
import { useSelectDocument, useSelectImage } from '../hooks';

import { Image } from './Image';
import { RegularText } from './Text';
import { Wrapper } from './Wrapper';

const { IMAGE_TYPE_REGEX, VIDEO_TYPE_REGEX } = consts;

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
  const [medias, setMedias] = useState([]);

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

  const { selectImage } = useSelectImage(
    undefined, // onChange
    false, // allowsEditing,
    undefined, // aspect,
    undefined, // quality,
    MediaTypeOptions.All // mediaTypes
  );
  const { selectDocument } = useSelectDocument();

  return (
    <GiftedChat
      alwaysShowSend
      messages={messages}
      minInputToolbarHeight={normalize(96)}
      placeholder={placeholder}
      scrollToBottom
      user={{ _id: parseInt(userId) }}
      renderActions={(props) => {
        const mediaActionSheet = {
          'Aus Bibliothek wählen': async () => {
            const { uri, type } = await selectImage();
            const mediaType = (IMAGE_TYPE_REGEX.exec(uri) || VIDEO_TYPE_REGEX.exec(uri))[1];

            try {
              await errorHandler(uri);
            } catch (error) {
              console.error(error);
              return;
            }

            setMedias([...medias, { mimeType: `${type}/${mediaType}`, type, uri }]);
          },
          'Dokument senden': async () => {
            const { mimeType, uri } = await selectDocument();

            try {
              await errorHandler(uri);
            } catch (error) {
              console.error(error);
              return;
            }

            setMedias([...medias, { mimeType, type: 'pdf', uri }]);
          },
          Cancel: () => null
        };

        return (
          <Actions
            {...props}
            options={mediaActionSheet}
            containerStyle={styles.actionButtonContainer}
            icon={() => <Icon.NamedIcon name="add" size={normalize(24)} color={colors.darkText} />}
          />
        );
      }}
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
      renderDay={(props) => <Day {...props} dateFormat="DD.MM.YYYY" />}
      renderFooter={() => medias && renderFooter(medias, setMedias)}
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
            left: messageTextStyleLeft || { color: colors.darkText, fontSize: normalize(14) },
            right: messageTextStyleRight || { color: colors.darkText, fontSize: normalize(14) }
          }}
        />
      )}
      renderSend={({ onSend, text, sendButtonProps, ...props }) => (
        <Send
          {...props}
          containerStyle={styles.sendButtonContainer}
          sendButtonProps={{ ...sendButtonProps, onPress: () => onSendMessages(text, onSend) }}
        >
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

const renderFooter = (medias, setMedias) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
              <Icon.NamedIcon
                name="close-circle-outline"
                size={normalize(24)}
                color={colors.surface}
              />
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
    alignSelf: 'center',
    justifyContent: 'center'
  },
  border: {
    borderColor: colors.darkText,
    borderWidth: 1
  },
  containerStyle: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  inputToolbarContainer: {
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
  overlayContainerStyle: {
    backgroundColor: colors.surface
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
  placeholderStyle: {
    backgroundColor: colors.surface
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
  spacing: {
    marginVertical: normalize(5)
  },
  spacingTime: {
    paddingHorizontal: normalize(10)
  },
  textInputStyle: {
    borderColor: colors.gray20,
    borderRadius: normalize(4),
    borderWidth: normalize(1),
    marginBottom: 0,
    marginLeft: normalize(16),
    marginTop: 0,
    maxHeight: normalize(200),
    minHeight: normalize(48),
    paddingHorizontal: normalize(10),
    paddingTop: normalize(16)
  },
  titleStyle: {
    color: colors.darkText,
    fontSize: normalize(12)
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
  textInputProps: PropTypes.object,
  userId: PropTypes.string || PropTypes.number
};

UserAvatar.propTypes = {
  uri: PropTypes.string,
  title: PropTypes.string
};
