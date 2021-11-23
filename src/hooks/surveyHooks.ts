import { useCallback, useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo';
import { Alert } from 'react-native';

import { texts } from '../config';
import { addToStore, readFromStore } from '../helpers';
import { SUBMIT_SURVEY_RESPONSE } from '../queries/survey';

// TODO: implement properly
export const useSurveyLanguages = (isMultiLanguage?: boolean) =>
  (isMultiLanguage ? ['de', 'pl'] : ['de']) as ('de' | 'pl')[];

const SURVEY_ANSWERS_STORAGE_PREFIX = 'SVA_SURVEY_ANSWERS_';

export const useAnswerSelection = (id?: string, refetch?: () => void) => {
  const client = useApolloClient();
  const [selection, setSelection] = useState<string | undefined>();
  const [previousSubmission, setPreviousSubmission] = useState<string | undefined>();

  const readPreviousSubmissionFromStore = useCallback(async (id?: string) => {
    if (!id) return;

    const storedPreviousSubmission = await readFromStore(SURVEY_ANSWERS_STORAGE_PREFIX + id);

    if (storedPreviousSubmission) {
      setSelection(storedPreviousSubmission);
      setPreviousSubmission(storedPreviousSubmission);
    }
  }, []);

  const submitSelection = useCallback(async () => {
    if (selection && previousSubmission !== selection) {
      try {
        const { data, errors } = await client.mutate({
          mutation: SUBMIT_SURVEY_RESPONSE,
          variables: { decreaseId: previousSubmission, increaseId: selection }
        });

        if (errors || data?.voteForSurvey?.statusCode !== 200) {
          throw new Error();
        }
      } catch (e) {
        Alert.alert(texts.survey.errors.submissionTitle, texts.survey.errors.submissionBody);
        return;
      }

      setPreviousSubmission(selection);
      await addToStore(SURVEY_ANSWERS_STORAGE_PREFIX + id, selection);
      refetch?.();
    }
  }, [client, id, previousSubmission, refetch, selection]);

  useEffect(() => {
    readPreviousSubmissionFromStore(id);
  }, [id]);

  return { previousSubmission, selection, setSelection, submitSelection };
};
