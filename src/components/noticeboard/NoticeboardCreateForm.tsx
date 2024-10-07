import { StackNavigationProp } from '@react-navigation/stack';
import moment from 'moment';
import { extendMoment } from 'moment-range';
import React, { useContext, useState } from 'react';
import { useMutation, useQuery } from 'react-apollo';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Keyboard, StyleSheet } from 'react-native';

import {
  Button,
  Checkbox,
  DateTimeInput,
  DocumentSelector,
  HtmlView,
  Input,
  LoadingSpinner,
  RegularText,
  Touchable,
  Wrapper
} from '../../components';
import { colors, consts, texts } from '../../config';
import {
  formatSizeStandard,
  graphqlFetchPolicy,
  momentFormat,
  parseListItemsFromQuery
} from '../../helpers';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { CREATE_GENERIC_ITEM } from '../../queries/genericItem';
import { uploadMediaContent } from '../../queries/mediaContent';
import { SettingsContext } from '../../SettingsProvider';
import { NOTICEBOARD_TYPES } from '../../types';

const { EMAIL_REGEX, MEDIA_TYPES } = consts;
const extendedMoment = extendMoment(moment);

type TNoticeboardCreateData = {
  body: string;
  dateEnd: string;
  dateStart: string;
  documents: string;
  email: string;
  name: string;
  noticeboardType: NOTICEBOARD_TYPES;
  termsOfService: boolean;
  title: string;
};

/* eslint-disable complexity */
export const NoticeboardCreateForm = ({
  navigation,
  queryVariables,
  route
}: {
  navigation: StackNavigationProp<any>;
  queryVariables: { [key: string]: any };
  route: any;
}) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { showNoticeboardMediaContent = {} } = settings;
  const { document: showDocument = false, documentMaxSizes = {} } = showNoticeboardMediaContent;
  const consentForDataProcessingText = route?.params?.consentForDataProcessingText ?? '';
  const genericType = route?.params?.genericType ?? '';
  const requestedDateDifference = route?.params?.requestedDateDifference ?? 3;
  const [isLoading, setIsLoading] = useState(false);

  const { data: categories } = useQuery(getQuery(QUERY_TYPES.CATEGORIES), {
    fetchPolicy,
    variables: queryVariables
  });

  const NOTICEBOARD_TYPE_OPTIONS = parseListItemsFromQuery(QUERY_TYPES.CATEGORIES, categories, '', {
    queryVariables
  }).map((item) => ({ value: item.title, title: item.title }));

  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm({
    defaultValues: {
      body: '',
      dateEnd: new Date(),
      dateStart: new Date(),
      documents: '[]',
      email: '',
      name: '',
      noticeboardType: '',
      termsOfService: false,
      title: ''
    }
  });

  const [createGenericItem, { loading }] = useMutation(CREATE_GENERIC_ITEM);
  let documentUrl: string | undefined;

  const onSubmit = async (noticeboardNewData: TNoticeboardCreateData) => {
    Keyboard.dismiss();

    if (!noticeboardNewData.termsOfService) {
      return Alert.alert(texts.noticeboard.alerts.hint, texts.noticeboard.alerts.termsOfService);
    }

    const dateStart = new Date(noticeboardNewData.dateStart);
    const dateEnd = new Date(noticeboardNewData.dateEnd);
    const dateDifference = extendedMoment.range(dateStart, dateEnd).diff('months');

    if (dateDifference > requestedDateDifference || dateDifference < 0) {
      return Alert.alert(texts.noticeboard.alerts.hint, texts.noticeboard.alerts.dateDifference);
    }

    setIsLoading(true);

    try {
      const documents = JSON.parse(noticeboardNewData.documents);
      const documentsUrl: { sourceUrl: { url: string }; contentType: string }[] = documents
        ?.filter((document: { id: number }) => !!document.id)
        ?.map((document: { mimeType: string; cachedAttachment: string }) => ({
          contentType: document.mimeType,
          sourceUrl: { url: document.cachedAttachment }
        }));
      const documentsSize = documents.reduce(
        (acc: number, document: any) => acc + document.size,
        0
      );

      // check if any document size is bigger than `documentMaxSizes.file`
      for (const document of documents) {
        if (!!documentMaxSizes.file && document.size > documentMaxSizes.file) {
          setIsLoading(false);
          return Alert.alert(
            texts.noticeboard.alerts.hint,
            texts.noticeboard.alerts.documentSizeError(formatSizeStandard(documentMaxSizes.file))
          );
        }
      }

      // check if documents size is bigger than `documentMaxSizes.total`
      if (documentMaxSizes.total && documentsSize > documentMaxSizes.total) {
        setIsLoading(false);
        return Alert.alert(
          texts.noticeboard.alerts.hint,
          texts.noticeboard.alerts.documentsSizeError(formatSizeStandard(documentMaxSizes.total))
        );
      }

      if (documents?.length) {
        for (const document of documents) {
          if (!document.id) {
            try {
              documentUrl = await uploadMediaContent(
                document,
                document.mimeType,
                'document',
                MEDIA_TYPES.DOCUMENT
              );

              documentUrl &&
                documentsUrl.push({
                  sourceUrl: { url: documentUrl },
                  contentType: document.mimeType
                });
            } catch (error) {
              Alert.alert(
                texts.noticeboard.alerts.hint,
                texts.noticeboard.alerts.documentUploadError
              );
              return;
            }
          }
        }
      }

      await createGenericItem({
        variables: {
          categoryName: noticeboardNewData.noticeboardType,
          genericType,
          publishedAt: momentFormat(noticeboardNewData.dateStart),
          title: noticeboardNewData.title,
          contacts: [{ email: noticeboardNewData.email, firstName: noticeboardNewData.name }],
          contentBlocks: [{ body: noticeboardNewData.body, title: noticeboardNewData.title }],
          mediaContents: documentsUrl,
          dates: [
            {
              dateEnd: momentFormat(noticeboardNewData.dateEnd),
              dateStart: momentFormat(noticeboardNewData.dateStart)
            }
          ]
        }
      });

      navigation.goBack();
      Alert.alert(texts.noticeboard.successScreen.header, texts.noticeboard.successScreen.entry);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  };

  return (
    <>
      <Input name="dateStart" hidden control={control} />

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="name"
          label={`${texts.noticeboard.inputName} *`}
          placeholder={texts.noticeboard.inputName}
          validate
          rules={{
            required: `${texts.noticeboard.inputName} ${texts.noticeboard.inputErrorText}`
          }}
          errorMessage={errors.name && errors.name.message}
          control={control}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="email"
          label={`${texts.noticeboard.inputMail} *`}
          placeholder={texts.noticeboard.inputMail}
          keyboardType="email-address"
          validate
          rules={{
            required: `${texts.noticeboard.inputMail} ${texts.noticeboard.inputErrorText}`,
            pattern: {
              value: EMAIL_REGEX,
              message: `${texts.noticeboard.inputMail}${texts.noticeboard.invalidMail}`
            }
          }}
          errorMessage={errors.email && errors.email.message}
          control={control}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="noticeboardType"
          rules={{ required: texts.noticeboard.alerts.noticeboardType }}
          render={({ field: { onChange, value } }) => (
            <>
              {NOTICEBOARD_TYPE_OPTIONS.map((noticeboardItem: { value: string; title: string }) => (
                <Checkbox
                  key={noticeboardItem.title}
                  checked={value === noticeboardItem.value}
                  onPress={() => onChange(noticeboardItem.value)}
                  title={noticeboardItem.title}
                  checkedColor={colors.accent}
                  uncheckedColor={colors.darkText}
                  containerStyle={styles.checkboxContainerStyle}
                  textStyle={styles.checkboxTextStyle}
                  link={undefined}
                  center={undefined}
                  linkDescription={undefined}
                  checkedIcon={undefined}
                  uncheckedIcon={undefined}
                />
              ))}
              <Input
                control={control}
                errorMessage={errors.noticeboardType && errors.noticeboardType.message}
                hidden
                name={'noticeboardType'}
                validate
              />
            </>
          )}
          control={control}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="title"
          label={`${texts.noticeboard.inputTitle} *`}
          placeholder={texts.noticeboard.inputTitle}
          validate
          rules={{
            required: `${texts.noticeboard.inputTitle} ${texts.noticeboard.inputErrorText}`
          }}
          errorMessage={errors.title && errors.title.message}
          control={control}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="body"
          label={`${texts.noticeboard.inputDescription} *`}
          placeholder={texts.noticeboard.inputDescription}
          validate
          multiline
          rules={{
            required: `${texts.noticeboard.inputDescription} ${texts.noticeboard.inputErrorText}`
          }}
          errorMessage={errors.body && errors.body.message}
          control={control}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="dateEnd"
          render={({ field: { name, onChange, value } }) => (
            <DateTimeInput
              {...{
                mode: 'date',
                errors,
                required: true,
                value,
                onChange,
                name,
                label: texts.noticeboard.inputDate(requestedDateDifference),
                placeholder: texts.noticeboard.inputDate(requestedDateDifference),
                control
              }}
            />
          )}
          control={control}
        />
      </Wrapper>

      {showDocument && (
        <Wrapper style={styles.noPaddingTop}>
          <Controller
            name="documents"
            control={control}
            render={({ field }) => (
              <DocumentSelector
                {...{ control, field }}
                maxFileSize={documentMaxSizes.file}
                item={{
                  buttonTitle: texts.noticeboard.addDocuments,
                  infoTitle: texts.noticeboard.documentsInfo
                }}
              />
            )}
          />
        </Wrapper>
      )}

      <Wrapper style={styles.noPaddingTop}>
        {/* @ts-expect-error HtmlView uses memo in js, which is not inferred correctly */}
        <HtmlView html={consentForDataProcessingText} />

        <Controller
          name="termsOfService"
          render={({ field: { onChange, value } }) => (
            <Checkbox
              checked={!!value}
              onPress={() => onChange(!value)}
              title={`${texts.noticeboard.inputCheckbox} *`}
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

      <Wrapper>
        {isLoading || loading ? (
          <LoadingSpinner loading={isLoading} />
        ) : (
          <Button onPress={handleSubmit(onSubmit)} title={texts.noticeboard.send} />
        )}

        <Touchable onPress={() => navigation.goBack()}>
          <RegularText primary center>
            {texts.noticeboard.abort}
          </RegularText>
        </Touchable>
      </Wrapper>
    </>
  );
};
/* eslint-enable complexity */

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
