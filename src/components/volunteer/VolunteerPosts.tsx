import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useQuery } from 'react-query';

import { consts, texts } from '../../config';
import { QUERY_TYPES } from '../../queries';
import { posts as postsQuery } from '../../queries/volunteer';
import { ScreenName } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner';
import { SectionHeader } from '../SectionHeader';
import { BoldText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper } from '../Wrapper';

import { VolunteerPostListItem } from './VolunteerPostListItem';
import { VolunteerPostTextField } from './VolunteerPostTextField';

const { ROOT_ROUTE_NAMES } = consts;

export const VolunteerPosts = ({
  contentContainerId,
  isRefetching,
  openWebScreen,
  navigation,
  isGroupMember
}: {
  contentContainerId: number;
  isRefetching: boolean;
  openWebScreen: (webUrl: string, specificTitle?: string | undefined) => void;
  navigation: StackScreenProps<any>['navigation'];
  isGroupMember?: boolean;
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
    // refetch posts when pull to refresh from parent component
    isRefetching && refetch?.();
  }, [isRefetching]);

  useEffect(() => {
    // refetch posts when group membership changes
    refetch?.();
  }, [isGroupMember]);

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  return (
    <>
      {(!!posts?.length || !!isGroupMember) && (
        <SectionHeader
          onPress={() =>
            navigation.push(ScreenName.VolunteerIndex, {
              title: texts.volunteer.posts,
              query: QUERY_TYPES.VOLUNTEER.POSTS,
              queryVariables: contentContainerId,
              rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
            })
          }
          title={texts.volunteer.posts + (data?.results?.length ? ` (${data.results.length})` : '')}
        />
      )}

      {!!isGroupMember && (
        <VolunteerPostTextField contentContainerId={contentContainerId} refetch={refetch} />
      )}

      {!!posts?.length &&
        posts.map((post: any, index: number) => (
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

      {data?.results?.length > 3 && !!isGroupMember && (
        <Wrapper>
          <Touchable
            onPress={() =>
              navigation.push(ScreenName.VolunteerIndex, {
                title: texts.volunteer.posts,
                query: QUERY_TYPES.VOLUNTEER.POSTS,
                queryVariables: contentContainerId,
                rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
              })
            }
          >
            <BoldText center primary underline>
              {texts.volunteer.postsIndexLink}
            </BoldText>
          </Touchable>
        </Wrapper>
      )}
    </>
  );
};
