import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';

import { colors, consts, device, Icon, normalize } from '../config';
import { SettingsContext } from '../SettingsProvider';

import { Title, TitleContainer, TitleShadow } from './Title';
import { Touchable } from './Touchable';
import { WrapperRow } from './Wrapper';

type Props = {
  big?: boolean;
  center?: boolean;
  containerStyle?: any;
  small?: boolean;
  onPress?: () => void;
  title: string;
};

export const SectionHeader = ({
  big = false,
  center = false,
  containerStyle,
  onPress,
  small = false,
  title
}: Props) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { flat = false, uppercase = false } = settings;

  if (!title) return null;

  const innerComponent = (
    <WrapperRow>
      <Title
        accessibilityLabel={`(${title}) ${consts.a11yLabel.heading} ${
          onPress ? consts.a11yLabel.button : ''
        } `}
        big={big}
        center={center}
        small={small}
        uppercase={uppercase}
      >
        {title}
      </Title>
      {!!onPress && (
        <Icon.ArrowRight color={colors.surface} size={normalize(18)} style={styles.icon} />
      )}
    </WrapperRow>
  );

  return (
    <>
      <TitleContainer flat={flat} style={containerStyle}>
        {onPress ? <Touchable onPress={onPress}>{innerComponent}</Touchable> : innerComponent}
      </TitleContainer>
      {!flat && device.platform === 'ios' && <TitleShadow />}
    </>
  );
};

const styles = StyleSheet.create({
  icon: {
    alignSelf: 'center'
  }
});
