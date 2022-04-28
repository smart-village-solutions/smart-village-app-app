import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useMutation } from 'react-apollo';
import { useForm } from 'react-hook-form';
import { Alert, StyleSheet } from 'react-native';

import { namespace, secrets, texts } from '../../../../config';
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

export const NewDebate = ({ navigation, data, query }) => {
  const [termsOfService, setTermsOfService] = useState(data?.termsOfService ?? false);
  const [startLoading, setStartLoading] = useState(false);

  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm({
    defaultValues: {
      title: data?.title,
      description: data?.description,
      tagList: data?.tagList?.toString()
    }
  });

  const [startDebate] = useMutation(START_DEBATE, {
    client: ConsulClient
  });
  const [updateDebate] = useMutation(UPDATE_DEBATE, {
    client: ConsulClient
  });

  const onSubmit = async (val) => {
    let variables = {
      id: data?.id,
      attributes: {
        translationsAttributes: {
          title: val.title,
          description: val.description
        },
        tagList: val.tagList,
        termsOfService: termsOfService
      }
    };

    if (!termsOfService) return showRegistrationFailAlert();

    switch (query) {
      case QUERY_TYPES.CONSUL.START_DEBATE:
        setStartLoading(true);

        try {
          await startDebate({ variables });
          setStartLoading(false);

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
          setStartLoading(false);
        }
        break;
      case QUERY_TYPES.CONSUL.UPDATE_DEBATE:
        setStartLoading(true);

        try {
          let data = await updateDebate({ variables });
          setStartLoading(false);

          navigation.navigate(ScreenName.ConsulDetailScreen, {
            query: QUERY_TYPES.CONSUL.DEBATE,
            queryVariables: { id: data.data.updateDebate.id }
          });
        } catch (error) {
          graphqlErr(error.message);
          console.error(error.message);
          setStartLoading(false);
        }
        break;
      default:
        break;
    }
  };

  if (startLoading) return <LoadingSpinner loading />;

  return (
    <>
      {INPUTS.map((item, index) => (
        <Wrapper key={index} style={styles.noPaddingTop}>
          <Input
            control={control}
            {...item}
            validate={item.rules.required}
            errorMessage={errors[item.name] && `${errors[item.name].message}`}
          />
        </Wrapper>
      ))}

      <Wrapper style={styles.noPaddingTop}>
        <WrapperHorizontal>
          <Checkbox
            title={texts.consul.startNew.termsOfServiceLabel}
            link={`${secrets[namespace]?.consul.serverUrl}${secrets[namespace]?.consul.termsOfService}`}
            linkDescription={texts.consul.startNew.termsOfServiceLinkLabel}
            checkedIcon="check-square-o"
            uncheckedIcon="square-o"
            checked={termsOfService}
            onPress={() => setTermsOfService(!termsOfService)}
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
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func
  }).isRequired,
  data: PropTypes.object,
  query: PropTypes.string
};

const INPUTS = [
  {
    name: 'title',
    label: texts.consul.startNew.newDebateTitleLabel,
    placeholder: texts.consul.startNew.newDebateTitleLabel,
    keyboardType: 'default',
    textContentType: 'none',
    autoCompleteType: 'off',
    autoCapitalize: 'none',
    rules: {
      required: texts.consul.startNew.leerError,
      minLength: { value: 4, message: 'ist zu kurz (minimum 4 Zeichen)' }
    }
  },
  {
    name: 'description',
    multiline: true,
    minHeight: 150,
    label: texts.consul.startNew.newDebateDescriptionLabel,
    placeholder: texts.consul.startNew.newDebateDescriptionLabel,
    keyboardType: 'default',
    textContentType: 'none',
    autoCompleteType: 'off',
    autoCapitalize: 'none',
    rules: {
      required: texts.consul.startNew.leerError,
      minLength: { value: 10, message: 'ist zu kurz (minimum 10 Zeichen)' }
    }
  },
  {
    name: 'tagList',
    multiline: true,
    label: texts.consul.startNew.tags,
    placeholder: texts.consul.startNew.newDebateTagLabel,
    keyboardType: 'default',
    textContentType: 'none',
    autoCompleteType: 'off',
    autoCapitalize: 'none',
    rules: { required: false }
  }
];
