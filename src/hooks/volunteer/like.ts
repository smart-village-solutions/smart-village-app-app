import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { QUERY_TYPES } from '../../queries';
import { likeDelete, likeNew, likesByObject } from '../../queries/volunteer';
import { useVolunteerRefresh } from '../HomeRefresh';

export const useLike = ({
  initialLikeCount = 0,
  objectId,
  objectModel,
  userGuid
}: {
  initialLikeCount?: number;
  objectId: number;
  objectModel: string;
  userGuid?: string | null;
}) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [likeId, setLikeId] = useState<number | undefined>();
  const queryClient = useQueryClient();

  const {
    data: likesData,
    isLoading: likesLoading,
    refetch: likesRefetch
  } = useQuery(['likesByObject', objectModel, objectId], () =>
    likesByObject({ objectModel, objectId })
  );

  useVolunteerRefresh(likesRefetch, QUERY_TYPES.VOLUNTEER.STREAM);

  // check if user has liked the post already
  useEffect(() => {
    setLikeCount(likesData?.total || 0);

    if (likesData?.results?.length && userGuid) {
      const hasUserLiked = likesData.results.find(
        ({ createdBy }: { createdBy: { guid: string } }) => userGuid === createdBy?.guid
      );

      if (hasUserLiked) {
        setLiked(true);
        setLikeId(hasUserLiked.id);
      } else {
        setLiked(false);
        setLikeId(undefined);
      }
    } else {
      setLiked(false);
      setLikeId(undefined);
    }
  }, [likesData, userGuid]);

  const createLikeMutation = useMutation({
    mutationFn: likeNew,
    onMutate: () => {
      // Optimistic update
      setLiked(true);
      setLikeCount((prev) => prev + 1);
    },
    onSuccess: ({ id }) => {
      setLikeId(id);
      queryClient.invalidateQueries({ queryKey: ['likesByObject'] });
      queryClient.invalidateQueries({ queryKey: ['commentsByObject'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['stream'] });
    },
    onError: () => {
      // Revert optimistic update
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    }
  });

  const deleteLikeMutation = useMutation({
    mutationFn: likeDelete,
    onMutate: () => {
      // Optimistic update
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    },
    onSuccess: () => {
      setLikeId(undefined);
      queryClient.invalidateQueries({ queryKey: ['likesByObject'] });
      queryClient.invalidateQueries({ queryKey: ['commentsByObject'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['stream'] });
    },
    onError: () => {
      // Revert optimistic update
      setLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  });

  const toggleLike = () => {
    if (liked && likeId) {
      deleteLikeMutation.mutate(likeId);
    } else {
      createLikeMutation.mutate({ objectModel, objectId });
    }
  };

  return {
    liked,
    likeCount,
    toggleLike,
    loading: createLikeMutation.isPending || deleteLikeMutation.isPending || likesLoading
  };
};
