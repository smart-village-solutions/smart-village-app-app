import { useNavigation } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback } from 'react';
import { useQuery } from 'react-apollo';
import { SectionList } from 'react-native';

import { SafeAreaViewFlex, SectionHeader, TextListItem } from '../components';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { texts } from '../config';
import { combineLanguages } from '../helpers';
import { usePullToRefetch, useSurveyLanguages } from '../hooks';
import { SURVEYS } from '../queries/survey';
import { Survey } from '../types';

const useSurveySections = () => {
  const { data: surveys, loading, refetch } = useQuery<{
    ongoing: Survey[];
    archived: Survey[];
  }>(SURVEYS, { fetchPolicy: 'cache-and-network' });

  const surveySections = [];

  if (surveys?.ongoing.length) {
    surveySections.push({ data: surveys?.ongoing, key: 'ongoing' });
  }

  if (surveys?.archived.length) {
    surveySections.push({ data: surveys?.archived, key: 'archived', title: texts.survey.archive });
  }

  return { loading, refetch, surveySections };
};

const parseSurveyToItem = (survey: Survey, languages: string[]) => {
  const langTitle = combineLanguages(languages, survey.title);

  // we know there will be at least one language for the question
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const langQuestion = combineLanguages(languages, survey.questionTitle)!;

  const title = langTitle?.length ? langTitle : langQuestion;

  return { title, routeName: 'SurveyDetail', params: { id: survey.id } };
};

const renderSectionHeader = ({
  section: { title, data }
}: {
  section: { title?: string; data: Survey[] };
}) => {
  if (!data.length || !title) return null;

  return <SectionHeader title={title} />;
};

export const SurveyOverviewScreen = () => {
  const { loading, refetch, surveySections } = useSurveySections();
  const RefreshControl = usePullToRefetch(loading, refetch);
  const languages = useSurveyLanguages();
  const navigation = useNavigation<StackNavigationProp<any>>();

  const renderSurvey = useCallback(
    ({ item: survey }: { item: Survey }) => {
      const parsedSurvey = parseSurveyToItem(survey, languages);

      return <TextListItem item={parsedSurvey} navigation={navigation} />;
    },
    [languages, navigation]
  );

  if (!surveySections.length && loading) {
    return <LoadingSpinner loading />;
  }

  return (
    <SafeAreaViewFlex>
      <SectionList
        refreshControl={RefreshControl}
        renderItem={renderSurvey}
        renderSectionHeader={renderSectionHeader}
        sections={surveySections}
      />
    </SafeAreaViewFlex>
  );
};
