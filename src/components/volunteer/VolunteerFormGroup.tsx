import { useIsFocused } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { useMutation } from 'react-query';

import { colors, texts } from '../../config';
import { groupEdit, groupNew } from '../../queries/volunteer';
import { JOIN_POLICY_TYPES, VISIBILITY_TYPES, VolunteerGroup } from '../../types';
import { Button } from '../Button';
import { Input } from '../form/Input';
import { BoldText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper } from '../Wrapper';

// eslint-disable-next-line complexity
export const VolunteerFormGroup = ({
  navigation,
  route,
  scrollToTop
}: StackScreenProps<any> & { scrollToTop: () => void }) => {
  const groupData = route.params?.groupData ?? undefined;

  const {
    control,
    formState: { errors, isValid, isSubmitted },
    handleSubmit
  } = useForm<VolunteerGroup>({
    mode: 'onBlur',
    defaultValues: {
      contentContainerId: groupData?.contentcontainer_id || '',
      description: groupData?.description || '',
      joinPolicy: JOIN_POLICY_TYPES.OPEN,
      name: groupData?.name || '',
      owner: groupData?.owner?.display_name || '',
      tags: groupData?.tags?.toString() || '',
      visibility: VISIBILITY_TYPES.ALL
    }
  });

  const isFocused = useIsFocused();

  const { mutateAsync, isLoading, isError, data, reset } = useMutation(groupNew);
  const { mutate: mutateEdit, isSuccess: isSuccessEdit } = useMutation(groupEdit);

  const onSubmit = (groupNewData: VolunteerGroup) => {
    if (groupData) {
      const { description, name, tags, visibility } = groupNewData;
      const { id, joinPolicy } = groupData;

      mutateEdit({ name, description, visibility, joinPolicy, tags, id });
    } else {
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
    }
  };

  if (!isValid) {
    scrollToTop();
  }

  if (isError || (!isLoading && data && !data.id)) {
    Alert.alert(
      'Fehler beim Erstellen einer Gruppe/eines Vereins',
      'Bitte Eingaben überprüfen und erneut versuchen.'
    );
    reset();
  }

  if (isSuccessEdit && isFocused) {
    navigation.goBack();

    Alert.alert('Erfolgreich', 'Die Gruppe/der Verein wurde erfolgreich erstellt.');
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
            errors.name && `${texts.volunteer.name} muss ausgefüllt werden (min. 2 Zeichen)`
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
        <Input
          name="owner"
          label={texts.volunteer.owner}
          placeholder={texts.volunteer.owner}
          multiline
          validate
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="visibility"
          render={({ onChange, value }) => (
            <CheckBox
              checked={!!value}
              onPress={() => onChange(!value)}
              title="Öffentlich"
              checkedColor={colors.accent}
              checkedIcon="check-square-o"
              uncheckedColor={colors.darkText}
              uncheckedIcon="square-o"
              containerStyle={styles.checkboxContainerStyle}
              textStyle={styles.checkboxTextStyle}
            />
          )}
          control={control}
        />
      </Wrapper>
      {/* <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="joinPolicy"
          render={({ onChange, value }) => (
            <CheckBox
              checked={!!value}
              onPress={() => onChange(!value)}
              title="Jeder kann beitreten"
              checkedColor={colors.accent}
              checkedIcon="check-square-o"
              uncheckedColor={colors.darkText}
              uncheckedIcon="square-o"
              containerStyle={styles.checkboxContainerStyle}
              textStyle={styles.checkboxTextStyle}
            />
          )}
          control={control}
        />
      </Wrapper> */}
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
    backgroundColor: colors.surface,
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0
  },
  checkboxTextStyle: {
    color: colors.darkText,
    fontWeight: 'normal'
  }
});
