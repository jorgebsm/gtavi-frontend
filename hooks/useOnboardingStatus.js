import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FEATURE_FLAGS from '../config/featureFlags';

const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: '@gtavi_onboarding_completed',
  NOTIFS_PROMPTED_AT: '@gtavi_notifs_prompted_at',
  NOTIFS_REJECTED_AT: '@gtavi_notifs_rejected_at',
};

// Mecanismo simple de publicación para sincronizar instancias del hook
const listeners = new Set();
const emit = (event) => {
  listeners.forEach((fn) => {
    try { fn(event); } catch (_) {}
  });
};

export const useOnboardingStatus = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastPromptedAt, setLastPromptedAt] = useState(null);
  const [lastRejectedAt, setLastRejectedAt] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [completed, promptedAt, rejectedAt] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED),
          AsyncStorage.getItem(STORAGE_KEYS.NOTIFS_PROMPTED_AT),
          AsyncStorage.getItem(STORAGE_KEYS.NOTIFS_REJECTED_AT),
        ]);

        setIsCompleted(completed === 'true');
        setLastPromptedAt(promptedAt ? new Date(promptedAt) : null);
        setLastRejectedAt(rejectedAt ? new Date(rejectedAt) : null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
    const handler = (event) => {
      if (!event) return;
      if (event.type === 'completed') setIsCompleted(true);
      if (event.type === 'prompted') setLastPromptedAt(new Date(event.at));
      if (event.type === 'rejected') setLastRejectedAt(new Date(event.at));
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const markCompleted = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    setIsCompleted(true);
    emit({ type: 'completed' });
  }, []);

  const markPrompted = useCallback(async () => {
    const now = new Date().toISOString();
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFS_PROMPTED_AT, now);
    setLastPromptedAt(new Date(now));
    emit({ type: 'prompted', at: now });
  }, []);

  const markRejected = useCallback(async () => {
    const now = new Date().toISOString();
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFS_REJECTED_AT, now);
    setLastRejectedAt(new Date(now));
    emit({ type: 'rejected', at: now });
  }, []);

  const canRePrompt = useCallback(() => {
    const days = FEATURE_FLAGS.ONBOARDING_REPROMPT_DAYS || 7;
    if (!lastRejectedAt) return false;
    const nextDate = new Date(lastRejectedAt);
    nextDate.setDate(nextDate.getDate() + days);
    return new Date() >= nextDate;
  }, [lastRejectedAt]);

  return {
    isCompleted,
    isLoading,
    lastPromptedAt,
    lastRejectedAt,
    markCompleted,
    markPrompted,
    markRejected,
    canRePrompt,
  };
};

export default useOnboardingStatus;


