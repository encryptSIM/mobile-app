import AsyncStorage from '@react-native-async-storage/async-storage';

export type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

export interface LogEntry {
  id: string; // stable id for UI
  timestamp: number; // first occurrence timestamp
  level: LogLevel;
  message: string;
  args: unknown[];
  count: number; // number of times this normalized log repeated
  lastTimestamp: number; // last time we saw the same normalized log
  key: string; // normalized dedupe key
}

interface PersistShape {
  version: 1;
  maxEntries: number;
  maxBytes: number;
  approxBytes: number;
  logs: LogEntry[];
}

type Listener = () => void;

function stableStringify(value: unknown): string {
  try {
    if (typeof value === 'string') return value;
    if (value instanceof Error) {
      return `${value.name}: ${value.message}\n${value.stack ?? ''}`;
    }
    return JSON.stringify(value, Object.keys(value as object).sort(), 2);
  } catch {
    return String(value);
  }
}

function normalizeMessage(args: unknown[]): string {
  const parts = args.map((a) => stableStringify(a));
  return parts.join(' ');
}

function computeKey(level: LogLevel, args: unknown[]): string {
  return `${level}|${normalizeMessage(args)}`;
}

function roughSizeOf(entry: LogEntry): number {
  // Cheap approximation to limit storage growth
  const base =
    8 + // timestamp
    8 + // lastTimestamp
    4 + // count
    entry.level.length +
    entry.message.length +
    entry.key.length +
    36; // id + overhead
  // args are not persisted fully as strings; we rely on message only
  return base;
}

class Logger {
  private static instance: Logger | null = null;
  private storageKey = '@app_logs_v1';
  private originalConsole: Console;
  private logs: LogEntry[] = [];
  private maxEntries = 5000; // hard cap on number of grouped entries
  private maxBytes = 1_500_000; // ~1.5 MB budget, tune as needed
  private approxBytes = 0;
  private saveScheduled = false;
  private listeners = new Set<Listener>();
  private overrideApplied = false;

  private constructor() {
    this.originalConsole = { ...console };
    void this.load();
    this.applyOverride();
  }

  static getInstance(): Logger {
    if (!Logger.instance) Logger.instance = new Logger();
    return Logger.instance;
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify(): void {
    for (const fn of this.listeners) {
      try {
        fn();
      } catch {
        // ignore
      }
    }
  }

  private applyOverride(): void {
    if (this.overrideApplied) return;
    this.overrideApplied = true;

    const levels: LogLevel[] = ['log', 'warn', 'error', 'info', 'debug'];

    levels.forEach((level) => {
      const original = this.originalConsole[level] as (...a: unknown[]) => void;
      console[level] = (...args: unknown[]) => {
        try {
          original(...args);
          this.capture(level, args);
        } catch {
          try {
            original(...args);
          } catch {
            // ignore
          }
        }
      };
    });
  }

  private async load(): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(this.storageKey);
      if (!raw) return;

      const parsed = JSON.parse(raw) as PersistShape;
      if (parsed?.version === 1 && Array.isArray(parsed.logs)) {
        this.logs = parsed.logs;
        this.maxEntries = parsed.maxEntries ?? this.maxEntries;
        this.maxBytes = parsed.maxBytes ?? this.maxBytes;
        this.approxBytes =
          typeof parsed.approxBytes === 'number'
            ? parsed.approxBytes
            : this.recalcBytes();
        this.pruneToLimits();
      } else {
        this.logs = [];
        this.approxBytes = 0;
      }
      this.notify();
    } catch (e) {
      this.originalConsole.error('Logger load failed', e);
      this.logs = [];
      this.approxBytes = 0;
    }
  }

  private scheduleSave(): void {
    if (this.saveScheduled) return;
    this.saveScheduled = true;
    // Batch saves to avoid excessive writes
    setTimeout(() => {
      this.saveScheduled = false;
      void this.save();
    }, 400);
  }

  private recalcBytes(): number {
    let total = 0;
    for (const e of this.logs) total += roughSizeOf(e);
    return total;
  }

  private pruneToLimits(): void {
    // Prune by entry count first
    if (this.logs.length > this.maxEntries) {
      const toRemove = this.logs.length - this.maxEntries;
      for (let i = 0; i < toRemove; i++) {
        const removed = this.logs.pop();
        if (removed) this.approxBytes -= roughSizeOf(removed);
      }
    }

    // Prune by size
    while (this.approxBytes > this.maxBytes && this.logs.length > 0) {
      const removed = this.logs.pop();
      if (removed) this.approxBytes -= roughSizeOf(removed);
    }

    if (this.approxBytes < 0) this.approxBytes = this.recalcBytes();
  }

  private async save(): Promise<void> {
    try {
      const data: PersistShape = {
        version: 1,
        maxEntries: this.maxEntries,
        maxBytes: this.maxBytes,
        approxBytes: this.approxBytes,
        logs: this.logs,
      };
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      this.originalConsole.error('Logger save failed', e);
    }
  }

  private capture(level: LogLevel, args: unknown[]): void {
    try {
      const key = computeKey(level, args);
      const now = Date.now();

      // Deduplicate: bump count if same normalized message and level
      const head = this.logs[0];
      if (head && head.key === key) {
        head.count += 1;
        head.lastTimestamp = now;
        // No size delta for same group bump
        this.scheduleSave();
        this.notify();
        return;
      }

      // If not identical to head, check a small window to merge nearby duplicates
      // to avoid storing same log twice when interleaved lightly.
      const windowSize = Math.min(10, this.logs.length);
      for (let i = 0; i < windowSize; i++) {
        const e = this.logs[i];
        if (e.key === key) {
          e.count += 1;
          e.lastTimestamp = now;
          // Move this entry to the front for recency
          this.logs.splice(i, 1);
          this.logs.unshift(e);
          this.scheduleSave();
          this.notify();
          return;
        }
      }

      const message = normalizeMessage(args);
      const entry: LogEntry = {
        id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: now,
        lastTimestamp: now,
        level,
        message,
        args: [], // Do not persist raw args to save space; message holds the formatted content
        count: 1,
        key,
      };

      this.logs.unshift(entry);
      this.approxBytes += roughSizeOf(entry);
      this.pruneToLimits();
      this.scheduleSave();
      this.notify();
    } catch (e) {
      try {
        this.originalConsole.error('Logger capture failed', e);
      } catch {
        // ignore
      }
    }
  }

  // Public API

  setLimits(opts: { maxEntries?: number; maxBytes?: number }): void {
    if (typeof opts.maxEntries === 'number' && opts.maxEntries > 100) {
      this.maxEntries = Math.floor(opts.maxEntries);
    }
    if (typeof opts.maxBytes === 'number' && opts.maxBytes >= 200_000) {
      this.maxBytes = Math.floor(opts.maxBytes);
    }
    this.pruneToLimits();
    this.scheduleSave();
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Flattened view: expand groups into individual “occurrences” if needed
  getFlattenedLogs(limit?: number): LogEntry[] {
    const out: LogEntry[] = [];
    for (const e of this.logs) {
      if (e.count <= 1) {
        out.push(e);
      } else {
        // Represent as one summary entry; consumers can show count and expand on demand.
        out.push(e);
      }
      if (limit && out.length >= limit) break;
    }
    return out;
  }

  // Grouped utilities
  getFilteredLogs(
    level?: LogLevel,
    search?: string
  ): LogEntry[] {
    const s = search?.toLowerCase().trim();
    const list = this.logs.filter((l) => {
      if (level && l.level !== level) return false;
      if (s && !l.message.toLowerCase().includes(s)) return false;
      return true;
    });
    return [...list];
  }

  clearLogs(): void {
    this.logs = [];
    this.approxBytes = 0;
    this.scheduleSave();
    this.notify();
  }
}

export const logger = Logger.getInstance();
