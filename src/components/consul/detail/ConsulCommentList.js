import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { FlatList } from 'react-native';

import { device, texts, consts } from '../../../config';
import { TitleShadow, Title, TitleContainer } from '../../Title';

import { ConsulCommentListItem } from './ConsulCommentListItem';

const text = texts.consul;
const a11yText = consts.a11yLabel;

export const ConsulCommentList = ({ commentCount, commentsData }) => {
  commentsData.sort((a, b) => parseInt(a.id) - parseInt(b.id));

  // let a = [
  //   { id: '1', parentId: null },
  //   { id: '2', parentId: '1' },
  //   { id: '3', parentId: '1' }
  // ];
  // useEffect(() => {
  //   for (let i = 0; i < a.length; i++) {
  //     const element = a[i];
  //     if (element.parentId) {
  //       a.find((data) => data.id === element.parentId);
  //     }
  //   }
  // }, []);
  // console.log(a);
  return (
    <>
      <TitleContainer>
        <Title accessibilityLabel={`(${text.comments}) ${a11yText.heading}`}>
          {commentCount > 1 ? text.comments : text.comment} ({commentCount})
        </Title>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}
      <FlatList
        data={commentsData}
        renderItem={(item, index) => <ConsulCommentListItem item={item} index={index} />}
      />
    </>
  );
};

ConsulCommentList.propTypes = {
  commentsData: PropTypes.array.isRequired,
  commentCount: PropTypes.number
};
