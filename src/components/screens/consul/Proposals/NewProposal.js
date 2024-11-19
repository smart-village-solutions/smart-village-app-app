import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { colors, consts, namespace, normalize, secrets, texts } from '../../../../config';
import { ConsulClient } from '../../../../ConsulClient';
import { documentErrorMessageGenerator, imageErrorMessageGenerator } from '../../../../helpers';
import { QUERY_TYPES } from '../../../../queries';
import { START_PROPOSAL, UPDATE_PROPOSAL } from '../../../../queries/consul';
import { uploadAttachment } from '../../../../queries/consul/uploads';
import { ScreenName } from '../../../../types';
import { Button } from '../../../Button';
import { Checkbox } from '../../../Checkbox';
import { DocumentSelector, ImageSelector } from '../../../consul';
import { Input } from '../../../form';
import { Label } from '../../../Label';
import { RegularText } from '../../../Text';
import { Wrapper, WrapperHorizontal } from '../../../Wrapper';

const { IMAGE_SELECTOR_ERROR_TYPES, URL_REGEX } = consts;

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
const showDataUploadError = (errorText) =>
  Alert.alert(texts.consul.privacyCheckRequireTitle, errorText);

const INPUTS = [
  {
    autoCapitalize: 'none',
    autoCompleteType: 'off',
    keyboardType: 'default',
    label: texts.consul.startNew.newProposalTitleLabel,
    name: 'title',
    placeholder: texts.consul.startNew.newProposalTitleLabel,
    rules: {
      required: texts.consul.startNew.emptyError,
      minLength: { value: 4, message: texts.consul.startNew.titleShortError }
    },
    textContentType: 'none',
    type: ITEM_TYPES.INPUT
  },
  {
    autoCapitalize: 'none',
    autoCompleteType: 'off',
    keyboardType: 'default',
    label: texts.consul.startNew.newProposalSummaryLabel,
    multiline: true,
    name: 'summary',
    placeholder: texts.consul.startNew.newProposalSummaryLabel,
    rules: {
      required: texts.consul.startNew.emptyError,
      maxLength: { value: 200, message: texts.consul.startNew.proposalSummaryInfo }
    },
    textContentType: 'none',
    type: ITEM_TYPES.INPUT
  },
  {
    autoCapitalize: 'none',
    autoCompleteType: 'off',
    keyboardType: 'default',
    label: texts.consul.startNew.newProposalDescriptionLabel,
    minHeight: normalize(150),
    multiline: true,
    textAlignVertical: 'top',
    name: 'description',
    placeholder: texts.consul.startNew.newProposalDescriptionLabel,
    rules: {
      required: texts.consul.startNew.emptyError,
      minLength: { value: 10, message: texts.consul.startNew.descriptionShortError }
    },
    textContentType: 'none',
    type: ITEM_TYPES.INPUT
  },
  {
    autoCapitalize: 'none',
    autoCompleteType: 'off',
    keyboardType: 'default',
    label: texts.consul.startNew.newProposalExternesVideoUrlLabel,
    name: 'videoUrl',
    placeholder: texts.consul.startNew.newProposalExternesVideoUrlLabel,
    rules: { required: false },
    textContentType: 'none',
    type: ITEM_TYPES.INPUT
  },
  {
    title: texts.consul.startNew.proposalVideoUrlInfo,
    type: ITEM_TYPES.INFO_TEXT
  },
  {
    buttonTitle: texts.consul.startNew.newProposalImageAddButtonTitle,
    infoText: texts.consul.startNew.newProposalImageAddInfoText,
    label: texts.consul.startNew.newProposalImageAddTitle,
    name: 'image',
    rules: { required: false },
    type: ITEM_TYPES.PICKER
  },
  {
    buttonTitle: texts.consul.startNew.newProposalDocumentAddButtonTitle,
    infoText: texts.consul.startNew.newProposalDocumentAddInfoText,
    label: texts.consul.startNew.newProposalDocumentAddTitle,
    name: 'documents',
    rules: { required: false },
    type: ITEM_TYPES.PICKER
  },
  {
    title: texts.consul.startNew.tags,
    type: ITEM_TYPES.TITLE
  },
  {
    title: texts.consul.startNew.proposalTagInfo,
    type: ITEM_TYPES.INFO_TEXT
  },
  {
    category: TAG_CATEGORIES,
    title: texts.consul.startNew.categoriesTitle,
    type: ITEM_TYPES.CATEGORY
  },
  {
    autoCapitalize: 'none',
    autoCompleteType: 'off',
    keyboardType: 'default',
    label: texts.consul.startNew.newProposalTagLabel,
    maxHeight: normalize(50),
    multiline: true,
    name: 'tagList',
    placeholder: texts.consul.startNew.tags,
    rules: { required: false },
    textContentType: 'none',
    type: ITEM_TYPES.INPUT
  }
];

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const NewProposal = ({ navigation, data, query }) => {
  const [hasAcceptedTermsOfService, setHasAcceptedTermsOfService] = useState(
    data?.termsOfService ?? false
  );
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState([]);

  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue
  } = useForm({
    defaultValues: {
      description: data?.description || '',
      documents: JSON.stringify(data?.documents) || '[]',
      image: data?.image || '[]',
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
    const { status, body } = await uploadAttachment(dataUri, dataType);

    if (status === 200) {
      const { cached_attachment: cachedAttachment, filename: title } = JSON.parse(body);

      return {
        title,
        cachedAttachment
      };
    } else if (status === 422) {
      const errors = JSON.parse(body.body).errors;

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

    const image = JSON.parse(newProposalData.image)?.[0]?.uri;
    // if the image is an absolute url, we are editing and do not want to upload a new image
    const isImageToUpload = image && !URL_REGEX.test(image);

    if (isImageToUpload) {
      try {
        const imageAttributes = await uploadData(image, 'image');

        variables.attributes = { ...variables.attributes, imageAttributes };
      } catch (error) {
        setIsLoading(false);

        const errorMessage = await imageErrorMessageGenerator(image);

        return showDataUploadError(
          texts.consul.startNew[errorMessage] ?? texts.consul.startNew.generalDataUploadError
        );
      }
    }

    if (newProposalData.documents) {
      const documents = JSON.parse(newProposalData.documents).filter(({ url }) => !url);

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

          const errorMessage = await documentErrorMessageGenerator(cachedAttachment);

          return showDataUploadError(
            texts.consul.startNew[errorMessage] ?? texts.consul.startNew.generalDataUploadError
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
                    style={[styles.tagContainer, !!items.selected && styles.tagContainerSelected]}
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
              render={({ field }) =>
                item.name === 'image' ? (
                  <ImageSelector
                    {...{
                      control,
                      errorType: IMAGE_SELECTOR_ERROR_TYPES.CONSUL,
                      field,
                      item,
                      imageId: data?.imageId
                    }}
                  />
                ) : (
                  <DocumentSelector
                    {...{
                      configuration: {
                        limitation: {
                          maxCount: 3
                        }
                      },
                      control,
                      field,
                      item
                    }}
                  />
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
/* eslint-enable complexity */

const styles = StyleSheet.create({
  noPaddingTop: {
    paddingTop: 0
  },
  tagContainer: {
    backgroundColor: colors.borderRgba,
    margin: 5,
    borderRadius: 5
  },
  tagContainerSelected: {
    backgroundColor: colors.primary
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
