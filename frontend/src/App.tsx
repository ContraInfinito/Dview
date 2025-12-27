import { useEffect, useState } from 'react';
import { fetchCandles, analyze } from './api';
import { Candle } from './types';
import { Chart } from './components/Chart';

interface AnalysisRecord {
  id: string;
  symbol: string;
  timeframe: string;
  text: string;
  timestamp: Date;
  groupId: string | null;
}

interface AnalysisGroup {
  id: string;
  name: string;
  color: string;
}

const symbols = [
  { label: 'Boom 500', value: 'BOOM500' },
  { label: 'Crash 500', value: 'CRASH500' },
];

const timeframes = [
  { label: '1m', value: '1m' },
  { label: '1h', value: '1h' },
  { label: '1d', value: '1d' },
];

function App() {
  const [symbol, setSymbol] = useState(symbols[0].value);
  const [timeframe, setTimeframe] = useState(timeframes[0].value);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  
  const [history, setHistory] = useState<AnalysisRecord[]>(() => {
    const saved = localStorage.getItem('analysisHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [groups, setGroups] = useState<AnalysisGroup[]>(() => {
    const saved = localStorage.getItem('analysisGroups');
    return saved ? JSON.parse(saved) : [];
  });
  const [newGroupName, setNewGroupName] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    localStorage.setItem('analysisHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('analysisGroups', JSON.stringify(groups));
  }, [groups]);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchCandles(symbol, timeframe);
      setCandles(data.candles);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load candles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [symbol, timeframe]);

  const runAnalysis = async () => {
    try {
      setAnalyzing(true);
      setError('');
      const text = await analyze(symbol, timeframe);
      setAnalysis(text);
      
      // Save to history
      const record: AnalysisRecord = {
        id: Date.now().toString(),
        symbol,
        timeframe,
        text,
        timestamp: new Date(),
        groupId: null,
      };
      setHistory(prev => [record, ...prev]);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const deleteAnalysis = (id: string) => {
    setHistory(prev => prev.filter(a => a.id !== id));
  };

  const assignToGroup = (analysisId: string, groupId: string | null) => {
    setHistory(prev => prev.map(a => a.id === analysisId ? { ...a, groupId } : a));
  };

  const createGroup = () => {
    if (!newGroupName.trim()) return;
    const colors = ['#2ecc71', '#3498db', '#9b59b6', '#e67e22', '#e74c3c', '#1abc9c', '#f1c40f'];
    const newGroup: AnalysisGroup = {
      id: Date.now().toString(),
      name: newGroupName.trim(),
      color: colors[groups.length % colors.length],
    };
    setGroups(prev => [...prev, newGroup]);
    setNewGroupName('');
  };

  const deleteGroup = (groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
    setHistory(prev => prev.map(a => a.groupId === groupId ? { ...a, groupId: null } : a));
  };

  const clearAllHistory = () => {
    if (confirm('Clear all analysis history?')) {
      setHistory([]);
    }
  };

  return (
    <div className="app">
      <div className="header">
        <strong>Symbol:</strong>
        {symbols.map((s) => (
          <button key={s.value} className={`button ${symbol === s.value ? 'active' : ''}`} onClick={() => setSymbol(s.value)}>
            {s.label}
          </button>
        ))}
        <strong>Timeframe:</strong>
        {timeframes.map((t) => (
          <button key={t.value} className={`button ${timeframe === t.value ? 'active' : ''}`} onClick={() => setTimeframe(t.value)}>
            {t.label}
          </button>
        ))}
        <button className="button" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
        <button className="button" onClick={runAnalysis} disabled={analyzing}>
          {analyzing ? 'Analyzing…' : 'AI Analysis'}
        </button>
        <button className="button" onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? 'Hide' : 'Show'} History ({history.length})
        </button>
      </div>

      <div className="panel">
        {error && <div style={{ color: '#e74c3c', marginBottom: 8 }}>{error}</div>}
        <div className="chart-container">
          <Chart candles={candles} />
        </div>
      </div>

      {showHistory && (
        <div className="panel" style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3>Analysis History</h3>
            <button className="button" onClick={clearAllHistory} style={{ fontSize: 12 }}>Clear All</button>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <strong>Groups:</strong>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {groups.map(g => (
                <span key={g.id} style={{ background: g.color, padding: '4px 8px', borderRadius: 4, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {g.name}
                  <button onClick={() => deleteGroup(g.id)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14 }}>×</button>
                </span>
              ))}
              <input 
                type="text" 
                placeholder="New group" 
                value={newGroupName} 
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createGroup()}
                style={{ padding: '4px 8px', background: '#0f141c', border: '1px solid #2c3b52', borderRadius: 4, color: '#e8edf5', fontSize: 12, width: 120 }}
              />
              <button className="button" onClick={createGroup} style={{ fontSize: 12, padding: '4px 8px' }}>+</button>
            </div>
          </div>

          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {history.length === 0 ? (
              <p style={{ color: '#8fa1c1' }}>No analysis history yet.</p>
            ) : (
              history.map(record => {
                const group = groups.find(g => g.groupId === record.groupId);
                return (
                  <div key={record.id} style={{ background: '#0f141c', padding: 12, marginBottom: 8, borderRadius: 6, borderLeft: group ? `4px solid ${group.color}` : '4px solid transparent' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                      <div>
                        <strong>{record.symbol}</strong> <span style={{ color: '#8fa1c1' }}>({record.timeframe})</span>
                        <span style={{ color: '#8fa1c1', fontSize: 11, marginLeft: 8 }}>
                          {new Date(record.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <select 
                          value={record.groupId || ''} 
                          onChange={(e) => assignToGroup(record.id, e.target.value || null)}
                          style={{ background: '#1f2a3a', color: '#e8edf5', border: '1px solid #2c3b52', borderRadius: 4, padding: '2px 6px', fontSize: 11 }}
                        >
                          <option value="">No group</option>
                          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                        <button onClick={() => deleteAnalysis(record.id)} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 11 }}>Delete</button>
                      </div>
                    </div>
                    <div style={{ color: '#e8edf5', fontSize: 13, whiteSpace: 'pre-wrap' }}>{record.text}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <div className="panel" style={{ marginTop: 12 }}>
        <h3>AI Analysis</h3>
        <textarea value={analysis} readOnly placeholder="Run AI Analysis to generate commentary" />
        <p style={{ color: '#8fa1c1', fontSize: 12 }}>
          AI calls use an external API via the backend; set LLM_API_URL and LLM_API_KEY in the backend .env.
        </p>
      </div>
    </div>
  );
}

export default App;
