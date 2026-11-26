import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Speech from 'expo-speech';

import { useOptionalAudioPlayback } from '../AudioPlayerProvider';
import { DetailSpeechItem } from '../helpers/accessibility/detailSpeechParser';

type SpeechChunk = {
  sourceCharStart: number;
  sourceIndex: number;
  text: string;
};

const DEFAULT_TTS_LANGUAGE = 'de-DE';
const NATIVE_SPEECH_RATE_SCALE = 0.9;

export const getNativeSpeechRate = (speechRate: number) =>
  Math.min(Math.max(speechRate * NATIVE_SPEECH_RATE_SCALE, 0.1), 2);

type ChunkPart = {
  start: number;
  text: string;
};

const splitIntoChunks = (text: string, maxLength: number): ChunkPart[] => {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  if (normalized.length <= maxLength) return [{ start: 0, text: normalized }];

  const chunks: ChunkPart[] = [];
  let remaining = normalized;
  let consumedChars = 0;

  while (remaining.length > maxLength) {
    const rawPart = remaining.slice(0, maxLength);
    const splitIndex = Math.max(
      rawPart.lastIndexOf('. '),
      rawPart.lastIndexOf('! '),
      rawPart.lastIndexOf('? '),
      rawPart.lastIndexOf(', '),
      rawPart.lastIndexOf('; '),
      rawPart.lastIndexOf(' ')
    );

    const boundary = splitIndex > 0 ? splitIndex + 1 : maxLength;
    const part = remaining.slice(0, boundary).trim();
    if (part.length) {
      const relativeStart = remaining.indexOf(part);
      chunks.push({
        start: consumedChars + Math.max(relativeStart, 0),
        text: part
      });
    }
    consumedChars += boundary;
    remaining = remaining.slice(boundary).trim();
    while (normalized.charAt(consumedChars) === ' ') {
      consumedChars += 1;
    }
  }

  if (remaining.length) {
    const relativeStart = normalized.indexOf(remaining, consumedChars);
    chunks.push({
      start: Math.max(relativeStart, consumedChars),
      text: remaining
    });
  }

  return chunks;
};

const buildQueue = (items: DetailSpeechItem[]) => {
  const maxLength = Math.max(1, Speech.maxSpeechInputLength || Number.MAX_SAFE_INTEGER);

  return items.reduce<SpeechChunk[]>((acc, item, index) => {
    const chunks = splitIntoChunks(item.text, maxLength);
    chunks.forEach((chunk) => {
      acc.push({
        sourceCharStart: chunk.start,
        sourceIndex: index,
        text: chunk.text
      });
    });
    return acc;
  }, []);
};

// The native speech queue is shared across screens, including during route changes.
let pendingNativeStop: Promise<void> | undefined;

const stopNativeSpeech = () => {
  pendingNativeStop ??= Speech.stop()
    .catch((error) => console.warn('Could not stop speech playback.', error))
    .finally(() => {
      pendingNativeStop = undefined;
    });
  return pendingNativeStop;
};

export const useDetailSpeech = (items: DetailSpeechItem[], enabled = true, speechRate = 1) => {
  const pauseAudio = useOptionalAudioPlayback()?.pauseForReadAloud;
  const queue = useMemo(() => (enabled ? buildQueue(items) : []), [enabled, items]);
  const queueKey = useMemo(() => items.map((item) => `${item.id}:${item.text}`).join('|'), [items]);
  const generationRef = useRef(0);
  const activeChunkIndexRef = useRef(0);
  const activeChunkResumeOffsetRef = useRef(0);
  const resumeChunkIndexRef = useRef(0);
  const resumeChunkOffsetRef = useRef(0);
  const previousSpeechRateRef = useRef(speechRate);
  const mountedRef = useRef(true);
  const pausedByUserRef = useRef(false);
  const speechRequestedRef = useRef(false);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [activeWordRange, setActiveWordRange] = useState<{ length: number; start: number } | null>(
    null
  );

  const stop = useCallback(async () => {
    const generation = ++generationRef.current;
    speechRequestedRef.current = false;
    pausedByUserRef.current = false;
    resumeChunkIndexRef.current = 0;
    resumeChunkOffsetRef.current = 0;
    activeChunkIndexRef.current = 0;
    activeChunkResumeOffsetRef.current = 0;

    await stopNativeSpeech();

    if (!mountedRef.current || generation !== generationRef.current) return;
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentItemIndex(0);
    setActiveWordRange(null);
  }, []);

  const playFromIndex = useCallback(
    (startIndex: number, startOffset = 0) => {
      const generation = generationRef.current;
      const finishPlayback = () => {
        speechRequestedRef.current = false;
        if (mountedRef.current) {
          setIsSpeaking(false);
          setIsPaused(false);
          setCurrentItemIndex(items.length ? items.length - 1 : 0);
          setActiveWordRange(null);
        }
        resumeChunkIndexRef.current = 0;
        resumeChunkOffsetRef.current = 0;
        activeChunkIndexRef.current = 0;
        activeChunkResumeOffsetRef.current = 0;
      };

      const speakChunk = (chunkIndex: number, chunkOffset = 0) => {
        if (!mountedRef.current) return;

        if (!queue.length || chunkIndex >= queue.length) {
          finishPlayback();
          return;
        }

        const currentChunk = queue[chunkIndex];
        if (!currentChunk) return;

        activeChunkIndexRef.current = chunkIndex;
        activeChunkResumeOffsetRef.current = Math.min(
          Math.max(chunkOffset, 0),
          currentChunk.text.length
        );
        const trimmedTextStart = currentChunk.text
          .slice(activeChunkResumeOffsetRef.current)
          .search(/\S/);
        const speechOffset =
          trimmedTextStart > 0
            ? activeChunkResumeOffsetRef.current + trimmedTextStart
            : activeChunkResumeOffsetRef.current;
        const speechText = currentChunk.text.slice(speechOffset);

        if (!speechText.trim().length) {
          speakChunk(chunkIndex + 1);
          return;
        }

        if (mountedRef.current) {
          setIsSpeaking(true);
          setIsPaused(false);
          setCurrentItemIndex(currentChunk.sourceIndex);
        }

        Speech.speak(speechText, {
          language: DEFAULT_TTS_LANGUAGE,
          rate: getNativeSpeechRate(speechRate),
          onBoundary: (event: { charIndex?: number; charLength?: number }) => {
            if (generationRef.current !== generation || !mountedRef.current) return;

            const localStart = typeof event?.charIndex === 'number' ? event.charIndex : 0;
            const candidateLength =
              typeof event?.charLength === 'number' ? event.charLength : undefined;
            const fallbackLength = Math.max(speechText.slice(localStart).search(/\s|$/), 1);
            const localLength =
              candidateLength && candidateLength > 0 ? candidateLength : fallbackLength;
            const sourceStart = speechOffset + Math.max(localStart, 0);

            activeChunkResumeOffsetRef.current = sourceStart;

            setActiveWordRange({
              length: localLength,
              start: currentChunk.sourceCharStart + sourceStart
            });
          },
          onDone: () => {
            if (
              generationRef.current !== generation ||
              pausedByUserRef.current ||
              !mountedRef.current
            ) {
              return;
            }

            const nextIndex = chunkIndex + 1;
            if (nextIndex < queue.length) {
              speakChunk(nextIndex);
              return;
            }

            finishPlayback();
          },
          onError: (error) => {
            if (generationRef.current !== generation) return;
            speechRequestedRef.current = false;
            console.warn('Speech playback failed.', error);
            if (!mountedRef.current) return;
            setIsSpeaking(false);
            setIsPaused(false);
            setActiveWordRange(null);
          },
          onStart: () => {
            if (generationRef.current !== generation || !mountedRef.current) return;
            setIsSpeaking(true);
            setActiveWordRange(null);
          }
        });
      };

      speakChunk(startIndex, startOffset);
    },
    [items.length, queue, speechRate]
  );

  const start = useCallback(async () => {
    if (!enabled || !queue.length) return;

    pauseAudio?.();
    const generation = ++generationRef.current;
    speechRequestedRef.current = true;
    pausedByUserRef.current = false;
    resumeChunkIndexRef.current = 0;
    resumeChunkOffsetRef.current = 0;
    activeChunkIndexRef.current = 0;
    activeChunkResumeOffsetRef.current = 0;

    await stopNativeSpeech();
    if (!mountedRef.current || generation !== generationRef.current) return;
    setCurrentItemIndex(0);
    playFromIndex(0);
  }, [enabled, pauseAudio, playFromIndex, queue.length]);

  const pause = useCallback(async () => {
    if (!speechRequestedRef.current) {
      await pendingNativeStop;
      return;
    }

    const generation = ++generationRef.current;
    speechRequestedRef.current = false;
    pausedByUserRef.current = true;
    resumeChunkIndexRef.current = activeChunkIndexRef.current;
    resumeChunkOffsetRef.current = activeChunkResumeOffsetRef.current;

    await stopNativeSpeech();
    if (!mountedRef.current || generation !== generationRef.current) return;
    setIsSpeaking(false);
    setIsPaused(true);
    setCurrentItemIndex(queue[resumeChunkIndexRef.current]?.sourceIndex || 0);
  }, [queue]);

  const resume = useCallback(async () => {
    if (!enabled || !isPaused || !queue.length) return;

    pauseAudio?.();
    const generation = ++generationRef.current;
    speechRequestedRef.current = true;
    pausedByUserRef.current = false;
    if (pendingNativeStop) await pendingNativeStop;
    if (!mountedRef.current || generation !== generationRef.current) return;
    playFromIndex(resumeChunkIndexRef.current, resumeChunkOffsetRef.current);
  }, [enabled, isPaused, pauseAudio, playFromIndex, queue.length]);

  const skipToItem = useCallback(
    async (targetItemIndex: number) => {
      if (!enabled || !queue.length || !items.length) return;

      const nextItemIndex = Math.min(Math.max(targetItemIndex, 0), items.length - 1);
      const nextChunkIndex = queue.findIndex((chunk) => chunk.sourceIndex === nextItemIndex);
      if (nextChunkIndex < 0) return;

      pauseAudio?.();
      const generation = ++generationRef.current;
      speechRequestedRef.current = true;
      pausedByUserRef.current = false;
      resumeChunkIndexRef.current = nextChunkIndex;
      resumeChunkOffsetRef.current = 0;
      activeChunkIndexRef.current = nextChunkIndex;
      activeChunkResumeOffsetRef.current = 0;

      await stopNativeSpeech();
      if (!mountedRef.current || generation !== generationRef.current) return;
      setCurrentItemIndex(nextItemIndex);
      setActiveWordRange(null);
      playFromIndex(nextChunkIndex);
    },
    [enabled, items.length, pauseAudio, playFromIndex, queue]
  );

  const skipPrevious = useCallback(
    () => skipToItem(currentItemIndex - 1),
    [currentItemIndex, skipToItem]
  );
  const skipNext = useCallback(
    () => skipToItem(currentItemIndex + 1),
    [currentItemIndex, skipToItem]
  );

  useEffect(() => {
    if (enabled) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void stop();
  }, [enabled, stop]);

  useEffect(() => {
    if (!queue.length) {
      void stopNativeSpeech();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentItemIndex(0);
      setActiveWordRange(null);
      resumeChunkIndexRef.current = 0;
      resumeChunkOffsetRef.current = 0;
      activeChunkIndexRef.current = 0;
      activeChunkResumeOffsetRef.current = 0;
      return;
    }

    if (!isSpeaking && !isPaused) {
      setCurrentItemIndex(0);
    }
  }, [isPaused, isSpeaking, queue.length]);

  useEffect(() => {
    return () => {
      generationRef.current += 1;
      pausedByUserRef.current = true;
      speechRequestedRef.current = false;
      void stopNativeSpeech();
    };
  }, [queueKey]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        void stop();
      }
    });

    return () => subscription.remove();
  }, [stop]);

  useEffect(() => {
    const hasRateChanged = Math.abs(previousSpeechRateRef.current - speechRate) > 0.0001;
    if (!hasRateChanged) return;

    previousSpeechRateRef.current = speechRate;

    if (!enabled || !isSpeaking || !speechRequestedRef.current || !queue.length) return;

    const restartWithNewRate = async () => {
      const generation = ++generationRef.current;
      pausedByUserRef.current = false;
      const restartIndex = Math.min(activeChunkIndexRef.current, queue.length - 1);
      const restartOffset = activeChunkResumeOffsetRef.current;

      await stopNativeSpeech();
      if (!mountedRef.current || generation !== generationRef.current) return;
      playFromIndex(restartIndex, restartOffset);
    };

    void restartWithNewRate();
  }, [enabled, isSpeaking, playFromIndex, queue.length, speechRate]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      generationRef.current += 1;
      pausedByUserRef.current = true;
      mountedRef.current = false;
      speechRequestedRef.current = false;
      void stopNativeSpeech();
    };
  }, []);

  return {
    activeItemId: items[currentItemIndex]?.id,
    activeWordRange,
    canStart: enabled && queue.length > 0,
    canSkipNext: currentItemIndex < items.length - 1,
    canSkipPrevious: currentItemIndex > 0,
    currentItemIndex,
    currentItemText: items[currentItemIndex]?.text || '',
    isPaused,
    isSpeaking,
    pause,
    resume,
    skipNext,
    skipPrevious,
    start,
    stop,
    totalItems: items.length
  };
};
