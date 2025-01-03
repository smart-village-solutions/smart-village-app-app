import { useIsFocused } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import moment from 'moment';
import React, { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Divider } from 'react-native-elements';
import { useMutation } from 'react-query';

import { colors, consts, device, Icon, normalize, texts } from '../../config';
import { momentFormat } from '../../helpers';
import { userEdit } from '../../queries/volunteer';
import { countries, VolunteerUser } from '../../types';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { DateTimeInput } from '../form';
import { DropdownInput } from '../form/DropdownInput';
import { Input } from '../form/Input';
import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperRow } from '../Wrapper';

const { EMAIL_REGEX, URL_REGEX } = consts;

const genderDropdownData = [
  { id: 1, name: 'male', value: 'Männlich' },
  { id: 2, name: 'female', value: 'Weiblich' },
  { id: 3, name: 'custom', value: 'Divers' }
];

// eslint-disable-next-line complexity
export const VolunteerFormProfile = ({
  navigation,
  scrollToTop,
  userData
}: StackScreenProps<any> & { scrollToTop: () => void; selectedUserIds?: number[] }) => {
  const [isCollapsedContact, setIsCollapsedContact] = useState(true);
  const [isCollapsedLinks, setIsCollapsedLinks] = useState(true);

  const genderDefaultValue = genderDropdownData?.filter(
    ({ name }) => name === userData?.profile?.gender
  )[0]?.id;

  const countryDefaultValue = countries?.filter(
    ({ name }) => name === userData?.profile?.country
  )[0]?.id;

  const {
    control,
    formState: { errors, isValid },
    handleSubmit
  } = useForm<VolunteerUser>({
    mode: 'onBlur',
    defaultValues: {
      about: userData?.profile?.about || '',
      birthday: userData?.profile?.birthday
        ? new Date(momentFormat(userData?.profile?.birthday, 'YYYY-MM-DD'))
        : undefined,
      birthdayHideYear: userData?.profile?.birthday_hide_year || 0,
      city: userData?.profile?.city || '',
      country: countryDefaultValue || '',
      email: userData?.account?.email || '',
      facebook: userData?.profile?.url_facebook || '',
      fax: userData?.profile?.fax || '',
      firstName: userData?.profile?.firstname || '',
      flickr: userData?.profile?.url_flickr || '',
      gender: genderDefaultValue || 0,
      id: userData?.account?.id || '',
      lastName: userData?.profile?.lastname || '',
      linkedin: userData?.profile?.url_linkedin || '',
      mySpace: userData?.profile?.url_myspace || '',
      phoneMobile: userData?.profile?.mobile || '',
      phonePrivate: userData?.profile?.phone_private || '',
      phoneWork: userData?.profile?.phone_work || '',
      postalCode: userData?.profile?.zip || '',
      skype: userData?.profile?.im_skype || '',
      state: userData?.profile?.state || '',
      street: userData?.profile?.street || '',
      title: userData?.profile?.title || '',
      twitter: userData?.profile?.url_twitter || '',
      username: userData?.account?.username || '',
      vimeo: userData?.profile?.url_vimeo || '',
      website: userData?.profile?.url || '',
      xing: userData?.profile?.url_xing || '',
      xmpp: userData?.profile?.im_xmpp || '',
      youtube: userData?.profile?.url_youtube || ''
    }
  });

  const isFocused = useIsFocused();

  const { mutate, isLoading, isError, isSuccess, data, reset } = useMutation(userEdit);

  const onSubmit = (profileEditData: VolunteerUser) => {
    mutate(profileEditData);
  };

  const onPressContactTitle = useCallback(() => setIsCollapsedContact((value) => !value), []);
  const onPressLinksTitle = useCallback(() => setIsCollapsedLinks((value) => !value), []);

  // TODO: commented out because scrolls on collapsing should not happen
  // if (!isValid) {
  //   scrollToTop();
  // }

  if (isError || (!isLoading && data && !data.id)) {
    Alert.alert(
      'Fehler beim Speichern des Profils',
      'Bitte Eingaben überprüfen und erneut versuchen.'
    );
    reset();
  } else if (isSuccess && isFocused) {
    navigation.goBack();

    Alert.alert('Erfolgreich', 'Das Profil wurde erfolgreich gespeichert.');
  }

  return (
    <>
      <Input hidden control={control} name="id" />
      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="username"
          label={texts.volunteer.username}
          placeholder={texts.volunteer.username}
          textContentType="username"
          autoCapitalize="none"
          validate
          rules={{
            required: texts.volunteer.usernameError,
            minLength: { value: 4, message: texts.volunteer.usernameErrorLengthError }
          }}
          errorMessage={errors.display_name && errors.display_name.message}
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          control={control}
          errorMessage={errors.email && `${texts.volunteer.email}${texts.volunteer.invalidMail}`}
          keyboardType="email-address"
          label={texts.volunteer.email}
          name="email"
          placeholder={texts.volunteer.email}
          rules={{ pattern: EMAIL_REGEX }}
          validate
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          control={control}
          label={texts.volunteer.firstname}
          name="firstName"
          placeholder={texts.volunteer.firstname}
          validate
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          control={control}
          label={texts.volunteer.lastname}
          name="lastName"
          placeholder={texts.volunteer.lastname}
          validate
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          control={control}
          label={texts.volunteer.title}
          name="title"
          placeholder={texts.volunteer.title}
          validate
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="gender"
          render={({ field: { name, onChange, value } }) => (
            <DropdownInput
              {...{
                errors,
                data: genderDropdownData,
                value,
                valueKey: 'name',
                onChange,
                name,
                label: texts.volunteer.gender,
                placeholder: texts.volunteer.gender,
                control,
                showSearch: false
              }}
            />
          )}
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          control={control}
          label={texts.volunteer.street}
          name="street"
          placeholder={texts.volunteer.street}
          validate
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          control={control}
          keyboardType="numeric"
          label={texts.volunteer.postalCode}
          name="postalCode"
          placeholder={texts.volunteer.postalCode}
          validate
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          control={control}
          label={texts.volunteer.city}
          name="city"
          placeholder={texts.volunteer.city}
          validate
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="country"
          render={({ field: { name, onChange, value } }) => (
            <DropdownInput
              {...{
                errors,
                data: countries,
                value,
                valueKey: 'name',
                onChange,
                name,
                label: texts.volunteer.country,
                placeholder: texts.volunteer.country,
                control
              }}
            />
          )}
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          control={control}
          label={texts.volunteer.state}
          name="state"
          placeholder={texts.volunteer.state}
          validate
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="birthday"
          render={({ field: { name, onChange, value } }) => (
            <DateTimeInput
              {...{
                minimumDate: moment().subtract(100, 'years').toDate(),
                mode: 'date',
                errors,
                value,
                onChange,
                name,
                label: texts.volunteer.birthday,
                placeholder: texts.volunteer.birthday,
                control
              }}
            />
          )}
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="birthdayHideYear"
          render={({ field: { onChange, value } }) => (
            <Checkbox
              checked={!!value}
              checkedIcon={<Icon.SquareCheckFilled />}
              containerStyle={styles.checkboxContainerStyle}
              onPress={() => onChange(!value)}
              title="Jahr im Profil verbergen"
              uncheckedIcon={<Icon.Square color={colors.placeholder} />}
            />
          )}
          control={control}
        />
      </Wrapper>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          control={control}
          label={texts.volunteer.aboutMe}
          name="about"
          placeholder={texts.volunteer.aboutMe}
          validate
        />
      </Wrapper>
      <Divider style={styles.divider} />
      <Touchable onPress={onPressContactTitle}>
        <Wrapper style={styles.wrapper}>
          <WrapperRow spaceBetween>
            <BoldText>Kommunikation</BoldText>
            {isCollapsedContact ? <Icon.ArrowDown /> : <Icon.ArrowUp />}
          </WrapperRow>
        </Wrapper>
      </Touchable>
      <Collapsible collapsed={isCollapsedContact}>
        <Wrapper style={styles.noPaddingTop}>
          <Input
            control={control}
            keyboardType="phone-pad"
            label={texts.volunteer.phonePrivate}
            name="phonePrivate"
            placeholder={texts.volunteer.phonePrivate}
            validate
          />
        </Wrapper>
        <Wrapper style={styles.noPaddingTop}>
          <Input
            control={control}
            keyboardType="phone-pad"
            label={texts.volunteer.phoneWork}
            name="phoneWork"
            placeholder={texts.volunteer.phoneWork}
            validate
          />
        </Wrapper>
        <Wrapper style={styles.noPaddingTop}>
          <Input
            control={control}
            keyboardType="phone-pad"
            label={texts.volunteer.phoneMobile}
            name="phoneMobile"
            placeholder={texts.volunteer.phoneMobile}
            validate
          />
        </Wrapper>
        <Wrapper style={styles.noPaddingTop}>
          <Input
            control={control}
            keyboardType="phone-pad"
            label={texts.volunteer.fax}
            name="fax"
            placeholder={texts.volunteer.fax}
            validate
          />
        </Wrapper>
        <Wrapper style={styles.noPaddingTop}>
          <Input
            control={control}
            label={texts.volunteer.skype}
            name="skype"
            placeholder={texts.volunteer.skype}
            validate
          />
        </Wrapper>
        <Wrapper style={styles.noPaddingTop}>
          <Input
            control={control}
            errorMessage={errors.xmpp && `${texts.volunteer.xmpp}${texts.volunteer.invalidMail}`}
            keyboardType="email-address"
            label={texts.volunteer.xmpp}
            name="xmpp"
            placeholder={texts.volunteer.xmpp}
            rules={{ pattern: EMAIL_REGEX }}
            validate
          />
        </Wrapper>
      </Collapsible>
      <Divider style={styles.divider} />
      <Touchable onPress={onPressLinksTitle}>
        <Wrapper style={styles.wrapper}>
          <WrapperRow spaceBetween>
            <BoldText>Links</BoldText>
            {isCollapsedLinks ? <Icon.ArrowDown /> : <Icon.ArrowUp />}
          </WrapperRow>
        </Wrapper>
      </Touchable>
      <Collapsible collapsed={isCollapsedLinks}>
        <Wrapper style={styles.noPaddingTop}>
          <Input
            control={control}
            errorMessage={
              errors.website && `${texts.volunteer.website}${texts.volunteer.invalidUrl}`
            }
            keyboardType="url"
            label={texts.volunteer.website}
            name="website"
            placeholder={texts.volunteer.website}
            rules={{ required: false, pattern: URL_REGEX }}
            validate
          />
        </Wrapper>
        <Wrapper style={styles.noPaddingTop}>
          <Input
            control={control}
            errorMessage={
              errors.facebook && `${texts.volunteer.facebook}${texts.volunteer.invalidUrl}`
            }
            keyboardType="url"
            label={texts.volunteer.facebook}
            name="facebook"
            placeholder={texts.volunteer.facebook}
            rules={{ required: false, pattern: URL_REGEX }}
            validate
          />
        </Wrapper>
        <Wrapper style={styles.noPaddingTop}>
          <Input
            control={control}
            errorMessage={
              errors.linkedin && `${texts.volunteer.linkedin}${texts.volunteer.invalidUrl}`
            }
            keyboardType="url"
            label={texts.volunteer.linkedin}
            name="linkedin"
            placeholder={texts.volunteer.linkedin}
            rules={{ required: false, pattern: URL_REGEX }}
            validate
          />
        </Wrapper>
        <Wrapper style={styles.noPaddingTop}>
          <Input
            control={control}
            errorMessage={errors.xing && `${texts.volunteer.xing}${texts.volunteer.invalidUrl}`}
            keyboardType="url"
            label={texts.volunteer.xing}
            name="xing"
            placeholder={texts.volunteer.xing}
            rules={{ required: false, pattern: URL_REGEX }}
            validate
          />
        </Wrapper>
        <Wrapper style={styles.noPaddingTop}>
          <Input
            control={control}
            errorMessage={
              errors.youtube && `${texts.volunteer.youtube}${texts.volunteer.invalidUrl}`
            }
            keyboardType="url"
            label={texts.volunteer.youtube}
            name="youtube"
            placeholder={texts.volunteer.youtube}
            rules={{ required: false, pattern: URL_REGEX }}
            validate
          />
        </Wrapper>
        <Wrapper style={styles.noPaddingTop}>
          <Input
            control={control}
            errorMessage={errors.vimeo && `${texts.volunteer.vimeo}${texts.volunteer.invalidUrl}`}
            keyboardType="url"
            label={texts.volunteer.vimeo}
            name="vimeo"
            placeholder={texts.volunteer.vimeo}
            rules={{ required: false, pattern: URL_REGEX }}
            validate
          />
        </Wrapper>
        <Wrapper style={styles.noPaddingTop}>
          <Input
            control={control}
            errorMessage={errors.flickr && `${texts.volunteer.flickr}${texts.volunteer.invalidUrl}`}
            keyboardType="url"
            label={texts.volunteer.flickr}
            name="flickr"
            placeholder={texts.volunteer.flickr}
            rules={{ required: false, pattern: URL_REGEX }}
            validate
          />
        </Wrapper>
        <Wrapper style={styles.noPaddingTop}>
          <Input
            control={control}
            errorMessage={
              errors.mySpace && `${texts.volunteer.mySpace}${texts.volunteer.invalidUrl}`
            }
            keyboardType="url"
            label={texts.volunteer.mySpace}
            name="mySpace"
            placeholder={texts.volunteer.mySpace}
            rules={{ required: false, pattern: URL_REGEX }}
            validate
          />
        </Wrapper>
        <Wrapper style={styles.noPaddingTop}>
          <Input
            control={control}
            errorMessage={
              errors.twitter && `${texts.volunteer.twitter}${texts.volunteer.invalidUrl}`
            }
            keyboardType="twitter"
            label={texts.volunteer.twitter}
            name="twitter"
            placeholder={texts.volunteer.twitter}
            rules={{ required: false, pattern: URL_REGEX }}
            validate
          />
        </Wrapper>
      </Collapsible>
      <Divider style={styles.divider} />

      <Wrapper>
        <Button
          onPress={handleSubmit(onSubmit)}
          title={texts.volunteer.send}
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
  checkboxContainerStyle: {
    backgroundColor: colors.surface,
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0
  },
  divider: {
    backgroundColor: colors.placeholder
  },
  noPaddingTop: {
    paddingTop: 0
  },
  wrapper: {
    paddingBottom: device.platform === 'ios' ? normalize(16) : normalize(14),
    paddingTop: device.platform === 'ios' ? normalize(16) : normalize(18)
  }
});
