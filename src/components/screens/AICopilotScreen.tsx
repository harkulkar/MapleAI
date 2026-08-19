import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Copy,
  Check
} from 'lucide-react';
import type { Claim, CopilotMessage } from '../../types/claims';
import { processCopilotQuery } from '../../services/aiService';
import type { ScreenId } from '../layout/Sidebar';

interface AICopilotScreenProps {
  claims: Claim[];
  onSelectClaim: (claimId: string) => void;
  setActiveScreen: (screen: ScreenId) => void;
}

const SUGGESTED_PROMPTS = [
  'Tell me about claim ALL-812189',
  'What documents are pending for Gallagher claims?',
  'Show all theft claims in JPP entity',
  'Which claims have the highest loss amount?',
  'Show summary of Marsh broker claims',
  'What documents are pending for Alliance?'
];

const STATUS_PILL: Record<string, string> = {
  'Settled': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Open - Documents Pending': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Open - For Settlement': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Open - With Insurer': 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  'Open - Assessment Pending': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
};

function statusPillClass(status: string) {
  return STATUS_PILL[status] ?? 'bg-slate-700/40 text-slate-300 border-slate-600/40';
}

function parsePendingList(raw: string): string[] {
  const text = raw.replace(/\s+/g, ' ').trim();
  if (!text) return [];
  if (/\d+\.\s/.test(text)) {
    return text.split(/\s*(?:\d+\.\s+)/).map((item) => item.trim().replace(/[.;]+$/, '')).filter((item) => item.length > 2);
  }
  if (text.includes('•')) {
    return text.split('•').map((item) => item.trim()).filter((item) => item.length > 2);
  }
  return [text];
}

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(<strong key={`${keyPrefix}-b-${i++}`} className="font-semibold text-white">{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(<code key={`${keyPrefix}-c-${i++}`} className="rounded bg-slate-800 px-1 py-0.5 font-mono text-[11px] text-amber-300">{token.slice(1, -1)}</code>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function CopilotRichText({ text }: { text: string }) {
  const lines = text.replace(/\r/g, '').split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.trim().startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i += 1;
      }
      const rows = tableLines
        .map((row) => row.split('|').slice(1, -1).map((cell) => cell.trim()))
        .filter((row) => row.length > 0 && !row.every((cell) => /^[-:]+$/.test(cell)));
      if (rows.length > 0) {
        const [header, ...body] = rows;
        blocks.push(
          <div key={`t-${key++}`} className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-left">
              <thead className="bg-slate-900">
                <tr>
                  {header.map((cell, idx) => (
                    <th key={idx} className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{cell.replace(/\*\*/g, '')}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {body.map((row, rIdx) => (
                  <tr key={rIdx} className="bg-slate-950/60">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 text-xs text-slate-200">{renderInline(cell, `td-${rIdx}-${cIdx}`)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      blocks.push(
        <p key={`h-${key++}`} className="text-sm font-bold text-white">
          {renderInline(heading[2], `h-${key}`)}
        </p>
      );
      i += 1;
      continue;
    }

    if (line.trim().startsWith('>')) {
      const quote = line.replace(/^>\s?/, '');
      blocks.push(
        <div key={`q-${key++}`} className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          {renderInline(quote, `q-${key}`)}
        </div>
      );
      i += 1;
      continue;
    }

    if (/^\s*[-•]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && (/^\s*[-•]\s+/.test(lines[i]) || /^\s*\d+\.\s+/.test(lines[i]))) {
        items.push(lines[i].replace(/^\s*[-•]\s+/, '').replace(/^\s*\d+\.\s+/, ''));
        i += 1;
      }
      blocks.push(
        <ul key={`l-${key++}`} className="space-y-1.5">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-2 text-xs text-slate-200">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
              <span>{renderInline(item, `li-${idx}`)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    blocks.push(
      <p key={`p-${key++}`} className="text-xs leading-relaxed text-slate-300">
        {renderInline(line.replace(/^\*|\*$/g, ''), `p-${key}`)}
      </p>
    );
    i += 1;
  }

  return <div className="space-y-2.5">{blocks}</div>;
}

export const AICopilotScreen: React.FC<AICopilotScreenProps> = ({ claims, onSelectClaim, setActiveScreen }) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: 'Hello — I am MAPLE AI Copilot, trained on the Maple Highways master register (581 claims, 47 columns).\n\nAsk about a claim ID (ALL-812189, GAL-CLAIM-2025-26-04669, WTW-91, MAR-0001), broker, entity, pending documents, or asset damage.'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: CopilotMessage = {
      id: Date.now().toString(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const response = processCopilotQuery(text, claims);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 550);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmailId(id);
    setTimeout(() => setCopiedEmailId(null), 2000);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto h-[calc(100vh-4rem)] flex flex-col space-y-4">
      {/* Copilot Header */}
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-900 border border-blue-400/30 flex items-center justify-center text-amber-400 shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>MAPLE AI COPILOT</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                ACTIVE
              </span>
            </h1>
            <p className="text-xs text-slate-400">Natural language AI query engine across claims, contracts, deductibles & documents.</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 rounded-lg"
        >
          Clear Chat
        </button>
      </div>

      {/* Quick Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        <span className="text-[11px] font-bold uppercase text-slate-500 shrink-0">CEO Prompts:</span>
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-blue-900/40 text-slate-300 hover:text-white border border-slate-800 hover:border-blue-500/50 text-xs font-medium whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 overflow-y-auto space-y-6 shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-3xl space-y-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}>
              <div className={`p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                  : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none space-y-3'
                }`}>
                {msg.sender === 'user' ? (
                  <div>{msg.text}</div>
                ) : msg.type !== 'claim_detail' ? (
                  <CopilotRichText text={msg.text} />
                ) : null}

                {msg.type === 'claim_detail' && msg.data && (
                  <div className="overflow-hidden rounded-xl border border-slate-800">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-800 bg-slate-900 px-4 py-3">
                      <div>
                        <p className="font-mono text-sm font-bold text-white">{msg.data.claimId}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{msg.data.subtitle}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusPillClass(msg.data.status)}`}>
                        {String(msg.data.status).replace('Open - ', '')}
                      </span>
                    </div>
                    <dl className="divide-y divide-slate-800/80">
                      {msg.data.rows.map((row: { label: string; value: string; emphasize?: boolean }) => (
                        <div key={row.label} className="grid grid-cols-[120px_1fr] gap-3 px-4 py-2">
                          <dt className="text-[11px] font-medium text-slate-500">{row.label}</dt>
                          <dd className={`text-xs ${row.emphasize ? 'font-bold text-amber-400' : 'text-slate-200'}`}>{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                    {msg.data.pendingNote && (
                      <div className="border-t border-slate-800 bg-amber-500/5 px-4 py-3">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-amber-400">Pending documents</p>
                        <ul className="space-y-1.5">
                          {parsePendingList(msg.data.pendingNote).map((doc: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-[11px] text-amber-100">
                              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
                              <span>{doc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {msg.data.remarks && msg.data.remarks !== msg.data.pendingNote && (
                      <p className="border-t border-slate-800 px-4 py-2.5 text-[11px] text-slate-400">{msg.data.remarks}</p>
                    )}
                  </div>
                )}

                {msg.type === 'claims_list' && msg.data && (
                  <div className="space-y-2 border-t border-slate-800 pt-3">
                    {msg.data.map((c: any) => (
                      <div
                        key={c.id}
                        onClick={() => { onSelectClaim(c.id); setActiveScreen('claim-details'); }}
                        className="p-3 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer transition-all"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-white flex items-center gap-2 text-sm">
                            <span>{c.id}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">{c.status}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">{c.title} • {c.highway}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-amber-400 text-sm">{c.reserve}</div>
                          <span className="text-[10px] text-blue-400 font-semibold flex items-center gap-0.5 justify-end">
                            <span>View Details</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Render Missing Docs Data */}
                {msg.type === 'missing_docs' && msg.data && (
                  <div className="space-y-3 border-t border-slate-800 pt-3">
                    <div className="space-y-1.5">
                      {msg.data.items.map((item: string, idx: number) => (
                        <div key={idx} className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-200 flex items-center gap-2 font-medium">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border border-blue-500/30 bg-blue-950/50 p-3 text-sm font-medium text-blue-200">
                      {msg.data.keyAction}
                    </div>
                  </div>
                )}

                {/* Render Email Draft Preview Data */}
                {msg.type === 'email_preview' && msg.data && (
                  <div className="space-y-3 border-t border-slate-800 pt-3">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2 font-mono text-[11px]">
                      <div className="text-slate-400 font-bold border-b border-slate-800 pb-1.5">
                        Subject: <span className="text-white font-sans">{msg.data.subject}</span>
                      </div>
                      <div className="text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                        {msg.data.body}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleCopyText(msg.id, `Subject: ${msg.data.subject}\n\n${msg.data.body}`)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-1 text-[11px]"
                      >
                        {copiedEmailId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedEmailId === msg.id ? 'Copied Email!' : 'Copy Draft'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-[10px] text-slate-500 px-1">{msg.timestamp}</div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                CEO
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3.5 justify-start">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs text-slate-400 font-medium">MAPLE AI is analyzing portfolio data...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        className="relative shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask AI Copilot about claims above 5 Cr, pending docs over 90 days, or surveyor emails..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-lg"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

