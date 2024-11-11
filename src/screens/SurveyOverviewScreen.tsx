import { useNavigation } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback } from 'react';
import { useQuery } from 'react-apollo';
import { SectionList, StyleSheet, View } from 'react-native';

import { SafeAreaViewFlex, SectionHeader, TextListItem, WrapperHorizontal } from '../components';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { normalize, texts } from '../config';
import { combineLanguages } from '../helpers';
import { usePullToRefetch, useStaticContent, useSurveyLanguages } from '../hooks';
import { SURVEYS } from '../queries/survey';
import { Survey } from '../types';

import { ListHeaderComponent } from './NestedInfoScreen';

type Props = {
  route: {
    params?: {
      additionalProps?: {
        htmlName?: string;
      };
    };
  };
};

const useSurveySections = () => {
  const {
    data: surveys,
    loading,
    refetch
  } = useQuery<{
    ongoing: Survey[];
    archived: Survey[];
  }>(SURVEYS, { fetchPolicy: 'cache-and-network' });

  const surveySections = [];

  if (surveys?.ongoing.length) {
    surveySections.push({ data: surveys?.ongoing, key: 'ongoing' });
  }

  if (surveys?.archived.length) {
    surveySections.push({
      data: surveys?.archived.map((survey) => ({ ...survey, archived: true })),
      key: 'archived',
      title: texts.survey.archive
    });
  }

  return { loading, refetch, surveySections };
};

const parseSurveyToItem = (survey: Survey & { archived?: true }, languages: string[]) => {
  const languagesForSurvey = survey.isMultilingual ? languages : [languages[0]];
  const langTitle = combineLanguages(languagesForSurvey, survey.title);

  // we know there will be at least one language for the question
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const langQuestion = combineLanguages(languagesForSurvey, survey.questionTitle)!;

  const title = langTitle?.length ? langTitle : langQuestion;

  return { title, routeName: 'SurveyDetail', params: { id: survey.id, archived: survey.archived } };
};

const renderSectionHeader = ({
  section: { title, data }
}: {
  section: { title?: string; data: Survey[] };
}) => {
  if (!data.length || !title) return null;

  return (
    <>
      <View style={{ height: normalize(20) }} />
      <SectionHeader title={title} />
    </>
  );
};

export const SurveyOverviewScreen = ({ route }: Props) => {
  const { loading, refetch, surveySections } = useSurveySections();
  const RefreshControl = usePullToRefetch(refetch);
  const languages = useSurveyLanguages();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { additionalProps } = route.params ?? {};

  const { data: dataHtml, loading: loadingHtml } = useStaticContent<string>({
    name: additionalProps?.htmlName,
    type: 'html',
    refreshTimeKey: `publicHtmlFile-${additionalProps?.htmlName}`,
    skip: !additionalProps?.htmlName
  });

  const renderSurvey = useCallback(
    ({ item: survey }: { item: Survey }) => {
      const parsedSurvey = parseSurveyToItem(survey, languages);

      return (
        <WrapperHorizontal>
          <TextListItem item={parsedSurvey} navigation={navigation} />
        </WrapperHorizontal>
      );
    },
    [languages, navigation]
  );

  if (!surveySections.length && loading) {
    return <LoadingSpinner loading />;
  }

  return (
    <SafeAreaViewFlex>
      <SectionList
        ListHeaderComponent={
          <WrapperHorizontal>
            <ListHeaderComponent
              html={dataHtml}
              loading={loadingHtml}
              navigation={navigation}
              navigationTitle=""
            />
          </WrapperHorizontal>
        }
        refreshControl={RefreshControl}
        renderItem={renderSurvey}
        renderSectionHeader={renderSectionHeader}
        sections={surveySections}
        style={styles.container}
      />
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: normalize(14)
  }
});
