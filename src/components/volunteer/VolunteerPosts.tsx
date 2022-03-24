import React from 'react';
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

// eslint-disable-next-line complexity
export const VolunteerPosts = ({ contentContainerId }: { contentContainerId: number }) => {
  const { data, isLoading } = useQuery(
    ['posts', contentContainerId],
    () => postsQuery(contentContainerId),
    {
      enabled: !!contentContainerId // the query will not execute if there is no contentContainerId
    }
  );
  const posts = data?.results?.slice(0, 3);

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
