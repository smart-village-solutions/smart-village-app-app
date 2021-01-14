import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { formatSize } from '../../../helpers';
import { FilePreviewData } from '../../../types';
import { RegularText } from '../../Text';
import { WrapperRow } from '../../Wrapper';
import { OParlItemPreview } from './OParlItemPreview';

type Props = { navigation: NavigationScreenProp<never> } & FilePreviewData;

export const FilePreview = ({
  id,
  accessUrl,
  fileName,
  mimeType,
  name,
  navigation,
  size
}: Props) => {
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
