import PropTypes from 'prop-types';
import React from 'react';

import { SafeAreaViewFlex } from '../../../SafeAreaViewFlex';
import { Title, TitleContainer, TitleShadow } from '../../../Title';
import { Wrapper, WrapperWithOrientation } from '../../../Wrapper';
import { consts, device, texts } from '../../../../config';
import { ConsulCommentListItem } from '../../../Consul/detail/ConsulCommentListItem';

const text = texts.consul;
const a11yText = consts.a11yLabel;

/* NOTE: we need to check a lot for presence, so this is that complex */
export const UserCommentDetail = ({ listData, onRefresh }) => {
  return (
    <SafeAreaViewFlex>
      <WrapperWithOrientation>
        <TitleContainer>
          <Title accessibilityLabel={`(${text.comments}) ${a11yText.heading}`}>
            {text.comment}
          </Title>
        </TitleContainer>
        {device.platform === 'ios' && <TitleShadow />}

        <Wrapper>
          <ConsulCommentListItem item={{ item: listData.comment }} onRefresh={onRefresh} />
        </Wrapper>
      </WrapperWithOrientation>
    </SafeAreaViewFlex>
  );
};

UserCommentDetail.propTypes = {
  listData: PropTypes.object.isRequired,
  onRefresh: PropTypes.func
};
