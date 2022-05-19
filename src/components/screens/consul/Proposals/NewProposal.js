import * as FileSystem from 'expo-file-system';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { colors, Icon, namespace, normalize, secrets, texts } from '../../../../config';
import { ConsulClient } from '../../../../ConsulClient';
import { imageHeight, imageWidth } from '../../../../helpers';
import { useSelectDocument, useSelectImage } from '../../../../hooks';
import { QUERY_TYPES } from '../../../../queries';
import { START_PROPOSAL, UPDATE_PROPOSAL } from '../../../../queries/consul';
import { uploadAttachment } from '../../../../queries/consul/uploads';
import { ScreenName } from '../../../../types';
import { Button } from '../../../Button';
import { Checkbox } from '../../../Checkbox';
import { Input } from '../../../form';
import { Image } from '../../../Image';
import { Label } from '../../../Label';
import { RegularText } from '../../../Text';
import { Wrapper, WrapperHorizontal, WrapperRow } from '../../../Wrapper';

const TAG_CATEGORIES = [
  { name: 'Associations', id: 0, selected: false },
  { name: 'Culture', id: 1, selected: false },
  { name: 'Economy', id: 2, selected: false },
  { name: 'Employment', id: 3, selected: false },
  { name: 'Environment', id: 4, selected: false },
  { name: 'Equity', id: 5, selected: false },
  { name: 'Health', id: 6, selected: false },
  { name: 'Media', id: 7, selected: false },
  { name: 'Mobility', id: 8, selected: false },
  { name: 'Participation', id: 9, selected: false },
  { name: 'Security and Emergencies', id: 10, selected: false },
  { name: 'Social Rights', id: 11, selected: false },
  { name: 'Sports', id: 12, selected: false },
  { name: 'Sustainability', id: 13, selected: false },
  { name: 'Transparency', id: 14, selected: false }
];

const ITEM_TYPES = {
  INPUT: 'input',
  INFO_TEXT: 'infoText',
  TITLE: 'title',
  CATEGORY: 'category',
  PICKER: 'picker'
};

const IMAGE_TYPE_REGEX = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i;

const showPrivacyCheckRequireAlert = () =>
  Alert.alert(texts.consul.privacyCheckRequireTitle, texts.consul.privacyCheckRequireBody);
const graphqlErr = (err) => Alert.alert(texts.consul.privacyCheckRequireTitle, err);
const showDataUploadError = (errorText) =>
  Alert.alert(texts.consul.privacyCheckRequireTitle, errorText);

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const NewProposal = ({ navigation, data, query }) => {
  const [hasAcceptedTermsOfService, setHasAcceptedTermsOfService] = useState(
    data?.termsOfService ?? false
  );
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const documentsAttributes = [];

  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue
  } = useForm({
    defaultValues: {
      description: data?.description || '',
      documents: JSON.stringify(data?.documents) || '',
      image: data?.image || '',
      summary: data?.summary || '',
      tagList: data?.tagList?.toString() || '',
      title: data?.title || '',
      videoUrl: data?.videoUrl || ''
    }
  });

  const [submitProposal] = useMutation(START_PROPOSAL, {
    client: ConsulClient
  });
  const [updateProposal] = useMutation(UPDATE_PROPOSAL, {
    client: ConsulClient
  });

  useEffect(() => {
    if (data?.tagList) {
      TAG_CATEGORIES.map((item) => {
        for (let i = 0; i < data?.tagList.length; i++) {
          const element = data?.tagList[i];
          if (item.name === element) {
            item.selected = true;
          }
        }
      });
      setTags(TAG_CATEGORIES);
    } else {
      for (let i = 0; i < TAG_CATEGORIES.length; i++) {
        const element = TAG_CATEGORIES[i];
        element.selected = false;
      }
    }
  }, []);

  useEffect(() => {
    setTags(TAG_CATEGORIES);
    const selectedTag = tags.map((item) => {
      if (item.selected) return item.name;
    });
    const filterData = selectedTag.filter((data) => data);
    setValue('tagList', filterData.toString());
  }, [tags]);

  const uploadData = async (dataUri, dataType) => {
    const uploadData = await uploadAttachment(dataUri, dataType);
    if (uploadData.status === 200) {
      const { cached_attachment: cachedAttachment, filename: title } = JSON.parse(uploadData.body);

      return {
        title,
        cachedAttachment
      };
    } else if (uploadData.status === 422) {
      const errors = JSON.parse(uploadData.body).errors.toLowerCase().split(' ').join('-');

      throw errors;
    }
  };

  const onSubmit = async (newProposalData) => {
    let variables = {
      id: data?.id,
      attributes: {
        translationsAttributes: {
          title: newProposalData?.title,
          summary: newProposalData?.summary,
          description: newProposalData?.description
        },
        tagList: newProposalData?.tagList,
        termsOfService: hasAcceptedTermsOfService,
        videoUrl: newProposalData?.videoUrl
      }
    };

    if (!hasAcceptedTermsOfService) return showPrivacyCheckRequireAlert();

    setIsLoading(true);

    if (newProposalData.image) {
      try {
        const imageAttributes = await uploadData(newProposalData.image, 'image');

        variables.attributes = { ...variables.attributes, imageAttributes };
      } catch (error) {
        setIsLoading(false);

        return showDataUploadError(
          texts.consul.startNew[error] ?? texts.consul.startNew.generalDataUploadError
        );
      }
    }

    if (newProposalData.documents) {
      let documents = JSON.parse(newProposalData.documents);
      variables.attributes = {
        ...variables.attributes,
        documentsAttributes: []
      };

      for (let i = 0; i < documents.length; i++) {
        const { cachedAttachment, title } = documents[i];

        try {
          const documentsAttributes = await uploadData(cachedAttachment, 'documents');

          variables.attributes.documentsAttributes.push({
            cachedAttachment: documentsAttributes.cachedAttachment,
            title
          });
        } catch (error) {
          setIsLoading(false);

          return showDataUploadError(
            texts.consul.startNew[error] ?? texts.consul.startNew.generalDataUploadError
          );
        }
      }
    }

    switch (query) {
      case QUERY_TYPES.CONSUL.START_PROPOSAL:
        try {
          await submitProposal({ variables });

          navigation.navigate(ScreenName.ConsulIndexScreen, {
            title: texts.consul.homeScreen.proposals,
            query: QUERY_TYPES.CONSUL.PROPOSALS,
            queryVariables: {
              limit: 15,
              order: 'name_ASC',
              category: texts.consul.homeScreen.proposals
            },
            rootRouteName: ScreenName.ConsulHomeScreen
          });
        } catch (error) {
          graphqlErr(error.message);
          console.error(error.message);
          setIsLoading(false);
        }
        break;
      case QUERY_TYPES.CONSUL.UPDATE_PROPOSAL:
        try {
          let data = await updateProposal({ variables });

          navigation.navigate(ScreenName.ConsulDetailScreen, {
            query: QUERY_TYPES.CONSUL.PROPOSAL,
            queryVariables: { id: data.data.updateProposal.id }
          });
        } catch (error) {
          graphqlErr(error.message);
          console.error(error.message);
          setIsLoading(false);
        }
        break;
      default:
        break;
    }
  };

  return (
    <>
      {INPUTS.map((item, index) => (
        <Wrapper key={index} style={styles.noPaddingTop}>
          {item.type === ITEM_TYPES.TITLE && <Label>{item.title}</Label>}

          {item.type === ITEM_TYPES.INPUT && (
            <Input
              control={control}
              {...item}
              validate={item.rules.required}
              errorMessage={errors[item.name] && errors[item.name].message}
            />
          )}

          {item.type === ITEM_TYPES.INFO_TEXT && (
            <RegularText smallest placeholder>
              {item.title}
            </RegularText>
          )}

          {item.type === ITEM_TYPES.CATEGORY && (
            <>
              <Label>{item.title}</Label>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {item.category.map((items, indexs) => (
                  <TouchableOpacity
                    key={indexs}
                    activeOpacity={1}
                    style={[
                      styles.tagContainer,
                      {
                        backgroundColor: items.selected
                          ? colors.lighterPrimary
                          : colors.placeholder + '60'
                      }
                    ]}
                    onPress={() => {
                      if (items.selected) {
                        items.selected = false;
                      } else {
                        items.selected = true;
                      }
                      setTags([]);
                    }}
                  >
                    <RegularText
                      small
                      style={styles.tagText}
                      lightest={items.selected ? true : false}
                    >
                      {items.name}
                    </RegularText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {item.type === ITEM_TYPES.PICKER && (
            <Controller
              name={item.name}
              control={control}
              render={(field) =>
                item.name === 'image' ? (
                  <ImageSelector {...{ control, field, item }} />
                ) : (
                  <DocumentSelector {...{ control, field, item, documentsAttributes }} />
                )
              }
            />
          )}
        </Wrapper>
      ))}

      <Wrapper style={styles.noPaddingTop}>
        <WrapperHorizontal>
          <Checkbox
            title={texts.consul.startNew.termsOfServiceLabel}
            link={`${secrets[namespace]?.consul?.serverUrl}${secrets[namespace]?.consul?.termsOfService}`}
            linkDescription={texts.consul.startNew.termsOfServiceLinkLabel}
            checkedIcon="check-square-o"
            uncheckedIcon="square-o"
            checked={hasAcceptedTermsOfService}
            onPress={() => setHasAcceptedTermsOfService(!hasAcceptedTermsOfService)}
          />
        </WrapperHorizontal>

        <Wrapper>
          <Button
            disabled={isLoading}
            onPress={handleSubmit(onSubmit)}
            title={
              isLoading
                ? texts.consul.startNew.updateButtonDisabledLabel
                : query === QUERY_TYPES.CONSUL.START_PROPOSAL
                ? texts.consul.startNew.newProposalStartButtonLabel
                : texts.consul.startNew.updateButtonLabel
            }
          />
        </Wrapper>
      </Wrapper>
    </>
  );
};

const ImageSelector = ({ control, field, item }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [imageInfoText, setImageInfoText] = useState('');

  const { buttonTitle, infoText } = item;
  const { name, onChange, value } = field;

  const { selectImage } = useSelectImage(
    undefined, // onChange
    false, // allowsEditing,
    undefined, // aspect,
    undefined // quality
  );

  return (
    <>
      <Input
        {...item}
        control={control}
        errorMessage={errorMessage}
        hidden
        validate
        name={name}
        value={value}
      />
      <RegularText smallest placeholder>
        {infoText}
      </RegularText>

      {value ? (
        <>
          <WrapperRow center spaceBetween>
            <Image source={{ uri: value }} style={styles.image} />

            <TouchableOpacity
              onPress={() => {
                onChange('');
                setErrorMessage('');
                setImageInfoText('');
              }}
            >
              <Icon.Trash color={colors.error} size={normalize(16)} />
            </TouchableOpacity>
          </WrapperRow>
          {!!imageInfoText && <RegularText smallest>{imageInfoText}</RegularText>}
        </>
      ) : (
        <Button
          title={buttonTitle}
          invert
          onPress={async () => {
            const { uri, type } = await selectImage();
            const { size } = await FileSystem.getInfoAsync(uri);
            const imageType = IMAGE_TYPE_REGEX.exec(uri)[1];

            const errorMessage = imageErrorMessageGenerator({
              size,
              imageType
            });

            setErrorMessage(texts.consul.startNew[errorMessage]);
            setImageInfoText(`(${type}/${imageType}, ${bytesToSize(size)})`);
            onChange(uri);
          }}
        />
      )}
    </>
  );
};

const DocumentSelector = ({ control, field, item, documentsAttributes }) => {
  const [errorMessage, setErrorMessage] = useState([]);
  const [pdfInfoText, setPDFInfoText] = useState([]);

  const { buttonTitle, infoText } = item;
  const { name, onChange, value } = field;

  const { selectDocument } = useSelectDocument();

  return (
    <>
      <Input {...item} control={control} hidden name={name} value={JSON.stringify(value)} />
      <RegularText smallest placeholder>
        {infoText}
      </RegularText>

      {value
        ? JSON.parse(value).map((item, index) => (
            <>
              <WrapperRow key={index} center spaceBetween>
                <RegularText>{item.title}</RegularText>

                <TouchableOpacity
                  onPress={() => {
                    documentsAttributes.splice(index, 1);
                    errorMessage.splice(index, 1);
                    pdfInfoText.splice(index, 1);
                    onChange(JSON.stringify(documentsAttributes));
                    setErrorMessage(errorMessage);
                    setPDFInfoText(pdfInfoText);
                  }}
                >
                  <Icon.Trash color={colors.error} size={normalize(16)} />
                </TouchableOpacity>
              </WrapperRow>

              {!!pdfInfoText && <RegularText smallest>{pdfInfoText[index]}</RegularText>}
              {!!errorMessage && (
                <RegularText smallest error>
                  {errorMessage[index]}
                </RegularText>
              )}
            </>
          ))
        : null}

      {/* users can upload a maximum of 3 PDF files
					if 3 PDFs are selected, the new add button will not be displayed. */}
      {!value || JSON.parse(value).length < 3 ? (
        <Button
          title={buttonTitle}
          invert
          onPress={async () => {
            const { mimeType, name: title, size, uri: cachedAttachment } = await selectDocument();

            documentsAttributes.push({ title, cachedAttachment });

            const errorMessages = documentErrorMessageGenerator({
              size,
              mimeType
            });

            setErrorMessage([...errorMessage, texts.consul.startNew[errorMessages]]);
            setPDFInfoText([...pdfInfoText, `(${mimeType}, ${bytesToSize(size)})`]);
            onChange(JSON.stringify(documentsAttributes));
          }}
        />
      ) : null}
    </>
  );
};

const bytesToSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 Byte';
  let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

const imageErrorMessageGenerator = ({ size, imageType }) => {
  const isJPG = imageType === 'jpg' || imageType === 'jpeg';
  const isGreater1MB = size > 1048576;

  const errorMessage =
    !isJPG && isGreater1MB
      ? 'choose-image-content-type-image/png-does-not-match-any-of-accepted-content-types-jpg,-choose-image-must-be-in-between-0-bytes-and-1-mb'
      : !isJPG
      ? 'choose-image-content-type-image/png-does-not-match-any-of-accepted-content-types-jpg'
      : isGreater1MB
      ? 'choose-image-must-be-in-between-0-bytes-and-1-mb'
      : '';

  return errorMessage;
};

const documentErrorMessageGenerator = ({ size, mimeType }) => {
  const isPDF = mimeType === 'application/pdf';
  const isGreater3MB = size > 3145728;

  const errorMessage =
    !isPDF && isGreater3MB
      ? 'choose-document-content-type-application/msword-does-not-match-any-of-accepted-content-types-pdf,-choose-document-must-be-in-between-0-bytes-and-3-mb'
      : !isPDF
      ? 'choose-document-content-type-application/msword-does-not-match-any-of-accepted-content-types-pdf'
      : isGreater3MB
      ? 'choose-document-must-be-in-between-0-bytes-and-3-mb'
      : '';

  return errorMessage;
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  image: {
    height: imageHeight(imageWidth() * 0.6),
    width: imageWidth() * 0.6
  },
  noPaddingTop: {
    paddingTop: 0
  },
  tagContainer: {
    backgroundColor: colors.borderRgba,
    margin: 5,
    borderRadius: 5
  },
  tagText: {
    padding: 10
  }
});

NewProposal.propTypes = {
  data: PropTypes.object,
  navigation: PropTypes.object.isRequired,
  query: PropTypes.string
};

ImageSelector.propTypes = {
  control: PropTypes.object,
  field: PropTypes.object,
  item: PropTypes.object,
  selectImage: PropTypes.func
};

DocumentSelector.propTypes = {
  control: PropTypes.object,
  documentsAttributes: PropTypes.object,
  field: PropTypes.object,
  item: PropTypes.object,
  selectImage: PropTypes.func
};

const INPUTS = [
  {
    type: ITEM_TYPES.INPUT,
    name: 'title',
    label: texts.consul.startNew.newProposalTitleLabel,
    placeholder: texts.consul.startNew.newProposalTitleLabel,
    keyboardType: 'default',
    textContentType: 'none',
    autoCompleteType: 'off',
    autoCapitalize: 'none',
    rules: {
      required: texts.consul.startNew.emptyError,
      minLength: { value: 4, message: texts.consul.startNew.titleShortError }
    }
  },
  {
    type: ITEM_TYPES.INPUT,
    name: 'summary',
    multiline: true,
    label: texts.consul.startNew.newProposalSummaryLabel,
    placeholder: texts.consul.startNew.newProposalSummaryLabel,
    keyboardType: 'default',
    textContentType: 'none',
    autoCompleteType: 'off',
    autoCapitalize: 'none',
    rules: {
      required: texts.consul.startNew.emptyError,
      maxLength: { value: 200, message: texts.consul.startNew.proposalSummaryInfo }
    }
  },
  {
    type: ITEM_TYPES.INPUT,
    name: 'description',
    multiline: true,
    label: texts.consul.startNew.newProposalDescriptionLabel,
    placeholder: texts.consul.startNew.newProposalDescriptionLabel,
    keyboardType: 'default',
    textContentType: 'none',
    autoCompleteType: 'off',
    autoCapitalize: 'none',
    minHeight: 150,
    rules: {
      required: texts.consul.startNew.emptyError,
      minLength: { value: 10, message: texts.consul.startNew.descriptionShortError }
    }
  },
  {
    type: ITEM_TYPES.INPUT,
    name: 'videoUrl',
    label: texts.consul.startNew.newProposalExternesVideoUrlLabel,
    placeholder: texts.consul.startNew.newProposalExternesVideoUrlLabel,
    keyboardType: 'default',
    textContentType: 'none',
    autoCompleteType: 'off',
    autoCapitalize: 'none',
    rules: { required: false }
  },
  {
    type: ITEM_TYPES.INFO_TEXT,
    title: texts.consul.startNew.proposalVideoUrlInfo
  },
  {
    type: ITEM_TYPES.PICKER,
    name: 'image',
    label: texts.consul.startNew.newProposalImageAddTitle,
    rules: { required: false },
    buttonTitle: texts.consul.startNew.newProposalImageAddButtonTitle,
    infoText: texts.consul.startNew.newProposalImageAddInfoText
  },
  {
    type: ITEM_TYPES.PICKER,
    name: 'documents',
    label: texts.consul.startNew.newProposalDocumentAddTitle,
    rules: { required: false },
    buttonTitle: texts.consul.startNew.newProposalDocumentAddButtonTitle,
    infoText: texts.consul.startNew.newProposalDocumentAddInfoText
  },
  {
    type: ITEM_TYPES.TITLE,
    title: texts.consul.startNew.tags
  },
  {
    type: ITEM_TYPES.INFO_TEXT,
    title: texts.consul.startNew.proposalTagInfo
  },
  {
    type: ITEM_TYPES.CATEGORY,
    title: texts.consul.startNew.categoriesTitle,
    category: TAG_CATEGORIES
  },
  {
    type: ITEM_TYPES.INPUT,
    name: 'tagList',
    multiline: true,
    label: texts.consul.startNew.newProposalTagLabel,
    placeholder: texts.consul.startNew.tags,
    keyboardType: 'default',
    textContentType: 'none',
    autoCompleteType: 'off',
    autoCapitalize: 'none',
    rules: { required: false }
  }
];
