import { useCallback, useEffect, useState } from 'react';
import { readFromStore } from '../helpers';

// TODO: implement properly
export const useSurveyLanguages = () => ['de', 'pl'];

const SURVEY_ANSWERS_STORAGE_PREFIX = 'SVA_SURVEY_ANSWERS_';
export const useAnswerSelection = (id?: string) => {
  const [selection, setSelection] = useState<string | undefined>();

  const readPreviousAnswer = useCallback(async (id?: string) => {
    if (!id) return;

    const previousAnswer = await readFromStore(SURVEY_ANSWERS_STORAGE_PREFIX + id);

    if (previousAnswer) {
      setSelection(previousAnswer);
    }
  }, []);

  // const submitSelection = useCallback(async () => {
  //   if (selection) {
  //     // TODO: add mutation here
  //     await addToStore(SURVEY_ANSWERS_STORAGE_PREFIX + id, selection);
  //   }
  // }, [id, selection]);

  useEffect(() => {
    readPreviousAnswer(id);
  }, [id]);

  return { selection, setSelection };
};
