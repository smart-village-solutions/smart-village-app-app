import React from 'react';
import { useForm } from 'react-hook-form';
import { TouchableOpacity, View } from 'react-native';

import { Icon, normalize, texts } from '../../config';
import { Input } from '../form';
import { WrapperRow, WrapperVertical } from '../Wrapper';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useTheme } from '../../hooks/useTheme';

export const VolunteerGroupSearchField = ({ onPress }: { onPress: () => void }) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  const { control } = useForm({
    defaultValues: {
      dummy: ''
    }
  });

  return (
    <WrapperVertical>
      <TouchableOpacity
        accessibilityLabel={texts.accessibilityLabels.actions.search}
        onPress={onPress}
      >
        <WrapperRow pointerEvents="none">
          <Input
            disabled
            chat
            placeholder={texts.volunteer.groupSearchNew}
            name="dummy"
            control={control}
            renderErrorMessage={false}
          />
          <View style={styles.button}>
            <Icon.Lupe color={colors.primary} size={normalize(24)} />
          </View>
        </WrapperRow>
      </TouchableOpacity>
    </WrapperVertical>
  );
};

const createStyles = () => ({
  button: {
    alignSelf: 'center',
    alignItems: 'flex-end',
    marginBottom: normalize(4),
    width: '10%'
  }
});
