import { useEffect, useRef, useState } from 'react';
import { Bot, Mic, Send, Volume2, X, Sparkles } from 'lucide-react';

type Msg = { role: 'aeris' | 'you'; text: string };
type Recognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: any) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => Recognition;
    webkitSpeechRecognition?: new () => Recognition;
  }
}

function reply(message: string) {
  const q = message.toLowerCase().replace(/\s+/g, ' ').trim();

  // Commander: only prepare a mission when the user explicitly asks for one.
  if (/\b(assign|give|create|set)\b/.test(q) && /\b(mission|task|machin)\b/.test(q)) {
    return 'COMMANDER · TODAY’S MISSION\n\nMission: Complete one focused 25-minute study or personal-development session.\n\n1. Choose one specific topic or task.\n2. Put your phone aside and work for 25 minutes.\n3. Write down what you completed.\n\nDifficulty: Balanced\nReward: Complete this mission in ARVENA’s Missions section to earn the rewards configured there.\n\nThis is a suggested mission. I have not added it to your mission list.';
  }
  if (/\b(mission|tasks?|discipline|procrastinat)\b/.test(q)) {
    return 'COMMANDER: Let’s make progress without overloading your day. Tell me your available time and your most important goal, and I’ll help break it into a realistic mission. I will not add or execute anything in ARVENA without your explicit instruction.';
  }

  // Companion: recognise common emotional and motivation language.
  if (/\b(unmotivat(ed|ion)?|motivat(e|ion)|encourage|no energy|can't focus|cannot focus|feeling low|feel low|give up|discourag(ed|ement)|overwhelm(ed|ing)?|stress(ed)?|sad|tired)\b/.test(q)) {
    return 'COMPANION: It’s okay if you don’t feel motivated right now. You do not have to fix your whole day in one moment. Start with something small: drink some water, take a breath, and choose one task you can do for just five minutes. You can stop after five minutes if you need to. Progress does not require a perfect mood. I’m here to help you take the next step.';
  }

  // Strategist: study planning and learning support.
  if (/\b(study plan|timetable|schedule|plan.*study|study.*plan)\b/.test(q)) {
    return 'STRATEGIST: Let’s build a realistic plan for tomorrow. Tell me which subjects or topics you need to cover and how many hours you can study. I’ll organise them into focused sessions, breaks, practice and revision.';
  }
  if (/\b(study|learn|knowledge|jee|exam|revision)\b/.test(q)) {
    return 'STRATEGIST: We can approach this systematically: first identify the topic, then review fundamentals, understand key concepts, solve examples, practise questions and finish with a short revision checkpoint. Tell me the subject and topic to begin.';
  }

  if (/\b(help|what can you do|capabilit)\b/.test(q)) {
    return 'I am AERIS, ARVENA’s hybrid intelligence interface. Commander helps structure missions and accountability; Companion offers encouragement and support; Strategist helps with study, planning and problem-solving. This version uses local response logic. A live AI model is not connected yet.';
  }

  return 'I’ve received your message. I’m currently running in local mode, so I can help with a limited set of mission, motivation and study-planning requests. A live AI model is not connected yet.';
}

export default function Aeris() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'aeris', text: 'AERIS online. I am your hybrid intelligence interface. What would you like to work on?' },
  ]);
  const rec = useRef<Recognition | null>(null);

  const send = (value = input) => {
    const message = value.trim();
    if (!message) return;
    setMsgs(current => [
      ...current,
      { role: 'you', text: message },
      { role: 'aeris', text: reply(message) },
    ]);
    setInput('');
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
      setMsgs(current => [...current, {
        role: 'aeris',
        text: 'Voice input is not available in this browser. You can type your message instead.',
      }]);
      return;
    }
    if (listening) {
      rec.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new RecognitionAPI();
    rec.current = recognition;
    recognition.lang = navigator.language || 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = event => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) send(transcript);
    };
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
            <div><b>AERIS</b><small>HYBRID INTELLIGENCE · LOCAL MODE</small></div>
            <button onClick={() => setOpen(false)} aria-label="Close AERIS"><X size={17} /></button>
          </div>
          <div className="aeris-modes">
            <span>COMMANDER</span><span>COMPANION</span><span>STRATEGIST</span>
          </div>
          <div className="aeris-messages">
            {msgs.map((message, index) => (
              <div className={'aeris-message ' + message.role} key={index}>
                <small>{message.role === 'aeris' ? 'AERIS' : 'YOU'}</small>
                <p style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
                {message.role === 'aeris' && (
                  <button className="aeris-speak" onClick={() => speak(message.text)}>
                    <Volume2 size={13} /> Listen
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="aeris-compose">
            <button className={listening ? 'listening' : ''} onClick={listen} aria-label="Voice input">
              <Mic size={17} />
            </button>
            <input
              value={input}
              onChange={event => setInput(event.target.value)}
              onKeyDown={event => { if (event.key === 'Enter') send(); }}
              placeholder="Message AERIS..."
            />
            <button onClick={() => send()} aria-label="Send"><Send size={16} /></button>
          </div>
          <p className="aeris-note">Local assistant · No live AI connection · Microphone activates only when tapped</p>
        </section>
      )}
    </>
  );
}
