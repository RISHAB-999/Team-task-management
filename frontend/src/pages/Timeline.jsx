import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Timeline() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('weeks'); // 'days', 'weeks', 'months'
  const [showFilter, setShowFilter] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState(['todo', 'in_progress', 'done', 'overdue']);
  const [selectedAssignees, setSelectedAssignees] = useState([]);

  useEffect(() => {
    api.get('/tasks/timeline').then(r => {
      setTasks(r.data.tasks || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const LEFT_PANEL_WIDTH = 320;
  const ROW_HEIGHT = 64;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const columns = [];
  let pxPerDay = 1;

  if (viewMode === 'days') {
    pxPerDay = 80;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 7); // Start 7 days ago

    for (let i = 0; i < 30; i++) {
      const colDate = new Date(startDate);
      colDate.setDate(startDate.getDate() + i);
      const isCurrent = today.getTime() === colDate.getTime();
      const month = colDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const d = colDate.getDate().toString().padStart(2, '0');

      columns.push({
        date: colDate,
        end_date: colDate,
        label: `${month} ${d}`,
        isCurrent,
        width: pxPerDay
      });
    }
  } else if (viewMode === 'weeks') {
    pxPerDay = 180 / 7;
    const day = today.getDay() || 7;
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() - day + 1 - 28);

    for (let i = 0; i < 16; i++) {
      const colDate = new Date(currentMonday);
      colDate.setDate(currentMonday.getDate() + (i * 7));
      const endColDate = new Date(colDate);
      endColDate.setDate(colDate.getDate() + 6);
      const isCurrent = today >= colDate && today <= endColDate;
      const month = colDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const d = colDate.getDate().toString().padStart(2, '0');

      columns.push({
        date: colDate,
        end_date: endColDate,
        label: `${month} ${d}`,
        isCurrent,
        width: 7 * pxPerDay
      });
    }
  } else if (viewMode === 'months') {
    pxPerDay = 8; // 240px for a 30-day month
    const startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);

    for (let i = 0; i < 12; i++) {
      const colDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const endColDate = new Date(colDate.getFullYear(), colDate.getMonth() + 1, 0);
      const daysInMonth = endColDate.getDate();
      const isCurrent = today >= colDate && today <= endColDate;
      const month = colDate.toLocaleString('en-US', { month: 'long' }).toUpperCase();
      const year = colDate.getFullYear();

      columns.push({
        date: colDate,
        end_date: endColDate,
        label: `${month} ${year}`,
        isCurrent,
        width: daysInMonth * pxPerDay
      });
    }
  }

  const startOfTimeline = columns[0].date;
  const endOfTimeline = columns[columns.length - 1].end_date;
  const totalTimelineWidth = columns.reduce((acc, c) => acc + c.width, 0);

  // Get task status for filtering
  const getTaskStatusForFilter = (task) => {
    if (!task.due_date) return 'todo';
    const due = new Date(task.due_date);
    due.setHours(0, 0, 0, 0);
    if (task.status === 'done') return 'done';
    if (task.status === 'in_progress') return 'in_progress';
    if (due < today && task.status !== 'done') return 'overdue';
    return 'todo';
  };

  // Get unique assignees from tasks
  const uniqueAssignees = Array.from(new Set(tasks.map(t => t.assigned_to_id))).filter(Boolean);
  const assigneeMap = {};
  tasks.forEach(t => {
    if (t.assigned_to_id && !assigneeMap[t.assigned_to_id]) {
      assigneeMap[t.assigned_to_id] = t.assigned_to_user?.name || 'Unknown';
    }
  });

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter(task => {
    const taskStatus = getTaskStatusForFilter(task);
    const statusMatches = selectedStatuses.includes(taskStatus);
    const assigneeMatches = selectedAssignees.length === 0 || selectedAssignees.includes(task.assigned_to_id);
    return statusMatches && assigneeMatches;
  });

  const projects = {};
  filteredTasks.forEach(t => {
    const pName = t.project?.name || 'No Project';
    if (!projects[pName]) projects[pName] = [];
    projects[pName].push(t);
  });

  const getTaskStyle = (task) => {
    if (!task.due_date) return null;

    const due = new Date(task.due_date);
    due.setHours(0, 0, 0, 0);

    let start;
    if (task.created_at) {
      start = new Date(task.created_at);
      start.setHours(0, 0, 0, 0);
      if (start > due) start = new Date(due);
    } else {
      start = new Date(due);
      start.setDate(due.getDate() - 5);
    }

    if (due < startOfTimeline || start > endOfTimeline) return null;

    const startDiff = (start - startOfTimeline) / (1000 * 60 * 60 * 24);
    const leftPx = startDiff * pxPerDay;

    const durationDays = (due - start + 1) / (1000 * 60 * 60 * 24);
    const widthPx = durationDays * pxPerDay;

    let color = 'var(--accent)';
    let text = 'PLANNED';
    let bgColor = 'rgba(168, 85, 247, 0.5)';
    let textColor = '#fff';

    if (task.status === 'done') {
      color = 'var(--success)';
      text = 'DONE';
      bgColor = 'rgba(16, 185, 129, 0.7)';
      textColor = '#fff';
    } else if (task.status === 'in_progress') {
      color = 'var(--warning)';
      text = 'IN PROGRESS';
      bgColor = 'rgba(245, 158, 11, 0.7)';
      textColor = '#1a1a2e';
    } else if (due < today && task.status !== 'done') {
      color = 'var(--danger)';
      text = 'OVERDUE';
      bgColor = 'rgba(239, 68, 68, 0.8)';
      textColor = '#fff';
    } else if (task.status === 'todo') {
      color = 'var(--text-3)';
      text = 'BACKLOG';
      bgColor = 'rgba(99, 102, 241, 0.6)';
      textColor = '#fff';
    }

    return { left: leftPx, width: Math.max(widthPx, 80), color, bgColor, text, textColor };
  };

  if (loading) return <div className="page" style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div className="page" style={{ maxWidth: 1440, margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>

      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: 'var(--text)' }}>Project Timeline</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14, marginTop: 4 }}>Workspace Roadmap</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, backgroundColor: 'transparent' }}>
            <button
              onClick={() => setViewMode('days')}
              className="btn btn-ghost"
              style={{
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 500,
                color: viewMode === 'days' ? '#fff' : 'var(--text-2)',
                background: viewMode === 'days' ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                border: viewMode === 'days' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.15)',
                borderRadius: 20,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                boxShadow: viewMode === 'days' ? '0 0 20px rgba(99,102,241,0.5)' : 'none'
              }}
              onMouseEnter={e => e.target.style.boxShadow = '0 0 20px rgba(99,102,241,0.8)'}
              onMouseLeave={e => e.target.style.boxShadow = viewMode === 'days' ? '0 0 20px rgba(99,102,241,0.5)' : 'none'}
            >Days</button>
            <button
              onClick={() => setViewMode('weeks')}
              className="btn btn-ghost"
              style={{
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 500,
                color: viewMode === 'weeks' ? '#fff' : 'var(--text-2)',
                background: viewMode === 'weeks' ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                border: viewMode === 'weeks' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.15)',
                borderRadius: 20,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                boxShadow: viewMode === 'weeks' ? '0 0 20px rgba(99,102,241,0.5)' : 'none'
              }}
              onMouseEnter={e => e.target.style.boxShadow = '0 0 20px rgba(99,102,241,0.8)'}
              onMouseLeave={e => e.target.style.boxShadow = viewMode === 'weeks' ? '0 0 20px rgba(99,102,241,0.5)' : 'none'}
            >Weeks</button>
            <button
              onClick={() => setViewMode('months')}
              className="btn btn-ghost"
              style={{
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 500,
                color: viewMode === 'months' ? '#fff' : 'var(--text-2)',
                background: viewMode === 'months' ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                border: viewMode === 'months' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.15)',
                borderRadius: 20,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                boxShadow: viewMode === 'months' ? '0 0 20px rgba(99,102,241,0.5)' : 'none'
              }}
              onMouseEnter={e => e.target.style.boxShadow = '0 0 20px rgba(99,102,241,0.8)'}
              onMouseLeave={e => e.target.style.boxShadow = viewMode === 'months' ? '0 0 20px rgba(99,102,241,0.5)' : 'none'}
            >Months</button>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => setShowFilter(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--text-2)',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 20,
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={e => e.target.style.boxShadow = '0 0 20px rgba(168,85,247,0.6)'}
            onMouseLeave={e => e.target.style.boxShadow = 'none'}
          >
            <span style={{ fontSize: 16 }}>⚙</span> Filter
          </button>
        </div>
      </div>

      <style>{`
        .timeline-container::-webkit-scrollbar { height: 10px; width: 10px; }
        .timeline-container::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 8px; }
        .timeline-container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 8px; }
        .timeline-container::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        
        .task-bar { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); z-index: 10; }
        .task-bar:hover { filter: brightness(1.2); z-index: 20 !important; }
      `}</style>

      {/* Main Board Wrapper - Strict Bounds */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0, minWidth: 0 }}>

        <div
          className="timeline-container"
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            overflow: 'auto',
            background: '#13131a',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ width: LEFT_PANEL_WIDTH + totalTimelineWidth, display: 'flex', flexDirection: 'column', minHeight: '100%', position: 'relative' }}>

            {/* FULL HEIGHT VERTICAL GRID LAYER */}
            <div style={{ position: 'absolute', top: ROW_HEIGHT, bottom: 0, left: LEFT_PANEL_WIDTH, right: 0, display: 'flex', pointerEvents: 'none', zIndex: 0 }}>
              {columns.map((c, i) => (
                <div key={i} style={{
                  width: c.width, minWidth: c.width, flexShrink: 0,
                  borderRight: '1px solid rgba(255,255,255,0.02)',
                  background: c.isCurrent ? 'rgba(99,102,241,0.02)' : 'transparent',
                  position: 'relative'
                }}>
                  {c.isCurrent && (
                    <div style={{ 
                      position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, 
                      background: 'rgba(167, 139, 250, 0.4)', 
                      boxShadow: '0 0 8px rgba(167, 139, 250, 0.4)' 
                    }} />
                  )}
                </div>
              ))}
            </div>

            {/* Table Header Row */}
            <div style={{ display: 'flex', position: 'sticky', top: 0, zIndex: 100, background: '#181822', borderBottom: '1px solid rgba(255,255,255,0.05)', height: ROW_HEIGHT * 1.2 }}>

              <div style={{
                position: 'sticky', left: 0, width: LEFT_PANEL_WIDTH, minWidth: LEFT_PANEL_WIDTH, zIndex: 110,
                background: '#181822', paddingLeft: 24, paddingRight: 24, fontSize: 11, fontWeight: 700, color: 'var(--text-2)',
                letterSpacing: 0.8, textTransform: 'uppercase', borderRight: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', boxShadow: '2px 0 10px rgba(0,0,0,0.1)', gap: 12
              }}>
                <div style={{ width: 3, height: 20, background: 'rgba(255,255,255,0.15)', borderRadius: 1 }} />
                Task Details
              </div>

              <div style={{ display: 'flex', position: 'relative', zIndex: 40, width: totalTimelineWidth }}>
                {columns.map((c, i) => (
                  <div key={i} style={{
                    width: c.width, minWidth: c.width, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRight: '1px solid rgba(255,255,255,0.02)',
                    background: c.isCurrent ? 'rgba(99,102,241,0.03)' : 'transparent',
                    fontSize: 10, fontWeight: 700, color: c.isCurrent ? '#a78bfa' : 'var(--text-2)', letterSpacing: 0.8,
                    position: 'relative',
                    padding: '0 4px'
                  }}>
                    <div style={{ textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.label} {c.isCurrent && viewMode !== 'days' && <span style={{ marginLeft: 2 }}>(NOW )</span>}
                    </div>
                    {/* The top glowing dot for NOW */}
                    {c.isCurrent && (
                      <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 10px 2px rgba(167, 139, 250, 0.6)', zIndex: 50 }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Project Groups & Tasks */}
            <div style={{ zIndex: 20, position: 'relative', display: 'flex', flexDirection: 'column', flex: 1 }}>
              {Object.keys(projects).length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-2)' }}>No tasks found in timeline.</div>
              ) : (
                Object.entries(projects).map(([projectName, projectTasks], projectIdx) => {
                  const phaseColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
                  const phaseColor = phaseColors[projectIdx % phaseColors.length];
                  
                  return (
                    <div key={projectName} style={{ display: 'flex', flexDirection: 'column', borderLeft: `4px solid ${phaseColor}`, background: 'rgba(255,255,255,0.005)' }}>
                      {/* Project Phase Row */}
                      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', height: ROW_HEIGHT, background: `rgba(255,255,255,0.02)` }}>
                        <div style={{ 
                          position: 'sticky', left: 0, width: LEFT_PANEL_WIDTH, minWidth: LEFT_PANEL_WIDTH, zIndex: 90, 
                          background: '#13131a', borderRight: '1px solid rgba(255,255,255,0.05)',
                          paddingLeft: 24, paddingRight: 24, fontSize: 12, fontWeight: 900, color: phaseColor, 
                          letterSpacing: 1.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center',
                          boxShadow: '2px 0 10px rgba(0,0,0,0.15)'
                        }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: phaseColor, boxShadow: `0 0 8px ${phaseColor}` }}></span>
                            {projectName}
                          </span>
                        </div>
                        <div style={{ display: 'flex', width: totalTimelineWidth }} />
                    </div>

                    {/* Task Rows */}
                    {projectTasks.map((task, idx) => {
                      const style = getTaskStyle(task);
                      return (
                        <div key={task.id} style={{ display: 'flex', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.02)', height: ROW_HEIGHT, background: idx % 2 === 0 ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0.008)' }}>
                          {/* Left side fixed task text */}
                          <div style={{ 
                            position: 'sticky', left: 0, width: LEFT_PANEL_WIDTH, minWidth: LEFT_PANEL_WIDTH, zIndex: 90, 
                            background: '#13131a', borderRight: '1px solid rgba(255,255,255,0.05)',
                            paddingLeft: 24, paddingRight: 24, display: 'flex', alignItems: 'center', gap: 12,
                            boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
                          }}>
                            <div style={{ width: 3, height: ROW_HEIGHT, borderRadius: 2, background: phaseColor, opacity: 1, flexShrink: 0, position: 'absolute', left: 0, top: 0, bottom: 0 }} />
                            <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {task.title}
                            </div>
                            {
                      task.assignee && (
                        <div
                          title={`Assigned to ${task.assignee.name}`}
                          style={{
                            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                            background: task.assignee.avatar_color || '#6366f1',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 11, fontWeight: 700,
                            border: '2px solid #13131a',
                            boxShadow: '0 0 0 1px rgba(255,255,255,0.1)'
                          }}>
                          {task.assignee.avatar_url ? (
                            <img src={task.assignee.avatar_url} alt={task.assignee.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            task.assignee.name.charAt(0).toUpperCase()
                          )}
                        </div>
                      )
                    }
                          </div>

              {/* Right side Task bar */}
              <div style={{ display: 'flex', position: 'relative', width: totalTimelineWidth }}>
                {style && (
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', pointerEvents: 'none', zIndex: 25 }}>
                    <div className="task-bar" style={{
                      position: 'absolute',
                      left: style.left,
                      width: style.width,
                      height: 28,
                      background: style.bgColor,
                      border: `2px solid ${style.color}`,
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 12px',
                      color: style.textColor || '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      pointerEvents: 'auto',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      boxShadow: `0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)`,
                      }} 
                                  onClick={() => navigate(`/projects/${task.project_id}`)}
                                  onMouseEnter={e => { 
                                    e.currentTarget.style.boxShadow = `0 0 30px ${style.color}66, 0 8px 30px rgba(0,0,0,0.4)`; 
                                    e.currentTarget.style.borderColor = style.color;
                                    e.currentTarget.style.transform = 'scaleY(1.05) translateY(-1px)';
                                  }}
                                  onMouseLeave={e => { 
                                    e.currentTarget.style.boxShadow = `0 4px 12px rgba(0,0,0,0.2), 0 0 10px ${style.color}33`; 
                                    e.currentTarget.style.borderColor = `${style.color}55`;
                                    e.currentTarget.style.transform = 'scaleY(1) translateY(0)';
                                  }}
                                  >
                    <div style={{ position: 'relative', zIndex: 2, whiteSpace: 'nowrap' }}>
                      {style.text}
                    </div>
                  </div>
                                </div>
                              )}
            </div>
          </div>
          );
                    })}
                    </div>
                  );
                })
              )}
              {/* Empty space filler for sticky left panel background */}
              <div style={{ flex: 1, display: 'flex' }}>
                <div style={{ 
                  position: 'sticky', left: 0, width: LEFT_PANEL_WIDTH, minWidth: LEFT_PANEL_WIDTH, 
                  background: '#13131a', borderRight: '1px solid rgba(255,255,255,0.05)', zIndex: 90,
                  boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
                }} />
              </div>

            </div>
          </div>
        </div>
      </div>

    {/* Filter Modal */ }
  {
    showFilter && (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
        zIndex: 1000, paddingTop: 100
      }} onClick={() => setShowFilter(false)}>
        <div style={{
          background: 'var(--bg-1)', border: '1px solid var(--border)',
          borderRadius: 16, padding: 24, width: 340, maxHeight: '80vh',
          overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
        }} onClick={e => e.stopPropagation()}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 24, color: 'var(--text)' }}>Filter Tasks</h2>

          {/* Status Filter */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginTop: 0, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['todo', 'in_progress', 'done', 'overdue'].map(status => (
                <label key={status} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: 'var(--text-2)', fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedStatuses([...selectedStatuses, status]);
                      } else {
                        setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                      }
                    }}
                    style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                  <span style={{ textTransform: 'capitalize' }}>{status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Assignee Filter */}
          {uniqueAssignees.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginTop: 0, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Assignee</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {uniqueAssignees.map(assigneeId => (
                  <label key={assigneeId} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: 'var(--text-2)', fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={selectedAssignees.includes(assigneeId)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedAssignees([...selectedAssignees, assigneeId]);
                        } else {
                          setSelectedAssignees(selectedAssignees.filter(a => a !== assigneeId));
                        }
                      }}
                      style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                    <span>{assigneeMap[assigneeId]}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              onClick={() => {
                setSelectedStatuses(['todo', 'in_progress', 'done', 'overdue']);
                setSelectedAssignees([]);
              }}
              style={{
                flex: 1,
                padding: '10px 16px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8,
                color: 'var(--text-2)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.15)'; e.target.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            >
              Reset
            </button>
            <button
              onClick={() => setShowFilter(false)}
              style={{
                flex: 1,
                padding: '10px 16px',
                background: 'var(--primary)',
                border: '1px solid var(--primary)',
                borderRadius: 8,
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => e.target.style.opacity = '0.9'}
              onMouseLeave={e => e.target.style.opacity = '1'}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    )
  }
    </div >
  );
}
