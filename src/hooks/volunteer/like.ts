import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { likeDelete, likeNew, likesByObject } from '../../queries/volunteer';

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

  const { data: likesData, isLoading: likesLoading } = useQuery(
    ['likesByObject', objectModel, objectId],
    () => likesByObject({ objectModel, objectId })
  );

  // check if user has liked the post already
  useEffect(() => {
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
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['likesByObject', objectModel, objectId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['commentsByObject', objectModel, objectId] });
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
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['likesByObject', objectModel, objectId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
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
