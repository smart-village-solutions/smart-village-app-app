import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { colors, namespace, secrets, texts } from '../../../../config';
import { ConsulClient } from '../../../../ConsulClient';
import { QUERY_TYPES } from '../../../../queries';
import { START_PROPOSAL, UPDATE_PROPOSAL } from '../../../../queries/consul';
import { ScreenName } from '../../../../types';
import { Button } from '../../../Button';
import { Checkbox } from '../../../Checkbox';
import { Input } from '../../../form';
import { Label } from '../../../Label';
import { LoadingSpinner } from '../../../LoadingSpinner';
import { RegularText } from '../../../Text';
import { Wrapper, WrapperHorizontal } from '../../../Wrapper';

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
  CATEGORY: 'category'
};

const showRegistrationFailAlert = () =>
  Alert.alert(texts.consul.privacyCheckRequireTitle, texts.consul.privacyCheckRequireBody);
const graphqlErr = (err) => Alert.alert('Hinweis', err);

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
      title: data?.title || '',
      description: data?.description || '',
      tagList: data?.tagList?.toString() || '',
      summary: data?.summary || '',
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
        videoUrl: newProposalData?.videoUrl,

        // TODO: image and document upload needed here? and if yes, how to do it?
        //  imageAttributes: {
        //   	title: 'Profil.png',
        //   	cachedAttachment:
        //   		'/Users/ardasenturk/Development/SVA/consul-bb/public/system/images/cached_attachments/user/49/original/3dfe4b17e340624be2f74f822f15e36cadd8d6e1.png'
        //  },
        //  documentsAttributes: [
        // 	  {
        // 		  title: 'sample.pdf',
        // 		  cachedAttachment:
        // 		  	'/Users/ardasenturk/Development/SVA/consul-bb/public/system/documents/cached_attachments/user/49/original/f2245afb48be5f906474ad929aacb7f91f408a23.pdf'
        // 	  }
        //  ],
      }
    };

    if (!hasAcceptedTermsOfService) return showRegistrationFailAlert(); // TODO: naming?

    switch (query) {
      case QUERY_TYPES.CONSUL.START_PROPOSAL:
        setIsLoading(true);

        try {
          await submitProposal({ variables });

          // TODO: handle uploads for the proposal (id returned by `submitProposal`?)
          // 1. get infos about files to be uploaded
          // 2. upload files per upload helper function `uploadAttachment` for the proposal
          // 3. if success go on here
          // 4. if error, show error message and ??

          setIsLoading(false);

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
        setIsLoading(true);
        try {
          let data = await updateProposal({ variables });

          // TODO: handle uploads for the proposal (id in `data`?)
          // 1. get infos about files to be uploaded
          // 2. upload files per upload helper function `uploadAttachment` for the proposal
          // 3. if success go on here
          // 4. if error, show error message and ??

          setIsLoading(false);

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

  if (isLoading) return <LoadingSpinner loading />;

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
        </Wrapper>
      ))}

      {/* TODO: uploads WIP */}
      <Controller
        key=??
        control={control}
        name=?? // image or documents
        rules={{ // TODO: depending on image or documents
          required: ??,
          validate: ??
        }}
        defaultValue=?? // should be placed in initial values for useForm?
        render={({ onChange, value }) => {
          // TODO: handle `onChange` somewhere after selecting image or documents to change `value`
          //       that is placed in the hidden input

          return (
            <>
              {/* preview component that renders image and documents to be uploaded */}
              <Input
                hidden // can be removed for development to see value of hidden input
                validate
                errorMessage=?? // or something like {errors[name] && `Es dürfen maximal ${max} Fotos hinzugefügt werden`}
                value={value} // or JSON.stringify(value)?
              />
              {/* TODO: multiple buttons depending on image (take picture, select picture from device) or documents (select from device) */}
              {/* TODO: new camera screen for taking pictures that is navigated to on selection "take picture" */}
              <Button
                title=?? // image or document
                invert
                onPress=?? // what happens for image (bottom sheet with selection for camera or image picker)? what happens for documents (directly document picker)?
              />
            </>
          );
        }}
      />

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
            onPress={handleSubmit(onSubmit)}
            title={
              query === QUERY_TYPES.CONSUL.START_PROPOSAL
                ? texts.consul.startNew.newProposalStartButtonLabel
                : texts.consul.startNew.updateButtonLabel
            }
          />
        </Wrapper>
      </Wrapper>
    </>
  );
};

const styles = StyleSheet.create({
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
