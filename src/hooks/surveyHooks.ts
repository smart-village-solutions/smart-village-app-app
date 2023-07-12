import { useCallback, useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo';
import { Alert } from 'react-native';

import { texts } from '../config';
import { addToStore, readFromStore } from '../helpers';
import { SUBMIT_SURVEY_RESPONSES } from '../queries/survey';

// TODO: implement properly
export const useSurveyLanguages = (isMultilingual?: boolean) =>
  (isMultilingual ? ['de', 'pl'] : ['de']) as ('de' | 'pl')[];

const SURVEY_ANSWERS_STORAGE_PREFIX = 'SVA_SURVEY_ANSWERS_';

export const useAnswerSelection = (id?: string, refetch?: () => void) => {
  const client = useApolloClient();
  const [selection, setSelection] = useState<string[]>([]);
  const [previousSubmission, setPreviousSubmission] = useState<string[]>([]);

  const readPreviousSubmissionFromStore = useCallback(async (id?: string) => {
    if (!id) return;

    const storedPreviousSubmission = await readFromStore(SURVEY_ANSWERS_STORAGE_PREFIX + id);

    if (storedPreviousSubmission) {
      // handle submissions made before multiselect was implemented
      if (typeof storedPreviousSubmission === 'string') {
        setSelection([storedPreviousSubmission]);
        setPreviousSubmission([storedPreviousSubmission]);
      } else {
        setSelection(storedPreviousSubmission);
        setPreviousSubmission(storedPreviousSubmission);
      }
    }
  }, []);

  const submitSelection = useCallback(async () => {
    try {
      const { data, errors } = await client.mutate({
        mutation: SUBMIT_SURVEY_RESPONSES,
        variables: { decreaseId: previousSubmission, increaseId: selection }
      });

      Alert.alert(texts.survey.submitSuccess.header, texts.survey.submitSuccess.entry);

      if (errors || data?.votesForSurvey?.statusCode !== 200) {
        throw new Error();
      }
    } catch (e) {
      console.error(e);
      Alert.alert(texts.survey.errors.submissionTitle, texts.survey.errors.submissionBody);
      return;
    }

    setPreviousSubmission(selection);
    await addToStore(SURVEY_ANSWERS_STORAGE_PREFIX + id, selection);
    refetch?.();
  }, [client, id, previousSubmission, refetch, selection]);

  useEffect(() => {
    readPreviousSubmissionFromStore(id);
  }, [id]);

  return { previousSubmission, selection, setSelection, submitSelection };
};
