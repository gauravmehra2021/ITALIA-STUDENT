import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { learnApi } from '../services/api';
import type { LearnerSummary } from '../types';

interface LearnerState {
  summary: LearnerSummary | null;
  refresh: () => Promise<void>;
}

const LearnerContext = createContext<LearnerState>({ summary: null, refresh: async () => undefined });

/** XP, streak and enrolled courses — shown in the header and refreshed after each lesson. */
export function LearnerProvider({ children }: { children: ReactNode }) {
  const [summary, setSummary] = useState<LearnerSummary | null>(null);

  const refresh = useCallback(async () => {
    try {
      setSummary(await learnApi.me());
    } catch {
      /* header stats are optional */
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return <LearnerContext.Provider value={{ summary, refresh }}>{children}</LearnerContext.Provider>;
}

export const useLearner = () => useContext(LearnerContext);
