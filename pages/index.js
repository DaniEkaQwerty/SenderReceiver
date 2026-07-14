import { useEffect, useRef, useState } from 'react';

const ACCENT = '#e9b53d';
const GREEN = '#5a9b82';
const PANEL_BG = '#171a17';
const BORDER = 'rgba(233, 230, 220, 0.12)';

function IconSend() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function IconInbox() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}
function IconArrowLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function StatusDot({ active, color }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: color,
        animation: active ? 'pulse-dot 1.4s ease-in-out infinite' : 'none',
      }}
    />
  );
}

export default function Home() {
  const [view, setView] = useState('dashboard');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState('');
  const [received, setReceived] = useState(null);
  const [receiveStatus, setReceiveStatus] = useState('waiting');
  const [justArrived, setJustArrived] = useState(false);
  const pollRef = useRef(null);
  const lastIdRef = useRef(null);

  useEffect(() => {
    if (view === 'receiver') {
      poll();
      pollRef.current = setInterval(poll, 2000);
      return () => clearInterval(pollRef.current);
    }
  }, [view]);

  async function poll() {
    try {
      const res = await fetch('/api/message');
      const data = await res.json();
      if (data.message) {
        if (data.message.id !== lastIdRef.current) {
          lastIdRef.current = data.message.id;
          setReceived(data.message);
          setJustArrived(true);
          setTimeout(() => setJustArrived(false), 900);
        }
        setReceiveStatus('ok');
      } else {
        setReceiveStatus('waiting');
      }
    } catch (e) {
      setReceiveStatus('error');
    }
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setSendStatus('transmitting');
    try {
      const res = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendStatus('error: ' + (data.error || 'unknown'));
      } else {
        setSendStatus('sent');
        setText('');
        setTimeout(() => setSendStatus(''), 1800);
      }
    } catch (e) {
      setSendStatus('error: ' + e.message);
    }
    setSending(false);
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: PANEL_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 20px',
            borderBottom: `1px solid ${BORDER}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span className="mono" style={{ fontSize: 11, letterSpacing: '0.15em', color: '#8a8f83' }}>
            RELAY // 01
          </span>
          <StatusDot active color={view === 'sender' ? ACCENT : view === 'receiver' ? GREEN : '#6b6f66'} />
        </div>

        <div style={{ padding: 28, minHeight: 420, display: 'flex', flexDirection: 'column' }}>
          {view === 'dashboard' && (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>Choose a role</h1>
              <p style={{ fontSize: 14, color: '#9a9d92', margin: '0 0 28px', lineHeight: 1.6 }}>
                Pick a side of the channel before you begin.
              </p>

              <button
                onClick={() => setView('sender')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '18px 18px',
                  marginBottom: 12,
                  background: 'transparent',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  color: '#e9e6dc',
                  textAlign: 'left',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.background = 'rgba(233,181,61,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(233,181,61,0.12)', color: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconSend />
                </span>
                <span>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>Sender</div>
                  <div className="mono" style={{ fontSize: 12, color: '#8a8f83', marginTop: 2 }}>write and transmit</div>
                </span>
              </button>

              <button
                onClick={() => setView('receiver')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '18px 18px',
                  background: 'transparent',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  color: '#e9e6dc',
                  textAlign: 'left',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = GREEN; e.currentTarget.style.background = 'rgba(90,155,130,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(90,155,130,0.14)', color: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconInbox />
                </span>
                <span>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>Receiver</div>
                  <div className="mono" style={{ fontSize: 12, color: '#8a8f83', marginTop: 2 }}>listen for incoming</div>
                </span>
              </button>
            </>
          )}

          {view === 'sender' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: ACCENT }}><IconSend /></span>
                  <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Sender</h1>
                </div>
                <button
                  onClick={() => setView('dashboard')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 8,
                    color: '#9a9d92', fontSize: 12, padding: '6px 10px',
                  }}
                >
                  <IconArrowLeft /> back
                </button>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="type your message or number here..."
                style={{
                  flex: 1,
                  minHeight: 220,
                  resize: 'vertical',
                  fontSize: 15,
                  lineHeight: 1.7,
                  padding: 16,
                  borderRadius: 10,
                  border: `1px solid ${BORDER}`,
                  background: '#0f1210',
                  color: '#e9e6dc',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                <span className="mono" style={{ fontSize: 12, color: sendStatus.startsWith('error') ? '#e07a5f' : '#8a8f83' }}>
                  {sendStatus === 'sent' && '✓ sent'}
                  {sendStatus === 'transmitting' && 'transmitting…'}
                  {sendStatus.startsWith('error') && sendStatus}
                  {!sendStatus && `${text.length} chars`}
                </span>
                <button
                  onClick={handleSend}
                  disabled={sending || !text.trim()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: ACCENT, border: 'none', borderRadius: 10,
                    color: '#1a1600', fontWeight: 500, fontSize: 14,
                    padding: '11px 20px',
                  }}
                >
                  Transmit <IconSend />
                </button>
              </div>
            </>
          )}

          {view === 'receiver' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: GREEN }}><IconInbox /></span>
                  <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Receiver</h1>
                </div>
                <button
                  onClick={() => setView('dashboard')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 8,
                    color: '#9a9d92', fontSize: 12, padding: '6px 10px',
                  }}
                >
                  <IconArrowLeft /> back
                </button>
              </div>

              <div className="mono" style={{ fontSize: 11, color: '#8a8f83', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <StatusDot active color={receiveStatus === 'ok' ? GREEN : receiveStatus === 'error' ? '#e07a5f' : ACCENT} />
                {receiveStatus === 'ok' && received && `received ${new Date(received.time).toLocaleTimeString()}`}
                {receiveStatus === 'waiting' && 'listening for transmission'}
                {receiveStatus === 'error' && 'connection error'}
              </div>

              <div
                style={{
                  flex: 1,
                  minHeight: 220,
                  padding: 16,
                  borderRadius: 10,
                  border: `1px solid ${justArrived ? GREEN : BORDER}`,
                  background: '#0f1210',
                  fontSize: 15,
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflowY: 'auto',
                  transition: 'border-color 0.3s',
                  animation: justArrived ? 'slide-in 0.3s ease-out' : 'none',
                }}
              >
                {received ? received.text : (
                  <span className="mono" style={{ color: '#54584f' }}>
                    no signal yet<span style={{ animation: 'blink-caret 1s step-end infinite' }}>_</span>
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
