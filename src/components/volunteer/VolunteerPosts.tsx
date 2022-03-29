import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useQuery } from 'react-query';

import { colors } from '../../config';
import { posts as postsQuery } from '../../queries/volunteer';
import { LoadingContainer } from '../LoadingContainer';
import { BoldText } from '../Text';
import { Title, TitleContainer } from '../Title';
import { Touchable } from '../Touchable';
import { Wrapper } from '../Wrapper';

import { VolunteerPostListItem } from './VolunteerPostListItem';

export const VolunteerPosts = ({
  contentContainerId,
  isRefetching,
  openWebScreen
}: {
  contentContainerId: number;
  isRefetching: boolean;
  openWebScreen: (webUrl: string, specificTitle?: string | undefined) => void;
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
        <Title>Beiträge</Title>
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
        <Touchable onPress={undefined}>
          <BoldText center primary underline>
            Alle Beiträge anzeigen
          </BoldText>
        </Touchable>
      </Wrapper>
    </>
  );
};
