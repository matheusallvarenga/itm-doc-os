import { useCallback, useEffect, useRef, useState } from "react";

interface RecordingTimerState {
  time: number;
  isRunning: boolean;
  isPaused: boolean;
}

export function useRecordingTimer() {
  const [state, setState] = useState<RecordingTimerState>({
    time: 0,
    isRunning: false,
    isPaused: false,
  });
  const intervalRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const tick = () => {
    setState((prev) => ({ ...prev, time: prev.time + 1 }));
  };

  const start = useCallback(() => {
    setState((prev) => {
      if (prev.isRunning && !prev.isPaused) return prev;
      return { ...prev, isRunning: true, isPaused: false };
    });
    clearTimer();
    intervalRef.current = window.setInterval(tick, 1000);
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: true }));
    clearTimer();
  }, []);

  const stop = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false, isPaused: false }));
    clearTimer();
  }, []);

  const reset = useCallback(() => {
    setState({ time: 0, isRunning: false, isPaused: false });
    clearTimer();
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  return {
    time: state.time,
    isRunning: state.isRunning,
    isPaused: state.isPaused,
    start,
    pause,
    stop,
    reset,
  };
}

