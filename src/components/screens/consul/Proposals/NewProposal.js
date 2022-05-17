import * as FileSystem from 'expo-file-system';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { colors, Icon, namespace, normalize, secrets, texts } from '../../../../config';
import { ConsulClient } from '../../../../ConsulClient';
import { imageHeight, imageWidth } from '../../../../helpers';
import { useSelectImage } from '../../../../hooks';
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

const showPrivacyCheckRequireAlert = () =>
  Alert.alert(texts.consul.privacyCheckRequireTitle, texts.consul.privacyCheckRequireBody);
const graphqlErr = (err) => Alert.alert(texts.consul.privacyCheckRequireTitle, err);
const showImageUploadError = (errorText) =>
  Alert.alert(texts.consul.privacyCheckRequireTitle, errorText);

export const NewProposal = ({ navigation, data, query }) => {
  const [hasAcceptedTermsOfService, setHasAcceptedTermsOfService] = useState(
    data?.termsOfService ?? false
  );
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const { selectImage } = useSelectImage(
    undefined, // onChange
    false, // allowsEditing,
    undefined, // aspect,
    undefined // quality
  );

  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue
  } = useForm({
    defaultValues: {
      description: data?.description || '',
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

  const uploadImage = async (imageData) => {
    const imageUploadData = await uploadAttachment(imageData, 'image');

    if (imageUploadData.status === 200) {
      const { cached_attachment: cachedAttachment, filename: title } = JSON.parse(
        imageUploadData.body
      );

      return {
        title,
        cachedAttachment
      };
    } else if (imageUploadData.status === 422) {
      const errors = JSON.parse(imageUploadData.body).errors.toLowerCase().split(' ').join('-');

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

        // TODO: image and document upload needed here? and if yes, how to do it?
        //  documentsAttributes: [
        // 	  {
        // 		  title: 'sample.pdf',
        // 		  cachedAttachment:
        // 		  	'/Users/ardasenturk/Development/SVA/consul-bb/public/system/documents/cached_attachments/user/49/original/f2245afb48be5f906474ad929aacb7f91f408a23.pdf'
        // 	  }
        //  ],
      }
    };

    if (!hasAcceptedTermsOfService) return showPrivacyCheckRequireAlert();

    setIsLoading(true);

    if (newProposalData.image) {
      try {
        const imageAttributes = await uploadImage(newProposalData.image);

        variables.attributes = { ...variables.attributes, imageAttributes };
      } catch (error) {
        setIsLoading(false);

        return showImageUploadError(
          texts.consul.startNew[error] ?? texts.consul.startNew.generalPhotoUploadError
        );
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
              render={(field) => <ImageSelector {...{ control, field, item, selectImage }} />}
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

const ImageSelector = ({ control, field, item, selectImage }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [imageInfoText, setImageInfoText] = useState('');

  const { buttonTitle, infoText } = item;
  const { name, onChange, value } = field;

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
              }}
            >
              <Icon.Trash color={colors.error} size={normalize(16)} />
            </TouchableOpacity>
          </WrapperRow>
          <RegularText smallest>{imageInfoText}</RegularText>
        </>
      ) : (
        <Button
          title={buttonTitle}
          invert
          onPress={async () => {
            const { uri, type } = await selectImage();
            const { size } = await FileSystem.getInfoAsync(uri);
            const errorMessage = imageErrorMessageGenerator({
              size,
              uri: uri.substr(uri.length - 4)
            });

            setErrorMessage(texts.consul.startNew[errorMessage]);
            setImageInfoText(`(${type}/${uri.substr(uri.length - 3)}, ${bytesToSize(size)})`);
            onChange(uri);
          }}
        />
      )}
    </>
  );
};

const bytesToSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 Byte';
  let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

const imageErrorMessageGenerator = ({ size, uri }) => {
  const errorMessage =
    uri !== '.jpg' && uri !== 'jpeg' && size > 1048576
      ? 'choose-image-content-type-image/png-does-not-match-any-of-accepted-content-types-jpg,-choose-image-must-be-in-between-0-bytes-and-1-mb'
      : uri !== '.jpg' && uri !== 'jpeg'
      ? 'choose-image-content-type-image/png-does-not-match-any-of-accepted-content-types-jpg'
      : size > 1048576
      ? 'choose-image-must-be-in-between-0-bytes-and-1-mb'
      : '';

  return errorMessage;
};

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
