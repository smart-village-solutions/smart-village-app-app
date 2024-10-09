import React from 'react';
import { FlatList } from 'react-native';

import { normalize, texts } from '../config';

import { SectionHeader } from './SectionHeader';
import { DocumentListItem } from './DocumentListItem';

export type DocumentTypes = {
  contentType: string;
  id: string;
  sourceUrl: { url: string };
  title: string;
};

type DocumentListTypes = {
  documents: DocumentTypes[];
};

export const DocumentList = ({ documents }: DocumentListTypes) => (
  <>
    <SectionHeader title={texts.noticeboard.documents} />
    <FlatList
      contentContainerStyle={{ padding: normalize(14) }}
      data={documents}
      renderItem={({ item }: { item: DocumentTypes }) => <DocumentListItem item={item} />}
    />
  </>
);
