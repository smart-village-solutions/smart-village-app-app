import { useContext, useMemo } from 'react';

import { AccessibilityContext } from '../AccessibilityProvider';
import { normalizeSpeechText } from '../helpers/accessibility/speechTextFormatter';
import { useRegisterReadAloudContent } from '../ReadAloudAvailabilityProvider';

type Props = {
  content?: string | null;
  contentId?: string;
};

const normalizeContent = (content?: string | null) => {
  return normalizeSpeechText(content || undefined);
};

export const ReadAloudContent = ({ content, contentId = 'content' }: Props) => {
  const { features } = useContext(AccessibilityContext);

  const normalizedContent = useMemo(() => normalizeContent(content), [content]);
  const speechItems = useMemo(
    () => (normalizedContent.length ? [{ id: contentId, text: normalizedContent }] : []),
    [contentId, normalizedContent]
  );
  useRegisterReadAloudContent(contentId, speechItems, features.readAloud && speechItems.length > 0);

  return null;
};
