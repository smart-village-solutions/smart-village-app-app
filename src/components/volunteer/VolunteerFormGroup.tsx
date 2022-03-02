import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { useMutation } from 'react-query';

import { colors, texts } from '../../config';
import { groupEdit, groupNew } from '../../queries/volunteer';
import { JOIN_POLICY_TYPES, VolunteerGroup } from '../../types';
import { Button } from '../Button';
import { Input } from '../form/Input';
import { BoldText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper } from '../Wrapper';

export const VolunteerFormGroup = ({
  navigation,
  scrollToTop
}: StackScreenProps<any> & { scrollToTop: () => void }) => {
  const {
    control,
    formState: { errors, isValid, isSubmitted },
    handleSubmit
  } = useForm<VolunteerGroup>({
    defaultValues: {
      visibility: 1,
      joinPolicy: JOIN_POLICY_TYPES.OPEN
    }
  });
  const { mutateAsync, isLoading, isError, data, reset } = useMutation(groupNew);
  const { mutate: mutateEdit, isSuccess: isSuccessEdit } = useMutation(groupEdit);

  const onSubmit = (groupNewData: VolunteerGroup) => {
    mutateAsync(groupNewData).then((dataAsync) => {
      // tags are not possible to send with creation and need to be updated after creation, which we
      // do automatically here
      if (dataAsync?.id) {
        mutateEdit({
          id: dataAsync.id,
          name: dataAsync.name,
          tags: groupNewData.tags
        });
      }
    });
  };

  if (!isValid) {
    scrollToTop();
  }

  if (isError || (!isLoading && data && !data.id)) {
    Alert.alert(
      'Fehler beim Erstellen einer Gruppe',
      'Bitte Eingaben überprüfen und erneut versuchen.'
    );
    reset();
  }

  if (isSuccessEdit) {
    navigation.goBack();

    Alert.alert('Erfolgreich', 'Die Gruppe wurde erfolgreich erstellt.');
  }

  return (
    <>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="name"
          label={texts.volunteer.name}
          placeholder={texts.volunteer.name}
          validate={isSubmitted}
          rules={{ required: true, minLength: 2 }}
          errorMessage={
            errors.name && `${texts.volunteer.name} muss ausgefüllt werden (und min. 2 Zeichen)`
          }
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="description"
          label={texts.volunteer.description}
          placeholder={texts.volunteer.description}
          multiline
          validate
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="visibility"
          defaultValue={1}
          render={({ field: { onChange, value } }) => (
            <CheckBox
              accessibilityRole="checkbox"
              checked={!!value}
              onPress={() => onChange(!value)}
              title="Öffentlich"
              uncheckedColor={colors.darkText}
              checkedColor={colors.primary}
              containerStyle={styles.checkboxContainerStyle}
              textStyle={styles.checkboxTextStyle}
            />
          )}
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="joinPolicy"
          defaultValue={1}
          render={({ field: { onChange, value } }) => (
            <CheckBox
              accessibilityRole="checkbox"
              checked={!!value}
              onPress={() => onChange(!value)}
              title="Jeder kann beitreten"
              uncheckedColor={colors.darkText}
              checkedColor={colors.primary}
              containerStyle={styles.checkboxContainerStyle}
              textStyle={styles.checkboxTextStyle}
            />
          )}
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="tags"
          label={texts.volunteer.tags}
          placeholder={texts.volunteer.tags}
          validate
          control={control}
        />
      </Wrapper>
      <Wrapper>
        <Button
          onPress={handleSubmit(onSubmit)}
          title={texts.volunteer.save}
          disabled={isLoading}
        />
        <Touchable onPress={() => navigation.goBack()}>
          <BoldText center primary underline>
            {texts.volunteer.abort.toUpperCase()}
          </BoldText>
        </Touchable>
      </Wrapper>
    </>
  );
};

const styles = StyleSheet.create({
  noPaddingTop: {
    paddingTop: 0
  },
  checkboxContainerStyle: {
    backgroundColor: colors.lightestText,
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0
  },
  checkboxTextStyle: {
    color: colors.darkText,
    fontWeight: 'normal'
  }
});
