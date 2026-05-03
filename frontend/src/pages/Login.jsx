import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({ email:'', password:'' });
  const [signupForm, setSignupForm] = useState({ name:'', email:'', password:'', role:'member' });

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await login(loginForm.email, loginForm.password);
    setLoading(false);
    if (res.ok) navigate('/');
    else setError(res.error);
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await signup(signupForm.name, signupForm.email, signupForm.password, signupForm.role);
    setLoading(false);
    if (res.ok) navigate('/');
    else setError(res.error);
  }

  const isLogin = tab === 'login';

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="brand-icon">
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="10" height="10" rx="2.5" fill="white"/>
              <rect x="16" y="2" width="10" height="10" rx="2.5" fill="white" opacity="0.7"/>
              <rect x="2" y="16" width="10" height="10" rx="2.5" fill="white" opacity="0.7"/>
              <rect x="16" y="16" width="10" height="10" rx="2.5" fill="white" opacity="0.4"/>
            </svg>
          </div>
          <h1>TaskFlow</h1>
          <p>Team collaboration, simplified</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab${isLogin ? ' active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Sign In</button>
          <button className={`auth-tab${!isLogin ? ' active' : ''}`} onClick={() => { setTab('signup'); setError(''); }}>Sign Up</button>
        </div>

        {error && <div className="form-error">{error}</div>}

        {isLogin ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@company.com" value={loginForm.email}
                onChange={e => setLoginForm(p => ({...p, email:e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={loginForm.password}
                onChange={e => setLoginForm(p => ({...p, password:e.target.value}))} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
              {loading ? <span className="spinner"/> : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" value={signupForm.name}
                onChange={e => setSignupForm(p => ({...p, name:e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@company.com" value={signupForm.email}
                onChange={e => setSignupForm(p => ({...p, email:e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>Password <small style={{color:'var(--text-2)'}}>min 6 chars</small></label>
              <input type="password" placeholder="Create a strong password" value={signupForm.password}
                onChange={e => setSignupForm(p => ({...p, password:e.target.value}))} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
              {loading ? <span className="spinner"/> : 'Create Account'}
            </button>
          </form>
        )}

        <p style={{ textAlign:'center', fontSize:12, color:'var(--text-2)', marginTop:20 }}>
          💡 First user to sign up automatically becomes Admin
        </p>
      </div>
    </div>
  );
}
