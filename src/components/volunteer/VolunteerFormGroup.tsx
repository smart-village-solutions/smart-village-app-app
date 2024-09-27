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
import { Label } from '../Label';
import { RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper } from '../Wrapper';

const VISIBILITY_OPTIONS = [
  { value: VISIBILITY_TYPES.ALL, title: 'Öffentlich (auch nicht registrierte Besucher)' },
  { value: VISIBILITY_TYPES.REGISTERED_ONLY, title: 'Öffentlich (Nur Mitglieder)' },
  { value: VISIBILITY_TYPES.PRIVATE, title: 'Privat (unsichtbar)' }
];

const JOIN_POLICY_OPTIONS = [
  { value: JOIN_POLICY_TYPES.OPEN, title: 'Jeder kann beitreten' },
  { value: JOIN_POLICY_TYPES.INVITE_AND_REQUEST, title: 'Einladung und Anfrage' },
  { value: JOIN_POLICY_TYPES.INVITE, title: 'Nur auf Einladung' }
];

// eslint-disable-next-line complexity
export const VolunteerFormGroup = ({
  navigation,
  route,
  scrollToTop
}: StackScreenProps<any> & { scrollToTop: () => void }) => {
  const groupData = route.params?.groupData;
  const isEditMode = !!groupData; // edit mode if there exists some group data

  const {
    control,
    formState: { errors, isValid, isSubmitted },
    watch,
    handleSubmit
  } = useForm<VolunteerGroup>({
    mode: 'onBlur',
    defaultValues: {
      contentContainerId: groupData?.contentcontainer_id || '',
      description: groupData?.description || '',
      joinPolicy: JOIN_POLICY_TYPES.OPEN,
      name: groupData?.name || '',
      tags: groupData?.tags?.toString() || '',
      visibility: VISIBILITY_TYPES.ALL
    }
  });

  const isFocused = useIsFocused();

  const { mutateAsync, isLoading, isError, data, reset } = useMutation(groupNew);
  const { mutate: mutateEdit, isSuccess: isSuccessEdit } = useMutation(groupEdit);

  const onSubmit = (groupNewData: VolunteerGroup) => {
    if (isEditMode) {
      const { id, joinPolicy } = groupData;

      mutateEdit({ ...groupNewData, id, joinPolicy });
    } else {
      mutateAsync(groupNewData).then((dataAsync: VolunteerGroup) => {
        // tags are not possible to send with creation and need to be updated after creation,
        // which we do automatically here
        if (dataAsync?.id) {
          mutateEdit({
            id: dataAsync.id,
            name: dataAsync.name,
            tags: groupNewData.tags,
            guid: dataAsync.guid,
            contentContainerId: dataAsync.contentContainerId
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
      isEditMode
        ? 'Fehler beim Aktualisieren einer Gruppe/eines Vereins'
        : 'Fehler beim Erstellen einer Gruppe/eines Vereins',
      'Bitte Eingaben überprüfen und erneut versuchen.'
    );
    reset();
  }

  if (isSuccessEdit && isFocused) {
    navigation.goBack();

    Alert.alert(
      'Erfolgreich',
      isEditMode
        ? 'Die Gruppe/der Verein wurde erfolgreich aktualisiert.'
        : 'Die Gruppe/der Verein wurde erfolgreich erstellt.'
    );
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
        <Label>{texts.volunteer.visibility}</Label>
        <Controller
          name="visibility"
          render={({ field: { onChange, value } }) => (
            <>
              {VISIBILITY_OPTIONS.map((visibilityItem) => (
                <CheckBox
                  accessibilityRole="button"
                  key={visibilityItem.title}
                  checked={value === visibilityItem.value}
                  onPress={() => onChange(visibilityItem.value)}
                  title={visibilityItem.title}
                  checkedColor={colors.accent}
                  uncheckedColor={colors.darkText}
                  containerStyle={styles.checkboxContainerStyle}
                />
              ))}
            </>
          )}
          control={control}
        />
      </Wrapper>
      {watch('visibility') !== VISIBILITY_TYPES.PRIVATE && (
        <Wrapper style={styles.noPaddingTop}>
          <Label>{texts.volunteer.accessionDirective}</Label>
          <Controller
            name="joinPolicy"
            render={({ field: { onChange, value } }) => (
              <>
                {JOIN_POLICY_OPTIONS.map((joinPolicyItem) => (
                  <CheckBox
                    accessibilityRole="button"
                    key={joinPolicyItem.title}
                    checked={value === joinPolicyItem.value}
                    onPress={() => onChange(joinPolicyItem.value)}
                    title={joinPolicyItem.title}
                    checkedColor={colors.accent}
                    uncheckedColor={colors.darkText}
                    containerStyle={styles.checkboxContainerStyle}
                  />
                ))}
              </>
            )}
            control={control}
          />
        </Wrapper>
      )}
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
          <RegularText primary center>
            {texts.volunteer.abort}
          </RegularText>
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
  }
});
