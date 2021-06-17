import { useNavigation } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { noop } from 'lodash';
import React, { useCallback } from 'react';
import { SectionList } from 'react-native';

import { SectionHeader, TextListItem } from '../components';
import { texts } from '../config';
import { combineLanguages } from '../helpers';
import { usePullToRefetch, useSurveyLanguages } from '../hooks';
import { Survey } from '../types';

const useSurveySections = () => {
  // const { data, loading, error, refetch } = useQuery<{
  //   surveys: { active: Survey[]; archived: Survey[] };
  // }>(SURVEYS, { fetchPolicy: 'cache-and-network' });

  // TOOD: replace dummy data by query data
  const surveys: { active: Survey[]; archived: Survey[] } = {
    active: [
      {
        id: '1',
        questionTitle: {
          de: 'quo',
          pl: 'qüö'
        },
        description: {
          de: 'bar',
          pl: 'bär'
        },
        dates: {
          dateStart: '2021-06-12',
          dateEnd: '2021-06-20'
        },
        responseOptions: [
          {
            id: '1',
            title: {
              de: 'foo 1',
              pl: 'föö 1'
            },
            votesCount: 111
          },
          {
            id: '2',
            title: {
              de: 'foo 2',
              pl: 'föö 2'
            },
            votesCount: 11
          }
        ]
      },
      {
        id: '2',
        title: {
          de: 'foo'
        },
        questionTitle: {
          de: 'quo',
          pl: 'qüö'
        },
        dates: {
          dateStart: '2021-06-12',
          dateEnd: '2021-06-20'
        },
        responseOptions: [
          {
            id: '3',
            title: {
              de: 'foo 3',
              pl: 'föö 3'
            },
            votesCount: 111
          },
          {
            id: '4',
            title: {
              de: 'foo 4',
              pl: 'föö 4'
            },
            votesCount: 11
          }
        ]
      },
      {
        id: '3',
        title: {
          de: 'Very long question title that is utterly pointless, but what can you do...',
          pl:
            'Bardzo długi tytuł pytania, który jest kompletnie bezsensowny, ale co możesz zrobić...'
        },
        questionTitle: {
          de: 'quo',
          pl: 'qüö'
        },
        description: {
          de: 'bar',
          pl: 'bär'
        },
        dates: {
          dateStart: '2021-06-12',
          dateEnd: '2021-06-20'
        },
        responseOptions: [
          {
            id: '5',
            title: {
              de: 'foo 5',
              pl: 'föö 5'
            },
            votesCount: 111
          },
          {
            id: '6',
            title: {
              de: 'foo 6',
              pl: 'föö 6'
            },
            votesCount: 11
          }
        ]
      }
    ],
    archived: [
      {
        id: '4',
        title: {
          de: 'foo',
          pl: 'föö'
        },
        questionTitle: {
          de: 'quo',
          pl: 'qüö'
        },
        description: {
          de: 'bar',
          pl: 'bär'
        },
        dates: {
          dateStart: '2021-06-12',
          dateEnd: '2021-06-20'
        },
        responseOptions: [
          {
            id: '7',
            title: {
              de: 'foo 7',
              pl: 'föö 7'
            },
            votesCount: 111
          },
          {
            id: '8',
            title: {
              de: 'foo 8',
              pl: 'föö 8'
            },
            votesCount: 11
          }
        ]
      }
    ]
  };

  const sectionData = [];

  // const surveys = data?.surveys;

  // active should always be present if data is present
  if (surveys?.active.length) {
    sectionData.push({ data: surveys?.active, key: 'active' });
  }

  if (surveys?.archived.length) {
    sectionData.push({ data: surveys?.archived, key: 'archived', title: texts.survey.archive });
  }

  // return { surveySections: sectionData, loading, error, refetch };
  return { surveySections: sectionData, loading: false, refetch: noop };
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
  const { surveySections, refetch, loading } = useSurveySections();
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

  return (
    <SectionList
      refreshControl={RefreshControl}
      renderItem={renderSurvey}
      renderSectionHeader={renderSectionHeader}
      sections={surveySections}
    />
  );
};
