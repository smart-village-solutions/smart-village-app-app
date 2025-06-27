import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Badge } from 'react-native-elements';
import { useQuery } from 'react-query';

import { colors, consts, normalize, texts } from '../../config';
import { QUERY_TYPES } from '../../queries';
import { posts as postsQuery } from '../../queries/volunteer';
import { ScreenName } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner';
import { SectionHeader } from '../SectionHeader';
import { RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperHorizontal, WrapperRow } from '../Wrapper';

import { VolunteerPostListItem } from './VolunteerPostListItem';
import { VolunteerPostModal } from './VolunteerPostModal';
import { VolunteerPostTextField } from './VolunteerPostTextField';

const { ROOT_ROUTE_NAMES } = consts;

export const VolunteerPosts = ({
  contentContainerId,
  isRefetching,
  openWebScreen,
  navigation,
  isGroupMember,
  userGuid
}: {
  contentContainerId: number;
  isRefetching: boolean;
  openWebScreen: (webUrl: string, specificTitle?: string | undefined) => void;
  navigation: StackScreenProps<any>['navigation'];
  isGroupMember?: boolean;
  userGuid?: string | null;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [postForModal, setPostForModal] = useState();
  const { data, isLoading, refetch } = useQuery(
    ['posts', contentContainerId],
    () => postsQuery({ contentContainerId }),
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

  useEffect(() => {
    // refetch posts when modal is closed
    isCollapsed && refetch?.();
  }, [isCollapsed]);

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  return (
    <>
      {(!!posts?.length || !!isGroupMember) && (
        <WrapperRow>
          <SectionHeader
            onPress={() =>
              navigation.push(ScreenName.VolunteerIndex, {
                title: texts.volunteer.posts,
                query: QUERY_TYPES.VOLUNTEER.POSTS,
                queryVariables: { contentContainerId },
                isGroupMember,
                rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
              })
            }
            title={texts.volunteer.posts}
          />
          {!!data?.results?.length && (
            <Badge
              badgeStyle={styles.badge}
              textStyle={styles.badgeText}
              value={data.results.length}
            />
          )}
        </WrapperRow>
      )}

      {!!isGroupMember && (
        <WrapperHorizontal>
          <VolunteerPostTextField
            onPress={() => {
              setPostForModal(undefined);
              setIsCollapsed(false);
            }}
          />
        </WrapperHorizontal>
      )}

      {!!posts?.length && (
        <WrapperHorizontal>
          {posts.map(
            (post: {
              id: number;
              message: string;
              content: {
                metadata: {
                  created_by: { guid: string; display_name: string };
                  created_at: string;
                };
              };
            }) => (
              <VolunteerPostListItem
                key={`post-${post.id}`}
                bottomDivider={false}
                openWebScreen={openWebScreen}
                post={post}
                setIsCollapsed={setIsCollapsed}
                setPostForModal={setPostForModal}
                userGuid={userGuid}
              />
            )
          )}
        </WrapperHorizontal>
      )}

      {data?.results?.length > 3 && !!isGroupMember && (
        <Wrapper>
          <Touchable
            onPress={() =>
              navigation.push(ScreenName.VolunteerIndex, {
                title: texts.volunteer.posts,
                query: QUERY_TYPES.VOLUNTEER.POSTS,
                queryVariables: { contentContainerId },
                rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
              })
            }
          >
            <RegularText primary center>
              {texts.volunteer.postsIndexLink}
            </RegularText>
          </Touchable>
        </Wrapper>
      )}

      {!!contentContainerId && (
        <VolunteerPostModal
          contentContainerId={contentContainerId}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          post={postForModal}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.gray20,
    borderRadius: normalize(30),
    height: normalize(30),
    marginLeft: normalize(-24),
    marginTop: normalize(7),
    width: normalize(30)
  },
  badgeText: {
    color: colors.darkText,
    fontSize: normalize(14),
    fontFamily: 'bold',
    lineHeight: normalize(20)
  }
});
