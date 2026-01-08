import { useState, useEffect, useCallback } from 'react';
import { getHistory, HistoryEntry, GetHistoryParams } from '../../api/history';

export interface IHistoryTableEntry {
  id: string;
  date: string;
  time: string;
  performedBy: string;
  performedByEmail: string;
  description: string;
  entityType?: string;
  entityName?: string;
}

export interface IUseHistoryReturn {
  history: IHistoryTableEntry[];
  isLoading: boolean;
  error: string | null;
  loadHistory: (params?: GetHistoryParams) => Promise<void>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
}

export const useHistory = (): IUseHistoryReturn => {
  const [history, setHistory] = useState<IHistoryTableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);

  const transformHistoryEntry = (entry: HistoryEntry): IHistoryTableEntry => {
    const date = new Date(entry.createdAt);
    
    return {
      id: entry._id,
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      performedBy: entry.performedByName,
      performedByEmail: entry.performedByEmail,
      description: entry.description,
      entityType: entry.entityType,
      entityName: entry.entityName,
    };
  };

  const loadHistory = useCallback(async (params?: GetHistoryParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getHistory(params);
      
      if (response.success && response.data) {
        const transformedHistory = response.data.map(transformHistoryEntry);
        setHistory(transformedHistory);
        setPagination(response.pagination || null);
      } else {
        throw new Error('Failed to fetch history');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial history on mount
  useEffect(() => {
    loadHistory({ limit: 50 });
  }, [loadHistory]);

  return {
    history,
    isLoading,
    error,
    loadHistory,
    pagination,
  };
};
