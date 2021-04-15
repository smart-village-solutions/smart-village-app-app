import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../../config';
import { OrganizationPreviewData } from '../../../types';
import { OParlPreviewEntry } from './OParlPreviewEntry';

type Props = {
  data: OrganizationPreviewData;
  navigation: NavigationScreenProp<never>;
};

export const OrganizationPreview = ({ data, navigation }: Props) => {
  const { id, type, classification, name, shortName } = data;

  const title = name || shortName || classification || texts.oparl.organization.organization;

  return <OParlPreviewEntry id={id} type={type} title={title} navigation={navigation} />;

  // return (
  //   <OParlPreviewWrapper id={id} navigation={navigation}>
  //     <Wrapper>
  //       <RegularText numberOfLines={1} primary lineThrough={deleted}>
  //         {name || shortName || classification || texts.oparl.organization.organization}
  //       </RegularText>
  //     </Wrapper>
  //   </OParlPreviewWrapper>
  // );
};
