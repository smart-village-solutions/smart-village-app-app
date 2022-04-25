import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-apollo';

import { Input } from '../../../Consul';
import { Wrapper } from '../../../Wrapper';
import { texts } from '../../../../config';
import { Button } from '../../../Button';
import { Checkbox } from '../../../Checkbox';
import { START_DEBATE } from '../../../../queries/Consul';
import { ConsulClient } from '../../../../ConsulClient';
import { LoadingSpinner } from '../../../LoadingSpinner';
import { ScreenName } from '../../../../types';
import { QUERY_TYPES } from '../../../../queries';
import { UPDATE_DEBATE } from '../../../../queries/Consul/Debates/updateDebate';

const text = texts.consul.startNew;
const queryTypes = QUERY_TYPES.CONSUL;

// Alerts
const showRegistrationFailAlert = () =>
  Alert.alert(texts.consul.privacyCheckRequireTitle, texts.consul.privacyCheckRequireBody);
const graphqlErr = (err) => Alert.alert('Hinweis', err);

export const NewDebate = ({ navigation, data, query }) => {
  const [termsOfService, settermsOfService] = useState(data?.termsOfService ?? false);
  const [startLoading, setStartLoading] = useState(false);

  // React Hook Form
  const { control, handleSubmit } = useForm({
    defaultValues: {
      title: data?.title,
      description: data?.description,
      tagList: data?.tagList?.toString()
    }
  });

  // GraphQL
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
      case queryTypes.START_DEBATE:
        setStartLoading(true);
        await startDebate({
          variables: variables
        })
          .then((val) => {
            setStartLoading(false);
            navigation.navigate(ScreenName.ConsulDetailScreen, {
              query: QUERY_TYPES.CONSUL.DEBATE,
              queryVariables: { id: val.data.startDebate.id },
              title: val.data.startDebate.title
            });
          })
          .catch((err) => {
            graphqlErr(err.message);
            console.error(err.message);
            setStartLoading(false);
          });
        break;
      case queryTypes.UPDATE_DEBATE:
        setStartLoading(true);
        await updateDebate({
          variables: variables
        })
          .then((val) => {
            setStartLoading(false);
            navigation.navigate(ScreenName.ConsulDetailScreen, {
              query: QUERY_TYPES.CONSUL.DEBATE,
              queryVariables: { id: val.data.updateDebate.id }
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
    <Wrapper>
      {Inputs.map((item, index) => (
        <Input key={index} {...item} control={control} rules={item.rules} />
      ))}
      <Checkbox
        title={text.termsOfServiceLabel}
        link={'https://beteiligung.bad-belzig.de/conditions'}
        linkDescription="Allgemeine Nutzungsbedingungen"
        checkedIcon="check-square-o"
        uncheckedIcon="square-o"
        checked={termsOfService}
        onPress={() => settermsOfService(!termsOfService)}
      />
      <Button
        onPress={handleSubmit(onSubmit)}
        title={
          query === queryTypes.START_DEBATE
            ? text.newDebateStartButtonLabel
            : text.updateButtonLabel
        }
      />
    </Wrapper>
  );
};

NewDebate.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func
  }).isRequired,
  data: PropTypes.object,
  query: PropTypes.string
};

const Inputs = [
  {
    name: 'title',
    label: text.newDebateTitleLabel,
    placeholder: text.newDebateTitleLabel,
    keyboardType: 'default',
    textContentType: 'none',
    autoCompleteType: 'off',
    autoCapitalize: 'none',
    rules: {
      required: text.emailError,
      minLength: { value: 4, message: 'ist zu kurz (minimum 4 Zeichen)' }
    }
  },
  {
    name: 'description',
    multiline: true,
    label: text.newDebateDescriptionLabel,
    placeholder: text.newDebateDescriptionLabel,
    keyboardType: 'default',
    textContentType: 'none',
    autoCompleteType: 'off',
    autoCapitalize: 'none',
    rules: {
      required: text.emailError,
      minLength: { value: 10, message: 'ist zu kurz (minimum 10 Zeichen)' }
    }
  },
  {
    name: 'tagList',
    label: text.newDebateTagLabel,
    placeholder: text.newDebateTagLabel,
    keyboardType: 'default',
    textContentType: 'none',
    autoCompleteType: 'off',
    autoCapitalize: 'none',
    rules: { required: false }
  }
];
