import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Speech from 'expo-speech';

import { DetailSpeechItem } from '../helpers/accessibility/detailSpeechParser';

type SpeechChunk = {
  sourceIndex: number;
  text: string;
};

const splitIntoChunks = (text: string, maxLength: number): string[] => {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  if (normalized.length <= maxLength) return [normalized];

  const chunks: string[] = [];
  let remaining = normalized;

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
      chunks.push(part);
    }
    remaining = remaining.slice(boundary).trim();
  }

  if (remaining.length) {
    chunks.push(remaining);
  }

  return chunks;
};

const buildQueue = (items: DetailSpeechItem[]) => {
  const maxLength = Math.max(1, Speech.maxSpeechInputLength || Number.MAX_SAFE_INTEGER);

  return items.reduce<SpeechChunk[]>((acc, item, index) => {
    const chunks = splitIntoChunks(item.text, maxLength);
    chunks.forEach((chunk) => {
      acc.push({ sourceIndex: index, text: chunk });
    });
    return acc;
  }, []);
};

export const useDetailSpeech = (items: DetailSpeechItem[], enabled = true, speechRate = 1) => {
  const queue = useMemo(() => (enabled ? buildQueue(items) : []), [enabled, items]);
  const generationRef = useRef(0);
  const activeChunkIndexRef = useRef(0);
  const resumeChunkIndexRef = useRef(0);
  const previousSpeechRateRef = useRef(speechRate);
  const mountedRef = useRef(true);
  const pausedByUserRef = useRef(false);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const stop = useCallback(async () => {
    generationRef.current += 1;
    pausedByUserRef.current = false;
    resumeChunkIndexRef.current = 0;
    activeChunkIndexRef.current = 0;

    try {
      await Speech.stop();
    } catch (error) {
      console.warn('Could not stop speech playback.', error);
    }

    if (!mountedRef.current) return;
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentItemIndex(0);
  }, []);

  const playFromIndex = useCallback(
    (startIndex: number) => {
      const generation = generationRef.current;
      const finishPlayback = () => {
        if (mountedRef.current) {
          setIsSpeaking(false);
          setIsPaused(false);
          setCurrentItemIndex(items.length ? items.length - 1 : 0);
        }
        resumeChunkIndexRef.current = 0;
        activeChunkIndexRef.current = 0;
      };

      const speakChunk = (chunkIndex: number) => {
        if (!queue.length || chunkIndex >= queue.length) {
          finishPlayback();
          return;
        }

        const currentChunk = queue[chunkIndex];
        if (!currentChunk) return;

        activeChunkIndexRef.current = chunkIndex;

        if (mountedRef.current) {
          setIsSpeaking(true);
          setIsPaused(false);
          setCurrentItemIndex(currentChunk.sourceIndex);
        }

        Speech.speak(currentChunk.text, {
          rate: speechRate,
          onDone: () => {
            if (generationRef.current !== generation || pausedByUserRef.current) return;

            const nextIndex = chunkIndex + 1;
            if (nextIndex < queue.length) {
              speakChunk(nextIndex);
              return;
            }

            finishPlayback();
          },
          onError: (error) => {
            if (generationRef.current !== generation) return;
            console.warn('Speech playback failed.', error);
            if (!mountedRef.current) return;
            setIsSpeaking(false);
            setIsPaused(false);
          },
          onStart: () => {
            if (generationRef.current !== generation || !mountedRef.current) return;
            setIsSpeaking(true);
          }
        });
      };

      speakChunk(startIndex);
    },
    [items.length, queue, speechRate]
  );

  const start = useCallback(async () => {
    if (!enabled || !queue.length) return;

    generationRef.current += 1;
    pausedByUserRef.current = false;
    resumeChunkIndexRef.current = 0;

    try {
      await Speech.stop();
    } catch (error) {
      console.warn('Could not reset speech queue before start.', error);
    }

    if (!mountedRef.current) return;
    setCurrentItemIndex(0);
    playFromIndex(0);
  }, [enabled, playFromIndex, queue.length]);

  const pause = useCallback(async () => {
    if (!isSpeaking) return;

    generationRef.current += 1;
    pausedByUserRef.current = true;
    resumeChunkIndexRef.current = activeChunkIndexRef.current;

    try {
      await Speech.stop();
    } catch (error) {
      console.warn('Could not pause speech playback.', error);
    }

    if (!mountedRef.current) return;
    setIsSpeaking(false);
    setIsPaused(true);
    setCurrentItemIndex(queue[resumeChunkIndexRef.current]?.sourceIndex || 0);
  }, [isSpeaking, queue]);

  const resume = useCallback(() => {
    if (!enabled || !isPaused || !queue.length) return;

    generationRef.current += 1;
    pausedByUserRef.current = false;
    playFromIndex(resumeChunkIndexRef.current);
  }, [enabled, isPaused, playFromIndex, queue.length]);

  useEffect(() => {
    if (enabled) return;
    void stop();
  }, [enabled, stop]);

  useEffect(() => {
    if (!queue.length) {
      void Speech.stop();
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentItemIndex(0);
      resumeChunkIndexRef.current = 0;
      activeChunkIndexRef.current = 0;
      return;
    }

    if (!isSpeaking && !isPaused) {
      setCurrentItemIndex(0);
    }
  }, [isPaused, isSpeaking, queue.length]);

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

    if (!enabled || !isSpeaking || !queue.length) return;

    const restartWithNewRate = async () => {
      generationRef.current += 1;
      pausedByUserRef.current = false;
      const restartIndex = Math.min(activeChunkIndexRef.current, queue.length - 1);

      try {
        await Speech.stop();
      } catch (error) {
        console.warn('Could not restart speech playback with new speed.', error);
      }

      if (!mountedRef.current) return;
      playFromIndex(restartIndex);
    };

    void restartWithNewRate();
  }, [enabled, isSpeaking, playFromIndex, queue.length, speechRate]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      void Speech.stop();
    };
  }, []);

  return {
    canStart: enabled && queue.length > 0,
    currentItemIndex,
    isPaused,
    isSpeaking,
    pause,
    resume,
    start,
    stop,
    totalItems: items.length
  };
};
