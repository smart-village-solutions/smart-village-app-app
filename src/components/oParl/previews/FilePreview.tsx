import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { formatSize } from '../../../helpers';
import { FilePreviewData } from '../../../types';
import { RegularText } from '../../Text';
import { WrapperRow } from '../../Wrapper';
import { OParlItemPreview } from './OParlItemPreview';

type Props = {
  data: FilePreviewData;
  navigation: NavigationScreenProp<never>;
};

export const FilePreview = ({ data, navigation }: Props) => {
  const { id, accessUrl, fileName, mimeType, name, size } = data;

  return (
    <OParlItemPreview id={id} navigation={navigation}>
      <RegularText numberOfLines={1} primary>
        {name || fileName || accessUrl}
      </RegularText>
      <WrapperRow>
        {!!mimeType && <RegularText>{`(${mimeType})`}</RegularText>}
        {!!size && <RegularText>{formatSize(size)}</RegularText>}
      </WrapperRow>
    </OParlItemPreview>
  );
};
