import PropTypes from 'prop-types';
import React from 'react';
import { FlatList } from 'react-native';
import { normalize } from 'react-native-elements';

import { Title, TitleContainer, TitleShadow } from '../../Title';
import { device, texts, consts } from '../../../config';

import { ConsulDocumentListItem } from './ConsulDocumentListItem';

const a11yText = consts.a11yLabel;

export const ConsulDocumentList = (documents) => {
  return (
    <>
      <TitleContainer>
        <Title accessibilityLabel={`(${texts.consul.documents}) ${a11yText.heading}`}>
          {texts.consul.documents}
        </Title>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}

      <FlatList
        contentContainerStyle={{ padding: normalize(14) }}
        data={documents.documents}
        renderItem={({ item }) => <ConsulDocumentListItem documentItem={item} />}
      />
    </>
  );
};

ConsulDocumentList.propTypes = {
  documents: PropTypes.array.isRequired
};
