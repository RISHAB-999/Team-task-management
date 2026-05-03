function priorityDot(p) {
  return { high:'🔴', medium:'🟡', low:'🟢' }[p] || '';
}

function isOverdue(dueDate, status) {
  if (!dueDate || status === 'done') return false;
  return new Date(dueDate) < new Date();
}

export default function TaskCard({ task, onClick, onStatusChange, isAdmin, highlightStatus, currentUserId }) {
  const overdue = isOverdue(task.due_date, task.status);
  
  const canEditStatus = isAdmin || task.assignee_id === currentUserId;

  function handleStatus(e) {
    e.stopPropagation();
    const next = { todo:'in_progress', in_progress:'done', done:'todo' }[task.status];
    onStatusChange?.(task.id, next);
  }

  let shadowStyle = {};
  if (highlightStatus) {
    shadowStyle.boxShadow = task.status === 'done' 
      ? '0 0 10px var(--success-glow), 0 0 20px var(--success-glow)' // Green shadow
      : '0 0 10px var(--danger-glow), 0 0 20px var(--danger-glow)';   // Red shadow
    shadowStyle.border = `1px solid ${task.status === 'done' ? 'var(--success-border)' : 'var(--danger-border)'}`;
  }

  return (
    <div className="task-card" onClick={() => onClick?.(task)} style={shadowStyle}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:8 }}>
        <span className={`badge badge-${task.priority}`}>{priorityDot(task.priority)} {task.priority}</span>
        {overdue && <span className="badge badge-overdue">⚠ overdue</span>}
      </div>

      <div className="task-title">{task.title}</div>

      {task.description && (
        <div style={{ fontSize:12, color:'var(--text-2)', marginBottom:10, lineHeight:1.5 }}>
          {task.description.length > 80 ? task.description.slice(0,80)+'…' : task.description}
        </div>
      )}

      <div className="task-footer">
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {task.assignee && (
            <div
              className="avatar"
              style={{
                width:22,
                height:22,
                fontSize:9,
                background: task.assignee.avatar_url ? `url('${task.assignee.avatar_url}')` : task.assignee.avatar_color || 'var(--primary)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              title={task.assignee.name}
            >
              {!task.assignee.avatar_url && task.assignee.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 11, color: 'var(--text-1)', fontWeight: 600 }}>
              Given: {new Date(task.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
            </span>
            {task.due_date ? (
              <span className={overdue ? 'due-overdue' : ''} style={{ fontSize: 11, color: overdue ? 'var(--danger)' : 'var(--text-1)', fontWeight: 600 }}>
                Due: {new Date(task.due_date).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
              </span>
            ) : (
              <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Due: —</span>
            )}
          </div>
        </div>
        {canEditStatus && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleStatus}
            title="Cycle status"
            style={{ fontSize:11, padding:'3px 8px' }}
          >
            {task.status === 'todo' ? '▷ Start' : task.status === 'in_progress' ? '✓ Done' : '↺ Reopen'}
          </button>
        )}
      </div>
    </div>
  );
}
