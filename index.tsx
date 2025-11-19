
import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { Upload, Link as LinkIcon, Copy, Check, Image as ImageIcon, ExternalLink, XCircle, Loader2, ShieldCheck, RefreshCw } from 'lucide-react';

const IMGBB_API_KEY = '80f60e611b7fee6e8fd1734121959124';

interface UploadResult {
  id: string;
  title: string;
  url_viewer: string;
  url: string;
  display_url: string;
  delete_url: string;
  thumb: {
    url: string;
  };
  image: {
    url: string;
    filename: string;
  };
}

const App = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, GIF).');
      return;
    }

    // Reset states
    setError(null);
    setResult(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error?.message || 'Failed to upload image. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const resetUpload = () => {
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="w-full px-6 py-4 border-b border-white/5 glass-panel sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={resetUpload}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-900/20 group-hover:scale-105 transition-transform duration-300">
              <ImageIcon className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-none">ImgShare</h1>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-1">Instant Hosting</p>
            </div>
          </div>
          <a 
            href="https://imgbb.com" 
            target="_blank" 
            rel="noreferrer" 
            className="text-xs font-medium text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/5"
          >
            Powered by ImgBB <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none animate-pulse delay-700" />

        <div className="w-full max-w-2xl animate-fade-in relative z-10">
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-200 animate-slide-up shadow-lg shadow-red-900/10">
              <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Upload Failed</h3>
                <p className="text-sm opacity-90">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="ml-auto hover:text-white"><XCircle className="w-4 h-4" /></button>
            </div>
          )}

          {!result ? (
            /* Upload View */
            <div className="space-y-8">
              <div className="text-center space-y-3 mb-10">
                <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight drop-shadow-sm">
                  Share images <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">instantly</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                  Free, anonymous image hosting. Direct links, BBCode, and HTML thumbnails.
                </p>
              </div>

              <div 
                className={`
                  relative group cursor-pointer overflow-hidden
                  border-2 border-dashed rounded-3xl transition-all duration-300 ease-out
                  flex flex-col items-center justify-center p-12 sm:p-20 min-h-[300px]
                  ${isDragging 
                    ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02] shadow-2xl shadow-indigo-500/20' 
                    : 'border-slate-700/50 bg-slate-800/30 hover:border-indigo-400/50 hover:bg-slate-800/50 hover:shadow-xl'
                  }
                `}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={onFileSelect} 
                  accept="image/*" 
                />
                
                {isUploading ? (
                  <div className="flex flex-col items-center gap-6 animate-fade-in">
                    <div className="relative">
                      <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-25 animate-pulse"></div>
                      <div className="relative bg-slate-900 p-4 rounded-2xl border border-indigo-500/30 shadow-xl">
                         <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                      </div>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-indigo-300 font-semibold text-lg animate-pulse">Uploading...</p>
                      <p className="text-slate-500 text-sm">Please wait while we process your image</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6 transition-transform duration-300 group-hover:scale-105">
                    <div className={`
                      w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 
                      flex items-center justify-center shadow-2xl border border-white/5
                      transition-all duration-300 group-hover:shadow-indigo-500/20 group-hover:border-indigo-500/30
                    `}>
                      <Upload className={`w-10 h-10 ${isDragging ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-400'} transition-colors duration-300`} />
                    </div>
                    <div className="space-y-2 text-center">
                      <p className="text-xl font-semibold text-slate-200">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-slate-500 font-medium">
                        SVG, PNG, JPG or GIF (max. 32MB)
                      </p>
                    </div>
                    <div className="mt-4 px-4 py-2 bg-slate-800/50 rounded-lg border border-white/5 text-xs text-slate-400 font-mono">
                      cmd/ctrl + v to paste
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Result View */
            <div className="animate-slide-up space-y-6">
              
              {/* Image Card */}
              <div className="bg-slate-900/50 border border-white/10 p-2 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 backdrop-blur-sm">
                <div className="relative aspect-video sm:aspect-[2/1] w-full bg-slate-950/50 rounded-2xl overflow-hidden flex items-center justify-center group">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                  <img 
                    src={result.image.url} 
                    alt="Uploaded result" 
                    className="max-w-full max-h-full object-contain relative z-10 shadow-lg transition-transform duration-500 group-hover:scale-[1.02]" 
                  />
                  <a 
                    href={result.image.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 border border-white/10"
                    title="Open full size"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Links Card */}
              <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    <ShieldCheck className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Upload Successful</h3>
                    <p className="text-sm text-slate-400">Your image is live and ready to share.</p>
                  </div>
                </div>

                <div className="grid gap-6">
                   <LinkGroup 
                    label="Direct Link (Hot Link)" 
                    value={result.image.url} 
                    icon={<LinkIcon className="w-4 h-4" />} 
                    help="Best for embedding in HTML, Markdown, or Discord."
                   />
                   <LinkGroup 
                    label="Viewer Link (Share Link)" 
                    value={result.url_viewer} 
                    icon={<ImageIcon className="w-4 h-4" />}
                    help="Best for sharing on social media, WhatsApp, or Email."
                   />
                </div>
              </div>

              <button
                onClick={resetUpload}
                className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/10 border border-white/5 flex items-center justify-center gap-2 group active:scale-[0.98]"
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                Upload Another Image
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 text-center text-slate-600 text-sm relative z-10">
        <p>&copy; {new Date().getFullYear()} ImgShare. Anonymous & Secure.</p>
      </footer>
    </div>
  );
};

// Helper Component for Link Inputs
const LinkGroup = ({ label, value, icon, help }: { label: string, value: string, icon: React.ReactNode, help: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end px-1">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          {icon} {label}
        </label>
      </div>
      <div className="relative group">
        <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <input
          type="text"
          readOnly
          value={value}
          className="relative w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-4 pr-28 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono shadow-inner"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <button
          onClick={handleCopy}
          className={`
            absolute right-2 top-2 bottom-2 px-4 rounded-lg flex items-center gap-2 text-xs font-bold transition-all duration-200
            ${copied 
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 translate-x-0' 
              : 'bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white border border-slate-700 hover:border-indigo-500'
            }
          `}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" /> Copy
            </>
          )}
        </button>
      </div>
      <p className="text-[11px] text-slate-500 pl-1">{help}</p>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
