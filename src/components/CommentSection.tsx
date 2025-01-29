import React, { RefObject, useCallback, useRef, useState } from 'react';
import { useMutation } from 'react-apollo';
import { Alert, Keyboard, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { colors, device, normalize, texts } from '../config';
import { momentFormat } from '../helpers';
import { useSurveyLanguages } from '../hooks';
import { COMMENT_ON_SURVEY } from '../queries/survey';
import { Survey } from '../types';

import { Button } from './Button';
import { RegularText } from './Text';
import { Wrapper } from './Wrapper';

type Props = {
  archived?: boolean;
  comments: Survey['comments'];
  isMultilingual?: boolean;
  scrollViewRef: RefObject<ScrollView>;
  surveyId: string;
};

const MAX_COMMENT_LENGTH = 5000;

export const CommentSection = ({
  archived,
  comments,
  isMultilingual,
  scrollViewRef,
  surveyId
}: Props) => {
  const refForPosition = useRef<View>(null);
  const [sendComment] = useMutation(COMMENT_ON_SURVEY);
  const [newComment, setNewComment] = useState('');

  const languages = useSurveyLanguages(isMultilingual);

  const submitComment = useCallback(() => {
    Keyboard.dismiss();

    if (newComment.length) {
      sendComment({ variables: { surveyId, message: newComment } });
      setNewComment('');
      Alert.alert(
        texts.survey.commentSubmissionAlertTitle,
        languages.map((lang) => texts.survey.commentSubmissionAlert[lang]).join('\n\n')
      );
    }
  }, [newComment, sendComment, surveyId]);

  const onFocus = () => {
    // on android the default scrolling behaviour with the keyboard avoiding view is sufficient
    if (device.platform === 'android') return;

    // on iOS trigger a scroll to the comment section headline
    refForPosition.current?.measure((_, y) => {
      scrollViewRef.current?.scrollTo({ y });
    });
  };

  const buttonTitle = languages.map((lang) => texts.survey.submitComment[lang]).join('\n');

  return (
    <>
      {(!archived || comments.length > 0) && (
        <Wrapper ref={refForPosition}>
          <RegularText big>{texts.survey.comments.de}</RegularText>
          {!!isMultilingual && (
            <RegularText big italic>
              {texts.survey.comments.pl}
            </RegularText>
          )}
        </Wrapper>
      )}
      {!archived && (
        <>
          <Wrapper noPaddingTop>
            <TextInput
              maxLength={MAX_COMMENT_LENGTH}
              multiline
              onChangeText={setNewComment}
              onFocus={onFocus}
              style={styles.textArea}
              textAlignVertical="top"
              value={newComment}
            />
            <View style={styles.limitContainer}>
              <RegularText smallest>{newComment.length + '/' + MAX_COMMENT_LENGTH}</RegularText>
            </View>
          </Wrapper>
          <Wrapper noPaddingTop>
            <Button title={buttonTitle} onPress={submitComment} />
          </Wrapper>
        </>
      )}
      {[...comments].reverse().map((comment) => {
        return (
          <Wrapper key={comment.id}>
            <RegularText smallest>
              {momentFormat(comment.createdAt, 'DD.MM.YYYY HH:mm [Uhr:]')}
            </RegularText>
            <RegularText>{comment.message}</RegularText>
          </Wrapper>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  limitContainer: {
    alignItems: 'flex-end'
  },
  textArea: {
    borderColor: colors.shadow,
    borderWidth: 1,
    height: normalize(100),
    padding: normalize(10)
  }
});
