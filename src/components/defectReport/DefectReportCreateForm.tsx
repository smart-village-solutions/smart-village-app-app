import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import React from 'react';
import { useMutation } from 'react-apollo';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Keyboard, StyleSheet } from 'react-native';

import {
  Button,
  Checkbox,
  DropdownInput,
  HtmlView,
  Input,
  RegularText,
  Touchable,
  Wrapper
} from '../../components';
import { Icon, colors, consts, texts } from '../../config';
import { CREATE_GENERIC_ITEM } from '../../queries/genericItem';
import { uploadMediaContent } from '../../queries/mediaContent';
import { GenericType } from '../../types';
import { ImageSelector } from '../selectors';

const { EMAIL_REGEX } = consts;

type TDefectReportCreateData = {
  body: string;
  categoryName: string;
  email?: string;
  images: string;
  name?: string;
  phone?: string;
  termsOfService: boolean;
  title: string;
};

export const DefectReportCreateForm = ({
  navigation,
  route,
  selectedPosition,
  categoryNameDropdownData
}: {
  navigation: StackNavigationProp<any>;
  route: any;
  selectedPosition: Location.LocationObjectCoords | undefined;
  categoryNameDropdownData: { id: number; name: string; value: string }[];
}) => {
  const consentForDataProcessingText = route?.params?.consentForDataProcessingText ?? '';
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      body: '',
      categoryName: '',
      email: '',
      images: '[]',
      name: '',
      phone: '',
      termsOfService: false,
      title: ''
    }
  });

  const [createGenericItem, { loading: isLoadingGenericItem }] = useMutation(CREATE_GENERIC_ITEM);
  let imageUrl: string | undefined;

  const onSubmit = async (defectReportNewData: TDefectReportCreateData) => {
    Keyboard.dismiss();

    if (!defectReportNewData.termsOfService) {
      return Alert.alert(texts.defectReport.alerts.hint, texts.defectReport.alerts.termsOfService);
    }

    setIsLoading(true);

    const images = JSON.parse(defectReportNewData.images);

    if (images?.length) {
      try {
        imageUrl = await uploadMediaContent(images[0], 'image');
      } catch (error) {
        setIsLoading(false);

        Alert.alert(texts.defectReport.alerts.hint, texts.defectReport.alerts.error);
        return;
      }
    }

    try {
      await createGenericItem({
        variables: {
          categoryName: defectReportNewData.categoryName,
          genericType: GenericType.DefectReport,
          title: defectReportNewData.title,
          contacts: [
            {
              email: defectReportNewData.email,
              firstName: defectReportNewData.name,
              phone: defectReportNewData.phone
            }
          ],
          contentBlocks: [{ body: defectReportNewData.body, title: defectReportNewData.title }],
          addresses: [
            {
              geoLocation: {
                latitude: selectedPosition?.latitude,
                longitude: selectedPosition?.longitude
              }
            }
          ],
          mediaContents: [
            {
              sourceUrl: {
                url: imageUrl
              },
              contentType: 'image'
            }
          ],
          forceCreate: true
        }
      });

      navigation.goBack();
      Alert.alert(texts.defectReport.successScreen.header, texts.defectReport.successScreen.entry);
    } catch (error) {
      setIsLoading(false);

      Alert.alert(texts.defectReport.alerts.hint, texts.defectReport.alerts.error);
    }
  };

  return (
    <>
      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="categoryName"
          render={({ field: { name, onChange, value } }) => (
            <DropdownInput
              {...{
                errors,
                data: categoryNameDropdownData,
                value,
                valueKey: 'name',
                onChange,
                name,
                required: true,
                label: `${texts.defectReport.categoryName} *`,
                placeholder: texts.defectReport.categoryName,
                control
              }}
            />
          )}
          control={control}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="title"
          label={`${texts.defectReport.inputTitle} *`}
          placeholder={texts.defectReport.inputTitle}
          validate
          rules={{
            required: `${texts.defectReport.inputTitle} ${texts.defectReport.inputErrorText}`
          }}
          errorMessage={errors.title && errors.title.message}
          control={control}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="body"
          label={`${texts.defectReport.inputDescription} *`}
          placeholder={texts.defectReport.inputDescription}
          validate
          multiline
          rules={{
            required: `${texts.defectReport.inputDescription} ${texts.defectReport.inputErrorText}`
          }}
          errorMessage={errors.body && errors.body.message}
          control={control}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="images"
          render={({ field }) => (
            <ImageSelector
              {...{
                control,
                field,
                item: {
                  name: 'images',
                  label: texts.volunteer.images,
                  buttonTitle: texts.volunteer.addImage
                }
              }}
            />
          )}
          control={control}
        />
      </Wrapper>

      <Wrapper>
        <RegularText>{texts.defectReport.optional}</RegularText>
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="name"
          label={texts.defectReport.inputName}
          placeholder={texts.defectReport.inputName}
          validate
          control={control}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="email"
          label={texts.defectReport.inputMail}
          placeholder={texts.defectReport.inputMail}
          keyboardType="email-address"
          validate
          rules={{
            pattern: {
              value: EMAIL_REGEX,
              message: `${texts.defectReport.inputMail}${texts.defectReport.invalidMail}`
            }
          }}
          errorMessage={errors.email && errors.email.message}
          control={control}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="phone"
          label={texts.defectReport.inputPhone}
          placeholder={texts.defectReport.inputPhone}
          validate
          control={control}
          keyboardType="phone-pad"
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        {/* @ts-expect-error HtmlView uses memo in js, which is not inferred correctly */}
        <HtmlView html={consentForDataProcessingText} />

        <Controller
          name="termsOfService"
          render={({ field: { onChange, value } }) => (
            <Checkbox
              checked={!!value}
              checkedIcon={<Icon.SquareCheckFilled />}
              containerStyle={styles.checkboxContainerStyle}
              onPress={() => onChange(!value)}
              title={`${texts.defectReport.inputCheckbox} *`}
              uncheckedIcon={<Icon.Square color={colors.placeholder} />}
            />
          )}
          control={control}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Button
          onPress={handleSubmit(onSubmit)}
          title={
            isLoading || isLoadingGenericItem ? texts.defectReport.wait : texts.defectReport.send
          }
          disabled={isLoading || isLoadingGenericItem}
        />

        <Touchable onPress={() => navigation.goBack()} disabled={isLoading || isLoadingGenericItem}>
          <RegularText primary center>
            {texts.defectReport.abort}
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
