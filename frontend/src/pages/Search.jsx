import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Search() {
  const [q, setQ]             = useState('');
  const [results, setResults] = useState({ tasks:[], projects:[] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const timer = useRef();

  useEffect(() => {
    clearTimeout(timer.current);
    if (q.length < 2) { setResults({ tasks:[], projects:[] }); return; }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(q)}`);
        setResults(data);
      } catch {}
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer.current);
  }, [q]);

  const hasResults = results.tasks.length > 0 || results.projects.length > 0;

  return (
    <div className="page">
      <div className="page-header"><h1>Search</h1></div>

      <div style={{ maxWidth:640 }}>
        <div className="form-group">
          <input
            autoFocus type="text" placeholder="🔍 Search tasks and projects..." value={q}
            onChange={e => setQ(e.target.value)}
            style={{ fontSize:16, padding:'14px 18px' }}
          />
        </div>

        {loading && <div style={{ color:'var(--text-2)', fontSize:13 }}>Searching…</div>}

        {!loading && q.length >= 2 && !hasResults && (
          <div className="empty-state"><div className="icon">🔍</div><h3>No results for "{q}"</h3></div>
        )}

        {results.projects.length > 0 && (
          <div className="section">
            <div className="section-header"><span className="section-title">Projects</span></div>
            <div className="card" style={{ padding:0 }}>
              {results.projects.map(p => (
                <div key={p.id} className="member-row" style={{ padding:'12px 16px', cursor:'pointer' }}
                  onClick={() => navigate(`/projects/${p.id}`)}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:p.color }} />
                  <div className="member-info">
                    <div className="member-name">{p.name}</div>
                    {p.description && <div className="member-email">{p.description.slice(0,60)}</div>}
                  </div>
                  <span className={`badge badge-${p.status}`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.tasks.length > 0 && (
          <div className="section">
            <div className="section-header"><span className="section-title">Tasks</span></div>
            <div className="card" style={{ padding:0 }}>
              {results.tasks.map(t => (
                <div key={t.id} className="member-row" style={{ padding:'12px 16px', cursor:'pointer' }}
                  onClick={() => navigate(`/projects/${t.project?.id}`)}>
                  <div>
                    <div className="member-name">{t.title}</div>
                    <div style={{ display:'flex', gap:6, marginTop:4 }}>
                      <span style={{ fontSize:11, color: t.project?.color }}>● {t.project?.name}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:6, marginLeft:'auto' }}>
                    <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                    <span className={`badge badge-${t.status}`}>{t.status.replace('_',' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
