import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { CheckBox } from 'react-native-elements';

import { colors, consts, normalize, texts } from '../config';
import { useOpenWebScreen } from '../hooks';
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
  const needLandscapeStyle =
    orientation === 'landscape' || dimensions.width > consts.DIMENSIONS.FULL_SCREEN_MAX_WIDTH;
  const headerTitle = title ?? '';
  const rootRouteName = '';
  const openWebScreen = link ? useOpenWebScreen(headerTitle, link, rootRouteName) : undefined;

  return (
    <CheckBox
      accessibilityRole="button"
      accessibilityLabel={`${a11yLabel.checkbox} (${
        checked
          ? texts.accessibilityLabels.checkbox.active
          : texts.accessibilityLabels.checkbox.inactive
      }) ${title}`}
      accessibilityValue={
        checked
          ? texts.accessibilityLabels.checkbox.active
          : texts.accessibilityLabels.checkbox.inactive
      }
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
      {...props}
    />
  );
};

const styles = StyleSheet.create({
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
    color: colors.darkText,
    fontWeight: 'normal'
  }
});

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
