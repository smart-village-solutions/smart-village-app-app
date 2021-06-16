import { RouteProp } from '@react-navigation/core';
import { noop } from 'lodash';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import {
  BoldText,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperWithOrientation
} from '../components';
import { combineLanguages } from '../helpers';
import { usePullToRefetch, useSurveyLanguages } from '../hooks';
import { Survey } from '../types';

type Props = {
  route: RouteProp<any, any>;
};

// TODO: remove dummy data
const data: { active: Survey[]; archived: Survey[] } = {
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
        pl: 'Bardzo długi tytuł pytania, który jest kompletnie bezsensowny, ale co możesz zrobić...'
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

export const SurveyDetailScreen = ({ route }: Props) => {
  const id = route.params?.id;
  const languages = useSurveyLanguages();

  // TODO: cache-and-network
  // TODO: replace by query
  const survey = data.active.find((s) => s.id === id) ?? data.archived.find((s) => s.id === id);
  const refetch = noop;
  const loading = false;

  const RefreshControl = usePullToRefetch(loading, refetch);

  if (!survey) {
    return null;
  }

  const title = combineLanguages(languages, survey.title);
  const description = combineLanguages(languages, survey.description);
  const questionTitle = combineLanguages(languages, survey.questionTitle);
  const responseOptions = survey.responseOptions.map((responseOption) => ({
    title: combineLanguages(languages, responseOption.title),
    id: responseOption.id
  }));

  return (
    <SafeAreaViewFlex>
      <ScrollView refreshControl={RefreshControl}>
        <WrapperWithOrientation>
          {!!title?.length && <SectionHeader title={title} />}
          {!!description?.length && (
            <Wrapper>
              <RegularText>{description}</RegularText>
            </Wrapper>
          )}
          {!!questionTitle?.length && (
            <Wrapper>
              <BoldText>{questionTitle}</BoldText>
            </Wrapper>
          )}
          {responseOptions.map((responseOption) => (
            <Wrapper key={responseOption.id} style={styles.noPaddingBottom}>
              <RegularText>{responseOption.title}</RegularText>
            </Wrapper>
          ))}
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  noPaddingBottom: {
    paddingBottom: 0
  }
});
