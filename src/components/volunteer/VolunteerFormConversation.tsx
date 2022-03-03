import { StackScreenProps } from '@react-navigation/stack';
import _sortBy from 'lodash/sortBy';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet } from 'react-native';
import { useMutation, useQuery } from 'react-query';

import { consts, texts } from '../../config';
import { isAccount, volunteerUserData } from '../../helpers';
import { QUERY_TYPES } from '../../queries';
import { conversationNew, users } from '../../queries/volunteer';
import { ScreenName, VolunteerConversation } from '../../types';
import { Button } from '../Button';
import { DropdownInput, DropdownInputProps } from '../form/DropdownInput';
import { Input } from '../form/Input';
import { BoldText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper } from '../Wrapper';

const { ROOT_ROUTE_NAMES } = consts;

const NAVIGATION = {
  CONVERSATIONS_INDEX: {
    name: ScreenName.VolunteerIndex,
    params: {
      title: texts.volunteer.conversations,
      query: QUERY_TYPES.VOLUNTEER.CONVERSATIONS,
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  }
};

export const VolunteerFormConversation = ({
  navigation,
  scrollToTop
}: StackScreenProps<any> & { scrollToTop: () => void }) => {
  const {
    control,
    formState: { errors, isValid },
    handleSubmit
  } = useForm<VolunteerConversation>();
  const { data: dataUsers } = useQuery(QUERY_TYPES.VOLUNTEER.USERS, users);
  const [userDropdownData, setUserDropdownData] = useState<DropdownInputProps['data'] | []>([]);

  const filterUserDropDownData = useCallback(async () => {
    if (dataUsers?.results?.length) {
      const { currentUserId } = await volunteerUserData();
      // show only others users, which are set to visible
      let filteredUserDropDownData = dataUsers.results
        ?.filter(
          (item: { account: { id: number; visibility: number } }) =>
            !isAccount(currentUserId, item.account) && item.account.visibility == 1
        )
        ?.map((item) => ({ ...item, value: item.display_name }));

      filteredUserDropDownData = _sortBy(filteredUserDropDownData, 'value');

      filteredUserDropDownData?.length && setUserDropdownData(filteredUserDropDownData);
    }
  }, [dataUsers?.results]);

  useEffect(() => {
    filterUserDropDownData();
  }, [filterUserDropDownData]);

  const { mutate, isLoading, isError, isSuccess, data, reset } = useMutation(conversationNew);
  const onSubmit = (conversationNewData: VolunteerConversation) => {
    mutate(conversationNewData);
  };

  if (!isValid) {
    scrollToTop();
  }

  if (isError || (!isLoading && data && !data.id)) {
    Alert.alert(
      'Fehler beim Erstellen einer Unterhaltung',
      'Bitte Eingaben überprüfen und erneut versuchen.'
    );
    reset();
  } else if (isSuccess) {
    navigation.goBack();

    Alert.alert('Erfolgreich', 'Die Unterhaltung wurde erfolgreich erstellt.');
  }

  return (
    <>
      <Wrapper>
        {!!userDropdownData?.length && (
          <Controller
            name="id"
            render={({ field: { onChange, value } }) => (
              <DropdownInput
                {...{
                  errors,
                  required: true,
                  data: userDropdownData,
                  value,
                  valueKey: 'guid',
                  onChange,
                  name: 'id',
                  label: texts.volunteer.recipient,
                  placeholder: texts.volunteer.recipient,
                  control
                }}
              />
            )}
            control={control}
          />
        )}
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="title"
          label={texts.volunteer.title}
          placeholder={texts.volunteer.title}
          validate
          rules={{ required: true }}
          errorMessage={errors.title && `${texts.volunteer.title} muss ausgefüllt werden`}
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="message"
          label={texts.volunteer.message}
          placeholder={texts.volunteer.message}
          multiline
          validate
          rules={{ required: true }}
          errorMessage={errors.message && `${texts.volunteer.message} muss ausgefüllt werden`}
          control={control}
        />
      </Wrapper>
      <Wrapper>
        <Button
          onPress={handleSubmit(onSubmit)}
          title={texts.volunteer.send}
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
  }
});
