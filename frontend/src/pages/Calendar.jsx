import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Calendar() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Current month state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slideDirection, setSlideDirection] = useState('slide-none');
  const [hoveredDate, setHoveredDate] = useState(null);

  useEffect(() => {
    // Fetch all tasks for the calendar
    // Since we don't have a generic /tasks endpoint for members, we'll use dashboard stats
    // which has recent and upcoming tasks, or if you're admin it gets all tasks.
    // For a real app, you'd add a GET /tasks endpoint.
    api.get('/tasks/dashboard/stats').then(r => {
      const allTasks = [...(r.data.recentTasks || []), ...(r.data.upcomingTasks || []), ...(r.data.overdueTasks || [])];
      // Deduplicate by ID
      const uniqueTasks = Array.from(new Map(allTasks.map(t => [t.id, t])).values());
      setTasks(uniqueTasks);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Make Monday = 0, Sunday = 6
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  const prevMonthDays = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth() - 1);
  
  const days = [];
  
  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ date: prevMonthDays - i, isCurrentMonth: false });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: i, isCurrentMonth: true });
  }
  
  // Next month leading days (to complete the grid)
  const remainingCells = 35 - days.length; // 5 rows of 7
  for (let i = 1; i <= (remainingCells > 0 ? remainingCells : 42 - days.length); i++) {
    days.push({ date: i, isCurrentMonth: false });
  }

  // Map real tasks by date
  const mappedTasks = {};
  tasks.forEach(task => {
    // If the task has no due date but is completed, we could potentially show it on updated_at
    // But for now, we'll place it on due_date. If we want it on the date it was done:
    const targetDateStr = task.status === 'done' && task.updated_at ? task.updated_at : task.due_date;
    if (!targetDateStr) return;
    
    const targetDate = new Date(targetDateStr);
    if (targetDate.getMonth() === currentDate.getMonth() && targetDate.getFullYear() === currentDate.getFullYear()) {
      const d = targetDate.getDate();
      if (!mappedTasks[d]) mappedTasks[d] = [];
      
      let color = 'var(--text-2)'; // default
      if (task.status === 'done') {
        color = 'var(--success)'; // Green for done
      } else {
        if (task.priority === 'high') color = 'var(--danger)';
        if (task.priority === 'medium') color = 'var(--warning)';
        if (task.priority === 'low') color = 'var(--primary)';
      }
      
      mappedTasks[d].push({ ...task, color });
    }
  });

  const [selectedDay, setSelectedDay] = useState(null);

  const nextMonth = () => {
    setSlideDirection('slide-left');
    setTimeout(() => {
      setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));
      setSlideDirection('slide-in-right');
    }, 150);
  };
  
  const prevMonth = () => {
    setSlideDirection('slide-right');
    setTimeout(() => {
      setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
      setSlideDirection('slide-in-left');
    }, 150);
  };
  
  const goToday = () => {
    setSlideDirection('fade-out');
    setTimeout(() => {
      setCurrentDate(new Date());
      setSlideDirection('fade-in');
    }, 150);
  };

  return (
    <div className="page" style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* Top Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Workspace Calendar</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', gap: 20, color: 'var(--text-2)', fontSize: 14, fontWeight: 500 }}>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => navigate('/')} onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; }}>Tasks</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => navigate('/timeline')} onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; }}>Timeline</span>
            <span style={{ color: 'var(--text)', borderBottom: '2px solid var(--accent)', paddingBottom: 4, cursor: 'pointer' }} onClick={() => navigate('/calendar')}>Calendar</span>
          </div>
        </div>
      </div>

      {/* Month Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{monthName} {year}</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14, marginTop: 4 }}>You have {Object.values(mappedTasks).flat().length} tasks scheduled this month.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', padding: '4px', gap: '4px' }}>
          <button onClick={prevMonth} className="btn btn-ghost" style={{ padding: '10px 14px', fontSize: 14, fontWeight: 500, color: 'var(--text-2)', background: 'transparent', border: 'none', borderRadius: 8, transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.08)"} onMouseLeave={e => e.currentTarget.style.background="transparent"}>&lt;</button>
          <button onClick={goToday} className="btn btn-ghost" style={{ padding: '10px 20px', fontWeight: 600, fontSize: 14, color: 'var(--text)', background: 'rgba(99,102,241,0.15)', border: 'none', borderRadius: 8, transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background="rgba(99,102,241,0.25)"} onMouseLeave={e => e.currentTarget.style.background="rgba(99,102,241,0.15)"}>Today</button>
          <button onClick={nextMonth} className="btn btn-ghost" style={{ padding: '10px 14px', fontSize: 14, fontWeight: 500, color: 'var(--text-2)', background: 'transparent', border: 'none', borderRadius: 8, transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.08)"} onMouseLeave={e => e.currentTarget.style.background="transparent"}>&gt;</button>
        </div>
      </div>

      <style>{`
        .calendar-grid { transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease; width: 100%; flex: 1; }
        .slide-none { transform: translateX(0); opacity: 1; }
        .slide-left { transform: translateX(-30px); opacity: 0; }
        .slide-right { transform: translateX(30px); opacity: 0; }
        .slide-in-right { transform: translateX(30px); opacity: 0; animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .slide-in-left { transform: translateX(-30px); opacity: 0; animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .fade-out { opacity: 0; transform: scale(0.98); }
        .fade-in { opacity: 0; transform: scale(0.98); animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes slideIn { to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn { to { transform: scale(1); opacity: 1; } }
        
        .day-cell {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .day-cell:hover {
          box-shadow: 0 0 25px var(--glow-color, var(--accent));
          border-color: var(--glow-color, var(--accent)) !important;
          transform: translateY(-2px);
          z-index: 10;
        }
        .day-cell.dimmed:hover {
          transform: none;
          box-shadow: none;
          border-color: transparent !important;
          cursor: default;
        }
      `}</style>

      {/* Calendar Grid */}
      <div className={`calendar-grid ${slideDirection}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 16 }}>
        {/* Days of Week */}
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
          <div key={day} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', letterSpacing: 1, paddingBottom: 16 }}>
            {day}
          </div>
        ))}

        {/* Days */}
        {days.map((dayObj, i) => {
          const isToday = dayObj.isCurrentMonth && dayObj.date === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
          const dayTasks = dayObj.isCurrentMonth ? mappedTasks[dayObj.date] : null;

          // Check if date is overdue (past date with incomplete tasks)
          const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayObj.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const isOverdue = dayObj.isCurrentMonth && dateToCheck < today;
          const hasIncompleteTasks = dayTasks && dayTasks.some(t => t.status !== 'done');
          const isOverdueWithIncomplete = isOverdue && hasIncompleteTasks;

          // Determine glow color
          let glowColor = 'rgba(99,102,241,0.5)'; // Default theme glow
          if (dayTasks && dayTasks.length > 0) {
            const allDone = dayTasks.every(t => t.status === 'done');
            if (allDone) {
              glowColor = 'rgba(16,185,129,0.6)'; // Green glow
            } else if (isOverdueWithIncomplete) {
              glowColor = 'rgba(239,68,68,0.8)'; // Red glow for overdue
            } else {
              glowColor = 'rgba(239,68,68,0.6)'; // Red glow
            }
          }

          const hasTasks = dayTasks && dayTasks.length > 0;
          const displayTasks = dayTasks ? dayTasks.slice(0, 3) : [];
          const remainingCount = dayTasks ? dayTasks.length - 3 : 0;
          const isHovered = hoveredDate === i;

          // Determine shadow style
          let shadowStyle = isToday ? '0 0 20px rgba(99,102,241,0.3), inset 0 0 20px rgba(99,102,241,0.1)' : 'none';
          if (isHovered) {
            if (hasTasks) {
              shadowStyle = `0 0 30px ${glowColor}, inset 0 0 20px ${glowColor}`;
            } else {
              // Purple shadow for dates without tasks
              shadowStyle = '0 0 30px rgba(168,85,247,0.5), inset 0 0 20px rgba(168,85,247,0.15)';
            }
          }

          return (
            <div 
              key={i} 
              className={`day-cell ${!dayObj.isCurrentMonth ? 'dimmed' : ''}`}
              onClick={() => {
                if (dayObj.isCurrentMonth && hasTasks) {
                  setSelectedDay({ date: dayObj.date, tasks: dayTasks });
                }
              }}
              onMouseEnter={() => setHoveredDate(i)}
              onMouseLeave={() => setHoveredDate(null)}
              style={{ 
              '--glow-color': glowColor,
              aspectRatio: '1', 
              minHeight: 120,
              width: '100%',
              background: isToday ? 'rgba(99,102,241,0.15)' : isOverdueWithIncomplete ? 'rgba(239,68,68,0.2)' : dayObj.isCurrentMonth ? 'var(--border-light)' : 'transparent',
              border: isToday ? '2px solid var(--primary)' : isOverdueWithIncomplete ? '2px solid rgba(239,68,68,0.6)' : '1px solid var(--border-light)',
              borderRadius: 12, 
              padding: 16,
              opacity: dayObj.isCurrentMonth ? 1 : 0.3,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: shadowStyle,
              transition: 'box-shadow 0.3s ease-out, background 0.2s ease-out, border 0.2s ease-out',
              cursor: hasTasks ? 'pointer' : 'default'
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: isToday ? 'var(--primary)' : 'var(--text-2)' }}>
                {dayObj.date.toString().padStart(2, '0')}
              </div>
              
              {isToday && <div style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 12px var(--primary)' }} />}

              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden' }}>
                {displayTasks.map(task => {
                  const isDone = task.status === 'done';
                  return (
                    <div key={task.id} style={{ 
                      background: `${task.color}20`, 
                      border: `1px solid ${task.color}40`,
                      color: isDone ? 'rgba(255,255,255,0.6)' : '#fff', 
                      fontSize: 10, 
                      fontWeight: 500, 
                      padding: '4px 8px', 
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '100%',
                      boxSizing: 'border-box',
                      textDecoration: isDone ? 'line-through' : 'none'
                    }}>
                      {isDone ? (
                        <div style={{ color: task.color, fontSize: 10, fontWeight: 800 }}>✓</div>
                      ) : (
                        <div style={{ width: 4, height: 4, minWidth: 4, borderRadius: '50%', background: task.color }} />
                      )}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                    </div>
                  );
                })}
                {remainingCount > 0 && (
                  <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600, padding: '2px 4px', textAlign: 'center' }}>
                    + {remainingCount} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Tasks Modal */}
      {selectedDay && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }} onClick={() => setSelectedDay(null)}>
          <div 
            style={{ 
              background: 'var(--bg-2)', border: '1px solid var(--border)', 
              borderRadius: 16, width: 480, maxWidth: '90%', padding: 24,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
                  {monthName} {selectedDay.date}, {year}
                </h2>
                <div style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 4 }}>
                  {selectedDay.tasks.length} Task{selectedDay.tasks.length !== 1 ? 's' : ''} Scheduled
                </div>
              </div>
              <button className="btn btn-ghost" onClick={() => setSelectedDay(null)} style={{ padding: 8, color: 'var(--text-2)' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '60vh', overflowY: 'auto', paddingRight: 4 }}>
              {selectedDay.tasks.map(task => {
                const isDone = task.status === 'done';
                return (
                  <div key={task.id} style={{
                    padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12,
                    borderLeft: `4px solid ${task.color}`, display: 'flex', flexDirection: 'column', gap: 8
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ 
                        fontSize: 15, fontWeight: 600, color: isDone ? 'var(--text-2)' : '#fff',
                        textDecoration: isDone ? 'line-through' : 'none' 
                      }}>
                        {task.title}
                      </div>
                      <div style={{ 
                        background: `${task.color}20`, color: task.color, 
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12, textTransform: 'uppercase' 
                      }}>
                        {task.priority}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: task.project?.color || 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', fontSize: 8, fontWeight: 700 }}>
                          {(task.project?.name || 'P')[0].toUpperCase()}
                        </div>
                        {task.project?.name || 'No Project'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: task.status === 'done' ? 'var(--success)' : task.status === 'in_progress' ? 'var(--accent)' : 'var(--text-2)' }}>
                          ●
                        </span>
                        <span style={{ textTransform: 'capitalize' }}>{task.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setSelectedDay(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
