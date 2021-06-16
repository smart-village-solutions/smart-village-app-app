import { useNavigation } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import gql from 'graphql-tag';
import { noop } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-apollo';
import { RefreshControl, SectionList } from 'react-native';

import { SectionHeader, TextListItem } from '../components';
import { colors } from '../config';
import { Survey } from '../types';

// TODO: implement and extract
const useSurveyLanguages = () => ['de', 'pl'];

// TODO: add and extract proper query
// const SURVEYS = gql``;

const useSurveySections = () => {
  // const { data, loading, error, refetch } = useQuery<{ active: Survey[]; archived: Survey[] }>(
  //   SURVEYS
  // );

  // TOOD: replace dummy data by query data
  const data: { active: Survey[]; archived: Survey[] } = {
    active: [
      {
        // title: {
        //   de: 'foo',
        //   pl: 'föö'
        // },
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
            title: {
              de: 'foo',
              pl: 'föö'
            },
            votesCount: 111
          },
          {
            title: {
              de: 'foo',
              pl: 'föö'
            },
            votesCount: 11
          }
        ]
      },
      {
        title: {
          de: 'foo'
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
            title: {
              de: 'foo',
              pl: 'föö'
            },
            votesCount: 111
          },
          {
            title: {
              de: 'foo',
              pl: 'föö'
            },
            votesCount: 11
          }
        ]
      },
      {
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
            title: {
              de: 'foo',
              pl: 'föö'
            },
            votesCount: 111
          },
          {
            title: {
              de: 'foo',
              pl: 'föö'
            },
            votesCount: 11
          }
        ]
      }
    ],
    archived: [
      {
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
            title: {
              de: 'foo',
              pl: 'föö'
            },
            votesCount: 111
          },
          {
            title: {
              de: 'foo',
              pl: 'föö'
            },
            votesCount: 11
          }
        ]
      }
    ]
  };

  const sectionData = [];

  // TODO: double check optional chaining here
  // active should always be present if data is present
  if (data?.active.length) {
    sectionData.push({ data: data.active, key: 'active' });
  }

  // TODO: double check optional chaining here
  if (data?.archived.length) {
    sectionData.push({ data: data.archived, key: 'archived', title: 'Umfrage-Archiv' });
  }

  // return { surveySections: sectionData, loading, error, refetch };
  return { surveySections: sectionData, loading: false, refetch: noop };
};

const parseSurveyToItem = (survey: Survey, languages: string[]) => {
  let title: string;

  findTitle: {
    const langTitles = languages
      .map((language) => survey.title?.[language])
      .filter((value) => !!value);

    if (langTitles.length) {
      title = langTitles.join(' / ');
      break findTitle;
    }

    const langQuestions = languages.map((language) => survey.questionTitle?.[language]);

    title = langQuestions.join(' / ');
  }

  return { title, routeName: 'SurveyOverview', params: {} };
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
  const [refreshing, setRefreshing] = useState(false);
  const { surveySections, refetch, loading } = useSurveySections();
  const languages = useSurveyLanguages();
  const navigation = useNavigation<StackNavigationProp<any>>();

  const refresh = useCallback(() => {
    setRefreshing(true);
    refetch?.();
  }, [refetch]);

  const renderSurvey = useCallback(
    ({ item: survey }: { item: Survey }) => {
      const parsedSurvey = parseSurveyToItem(survey, languages);

      return <TextListItem item={parsedSurvey} navigation={navigation} />;
    },
    [languages, navigation]
  );

  useEffect(() => {
    !loading && setRefreshing(false);
  }, [loading]);

  return (
    <SectionList
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          colors={[colors.accent]}
          tintColor={colors.accent}
        />
      }
      renderItem={renderSurvey}
      renderSectionHeader={renderSectionHeader}
      sections={surveySections}
    />
  );
};
