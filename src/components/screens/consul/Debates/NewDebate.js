import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useMutation } from 'react-apollo';
import { useForm } from 'react-hook-form';
import { Alert, StyleSheet } from 'react-native';

import { colors, Icon, namespace, normalize, secrets, texts } from '../../../../config';
import { ConsulClient } from '../../../../ConsulClient';
import { QUERY_TYPES } from '../../../../queries';
import { START_DEBATE, UPDATE_DEBATE } from '../../../../queries/consul';
import { ScreenName } from '../../../../types';
import { Button } from '../../../Button';
import { Checkbox } from '../../../Checkbox';
import { Input } from '../../../form';
import { LoadingSpinner } from '../../../LoadingSpinner';
import { Wrapper, WrapperHorizontal } from '../../../Wrapper';

const showRegistrationFailAlert = () =>
  Alert.alert(texts.consul.privacyCheckRequireTitle, texts.consul.privacyCheckRequireBody);
const graphqlErr = (err) => Alert.alert('Hinweis', err);

const INPUTS = [
  {
    autoCapitalize: 'none',
    autoCompleteType: 'off',
    keyboardType: 'default',
    label: texts.consul.startNew.newDebateTitleLabel,
    name: 'title',
    placeholder: texts.consul.startNew.newDebateTitleLabel,
    rules: {
      required: texts.consul.startNew.emptyError,
      minLength: { value: 4, message: 'ist zu kurz (minimum 4 Zeichen)' }
    },
    textContentType: 'none'
  },
  {
    autoCapitalize: 'none',
    autoCompleteType: 'off',
    keyboardType: 'default',
    label: texts.consul.startNew.newDebateDescriptionLabel,
    minHeight: normalize(150),
    multiline: true,
    textAlignVertical: 'top',
    name: 'description',
    placeholder: texts.consul.startNew.newDebateDescriptionLabel,
    rules: {
      required: texts.consul.startNew.emptyError,
      minLength: { value: 10, message: 'ist zu kurz (minimum 10 Zeichen)' }
    },
    textContentType: 'none'
  },
  {
    autoCapitalize: 'none',
    autoCompleteType: 'off',
    keyboardType: 'default',
    label: texts.consul.startNew.tags,
    maxHeight: normalize(50),
    multiline: true,
    name: 'tagList',
    placeholder: texts.consul.startNew.newDebateTagLabel,
    rules: { required: false },
    textContentType: 'none'
  }
];

export const NewDebate = ({ navigation, data, query }) => {
  const [hasAcceptedTermsOfService, setHasAcceptedTermsOfService] = useState(
    data?.termsOfService ?? false
  );
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm({
    defaultValues: {
      title: data?.title || '',
      description: data?.description || '',
      tagList: data?.tagList?.toString() || ''
    }
  });

  const [startDebate] = useMutation(START_DEBATE, {
    client: ConsulClient
  });
  const [updateDebate] = useMutation(UPDATE_DEBATE, {
    client: ConsulClient
  });

  const onSubmit = async (newDebateData) => {
    let variables = {
      id: data?.id,
      attributes: {
        translationsAttributes: {
          title: newDebateData?.title,
          description: newDebateData?.description
        },
        tagList: newDebateData?.tagList,
        termsOfService: hasAcceptedTermsOfService
      }
    };

    if (!hasAcceptedTermsOfService) return showRegistrationFailAlert();

    switch (query) {
      case QUERY_TYPES.CONSUL.START_DEBATE:
        setIsLoading(true);

        try {
          await startDebate({ variables });
          setIsLoading(false);

          navigation.navigate(ScreenName.ConsulIndexScreen, {
            title: texts.consul.homeScreen.debates,
            query: QUERY_TYPES.CONSUL.DEBATES,
            queryVariables: {
              limit: 15,
              order: 'name_ASC',
              category: texts.consul.homeScreen.debates
            },
            rootRouteName: ScreenName.ConsulHomeScreen
          });
        } catch (error) {
          graphqlErr(error.message);
          console.error(error.message);
          setIsLoading(false);
        }
        break;
      case QUERY_TYPES.CONSUL.UPDATE_DEBATE:
        setIsLoading(true);

        try {
          let data = await updateDebate({ variables });
          setIsLoading(false);

          navigation.navigate(ScreenName.ConsulDetailScreen, {
            query: QUERY_TYPES.CONSUL.DEBATE,
            queryVariables: { id: data.data.updateDebate.id }
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
          <Input
            control={control}
            {...item}
            validate={item.rules.required}
            errorMessage={errors[item.name] && errors[item.name].message}
          />
        </Wrapper>
      ))}

      <Wrapper style={styles.noPaddingTop}>
        <WrapperHorizontal>
          <Checkbox
            checked={hasAcceptedTermsOfService}
            checkedIcon={<Icon.SquareCheckFilled />}
            link={`${secrets[namespace]?.consul?.serverUrl}${secrets[namespace]?.consul?.termsOfService}`}
            linkDescription={texts.consul.startNew.termsOfServiceLinkLabel}
            onPress={() => setHasAcceptedTermsOfService(!hasAcceptedTermsOfService)}
            title={texts.consul.startNew.termsOfServiceLabel}
            uncheckedIcon={<Icon.Square color={colors.placeholder} />}
          />
        </WrapperHorizontal>

        <Wrapper>
          <Button
            onPress={handleSubmit(onSubmit)}
            title={
              query === QUERY_TYPES.CONSUL.START_DEBATE
                ? texts.consul.startNew.newDebateStartButtonLabel
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
  }
});

NewDebate.propTypes = {
  data: PropTypes.object,
  navigation: PropTypes.object.isRequired,
  query: PropTypes.string
};
