import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Overlay } from 'react-native-elements';
import { useQuery } from 'react-query';

import { Icon, colors, normalize, texts } from '../../config';
import { storeProfileAuthToken, storeProfileUserData } from '../../helpers';
import { useStaticContent } from '../../hooks';
import { useProfileContext } from '../../ProfileProvider';
import { QUERY_TYPES } from '../../queries';
import { member } from '../../queries/profile';
import { ProfileMember, ScreenName } from '../../types';
import { Button } from '../Button';
import { Image } from '../Image';
import { HeadlineText, RegularText } from '../Text';
import { Wrapper, WrapperHorizontal, WrapperVertical } from '../Wrapper';

export const LOGIN_MODAL = 'loginModal';

type TLoginModal = {
  navigation: StackNavigationProp<any>;
  publicJsonFile: string;
};

interface DataItem {
  backgroundColor?: string;
  description: string;
  headline?: string;
  picture?: { aspectRatio?: { HEIGHT: number; WIDTH: number }; uri: string };
  title: string;
}

/* eslint-disable complexity */
export const LoginModal = ({ navigation, publicJsonFile }: TLoginModal) => {
  const { isLoading, isLoggedIn, currentUserData } = useProfileContext();
  const [isVisible, setIsVisible] = useState(false);
  const isProfileUpdated =
    !!Object.keys(currentUserData?.member?.preferences || {}).length &&
    !!currentUserData?.member?.first_name &&
    !!currentUserData?.member?.last_name;

  const { data: contentData, loading: contentLoading } = useStaticContent<DataItem[]>({
    refreshTimeKey: `publicJsonFile-${publicJsonFile}`,
    name: publicJsonFile,
    type: 'json'
  });

  const { data: memberData, refetch: memberRefetch } = useQuery(
    QUERY_TYPES.PROFILE.MEMBER,
    member,
    {
      onSuccess: (responseData: ProfileMember) => {
        if (!responseData?.member) {
          storeProfileAuthToken();

          return;
        }

        storeProfileUserData(responseData);
      }
    }
  );

  useEffect(() => {
    memberRefetch();
  }, []);

  useEffect(() => {
    if (!isLoading && (!isLoggedIn || !isProfileUpdated)) {
      setIsVisible(true);
    }
  }, [isLoading]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (!isLoggedIn || !isProfileUpdated) {
        setIsVisible(true);
      }
    });

    return unsubscribe;
  }, [navigation, isLoading]);

  if (isLoading || contentLoading) {
    return null;
  }

  const { backgroundColor, description, headline, picture, title } = contentData;

  return (
    <Overlay
      animationType="fade"
      isVisible={isVisible}
      onBackdropPress={() => {
        setIsVisible(false);
        navigation.pop();
      }}
      overlayStyle={[styles.overlayWidth, { backgroundColor }]}
      statusBarTranslucent
      supportedOrientations={['portrait', 'landscape']}
    >
      <ScrollView style={[styles.containerRadius, { backgroundColor }]}>
        <>
          <TouchableOpacity
            onPress={() => {
              setIsVisible(false);
              navigation.pop();
            }}
            style={styles.closeButton}
          >
            <Icon.Close color={colors.lighterPrimary} size={normalize(16)} />
          </TouchableOpacity>

          {!!picture && (
            <Image
              source={picture}
              borderRadius={normalize(8)}
              aspectRatio={picture.aspectRatio || { HEIGHT: 0.7, WIDTH: 1 }}
              resizeMode="cover"
            />
          )}

          {!!headline && (
            <Wrapper style={styles.smallPaddingBottom}>
              <WrapperHorizontal>
                <HeadlineText center uppercase style={styles.headlineText}>
                  {headline}
                </HeadlineText>
              </WrapperHorizontal>
            </Wrapper>
          )}

          {!!title && (
            <Wrapper noPaddingTop>
              <WrapperHorizontal>
                <HeadlineText center big>
                  {title}
                </HeadlineText>
              </WrapperHorizontal>
            </Wrapper>
          )}

          {!!description && (
            <Wrapper noPaddingTop>
              <WrapperHorizontal>
                <RegularText center big>
                  {description}
                </RegularText>
              </WrapperHorizontal>
            </Wrapper>
          )}

          {!isLoggedIn ? (
            <Wrapper>
              <WrapperHorizontal>
                <Button
                  big
                  title={texts.profile.register}
                  onPress={() => {
                    setIsVisible(false);
                    navigation.navigate(ScreenName.ProfileRegistration, { from: LOGIN_MODAL });
                  }}
                />
              </WrapperHorizontal>

              <WrapperVertical style={styles.noPaddingTop}>
                <RegularText center>oder</RegularText>
              </WrapperVertical>

              <WrapperHorizontal>
                <Button
                  big
                  invert
                  title={texts.profile.login}
                  onPress={() => {
                    setIsVisible(false);
                    navigation.navigate(ScreenName.ProfileLogin, { from: LOGIN_MODAL });
                  }}
                />
              </WrapperHorizontal>
            </Wrapper>
          ) : (
            <Wrapper>
              <WrapperHorizontal>
                <Button
                  big
                  invert
                  title={texts.profile.update}
                  onPress={() => {
                    setIsVisible(false);
                    navigation.navigate(ScreenName.ProfileUpdate, {
                      from: LOGIN_MODAL,
                      member: memberData?.member
                    });
                  }}
                />
              </WrapperHorizontal>
            </Wrapper>
          )}
        </>
      </ScrollView>
    </Overlay>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    backgroundColor: colors.darkText,
    borderRadius: 25,
    height: normalize(32),
    justifyContent: 'center',
    opacity: 0.64,
    position: 'absolute',
    right: normalize(16),
    top: normalize(16),
    width: normalize(32),
    zIndex: 1
  },
  containerRadius: {
    borderRadius: normalize(8)
  },
  overlayWidth: {
    borderRadius: normalize(8),
    height: 'auto',
    padding: 0,
    width: '95%'
  },
  headlineText: {
    fontSize: normalize(14),
    fontWeight: '700',
    lineHeight: normalize(16)
  },
  smallPaddingBottom: {
    paddingBottom: normalize(8)
  }
});
