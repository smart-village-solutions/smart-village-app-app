import PropTypes from 'prop-types';
import React from 'react';
import { FlatList } from 'react-native';

import { normalize, texts } from '../../../config';
import { SectionHeader } from '../../SectionHeader';

import { ConsulDocumentListItem } from './ConsulDocumentListItem';

export const ConsulDocumentList = (documents) => {
  return (
    <>
      <SectionHeader title={texts.consul.documents} />
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
