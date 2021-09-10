import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-elements';

import { colors, device, normalize, texts } from '../config';
import { User } from '../types';

import { Image } from './Image';
import { BoldText, RegularText } from './Text';
import { Wrapper, WrapperRow } from './Wrapper';

type Props = {
  data: User;
};

type BadgeProps = {
  verified: boolean;
};

// TODO: create encounter subdirectory in components directory and extract component
const ImageBadge = ({ verified }: BadgeProps) => {
  return (
    <View style={styles.badge}>
      <Image
        // TODO: add proper badges
        source={verified ? require('../../assets/icon.png') : require('../../assets/icon.png')}
        resizeMode="contain"
        style={styles.badgeImage}
      />
    </View>
  );
};

const EncounterDetailEntry = ({ left, right }: { left: string; right: string }) => {
  return (
    <Wrapper>
      <WrapperRow spaceBetween style={styles.entryContainer}>
        <RegularText placeholder small textAlign="bottom">
          {left}
        </RegularText>
        {/* TODO: add information */}
        <RegularText>{right}</RegularText>
      </WrapperRow>
      <Divider style={styles.divider} />
    </Wrapper>
  );
};

export const EncounterUserDetails = ({ data }: Props) => {
  return (
    <Wrapper>
      <View style={styles.container}>
        <View>
          <View style={styles.circle}>
            <Image source={{ uri: data.imageUri }} resizeMode="contain" />
          </View>
          <ImageBadge verified={data.verified} />
        </View>
        <BoldText big>{`${data.firstName} ${data.lastName}`.toUpperCase()}</BoldText>
      </View>
      {!data.verified && (
        <>
          <EncounterDetailEntry left={texts.encounter.birthDate} right={data.birthDate} />
          <EncounterDetailEntry left={texts.encounter.phone} right={data.phone} />
          <EncounterDetailEntry left={texts.encounter.id} right={data.userId} />
        </>
      )}
      <EncounterDetailEntry
        left={texts.encounter.status}
        right={data.verified ? texts.encounter.verified : texts.encounter.notVerified}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  badge: {
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: device.width / 18,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
    width: device.width / 9
  },
  badgeImage: { aspectRatio: 1, width: '100%' },
  circle: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: device.width / 4,
    justifyContent: 'center',
    marginBottom: normalize(12),
    overflow: 'hidden',
    width: device.width / 2
  },
  container: {
    alignItems: 'center'
  },
  divider: { backgroundColor: colors.placeholder },
  entryContainer: { alignItems: 'flex-end' }
});
