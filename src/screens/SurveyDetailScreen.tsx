import { RouteProp } from '@react-navigation/core';
import React, { useRef } from 'react';
import { useQuery } from 'react-apollo';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  BoldText,
  Button,
  CommentSection,
  DefaultKeyboardAvoidingView,
  RegularText,
  Results,
  SafeAreaViewFlex,
  SectionHeader,
  SurveyAnswer,
  Wrapper,
  WrapperRow,
  WrapperWithOrientation
} from '../components';
import { texts } from '../config';
import { combineLanguages, momentFormat } from '../helpers';
import { useAnswerSelection, usePullToRefetch, useSurveyLanguages } from '../hooks';
import { DETAILED_SURVEY } from '../queries/survey';
import { Survey } from '../types';

type Props = {
  route: RouteProp<any, any>;
};

const DateComponent = ({ start, date }: { start?: boolean; date: string }) => {
  return (
    <Wrapper style={styles.noPaddingBottom}>
      <WrapperRow center spaceBetween>
        <View>
          <RegularText small>
            {start ? texts.survey.dateStart.de : texts.survey.dateEnd.de}
          </RegularText>
          <RegularText italic small>
            {start ? texts.survey.dateStart.pl : texts.survey.dateEnd.pl}
          </RegularText>
        </View>
        <RegularText>{momentFormat(date)}</RegularText>
      </WrapperRow>
    </Wrapper>
  );
};

const useSurvey = (id?: string) => {
  const { data, loading, refetch } = useQuery<{ surveys: Survey[] }>(DETAILED_SURVEY, {
    fetchPolicy: 'cache-and-network',
    variables: { id },
    skip: !id?.length
  });

  return { loading, refetch, survey: data?.surveys[0] };
};

// eslint-disable-next-line complexity
export const SurveyDetailScreen = ({ route }: Props) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const archived = route.params?.archived;
  const surveyId = route.params?.id;
  const { loading, refetch, survey } = useSurvey(surveyId);
  const languages = useSurveyLanguages();
  const { previousSubmission, selection, setSelection, submitSelection } = useAnswerSelection(
    surveyId,
    refetch
  );

  const RefreshControl = usePullToRefetch(loading, refetch);

  if (!survey) {
    return null;
  }

  const title = combineLanguages(languages, survey.title);
  const questionTitle = combineLanguages(languages, survey.questionTitle);

  const shownTitle = title?.length ? title : questionTitle;

  const buttonText = previousSubmission
    ? texts.survey.changeAnswer.de + '\n' + texts.survey.changeAnswer.pl
    : texts.survey.submitAnswer.de + '\n' + texts.survey.submitAnswer.pl;

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView refreshControl={RefreshControl} ref={scrollViewRef}>
          <WrapperWithOrientation>
            {!!shownTitle?.length && <SectionHeader title={shownTitle} />}
            <DateComponent start date={survey.date.dateStart} />
            <DateComponent date={survey.date.dateEnd} />
            {!!survey.description?.[languages[0]]?.length && (
              <Wrapper style={styles.noPaddingBottom}>
                <RegularText>{survey.description[languages[0]]}</RegularText>
                {!!survey.description?.[languages[1]]?.length && (
                  <RegularText italic>{survey.description[languages[1]]}</RegularText>
                )}
              </Wrapper>
            )}
            {!!survey.questionTitle?.[languages[0]]?.length && !!title?.length && (
              <Wrapper style={styles.noPaddingBottom}>
                <BoldText>{survey.questionTitle?.[languages[0]]}</BoldText>
                <BoldText italic>{survey.questionTitle?.[languages[1]]}</BoldText>
              </Wrapper>
            )}
            {survey.responseOptions.map((responseOption, index) => (
              <SurveyAnswer
                archived={archived}
                faded={!!selection && selection !== responseOption.id}
                index={index}
                responseOption={responseOption}
                selected={selection === responseOption.id}
                setSelection={setSelection}
                key={responseOption.id}
              />
            ))}
            {!archived && (
              <>
                <Wrapper>
                  <Button
                    disabled={
                      !selection || (!!previousSubmission && selection === previousSubmission)
                    }
                    title={buttonText}
                    onPress={submitSelection}
                  />
                </Wrapper>
                {!previousSubmission && (
                  <Wrapper style={styles.noPaddingBottom}>
                    <RegularText error small>
                      {texts.survey.hint.de}
                    </RegularText>
                    <RegularText error italic small>
                      {texts.survey.hint.pl}
                    </RegularText>
                  </Wrapper>
                )}
              </>
            )}
            {(previousSubmission || archived) && (
              <Results
                responseOptions={survey.responseOptions}
                selectedOption={previousSubmission}
              />
            )}
            <CommentSection
              archived={archived}
              comments={survey.surveyComments}
              scrollViewRef={scrollViewRef}
              surveyId={surveyId}
            />
          </WrapperWithOrientation>
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  noPaddingBottom: {
    paddingBottom: 0
  }
});
