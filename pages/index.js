import { useEffect, useRef, useState } from 'react';

const NAVY = '#1a3a5c';
const MINT = '#ccffcc';
const MINT_HOVER = '#b6ffb6';
const BORDER = '#e5e5e5';

function Header() {
  return (
    <header
      style={{
        background: NAVY,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        padding: '0 30px',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,.2)',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: MINT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: NAVY,
          fontWeight: 'bold',
          marginRight: 15,
          fontSize: 18,
        }}
      >
        ⇄
      </div>
      <h2 style={{ margin: 0, fontSize: 18 }}>Relay Console</h2>
    </header>
  );
}

function BackLink({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        color: '#888',
        fontSize: 13,
        padding: 0,
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      ← Kembali
    </button>
  );
}

export default function Home() {
  const [view, setView] = useState('dashboard');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState('');
  const [received, setReceived] = useState(null);
  const [history, setHistory] = useState([]);
  const [receiveStatus, setReceiveStatus] = useState('waiting');
  const [resetting, setResetting] = useState(false);
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
        lastIdRef.current = data.message.id;
        setReceived(data.message);
      } else {
        setReceived(null);
      }
      setHistory(data.history || []);
      setReceiveStatus('ok');
    } catch (e) {
      setReceiveStatus('error');
    }
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setSendStatus('mengirim…');
    try {
      const res = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendStatus('gagal: ' + (data.error || 'unknown'));
      } else {
        setSendStatus('terkirim');
        setText('');
        setTimeout(() => setSendStatus(''), 1800);
      }
    } catch (e) {
      setSendStatus('gagal: ' + e.message);
    }
    setSending(false);
  }

  async function handleReset(withHistory) {
    if (resetting) return;
    setResetting(true);
    try {
      await fetch('/api/message' + (withHistory ? '?history=1' : ''), { method: 'DELETE' });
      setReceived(null);
      if (withHistory) setHistory([]);
      setSendStatus('pesan direset');
      setTimeout(() => setSendStatus(''), 1500);
    } catch (e) {
      setSendStatus('gagal reset: ' + e.message);
    }
    setResetting(false);
  }

  const cardStyle = {
    background: 'white',
    borderRadius: 15,
    padding: 30,
    border: `1px solid ${BORDER}`,
    boxShadow: '0 2px 10px rgba(0,0,0,.08)',
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />

      <div style={{ maxWidth: 560, margin: '50px auto', padding: '0 20px' }}>
        {view === 'dashboard' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <h2 style={{ margin: 0, color: NAVY }}>Pilih peran</h2>
              <p style={{ color: '#666', margin: '6px 0 0' }}>Mau jadi pengirim atau penerima?</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              <div
                style={{ ...cardStyle, cursor: 'pointer', transition: '.25s' }}
                onClick={() => setView('sender')}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,.08)'; }}
              >
                <div style={{ width: 60, height: 60, borderRadius: 14, background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 16 }}>📤</div>
                <h3 style={{ margin: '0 0 8px', color: NAVY }}>Sender</h3>
                <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6, margin: 0 }}>Tulis dan kirim teks atau angka ke penerima.</p>
                <button className="open-btn" style={{ marginTop: 20, width: '100%', background: MINT, color: NAVY, border: 'none', borderRadius: 10, padding: 13, fontWeight: 'bold' }}>
                  Buka
                </button>
              </div>

              <div
                style={{ ...cardStyle, cursor: 'pointer', transition: '.25s' }}
                onClick={() => setView('receiver')}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,.08)'; }}
              >
                <div style={{ width: 60, height: 60, borderRadius: 14, background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 16 }}>📥</div>
                <h3 style={{ margin: '0 0 8px', color: NAVY }}>Receiver</h3>
                <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6, margin: 0 }}>Terima teks yang dikirim, otomatis update.</p>
                <button className="open-btn" style={{ marginTop: 20, width: '100%', background: MINT, color: NAVY, border: 'none', borderRadius: 10, padding: 13, fontWeight: 'bold' }}>
                  Buka
                </button>
              </div>
            </div>
          </>
        )}

        {view === 'sender' && (
          <div style={cardStyle}>
            <BackLink onClick={() => setView('dashboard')} />
            <h3 style={{ margin: '0 0 4px', color: NAVY }}>Sender</h3>
            <p style={{ color: '#666', fontSize: 14, margin: '0 0 20px' }}>Tulis pesan, lalu kirim ke receiver.</p>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tulis teks atau angka di sini…"
              style={{
                width: '100%',
                minHeight: 200,
                resize: 'vertical',
                fontSize: 15,
                lineHeight: 1.6,
                padding: 14,
                borderRadius: 10,
                border: `1px solid ${BORDER}`,
                background: '#fafbfc',
                color: '#1a1a1a',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <span style={{ fontSize: 13, color: sendStatus.startsWith('gagal') ? '#c0392b' : '#888' }}>
                {sendStatus || `${text.length} karakter`}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button
                onClick={handleSend}
                disabled={sending || !text.trim()}
                style={{ flex: 1, background: MINT, color: NAVY, border: 'none', borderRadius: 10, padding: 13, fontWeight: 'bold' }}
                onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = MINT_HOVER; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = MINT; }}
              >
                Kirim
              </button>
              <button
                onClick={() => handleReset(false)}
                disabled={resetting}
                style={{ background: '#ffe3e0', color: '#b3261e', border: 'none', borderRadius: 10, padding: '13px 18px', fontWeight: 'bold' }}
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {view === 'receiver' && (
          <>
            <div style={cardStyle}>
              <BackLink onClick={() => setView('dashboard')} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <h3 style={{ margin: 0, color: NAVY }}>Receiver</h3>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#888' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: receiveStatus === 'ok' ? '#4caf50' : '#e0a800', animation: 'pulse-dot 1.4s ease-in-out infinite' }} />
                  {receiveStatus === 'ok' ? 'terhubung' : 'menyambung…'}
                </span>
              </div>
              <p style={{ color: '#666', fontSize: 14, margin: '0 0 20px' }}>
                {received ? `Diterima ${new Date(received.time).toLocaleTimeString()}` : 'Belum ada pesan masuk.'}
              </p>

              <div
                style={{
                  minHeight: 200,
                  padding: 14,
                  borderRadius: 10,
                  border: `1px solid ${BORDER}`,
                  background: '#fafbfc',
                  fontSize: 15,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflowY: 'auto',
                  animation: 'fade-in 0.3s ease-out',
                }}
              >
                {received ? received.text : <span style={{ color: '#b0b0b0' }}>Menunggu pesan…</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                <button
                  onClick={() => handleReset(false)}
                  disabled={resetting}
                  style={{ background: '#ffe3e0', color: '#b3261e', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 'bold', fontSize: 13 }}
                >
                  Reset pesan
                </button>
              </div>
            </div>

            <div style={{ ...cardStyle, marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ margin: 0, color: NAVY, fontSize: 16 }}>History</h3>
                <button
                  onClick={() => handleReset(true)}
                  disabled={resetting || history.length === 0}
                  style={{ background: 'transparent', border: 'none', color: '#b3261e', fontSize: 13, padding: 0 }}
                >
                  Hapus semua
                </button>
              </div>

              {history.length === 0 && (
                <p style={{ color: '#b0b0b0', fontSize: 14, margin: 0 }}>Belum ada riwayat pesan.</p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 260, overflowY: 'auto' }}>
                {history.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: `1px solid ${BORDER}`,
                      background: item.id === (received && received.id) ? '#f2fff2' : '#fafbfc',
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>
                      {new Date(item.time).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 14, color: '#1a1a1a', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
