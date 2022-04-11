import PropTypes from 'prop-types';
import React from 'react';
import { FlatList } from 'react-native';
import { normalize } from 'react-native-elements';

import { Title, TitleContainer, TitleShadow } from '../../Title';
import { device, texts, consts } from '../../../config';

import { ConsulDocumentListItem } from './ConsulDocumentListItem';

const text = texts.consul;
const a11yText = consts.a11yLabel;

export const ConsulDocumentList = (documents) => {
  return (
    <>
      <TitleContainer>
        <Title accessibilityLabel={`(${text.comments}) ${a11yText.heading}`}>Documents</Title>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}

      {/* Document List! */}
      <FlatList
        contentContainerStyle={{ padding: normalize(14) }}
        data={documents.documents}
        renderItem={(item) => <ConsulDocumentListItem item={item} />}
      />
    </>
  );
};

ConsulDocumentList.propTypes = {
  documents: PropTypes.array.isRequired
};
