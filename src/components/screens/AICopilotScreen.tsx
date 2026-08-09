import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  FileText, 
  AlertTriangle, 
  Mail, 
  ChevronRight,
  ShieldCheck,
  Building2,
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
  'Which claims are above ₹5 Crores?',
  'Show all claims pending over 90 days.',
  'What documents are pending from us?',
  'Show previous flood claims above ₹1 Crore.',
  'Draft an email to the surveyor.',
  'What are the potential objections to this claim?'
];

export const AICopilotScreen: React.FC<AICopilotScreenProps> = ({ claims, onSelectClaim, setActiveScreen }) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: 'Hello Anand! I am **MAPLE AI Copilot**. I have indexed all 47 active portfolio claims, 124 benchmark historical survey reports, and corporate/legal contracts for Maple Highways.\n\nAsk me anything or pick a suggested query below:'
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

            <div className={`max-w-2xl space-y-2 ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}>
              <div className={`p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                  : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none space-y-3'
              }`}>
                {/* Text Formatting */}
                <div className="whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>

                {/* Render Claims List Data */}
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
                    <div className="p-3 bg-blue-950/50 border border-blue-500/30 rounded-lg text-blue-200 font-medium">
                      💡 {msg.data.keyAction}
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
          placeholder="Ask AI Copilot about claims above ₹5 Cr, pending docs over 90 days, or surveyor emails..."
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
