import PropTypes from 'prop-types';
import React from 'react';
import { FlatList } from 'react-native';

import { texts } from '../../../config';
import { Wrapper, WrapperRow } from '../../Wrapper';
import { SectionHeader } from '../../SectionHeader';

import { ConsulTagListItem } from './ConsulTagListItem';

export const ConsulTagList = ({ tags, onPress }) => {
  return (
    <>
      <SectionHeader title={texts.consul.tags} />
      <Wrapper>
        <WrapperRow>
          <FlatList
            showsHorizontalScrollIndicator={false}
            horizontal
            data={tags}
            renderItem={({ item, index }) => (
              <ConsulTagListItem onPress={onPress} tagItem={item} index={index} />
            )}
          />
        </WrapperRow>
      </Wrapper>
    </>
  );
};

ConsulTagList.propTypes = {
  onPress: PropTypes.object,
  tags: PropTypes.array.isRequired
};
