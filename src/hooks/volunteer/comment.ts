import { useCallback, useMemo, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query';

import { QUERY_TYPES } from '../../queries';
import { commentDelete, commentEdit, commentNew, commentsByObject } from '../../queries/volunteer';
import { VolunteerComment } from '../../types';
import {
  useVolunteerRefresh,
  VOLUNTEER_GROUP_REFRESH_EVENT,
  VOLUNTEER_STREAM_REFRESH_EVENT
} from '../HomeRefresh';

export const useComments = ({
  objectId,
  objectModel
}: {
  objectId: number;
  objectModel: string;
}) => {
  const queryClient = useQueryClient();

  const {
    data: commentsData,
    isLoading: commentsLoading,
    refetch: commentsRefetch
  } = useQuery(
    ['commentsByObject', objectModel, objectId],
    () => commentsByObject({ objectModel, objectId }),
    {
      staleTime: 0
    }
  );

  useVolunteerRefresh(commentsRefetch, QUERY_TYPES.VOLUNTEER.STREAM);
  useVolunteerRefresh(commentsRefetch, QUERY_TYPES.VOLUNTEER.GROUP);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['commentsByObject'] });
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    queryClient.invalidateQueries({ queryKey: ['stream'] });

    // this will trigger the onRefresh functions provided to the `useVolunteerRefresh` hook
    // in other components.
    DeviceEventEmitter.emit(VOLUNTEER_STREAM_REFRESH_EVENT);
    DeviceEventEmitter.emit(VOLUNTEER_GROUP_REFRESH_EVENT);
  };

  const createCommentMutation = useMutation({
    mutationFn: commentNew,
    onSuccess: invalidateAll
  });

  const updateCommentMutation = useMutation({
    mutationFn: commentEdit,
    onSuccess: invalidateAll
  });

  const deleteCommentMutation = useMutation({
    mutationFn: commentDelete,
    onSuccess: invalidateAll
  });

  const createComment = async (message: string) =>
    await createCommentMutation.mutateAsync({ objectId, objectModel, message });

  const updateComment = async (id: number, message: string) =>
    await updateCommentMutation.mutateAsync({ id, message });

  const deleteComment = async (id: number) => await deleteCommentMutation.mutateAsync(id);

  return {
    comments: commentsData,
    createComment,
    deleteComment,
    loading:
      commentsLoading ||
      createCommentMutation.isPending ||
      updateCommentMutation.isPending ||
      deleteCommentMutation.isPending,
    updateComment
  };
};

export const useInfiniteComments = ({
  commentsCount,
  latestComments,
  objectId,
  objectModel
}: {
  commentsCount: number;
  latestComments: VolunteerComment[];
  objectId: number;
  objectModel: string;
}) => {
  const [hasLoadedPrevious, setHasLoadedPrevious] = useState(false);
  const latestCount = latestComments?.length || 0;
  const previousCommentsCount = Math.max(0, commentsCount - latestCount);

  const {
    data: pagesData,
    fetchNextPage,
    isFetchingNextPage,
    refetch: refetchInfiniteComments
  } = useInfiniteQuery(
    ['commentsByObject', objectModel, objectId, 'infinite'],
    ({ pageParam = 1 }) => commentsByObject({ objectId, objectModel, page: pageParam }),
    {
      enabled: hasLoadedPrevious,
      getNextPageParam: (lastPage) => {
        if (!lastPage) return undefined;

        // try to determine page/pages from lastPage
        const current = typeof lastPage.page === 'number' ? lastPage.page : Number(lastPage.page);
        const totalPages =
          typeof lastPage.pages === 'number' ? lastPage.pages : Number(lastPage.pages);

        if (current && totalPages && current < totalPages) {
          return current + 1;
        }

        // fallback: get page param from links.next
        const next = lastPage?.links?.next;
        if (typeof next === 'string') {
          const match = next.match(/[?&]page=(\d+)/);
          if (match) return Number(match[1]);
        }
      }
    }
  );

  useVolunteerRefresh(refetchInfiniteComments, QUERY_TYPES.VOLUNTEER.STREAM);
  useVolunteerRefresh(refetchInfiniteComments, QUERY_TYPES.VOLUNTEER.GROUP);

  const loadedComments = useMemo(() => {
    if (!hasLoadedPrevious) return [];

    const pages = pagesData?.pages || [];
    const results = pages.flatMap((page) => (Array.isArray(page) ? page : page?.results || []));
    const latestIds = new Set(latestComments?.map((comment) => comment.id) || []);

    return results.filter((comment) => !latestIds.has(comment?.id));
  }, [hasLoadedPrevious, pagesData?.pages, latestComments]);

  const comments = useMemo(() => {
    if (!hasLoadedPrevious) return latestComments;

    const byId = new Map<number, VolunteerComment>();

    loadedComments.forEach((comment) => comment?.id && byId.set(comment.id, comment));
    latestComments?.forEach((comment) => comment?.id && byId.set(comment.id, comment));

    return Array.from(byId.values());
  }, [hasLoadedPrevious, latestComments, loadedComments]);

  const loadPreviousComments = useCallback(() => {
    if (!hasLoadedPrevious) {
      setHasLoadedPrevious(true);
    } else {
      if (!isFetchingNextPage) {
        fetchNextPage();
      }
    }
  }, [hasLoadedPrevious, isFetchingNextPage, fetchNextPage]);

  return {
    comments,
    hasLoadedPrevious,
    loadPreviousComments,
    previousCommentsCount
  };
};
