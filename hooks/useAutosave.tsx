'use client';

import { useEffect, useRef, useState } from 'react';

export interface AutosaveStatus {
  status: 'idle' | 'typing' | 'saving' | 'saved';
  lastSaved: Date | null;
  countdown: number;
}

interface UseAutosaveOptions {
  delay?: number; // Debounce delay in milliseconds (default: 5000)
  onSave: () => Promise<void> | void;
}

export function useAutosave({ delay = 5000, onSave }: UseAutosaveOptions) {
  const [status, setStatus] = useState<AutosaveStatus>({
    status: 'idle',
    lastSaved: null,
    countdown: 0,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef(false);

  const clearTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  const save = async () => {
    clearTimers();
    setStatus((prev) => ({ ...prev, status: 'saving', countdown: 0 }));
    
    try {
      await onSave();
      const now = new Date();
      setStatus({
        status: 'saved',
        lastSaved: now,
        countdown: 0,
      });
      pendingChangesRef.current = false;
    } catch (error) {
      console.error('Autosave failed:', error);
      setStatus((prev) => ({ ...prev, status: 'idle', countdown: 0 }));
    }
  };

  const triggerAutosave = () => {
    clearTimers();
    pendingChangesRef.current = true;

    // Update status to typing with countdown
    setStatus((prev) => ({
      ...prev,
      status: 'typing',
      countdown: Math.ceil(delay / 1000),
    }));

    // Start countdown interval
    let remainingSeconds = Math.ceil(delay / 1000);
    countdownIntervalRef.current = setInterval(() => {
      remainingSeconds -= 1;
      setStatus((prev) => ({
        ...prev,
        countdown: remainingSeconds,
      }));

      if (remainingSeconds <= 0 && countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }, 1000);

    // Schedule the actual save
    timeoutRef.current = setTimeout(() => {
      save();
    }, delay);
  };

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingChangesRef.current) {
        // Synchronous save attempt
        onSave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearTimers();
    };
  }, [onSave]);

  return { status, triggerAutosave, save };
}

interface AutosaveIndicatorProps {
  status: AutosaveStatus;
}

export function AutosaveIndicator({ status }: AutosaveIndicatorProps) {
  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'typing':
        return `Typing... autosave in ${status.countdown}s`;
      case 'saving':
        return 'Saving...';
      case 'saved':
        return status.lastSaved
          ? `Saved at ${formatTime(status.lastSaved)}`
          : 'All changes saved';
      default:
        return 'All changes saved';
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'typing':
        return 'text-yellow-600';
      case 'saving':
        return 'text-blue-600';
      case 'saved':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'typing':
        return '⌛';
      case 'saving':
        return '💾';
      case 'saved':
        return '✓';
      default:
        return '✓';
    }
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${getStatusColor()} transition-colors`}>
      <span>{getStatusIcon()}</span>
      <span>{getStatusText()}</span>
    </div>
  );
}
