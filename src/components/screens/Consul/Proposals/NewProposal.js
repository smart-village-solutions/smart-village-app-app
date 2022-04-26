import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Alert, TouchableOpacity, StyleSheet, ScrollView, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-apollo';

import { Input } from '../../../Consul';
import { Wrapper, WrapperHorizontal } from '../../../Wrapper';
import { texts, colors, secrets, namespace } from '../../../../config';
import { Button } from '../../../Button';
import { Checkbox } from '../../../Checkbox';
import { START_PROPOSAL, UPDATE_PROPOSAL } from '../../../../queries/Consul';
import { ConsulClient } from '../../../../ConsulClient';
import { LoadingSpinner } from '../../../LoadingSpinner';
import { ScreenName } from '../../../../types';
import { QUERY_TYPES } from '../../../../queries';
import { RegularText } from '../../../Text';
import { Label } from '../../../Label';
import { SafeAreaViewFlex } from '../../../SafeAreaViewFlex';

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

//  // TODO:am 25.04.2022!!!
//  imageAttributes: {
// 	title: 'Profil.png',
// 	cachedAttachment:
// 		'/Users/ardasenturk/Development/SVA/consul-bb/public/system/images/cached_attachments/user/49/original/3dfe4b17e340624be2f74f822f15e36cadd8d6e1.png'
// },
// documentsAttributes: [
// 	{
// 		title: 'sample.pdf',
// 		cachedAttachment:
// 			'/Users/ardasenturk/Development/SVA/consul-bb/public/system/documents/cached_attachments/user/49/original/f2245afb48be5f906474ad929aacb7f91f408a23.pdf'
// 	}
// ],

const showRegistrationFailAlert = () =>
  Alert.alert(texts.consul.privacyCheckRequireTitle, texts.consul.privacyCheckRequireBody);
const graphqlErr = (err) => Alert.alert('Hinweis', err);

export const NewProposal = ({ navigation, data, query }) => {
  const [termsOfService, settermsOfService] = useState(data?.termsOfService ?? false);
  const [startLoading, setStartLoading] = useState(false);
  const [tags, setTags] = useState([]);

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      title: data?.title,
      description: data?.description,
      tagList: data?.tagList?.toString(),
      summary: data?.summary,
      videoUrl: data?.videoUrl
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

  const onSubmit = async (val) => {
    let variables = {
      id: data?.id,
      attributes: {
        translationsAttributes: {
          title: val.title,
          summary: val.summary,
          description: val.description
        },
        tagList: val.tagList,
        termsOfService: termsOfService,
        videoUrl: val.videoUrl
      }
    };

    if (!termsOfService) return showRegistrationFailAlert();

    switch (query) {
      case QUERY_TYPES.CONSUL.START_PROPOSAL:
        setStartLoading(true);
        await submitProposal({
          variables: variables
        })
          .then((val) => {
            setStartLoading(false);
            navigation.navigate(ScreenName.ConsulDetailScreen, {
              query: QUERY_TYPES.CONSUL.PROPOSAL,
              queryVariables: { id: val.data.submitProposal.id },
              title: val.data.submitProposal.title
            });
          })
          .catch((err) => {
            graphqlErr(err.message);
            console.error(err.message);
            setStartLoading(false);
          });
        break;
      case QUERY_TYPES.CONSUL.UPDATE_PROPOSAL:
        setStartLoading(true);

        await updateProposal({
          variables: variables
        })
          .then((val) => {
            setStartLoading(false);
            navigation.navigate(ScreenName.ConsulDetailScreen, {
              query: QUERY_TYPES.CONSUL.PROPOSAL,
              queryVariables: { id: val.data.updateProposal.id }
            });
          })
          .catch((err) => {
            graphqlErr(err.message);
            console.error(err.message);
            setStartLoading(false);
          });
        break;
      default:
        break;
    }
  };

  if (startLoading) return <LoadingSpinner loading />;

  return (
    <SafeAreaViewFlex>
      <Wrapper>
        {INPUTS.map((item, index) => (
          <View key={index}>
            {item.type === ITEM_TYPES.INPUT && (
              <>
                <Input {...item} control={control} rules={item.rules} />
              </>
            )}

            {item.type === ITEM_TYPES.TITLE && (
              <>
                <Label>{item.title}</Label>
              </>
            )}

            {item.type === ITEM_TYPES.INFO_TEXT && (
              <>
                <RegularText smallest placeholder>
                  {item.title}
                </RegularText>
              </>
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
          </View>
        ))}

        <WrapperHorizontal>
          <Checkbox
            title={texts.consul.startNew.termsOfServiceLabel}
            link={`${secrets[namespace]?.consul.serverUrl}${secrets[namespace]?.consul.termsOfService}`}
            linkDescription={texts.consul.startNew.termsOfServiceLinkLabel}
            checkedIcon="check-square-o"
            uncheckedIcon="square-o"
            checked={termsOfService}
            onPress={() => settermsOfService(!termsOfService)}
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
    </SafeAreaViewFlex>
  );
};

NewProposal.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func
  }).isRequired,
  data: PropTypes.object,
  query: PropTypes.string
};

const styles = StyleSheet.create({
  tagContainer: {
    backgroundColor: colors.borderRgba,
    margin: 5,
    borderRadius: 5
  },
  tagText: {
    padding: 10
  }
});

const ITEM_TYPES = {
  INPUT: 'input',
  INFO_TEXT: 'infoText',
  TITLE: 'title',
  CATEGORY: 'category'
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
      required: texts.consul.startNew.leerError,
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
      required: texts.consul.startNew.leerError,
      maxLength: { value: 200, message: texts.consul.startNew.proposalSummaryInfo }
    }
  },
  {
    type: ITEM_TYPES.INFO_TEXT,
    title: texts.consul.startNew.proposalSummaryInfo
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
      required: texts.consul.startNew.leerError,
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
