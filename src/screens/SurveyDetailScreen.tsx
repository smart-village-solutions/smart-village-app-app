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
  SurveyText,
  Wrapper,
  WrapperRow
} from '../components';
import { texts } from '../config';
import { combineLanguages, momentFormat } from '../helpers';
import { useAnswerSelection, usePullToRefetch, useSurveyLanguages } from '../hooks';
import { DETAILED_SURVEY } from '../queries/survey';
import { Survey } from '../types';

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  route: RouteProp<any, any>;
};

const DateComponent = ({
  start,
  date,
  isMultilingual
}: {
  start?: boolean;
  date: string;
  isMultilingual?: boolean;
}) => {
  return (
    <Wrapper style={styles.noPaddingBottom}>
      <WrapperRow center spaceBetween>
        <View>
          <RegularText small>
            {start ? texts.survey.dateStart.de : texts.survey.dateEnd.de}
          </RegularText>
          {!!isMultilingual && (
            <RegularText italic small>
              {start ? texts.survey.dateStart.pl : texts.survey.dateEnd.pl}
            </RegularText>
          )}
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
  const { refetch, survey } = useSurvey(surveyId);
  const languages = useSurveyLanguages(survey?.isMultilingual);
  const { previousSubmission, selection, setSelection, submitSelection } = useAnswerSelection(
    surveyId,
    refetch
  );

  const RefreshControl = usePullToRefetch(refetch);

  if (!survey) {
    return null;
  }

  const title = combineLanguages(languages, survey.title);
  const questionTitle = combineLanguages(languages, survey.questionTitle);

  const shownTitle = title?.length ? title : questionTitle;

  const buttonText = previousSubmission?.length
    ? languages.map((lang) => texts.survey.changeAnswer[lang]).join('\n')
    : languages.map((lang) => texts.survey.submitAnswer[lang]).join('\n');

  const isButtonDisabled =
    !selection.length ||
    (selection.length === previousSubmission.length &&
      selection.reduce<boolean>((value, id) => {
        return value && previousSubmission.includes(id);
      }, true));

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          refreshControl={RefreshControl}
          ref={scrollViewRef}
        >
          {!!shownTitle?.length && <SectionHeader title={shownTitle} />}
          {!!survey.date?.dateStart && (
            <DateComponent
              date={survey.date.dateStart}
              isMultilingual={survey.isMultilingual}
              start
            />
          )}
          {!!survey.date?.dateEnd && (
            <DateComponent date={survey.date.dateEnd} isMultilingual={survey.isMultilingual} />
          )}
          {!!survey.description?.[languages[0]]?.length && (
            <Wrapper style={styles.noPaddingBottom}>
              <SurveyText content={survey.description[languages[0]]} />
              {!!survey.description?.[languages[1]]?.length && (
                <SurveyText content={survey.description[languages[1]]} italic />
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
              faded={(!!selection.length && !selection.includes(responseOption.id)) || archived}
              index={index}
              isMultilingual={survey.isMultilingual}
              isMultiSelect={survey.questionAllowMultipleResponses}
              responseOption={responseOption}
              selected={selection.includes(responseOption.id)}
              setSelection={setSelection}
              key={responseOption.id}
            />
          ))}
          {!archived && (
            <>
              <Wrapper>
                {!!survey.questionAllowMultipleResponses && (
                  <>
                    <RegularText center error>
                      {texts.survey.multiSelectPossible.de}
                    </RegularText>
                    {!!survey.isMultilingual && (
                      <RegularText center error italic>
                        {texts.survey.multiSelectPossible.pl}
                      </RegularText>
                    )}
                    <RegularText />
                  </>
                )}
                <Button disabled={isButtonDisabled} title={buttonText} onPress={submitSelection} />
              </Wrapper>
              {!previousSubmission.length && (
                <Wrapper style={styles.noPaddingBottom}>
                  <RegularText error small>
                    {texts.survey.hint.de}
                  </RegularText>
                  {!!survey?.isMultilingual && (
                    <RegularText error italic small>
                      {texts.survey.hint.pl}
                    </RegularText>
                  )}
                </Wrapper>
              )}
            </>
          )}
          {(previousSubmission.length || archived) && (
            <Results
              isMultilingual={survey.isMultilingual}
              responseOptions={survey.responseOptions}
              selectedOptions={previousSubmission}
            />
          )}

          {!!survey.canComment && (
            <CommentSection
              archived={archived}
              comments={survey.comments}
              isMultilingual={survey.isMultilingual}
              scrollViewRef={scrollViewRef}
              surveyId={surveyId}
            />
          )}
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
