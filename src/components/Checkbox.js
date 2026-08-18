import PropTypes from 'prop-types';
import React, { useContext, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { CheckBox } from 'react-native-elements';

import { consts, normalize, texts } from '../config';
import { useOpenWebScreen } from '../hooks';
import { useTheme } from '../hooks/useTheme';
import { OrientationContext } from '../OrientationProvider';

import { BoldText, RegularText } from './Text';
import { WrapperHorizontal } from './Wrapper';

const { a11yLabel } = consts;

const renderTitleContent = ({
  boldTitle,
  lightest,
  link,
  linkDescription,
  navigate,
  openWebScreen,
  title
}) => {
  const TextComponent = boldTitle ? BoldText : RegularText;

  return (
    <WrapperHorizontal>
      <TextComponent small lightest={lightest}>
        {title}
        {(!!link || !!navigate) && !!linkDescription && (
          <RegularText
            small
            primary
            underline
            onPress={link ? openWebScreen : navigate}
            style={{ flexShrink: 1 }}
          >
            {linkDescription}
          </RegularText>
        )}
      </TextComponent>
    </WrapperHorizontal>
  );
};

// eslint-disable-next-line complexity
export const Checkbox = ({
  boldTitle = false,
  center = false,
  checked = false,
  checkedIcon,
  containerStyle = {},
  disabled = false,
  lightest = false,
  link = '',
  linkDescription = '',
  navigate,
  onPress,
  title = '',
  uncheckedIcon,
  ...props
}) => {
  const { orientation, dimensions } = useContext(OrientationContext);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const needLandscapeStyle =
    orientation === 'landscape' || dimensions.width > consts.DIMENSIONS.FULL_SCREEN_MAX_WIDTH;
  const headerTitle = title ?? '';
  const rootRouteName = '';
  const openWebScreen = link ? useOpenWebScreen(headerTitle, link, rootRouteName) : undefined;

  return (
    <CheckBox
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={`${a11yLabel.checkbox} (${
        checked
          ? texts.accessibilityLabels.checkbox.active
          : texts.accessibilityLabels.checkbox.inactive
      }) ${title}`}
      accessibilityValue={{
        text: checked
          ? texts.accessibilityLabels.checkbox.active
          : texts.accessibilityLabels.checkbox.inactive
      }}
      size={normalize(21)}
      center={center}
      title={renderTitleContent({
        boldTitle,
        lightest,
        link,
        linkDescription,
        navigate,
        openWebScreen,
        title
      })}
      onPress={onPress}
      checkedIcon={checkedIcon}
      checked={checked}
      containerStyle={[
        styles.containerStyle,
        needLandscapeStyle && styles.containerStyleLandscape,
        containerStyle
      ]}
      uncheckedIcon={uncheckedIcon}
      textStyle={styles.titleStyle}
      checkedColor={colors.primary}
      uncheckedColor={colors.placeholder}
      disabled={disabled}
      {...props}
    />
  );
};

/* Dynamic theme styles cannot be resolved by react-native/no-unused-styles. */
/* eslint-disable react-native/no-unused-styles */
const createStyles = (colors) =>
  StyleSheet.create({
    containerStyle: {
      backgroundColor: colors.surface,
      borderWidth: 0,
      marginLeft: 0,
      marginRight: 0,
      padding: 0
    },
    containerStyleLandscape: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    titleStyle: {
      color: colors.text,
      fontWeight: 'normal'
    }
  });
/* eslint-enable react-native/no-unused-styles */

Checkbox.propTypes = {
  boldTitle: PropTypes.bool,
  center: PropTypes.bool,
  checked: PropTypes.bool,
  checkedIcon: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  containerStyle: PropTypes.object,
  disabled: PropTypes.bool,
  lightest: PropTypes.bool,
  link: PropTypes.string,
  linkDescription: PropTypes.string,
  navigate: PropTypes.func,
  onPress: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  uncheckedIcon: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};
