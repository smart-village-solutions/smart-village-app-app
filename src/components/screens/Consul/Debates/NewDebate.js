import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-apollo';

import { Input } from '../../../Consul';
import { Wrapper, WrapperHorizontal } from '../../../Wrapper';
import { texts, consul } from '../../../../config';
import { Button } from '../../../Button';
import { Checkbox } from '../../../Checkbox';
import { START_DEBATE, UPDATE_DEBATE } from '../../../../queries/Consul';
import { ConsulClient } from '../../../../ConsulClient';
import { LoadingSpinner } from '../../../LoadingSpinner';
import { ScreenName } from '../../../../types';
import { QUERY_TYPES } from '../../../../queries';
import { SafeAreaViewFlex } from '../../../SafeAreaViewFlex';

const showRegistrationFailAlert = () =>
  Alert.alert(texts.consul.privacyCheckRequireTitle, texts.consul.privacyCheckRequireBody);
const graphqlErr = (err) => Alert.alert('Hinweis', err);

export const NewDebate = ({ navigation, data, query }) => {
  const [termsOfService, settermsOfService] = useState(data?.termsOfService ?? false);
  const [startLoading, setStartLoading] = useState(false);

  const { control, handleSubmit } = useForm({
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
      case QUERY_TYPES.CONSUL.UPDATE_DEBATE:
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
    <SafeAreaViewFlex>
      <Wrapper>
        {Inputs.map((item, index) => (
          <View key={index}>
            <Input {...item} control={control} rules={item.rules} />
          </View>
        ))}

        <WrapperHorizontal>
          <Checkbox
            title={texts.consul.startNew.termsOfServiceLabel}
            link={consul.serverUrl + consul.termsOfService}
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
              query === QUERY_TYPES.CONSUL.START_DEBATE
                ? texts.consul.startNew.newDebateStartButtonLabel
                : texts.consul.startNew.updateButtonLabel
            }
          />
        </Wrapper>
      </Wrapper>
    </SafeAreaViewFlex>
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
    label: texts.consul.startNew.newDebateTitleLabel,
    placeholder: texts.consul.startNew.newDebateTitleLabel,
    keyboardType: 'default',
    textContentType: 'none',
    autoCompleteType: 'off',
    autoCapitalize: 'none',
    rules: {
      required: texts.consul.startNew.emailError,
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
      required: texts.consul.startNew.emailError,
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
