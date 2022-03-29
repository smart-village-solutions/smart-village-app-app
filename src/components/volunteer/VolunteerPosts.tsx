import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useQuery } from 'react-query';

import { colors, consts, texts } from '../../config';
import { QUERY_TYPES } from '../../queries';
import { posts as postsQuery } from '../../queries/volunteer';
import { ScreenName } from '../../types';
import { LoadingContainer } from '../LoadingContainer';
import { BoldText } from '../Text';
import { Title, TitleContainer } from '../Title';
import { Touchable } from '../Touchable';
import { Wrapper } from '../Wrapper';

import { VolunteerPostListItem } from './VolunteerPostListItem';

const { ROOT_ROUTE_NAMES } = consts;

export const VolunteerPosts = ({
  contentContainerId,
  isRefetching,
  openWebScreen,
  navigation
}: {
  contentContainerId: number;
  isRefetching: boolean;
  openWebScreen: (webUrl: string, specificTitle?: string | undefined) => void;
  navigation: StackScreenProps<any>['navigation'];
}) => {
  const { data, isLoading, refetch } = useQuery(
    ['posts', contentContainerId],
    () => postsQuery(contentContainerId),
    {
      enabled: !!contentContainerId // the query will not execute if there is no contentContainerId
    }
  );
  const posts = data?.results?.slice(0, 3);

  useEffect(() => {
    isRefetching && refetch?.();
  }, [isRefetching]);

  if (isLoading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  if (!posts?.length) return null;

  return (
    <>
      <TitleContainer>
        <Title>{texts.volunteer.posts}</Title>
      </TitleContainer>

      {posts.map((post, index) => (
        <View key={`post-${post.id}`}>
          <VolunteerPostListItem
            post={post}
            bottomDivider={
              index < posts.length - 1 // do not show a bottomDivider after last entry
            }
            openWebScreen={openWebScreen}
          />
        </View>
      ))}

      <Wrapper>
        <Touchable
          onPress={() =>
            navigation.navigate({
              name: ScreenName.VolunteerIndex,
              params: {
                title: texts.volunteer.posts,
                query: QUERY_TYPES.VOLUNTEER.POSTS,
                queryVariables: contentContainerId,
                rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
              }
            })
          }
        >
          <BoldText center primary underline>
            {texts.volunteer.postsIndexLink}
          </BoldText>
        </Touchable>
      </Wrapper>
    </>
  );
};
