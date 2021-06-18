import { useCallback, useEffect, useState } from 'react';
import { addToStore, readFromStore } from '../helpers';

// TODO: implement properly
export const useSurveyLanguages = () => ['de', 'pl'];

const SURVEY_ANSWERS_STORAGE_PREFIX = 'SVA_SURVEY_ANSWERS_';
export const useAnswerSelection = (id?: string) => {
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
    if (selection) {
      // TODO: add mutation here
      if (!previousSubmission) {
        // add a vote to the selected answer
      } else {
        // decrement one counter
        // increase the other
      }
      setPreviousSubmission(selection);
      await addToStore(SURVEY_ANSWERS_STORAGE_PREFIX + id, selection);
    }
  }, [id, selection]);

  useEffect(() => {
    readPreviousSubmissionFromStore(id);
  }, [id]);

  return { previousSubmission, selection, setSelection, submitSelection };
};
