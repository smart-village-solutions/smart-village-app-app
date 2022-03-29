import 'moment/locale/de';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar } from 'react-native-elements';
import { useQuery } from 'react-query';

import { colors, normalize } from '../../config';
import { volunteerListDate, volunteerProfileImage, volunteerUserData } from '../../helpers';
import { conversationRecipients } from '../../queries/volunteer';
import { RegularText } from '../Text';
import { Wrapper, WrapperWithOrientation } from '../Wrapper';

const UserAvatar = ({ uri, title }: { uri: string; title: string }) => (
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

export const VolunteerMessage = ({
  data,
  conversationId
}: {
  data: {
    results: [
      {
        id: number;
        user_id: number;
        content: string;
        created_at: string;
        created_by: number;
        updated_at: string;
        updated_by: number;
      }
    ];
  };
  conversationId: number;
}) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const { data: dataRecipients, isLoading } = useQuery(
    ['conversationRecipients', conversationId],
    () => conversationRecipients(conversationId)
  );

  useEffect(() => {
    volunteerUserData().then((volunteerUser) => {
      setCurrentUserId(volunteerUser.currentUserId);
    });
  }, []);

  if (isLoading || !dataRecipients || !currentUserId) return null;

  return (
    <WrapperWithOrientation>
      {currentUserId && !!data?.results?.length && (
        <Wrapper>
          {data.results.map((message) => {
            const { id, content, created_by: createdBy, updated_at } = message || {};
            const isOwnMessage = createdBy.toString() == currentUserId;

            const user = dataRecipients.find(
              (recipient: { id: string }) => recipient.id == createdBy.toString()
            );
            const { display_name: displayName, guid } = user || {};
            // get initials from the display name
            const title = displayName
              ?.split(' ')
              .map((part: string) => part[0])
              .join('');
            const uri = volunteerProfileImage(guid);

            return (
              <View key={id}>
                <View style={[!isOwnMessage && styles.containerStyle]}>
                  {!isOwnMessage && <UserAvatar uri={uri} title={title} />}
                  <RegularText right={isOwnMessage} smallest style={styles.dateTimeStyle}>
                    {volunteerListDate({
                      end_datetime: '',
                      start_datetime: '',
                      updated_at
                    })}
                  </RegularText>
                </View>
                <RegularText
                  primary={!isOwnMessage}
                  right={isOwnMessage}
                  style={styles.messageStyle}
                >
                  {content}
                </RegularText>
              </View>
            );
          })}
        </Wrapper>
      )}
    </WrapperWithOrientation>
  );
};

const styles = StyleSheet.create({
  border: {
    borderColor: colors.darkText,
    borderWidth: 1
  },
  containerStyle: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dateTimeStyle: {
    marginLeft: normalize(6)
  },
  messageStyle: {
    marginBottom: normalize(10)
  },
  overlayContainerStyle: {
    backgroundColor: colors.lightestText
  },
  placeholderStyle: {
    backgroundColor: colors.lightestText
  },
  titleStyle: {
    color: colors.darkText,
    fontSize: normalize(12)
  },
  spacing: {
    marginVertical: normalize(5)
  }
});
