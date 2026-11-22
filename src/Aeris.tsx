import { useEffect, useRef, useState } from 'react';
import { Bot, Mic, Send, Volume2, X, Sparkles, Settings, Save, Loader2 } from 'lucide-react';

type Msg = { role: 'aeris' | 'you'; text: string };
type Recognition = {
  lang: string; interimResults: boolean; maxAlternatives: number;
  onresult: ((event: any) => void) | null; onerror: (() => void) | null;
  onend: (() => void) | null; start: () => void; stop: () => void;
};
declare global {
  interface Window { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition; }
}

const ENDPOINT_KEY = 'arvena-aeris-endpoint-v1';
const TOKEN_KEY = 'arvena-aeris-token-v1';

function localReply(message: string) {
  const q = message.toLowerCase().replace(/\s+/g, ' ').trim();
  if (/\b(assign|give|create|set)\b/.test(q) && /\b(mission|task)\b/.test(q)) {
    return 'COMMANDER · SUGGESTED MISSION\n\nComplete one focused 25-minute session on a specific priority. Record what you finish in Mission Control. This is a suggestion only; I have not added it to your mission list.';
  }
  if (/\b(mission|tasks?|discipline|procrastinat)\b/.test(q)) {
    return 'COMMANDER: Tell me your available time and your most important goal. I’ll help turn them into a realistic mission. I will not change your ARVENA records without your explicit instruction.';
  }
  if (/\b(unmotivat(ed|ion)?|motivat(e|ion)|encourage|no energy|can't focus|cannot focus|feeling low|feel low|give up|discourag(ed|ement)|overwhelm(ed|ing)?|stress(ed)?|sad|tired)\b/.test(q)) {
    return 'COMPANION: You do not have to fix the whole day at once. Take a breath, choose one small next step, and give yourself five minutes to begin. We can make the plan lighter if needed.';
  }
  if (/\b(study plan|timetable|schedule|plan.*study|study.*plan)\b/.test(q)) {
    return 'STRATEGIST: I can help build a realistic plan. Tell me the subjects or topics, your available hours and any fixed commitments.';
  }
  return 'AERIS is currently in local fallback mode. Connect the Cloudflare Worker in AERIS settings to enable live AI responses.';
}

export default function Aeris() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [sending, setSending] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [endpoint, setEndpoint] = useState(() => localStorage.getItem(ENDPOINT_KEY) || '');
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [aiReady, setAiReady] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'aeris', text: 'AERIS online. Commander, Companion and Strategist are ready. Connect the secure AI service to enable full conversational intelligence.' },
  ]);
  const rec = useRef<Recognition | null>(null);
  const configured = Boolean(endpoint.trim() && token.trim());

  const saveSettings = () => {
    const cleanEndpoint = endpoint.trim().replace(/\/+$/, '');
    setEndpoint(cleanEndpoint);
    localStorage.setItem(ENDPOINT_KEY, cleanEndpoint);
    localStorage.setItem(TOKEN_KEY, token.trim());
    setAiReady(false);
    setShowSettings(false);
    setMsgs(current => [...current, { role: 'aeris', text: 'AERIS connection settings saved on this device. Send a test message to verify the connection.' }]);
  };

  const send = async (value = input) => {
    const message = value.trim();
    if (!message || sending) return;
    const next = [...msgs, { role: 'you' as const, text: message }];
    setMsgs(next);
    setInput('');
    setSending(true);
    if (!configured) {
      setMsgs(current => [...current, { role: 'aeris', text: localReply(message) }]);
      setSending(false);
      return;
    }
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-ARVENA-ACCESS': token },
        body: JSON.stringify({
          messages: next.slice(-16).map(item => ({
            role: item.role === 'you' ? 'user' : 'assistant',
            content: item.text
          }))
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'The AI service returned an error.');
      if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('The AI service returned an empty response.');
      setAiReady(true);
      setMsgs(current => [...current, { role: 'aeris', text: data.reply }]);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Connection failed. Check the Worker URL and access token.';
      setAiReady(false);
      setMsgs(current => [...current, { role: 'aeris', text: 'CONNECTION ISSUE: ' + messageText + '\n\nYour message is still in this chat. Check the AERIS connection settings and try again.' }]);
    } finally {
      setSending(false);
    }
  };

  const speak = (value: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(value));
    }
  };

  const listen = () => {
    const RecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!RecognitionAPI) {
      setMsgs(current => [...current, { role: 'aeris', text: 'Voice input is not available in this browser. You can type your message instead.' }]);
      return;
    }
    if (listening) { rec.current?.stop(); setListening(false); return; }
    const recognition = new RecognitionAPI();
    rec.current = recognition;
    recognition.lang = navigator.language || 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = event => { const transcript = event.results?.[0]?.[0]?.transcript; if (transcript) void send(transcript); };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  };

  useEffect(() => () => {
    rec.current?.stop();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  return (
    <>
      <button className="aeris-launch" onClick={() => setOpen(value => !value)}>
        <Sparkles size={18} /> AERIS
      </button>
      {open && (
        <section className="aeris-panel">
          <div className="aeris-head">
            <div className="aeris-avatar"><Bot size={20} /></div>
            <div><b>AERIS</b><small>{aiReady ? 'HYBRID INTELLIGENCE · AI READY' : configured ? 'HYBRID INTELLIGENCE · CONFIGURED' : 'HYBRID INTELLIGENCE · LOCAL MODE'}</small></div>
            <button onClick={() => setShowSettings(value => !value)} aria-label="AERIS settings"><Settings size={16} /></button>
            <button onClick={() => setOpen(false)} aria-label="Close AERIS"><X size={17} /></button>
          </div>
          {showSettings && (
            <div className="aeris-config">
              <b>SECURE AI CONNECTION</b>
              <p>Enter your deployed Cloudflare Worker URL and the private access token configured as ARVENA_ACCESS_TOKEN.</p>
              <label>WORKER URL<input value={endpoint} onChange={event => setEndpoint(event.target.value)} placeholder="https://arvena-aeris.your-subdomain.workers.dev" autoComplete="url" /></label>
              <label>PRIVATE ACCESS TOKEN<input value={token} onChange={event => setToken(event.target.value)} placeholder="Paste your private token" type="password" autoComplete="off" /></label>
              <div><button onClick={saveSettings}><Save size={14}/> SAVE CONNECTION</button><button onClick={() => setShowSettings(false)}>CANCEL</button></div>
              <small>Your token is stored in this browser only. Never paste it into GitHub source code or a public chat.</small>
            </div>
          )}
          <div className="aeris-modes">
            <span>COMMANDER</span><span>COMPANION</span><span>STRATEGIST</span>
          </div>
          <div className="aeris-messages">
            {msgs.map((message, index) => (
              <div className={'aeris-message ' + message.role} key={index}>
                <small>{message.role === 'aeris' ? 'AERIS' : 'YOU'}</small>
                <p style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
                {message.role === 'aeris' && (
                  <button className="aeris-speak" onClick={() => speak(message.text)}><Volume2 size={13} /> Listen</button>
                )}
              </div>
            ))}
            {sending && <div className="aeris-message aeris"><small>AERIS</small><p><Loader2 size={14} className="aeris-spinner"/> Thinking…</p></div>}
          </div>
          <div className="aeris-compose">
            <button className={listening ? 'listening' : ''} onClick={listen} aria-label="Voice input"><Mic size={17} /></button>
            <input value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') void send(); }} placeholder="Message AERIS..." />
            <button onClick={() => void send()} aria-label="Send" disabled={sending}><Send size={16} /></button>
          </div>
          <p className="aeris-note">{aiReady ? 'Cloud AI active · messages sent to Cloudflare Workers AI' : configured ? 'Cloud AI configured · send a message to test' : 'Local fallback · connect AI in settings · microphone activates only when tapped'}</p>
        </section>
      )}
    </>
  );
}
