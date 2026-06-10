import React, { useContext, useMemo, useState } from 'react';

import { AccessibilityContext } from '../AccessibilityProvider';
import { removeHtml, trimNewLines } from '../helpers';
import { useDetailSpeech } from '../hooks';
import { useRegisterReadAloudContent } from '../ReadAloudAvailabilityProvider';

import { DetailReadAloudControls } from './detail/DetailReadAloudControls';

type Props = {
  content?: string | null;
  contentId?: string;
};

const normalizeContent = (content?: string | null) => {
  if (!content) return '';
  return trimNewLines(removeHtml(content))?.replace(/\s+/g, ' ').trim() || '';
};

export const ReadAloudContent = ({ content, contentId = 'content' }: Props) => {
  const { features, isReadAloudEnabled } = useContext(AccessibilityContext);
  const [speechRate, setSpeechRate] = useState(1);

  const normalizedContent = useMemo(() => normalizeContent(content), [content]);
  const speechItems = useMemo(
    () => (normalizedContent.length ? [{ id: contentId, text: normalizedContent }] : []),
    [contentId, normalizedContent]
  );
  useRegisterReadAloudContent(contentId, features.readAloud && speechItems.length > 0);

  const {
    activeItemId,
    activeWordRange,
    canStart,
    currentItemIndex,
    currentItemText,
    isPaused,
    isSpeaking,
    pause,
    resume,
    start,
    stop,
    totalItems
  } = useDetailSpeech(speechItems, isReadAloudEnabled, speechRate);

  if (!isReadAloudEnabled || !speechItems.length) return null;

  return (
    <DetailReadAloudControls
      activeItemId={activeItemId}
      activeWordRange={activeWordRange}
      canStart={canStart}
      currentItemIndex={currentItemIndex}
      currentItemText={currentItemText}
      isPaused={isPaused}
      isSpeaking={isSpeaking}
      onPause={pause}
      onResume={resume}
      onSpeechRateChange={setSpeechRate}
      onStart={start}
      onStop={stop}
      speechRate={speechRate}
      totalItems={totalItems}
    />
  );
};
