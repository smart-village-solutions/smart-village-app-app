import { useMutation, useQuery, useQueryClient } from 'react-query';

import { commentDelete, commentEdit, commentNew, commentsByObject } from '../../queries/volunteer';

export const useComments = ({
  objectId,
  objectModel
}: {
  objectId: number;
  objectModel: string;
}) => {
  const queryClient = useQueryClient();

  const { isLoading: commentsLoading, refetch: commentsRefetch } = useQuery(
    ['commentsByObject', objectModel, objectId],
    () => commentsByObject({ objectModel, objectId })
  );

  const createCommentMutation = useMutation({
    mutationFn: commentNew,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commentsByObject', objectModel, objectId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['stream'] });
      commentsRefetch();
    }
  });

  const updateCommentMutation = useMutation({
    mutationFn: commentEdit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commentsByObject', objectModel, objectId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['stream'] });
      commentsRefetch();
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: commentDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commentsByObject', objectModel, objectId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['stream'] });
      commentsRefetch();
    }
  });

  const createComment = async (message: string) => {
    return await createCommentMutation.mutateAsync({ objectId, objectModel, message });
  };

  const updateComment = async (id: number, message: string) => {
    return await updateCommentMutation.mutateAsync({ id, message });
  };

  const deleteComment = async (id: number) => {
    return await deleteCommentMutation.mutateAsync(id);
  };

  return {
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
