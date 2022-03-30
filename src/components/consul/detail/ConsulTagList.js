import PropTypes from 'prop-types';
import React from 'react';
import { FlatList } from 'react-native';

import { Title, TitleContainer, TitleShadow } from '../../Title';
import { Wrapper, WrapperRow } from '../../Wrapper';
import { device, texts, consts } from '../../../config';

import { ConsulTagListItem } from './ConsulTagListItem';

const text = texts.consul;
const a11yText = consts.a11yLabel;

export const ConsulTagList = ({ tags, onPress }) => {
  return (
    <>
      <TitleContainer>
        <Title accessibilityLabel={`(${text.tags}) ${a11yText.heading}`}>{text.tags}</Title>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}

      <Wrapper>
        <WrapperRow>
          <FlatList
            showsHorizontalScrollIndicator={false}
            horizontal
            data={tags}
            renderItem={(item, index) => (
              <ConsulTagListItem onPress={onPress} item={item} index={index} />
            )}
          />
        </WrapperRow>
      </Wrapper>
    </>
  );
};

ConsulTagList.propTypes = {
  tags: PropTypes.array.isRequired,
  onPress: PropTypes.object
};
