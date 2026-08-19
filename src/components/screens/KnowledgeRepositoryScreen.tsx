import React, { useEffect, useMemo, useState } from 'react';
import {
  Database,
  Search,
  Folder,
  FileText,
  CheckCircle2,
  Download,
  Eye,
  Sparkles,
  Building,
  FileCheck,
  ShieldCheck,
  Layers,
  Wrench,
  HardDrive,
  Cloud,
  Loader2,
  AlertTriangle,
  X,
  ExternalLink,
} from 'lucide-react';
import type { ScreenId } from '../layout/Sidebar';

interface KnowledgeRepositoryScreenProps {
  setActiveScreen: (screen: ScreenId) => void;
}

type BlobFile = {
  pathname: string;
  url: string;
  downloadUrl: string;
  size: number;
  uploadedAt: string;
};

type KnowledgeDoc = {
  id: string;
  title: string;
  sub: string;
  size: string;
  date: string;
  url: string;
  downloadUrl: string;
  categoryId: string;
  pathname: string;
};

function formatBytes(bytes: number) {
  if (!bytes || bytes < 1024) return `${bytes || 0} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fileTitle(pathname: string) {
  const name = pathname.split('/').pop() || pathname;
  return decodeURIComponent(name);
}

function categorize(pathname: string) {
  const parts = pathname.replace(/^\/+/, '').split('/').filter(Boolean);
  if (parts.length > 1) return parts[0];
  return 'uploads';
}

function prettyFolder(name: string) {
  return name.replace(/_+$/g, '').replace(/[_-]+/g, ' ').trim();
}

function fileKind(pathname: string) {
  const ext = pathname.split('.').pop()?.toUpperCase() || 'FILE';
  const folder = pathname.includes('/') ? pathname.split('/').slice(0, -1).join(' / ') : 'Vault root';
  return `${ext} · ${folder}`;
}

function isImage(pathname: string) {
  return /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(pathname);
}

function isPdf(pathname: string) {
  return /\.pdf$/i.test(pathname);
}

function encodeBlobParam(value: string) {
  const bytes = new TextEncoder().encode(value);
  let bin = '';
  bytes.forEach((byte) => { bin += String.fromCharCode(byte); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fileApiUrl(doc: { pathname: string; url: string }, download = false) {
  const params = new URLSearchParams({
    p: encodeBlobParam(doc.pathname),
  });
  if (download) params.set('download', '1');
  return `/api/knowledge-file?${params.toString()}`;
}

async function downloadKnowledgeFile(doc: { pathname: string; url: string; title: string }) {
  const response = await fetch('/api/knowledge-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pathname: doc.pathname, url: doc.url, download: true }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Download failed' }));
    throw new Error(data.error || 'Download failed');
  }
  const blob = await response.blob();
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = doc.title;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}

export const KnowledgeRepositoryScreen: React.FC<KnowledgeRepositoryScreenProps> = ({ setActiveScreen }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState<KnowledgeDoc | null>(null);
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/knowledge-docs');
        const data = await response.json().catch(() => ({ files: [] }));
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load documents');
        }
        const mapped: KnowledgeDoc[] = (data.files as BlobFile[] || [])
          .filter((file) => !file.pathname.split('/').pop()?.startsWith('.'))
          .map((file) => ({
          id: file.pathname,
          title: fileTitle(file.pathname),
          sub: fileKind(file.pathname),
          size: formatBytes(file.size),
          date: formatDate(file.uploadedAt),
          url: file.url,
          downloadUrl: file.downloadUrl || file.url,
          categoryId: categorize(file.pathname),
          pathname: file.pathname,
        }));
        if (!cancelled) setDocs(mapped);
      } catch (err) {
        if (!cancelled) {
          setDocs([]);
          setError(err instanceof Error ? err.message : 'Failed to load Vercel Blob documents');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  const counts = useMemo(() => {
    const next: Record<string, number> = { all: docs.length };
    for (const doc of docs) {
      next[doc.categoryId] = (next[doc.categoryId] || 0) + 1;
    }
    return next;
  }, [docs]);

  const folderCategories = useMemo(() => {
    const ids = [...new Set(docs.map((d) => d.categoryId))].sort();
    const icons = [ShieldCheck, FileCheck, HardDrive, Building, Layers, Wrench, Database];
    return [
      { id: 'all', name: 'All files', icon: Cloud },
      ...ids.map((id, index) => ({
        id,
        name: prettyFolder(id),
        icon: icons[index % icons.length],
      })),
    ];
  }, [docs]);

  const visibleCategories = folderCategories;

  const selectedCategory = visibleCategories.find((c) => c.id === activeCategory) || visibleCategories[0];

  const filteredDocs = useMemo(() => {
    const inCategory = activeCategory === 'all' ? docs : docs.filter((d) => d.categoryId === activeCategory);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return inCategory;
    return inCategory.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.sub.toLowerCase().includes(q) ||
      item.pathname.toLowerCase().includes(q)
    );
  }, [docs, activeCategory, searchQuery]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>MODULE 3 • KNOWLEDGE BANK</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">AI KNOWLEDGE REPOSITORY</h1>
          <p className="text-sm text-slate-400">Documents loaded from your Vercel Blob store.</p>
        </div>

        <button
          onClick={() => setActiveScreen('copilot')}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-bold rounded-lg shadow-md shadow-blue-900/30 flex items-center gap-2 transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Query Repository via AI Copilot</span>
        </button>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search uploaded files by name or folder..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 pl-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${error ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`} />
            <span className={`font-semibold ${error ? 'text-red-400' : 'text-emerald-400'}`}>
              {loading ? 'Connecting to Vercel Blob...' : error ? error : `${docs.length} documents in blob store`}
            </span>
          </div>
          <span>Source: Vercel Blob</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {visibleCategories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`p-4 rounded-xl border transition-all text-left space-y-2 ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-900/30'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-5 h-5 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 font-bold border border-slate-800 text-slate-300">
                  {counts[cat.id] || 0}
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100 truncate">{cat.name}</div>
                <div className="text-[10px] text-slate-500">Blob folder</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              {selectedCategory.name} ({filteredDocs.length})
            </h2>
          </div>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Live from Vercel Blob</span>
          </span>
        </div>
        {downloadError && (
          <div className="px-5 py-2 text-xs text-red-300 bg-red-500/10 border-b border-red-500/20">{downloadError}</div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading documents...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 px-6 text-center">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
              <p className="text-sm text-slate-300">{error}</p>
              <p className="text-xs text-slate-500 max-w-md">
                Add your Vercel Blob token as <span className="font-mono text-amber-300">BLOB_READ_WRITE_TOKEN</span> in <span className="font-mono">.env</span>, then restart the app.
              </p>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">
              No files in this folder yet. Upload documents to your Vercel Blob store to see them here.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Document Title</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-white text-xs">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                        <div>
                          <div className="text-slate-100 font-semibold">{doc.title}</div>
                          <div className="text-[10px] text-slate-500">{doc.sub}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs">{prettyFolder(doc.categoryId)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800"
                          title="Preview Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              setDownloadError('');
                              await downloadKnowledgeFile(doc);
                            } catch (err) {
                              setDownloadError(err instanceof Error ? err.message : 'Download failed');
                            }
                          }}
                          className="p-1.5 rounded bg-slate-950 hover:bg-slate-800 text-blue-400 border border-slate-800"
                          title="Download Document"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {previewDoc && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-4xl w-full max-h-[90vh] flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm min-w-0">
                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">{previewDoc.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={fileApiUrl(previewDoc, true)}
                  className="text-xs text-blue-300 hover:text-white px-2 py-1 bg-slate-800 rounded inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="text-[11px] text-slate-500">{previewDoc.sub} · {previewDoc.size} · {previewDoc.date}</div>
            <div className="flex-1 min-h-[360px] bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
              {isImage(previewDoc.pathname) ? (
                <img src={fileApiUrl(previewDoc)} alt={previewDoc.title} className="w-full h-full object-contain" />
              ) : isPdf(previewDoc.pathname) ? (
                <iframe title={previewDoc.title} src={fileApiUrl(previewDoc)} className="w-full h-[60vh] bg-white" />
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400 text-sm p-8 text-center">
                  <FileText className="w-8 h-8 text-slate-600" />
                  <p>Preview is not available for this file type.</p>
                  <button
                    type="button"
                    onClick={() => { void downloadKnowledgeFile(previewDoc); }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                  >
                    Download file
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
