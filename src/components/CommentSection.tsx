import React, { useCallback, useState } from 'react';
import { RefObject } from 'react';
import { useRef } from 'react';
import { useMutation } from 'react-apollo';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { normalize } from 'react-native-elements';

import { colors, device, texts } from '../config';
import { COMMENT_ON_SURVEY } from '../queries/survey';
import { Survey } from '../types';

import { Button } from './Button';
import { RegularText } from './Text';
import { Wrapper } from './Wrapper';

type Props = {
  archived?: boolean;
  comments: Survey['surveyComments'];
  scrollViewRef: RefObject<ScrollView>;
  surveyId: string;
};

export const CommentSection = ({ archived, comments, scrollViewRef, surveyId }: Props) => {
  const refForPosition = useRef<View>(null);
  const [sendComment] = useMutation(COMMENT_ON_SURVEY);
  const [newComment, setNewComment] = useState('');

  const submitComment = useCallback(() => {
    setNewComment('');
    sendComment({ variables: { surveyId, message: newComment } });
    Alert.alert(
      texts.survey.commentSubmissionAlert.de + '\n\n' + texts.survey.commentSubmissionAlert.pl
    );
  }, [newComment, sendComment, surveyId]);

  const onFocus = () => {
    // on android the default scrolling behaviour with the keyboard avoiding view is sufficient
    if (device.platform === 'android') return;

    // on iOS trigger a scroll to the comment section headline
    refForPosition.current?.measure((_, y) => {
      scrollViewRef.current?.scrollTo({ y });
    });
  };

  const buttonTitle = texts.survey.submitComment.de + '\n' + texts.survey.submitComment.pl;

  return (
    <>
      {(!archived || comments.length > 0) && (
        <Wrapper ref={refForPosition}>
          <RegularText big>{texts.survey.comments.de}</RegularText>
          <RegularText big italic>
            {texts.survey.comments.pl}
          </RegularText>
        </Wrapper>
      )}
      {!archived && (
        <Wrapper>
          <TextInput
            onFocus={onFocus}
            multiline
            onChangeText={setNewComment}
            style={styles.textArea}
            textAlignVertical="top"
            value={newComment}
          />
          <Button title={buttonTitle} onPress={submitComment} />
        </Wrapper>
      )}
      {comments.map((comment) => {
        return (
          <Wrapper key={comment.id}>
            {/* TODO: add date here instead of comment id */}
            <RegularText small>{typeof comment.id}</RegularText>
            <RegularText>{comment.message}</RegularText>
          </Wrapper>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  textArea: {
    borderColor: colors.shadow,
    borderWidth: 1,
    height: normalize(100),
    marginBottom: normalize(30),
    padding: normalize(10)
  }
});
