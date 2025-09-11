import React, {
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
  JSX,
} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  SafeAreaView,
  Modal,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { logger, LogEntry } from '../../utils/logger';

type Level = LogEntry['level'] | 'all';
type SimilarityMode = 'message' | 'level+message';

const LOG_COLORS: Record<LogEntry['level'], string> = {
  log: '#fff',
  info: '#4a90e2',
  warn: '#f5a623',
  error: '#d0021b',
  debug: '#9013fe',
};

function normalizeMessage(message: string): string {
  return message.replace(/\s+/g, ' ').trim();
}

function summarize(message: string, max = 140): string {
  const m = normalizeMessage(message);
  return m.length <= max ? m : `${m.slice(0, max - 1)}…`;
}

function similarityKey(entry: LogEntry, mode: SimilarityMode = 'message'): string {
  const base = normalizeMessage(entry.message);
  if (mode === 'level+message') return `${entry.level}:${base}`;
  return base;
}

function formatEntry(entry: LogEntry): string {
  const ts = new Date(entry.timestamp).toISOString();
  return `[${ts}] ${entry.level.toUpperCase()}: ${entry.message}`;
}

export default function LogViewer(): JSX.Element {
  const [logs, setLogs] = useState<LogEntry[]>(logger.getLogs());
  const [selectedLevel, setSelectedLevel] = useState<Level>('all');
  const [searchText, setSearchText] = useState('');
  const [collapsedAll, setCollapsedAll] = useState<boolean>(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [hiddenSimilarityKeys, setHiddenSimilarityKeys] = useState<Set<string>>(
    new Set()
  );
  const [similarityMode, setSimilarityMode] = useState<SimilarityMode>('message');
  const [actionLog, setActionLog] = useState<LogEntry | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const listRef = useRef<FlatList<LogEntry>>(null);

  const refreshLogs = useCallback(() => {
    setLogs(logger.getLogs());
  }, []);

  const clearLogs = useCallback(() => {
    Alert.alert('Clear Logs', 'Are you sure you want to clear all logs?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          logger.clearLogs();
          refreshLogs();
          setSelectedIds(new Set());
          setExpandedIds(new Set());
        },
      },
    ]);
  }, [refreshLogs]);

  const resetFilters = useCallback(() => {
    setSelectedLevel('all');
    setSearchText('');
    setCollapsedAll(false);
    setExpandedIds(new Set());
    setHiddenSimilarityKeys(new Set());
    setSelectedIds(new Set());
  }, []);

  const filteredLogs = useMemo(() => {
    const levelFilter = selectedLevel === 'all' ? undefined : selectedLevel;
    const search = searchText.trim().toLowerCase();

    return logger
      .getFilteredLogs(levelFilter, search.length ? search : undefined)
      .filter((l) => !hiddenSimilarityKeys.has(similarityKey(l, similarityMode)));
  }, [selectedLevel, searchText, hiddenSimilarityKeys, similarityMode]);

  const countsByKey = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of filteredLogs) {
      const key = similarityKey(l, similarityMode);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [filteredLogs, similarityMode]);

  const isExpanded = useCallback(
    (id: string) => expandedIds.has(id),
    [expandedIds]
  );

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const collapseAll = useCallback(() => {
    setCollapsedAll(true);
    setExpandedIds(new Set());
  }, []);

  const expandAll = useCallback(() => {
    setCollapsedAll(false);
    setExpandedIds(new Set(filteredLogs.map((l) => l.id)));
  }, [filteredLogs]);

  const scrollToBottom = useCallback(() => {
    if (!listRef.current || filteredLogs.length === 0) return;
    listRef.current.scrollToIndex({
      index: filteredLogs.length - 1,
      animated: true,
      viewPosition: 1,
    });
  }, [filteredLogs.length]);

  useEffect(() => {
    const sub = setInterval(() => {
      const latest = logger.getLogs();
      if (latest.length !== logs.length) {
        setLogs(latest);
      }
    }, 1000);
    return () => clearInterval(sub);
  }, [logs.length]);

  const openActions = useCallback((entry: LogEntry) => {
    setActionLog(entry);
  }, []);

  const closeActions = useCallback(() => {
    setActionLog(null);
  }, []);

  const seeSimilar = useCallback(() => {
    if (!actionLog) return;
    setSelectedLevel('all');
    setSearchText(normalizeMessage(actionLog.message));
    setHiddenSimilarityKeys(new Set());
    closeActions();
  }, [actionLog, closeActions]);

  const hideSimilar = useCallback(() => {
    if (!actionLog) return;
    const key = similarityKey(actionLog, similarityMode);
    setHiddenSimilarityKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    closeActions();
  }, [actionLog, similarityMode, closeActions]);

  const copyText = useCallback(async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Copied', 'Content copied to clipboard.');
    } catch (e) {
      Alert.alert('Copy failed', 'Unable to copy to clipboard.');
    }
  }, []);

  const copyEntry = useCallback(
    async (entry: LogEntry) => {
      await copyText(formatEntry(entry));
    },
    [copyText]
  );

  const copyAll = useCallback(async () => {
    const text = filteredLogs.map(formatEntry).join('\n');
    await copyText(text);
  }, [filteredLogs, copyText]);

  const copySelected = useCallback(async () => {
    const selected = filteredLogs.filter((l) => selectedIds.has(l.id));
    if (selected.length === 0) {
      Alert.alert('No selection', 'Select one or more logs first.');
      return;
    }
    const text = selected.map(formatEntry).join('\n');
    await copyText(text);
  }, [filteredLogs, selectedIds, copyText]);

  const renderLogItem = useCallback(
    ({ item }: { item: LogEntry }) => {
      const expanded = collapsedAll ? isExpanded(item.id) : true;
      const display =
        expanded || collapsedAll ? item.message : summarize(item.message);
      const key = similarityKey(item, similarityMode);
      const count = countsByKey.get(key) ?? 1;
      const selected = selectedIds.has(item.id);

      return (
        <TouchableOpacity
          onPress={() => {
            if (collapsedAll) {
              toggleExpanded(item.id);
            } else {
              toggleSelected(item.id);
            }
          }}
          onLongPress={() => openActions(item)}
          activeOpacity={0.7}
          style={[
            styles.logItem,
            {
              borderLeftColor: LOG_COLORS[item.level] ?? '#333',
              borderColor: selected ? '#4a90e2' : '#333',
            },
            selected && styles.selectedItem,
          ]}
        >
          <View style={styles.logHeader}>
            <View style={styles.logHeaderLeft}>
              <Text style={[styles.logLevel, { color: LOG_COLORS[item.level] }]}>
                {item.level.toUpperCase()}
              </Text>
              {count > 1 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleTimeString()}
            </Text>
          </View>

          <Text
            style={styles.logMessage}
            numberOfLines={collapsedAll && !expanded ? 1 : undefined}
          >
            {display}
          </Text>

          <View style={styles.inlineActions}>
            <TouchableOpacity
              onPress={() =>
                collapsedAll ? toggleExpanded(item.id) : openActions(item)
              }
              style={styles.inlineActionBtn}
            >
              <Text style={styles.inlineActionText}>
                {collapsedAll && !expanded ? 'Expand' : 'Actions'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => toggleSelected(item.id)}
              style={styles.inlineActionBtn}
            >
              <Text style={styles.inlineActionText}>
                {selected ? 'Deselect' : 'Select'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => copyEntry(item)}
              style={styles.inlineActionBtn}
            >
              <Text style={styles.inlineActionText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [
      collapsedAll,
      isExpanded,
      toggleExpanded,
      openActions,
      countsByKey,
      similarityMode,
      selectedIds,
      toggleSelected,
      copyEntry,
    ]
  );

  const keyExtractor = useCallback((item: LogEntry) => item.id, []);
  const levels: Level[] = ['all', 'log', 'info', 'warn', 'error', 'debug'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Logs ({filteredLogs.length})</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={refreshLogs} style={styles.button}>
            <Text style={styles.buttonText}>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearLogs} style={[styles.button, styles.dangerButton]}>
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.controlsRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search logs..."
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
          autoCorrect={false}
          autoCapitalize="none"
        />

        <TouchableOpacity onPress={resetFilters} style={styles.smallButton}>
          <Text style={styles.smallButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {levels.map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.filterButton,
              selectedLevel === level && styles.activeFilter,
            ]}
            onPress={() => setSelectedLevel(level)}
          >
            <Text
              style={[
                styles.filterText,
                selectedLevel === level && styles.activeFilterText,
              ]}
            >
              {level.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.toolbarRow}>
        <TouchableOpacity
          onPress={() => setCollapsedAll((v) => !v)}
          style={styles.toolbarButton}
        >
          <Text style={styles.toolbarButtonText}>
            {collapsedAll ? 'Expand All' : 'Collapse All'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={expandAll} style={styles.toolbarButton}>
          <Text style={styles.toolbarButtonText}>Expand Visible</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={collapseAll} style={styles.toolbarButton}>
          <Text style={styles.toolbarButtonText}>Collapse Visible</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={scrollToBottom} style={styles.toolbarButton}>
          <Text style={styles.toolbarButtonText}>Bottom</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.selectionBar}>
        <Text style={styles.selectionText}>
          Selected: {selectedIds.size}
        </Text>
        <View style={styles.selectionActions}>
          <TouchableOpacity onPress={clearSelection} style={styles.toolbarButton}>
            <Text style={styles.toolbarButtonText}>Clear Selection</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={copySelected} style={styles.toolbarButton}>
            <Text style={styles.toolbarButtonText}>Copy Selected</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={copyAll} style={styles.toolbarButton}>
            <Text style={styles.toolbarButtonText}>Copy All</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={filteredLogs}
        renderItem={renderLogItem}
        keyExtractor={keyExtractor}
        style={styles.logsList}
        showsVerticalScrollIndicator={false}
        initialNumToRender={30}
        maxToRenderPerBatch={30}
        windowSize={10}
        removeClippedSubviews
        getItemLayout={(_, index) => ({
          length: 100,
          offset: 100 * index,
          index,
        })}
        extraData={selectedIds}
      />

      <ActionModal
        visible={!!actionLog}
        entry={actionLog}
        onClose={closeActions}
        onSeeSimilar={seeSimilar}
        onHideSimilar={hideSimilar}
        onCopySingle={() => {
          if (actionLog) void copyEntry(actionLog);
        }}
        similarityMode={similarityMode}
        setSimilarityMode={setSimilarityMode}
      />
    </SafeAreaView>
  );
}

function ActionModal(props: {
  visible: boolean;
  entry: LogEntry | null;
  onClose: () => void;
  onSeeSimilar: () => void;
  onHideSimilar: () => void;
  onCopySingle: () => void;
  similarityMode: SimilarityMode;
  setSimilarityMode: (m: SimilarityMode) => void;
}): JSX.Element | null {
  const {
    visible,
    entry,
    onClose,
    onSeeSimilar,
    onHideSimilar,
    onCopySingle,
    similarityMode,
    setSimilarityMode,
  } = props;

  if (!visible || !entry) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Log Actions</Text>
          <Text style={styles.modalSubtitle}>Level: {entry.level.toUpperCase()}</Text>
          <Text style={styles.modalMessage} numberOfLines={8}>
            {entry.message}
          </Text>

          <View style={styles.modeRow}>
            <Text style={styles.modeLabel}>Similarity:</Text>
            <TouchableOpacity
              onPress={() => setSimilarityMode('message')}
              style={[
                styles.modeBtn,
                similarityMode === 'message' && styles.modeBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  similarityMode === 'message' && styles.modeBtnTextActive,
                ]}
              >
                Message
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSimilarityMode('level+message')}
              style={[
                styles.modeBtn,
                similarityMode === 'level+message' && styles.modeBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  similarityMode === 'level+message' &&
                  styles.modeBtnTextActive,
                ]}
              >
                Level+Message
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onSeeSimilar} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>See Similar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onHideSimilar} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Hide Similar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onCopySingle} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Copy This</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.modalClose}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerButtons: { flexDirection: 'row', gap: 8 },
  button: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  dangerButton: { backgroundColor: '#d0021b' },
  buttonText: { color: '#fff', fontSize: 12, fontWeight: '500' },

  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  smallButton: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  smallButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#333',
  },
  activeFilter: { backgroundColor: '#4a90e2' },
  filterText: { color: '#999', fontSize: 12, fontWeight: '500' },
  activeFilterText: { color: '#fff' },

  toolbarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  toolbarButton: {
    backgroundColor: '#222',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toolbarButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  selectionBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#222',
    backgroundColor: '#0d0d0d',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectionText: { color: '#aaa', fontSize: 12 },
  selectionActions: { flexDirection: 'row', gap: 8, flex: 1, flexWrap: 'wrap' },

  logsList: { flex: 1 },

  logItem: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 8,
    marginVertical: 4,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#333',
    borderWidth: 1,
  },
  selectedItem: {
    backgroundColor: '#101a26',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logLevel: { fontSize: 12, fontWeight: 'bold' },
  timestamp: { fontSize: 11, color: '#888' },
  logMessage: { color: '#fff', fontSize: 14, lineHeight: 20 },

  badge: {
    backgroundColor: '#333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  inlineActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  inlineActionBtn: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  inlineActionText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  modalSubtitle: { color: '#aaa', fontSize: 12, marginBottom: 8 },
  modalMessage: { color: '#fff', fontSize: 14, lineHeight: 20, marginBottom: 12 },
  modeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  modeLabel: { color: '#ccc', fontSize: 12 },
  modeBtn: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  modeBtnActive: { backgroundColor: '#4a90e2' },
  modeBtnText: { color: '#ddd', fontSize: 12, fontWeight: '600' },
  modeBtnTextActive: { color: '#fff' },

  modalActions: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  modalButton: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  modalClose: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalCloseText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
