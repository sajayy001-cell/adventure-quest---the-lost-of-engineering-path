import React, { useState } from 'react';
import { GODOT_PROJECT_FILES, GodotFile, createGodotProjectZip } from '../game/godotFiles';
import { X, Copy, Check, FileCode, Settings, Layers, Download, Archive, Sparkles, FolderArchive, CheckCircle2 } from 'lucide-react';

interface GodotExporterModalProps {
  onClose: () => void;
}

export const GodotExporterModal: React.FC<GodotExporterModalProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<GodotFile>(GODOT_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipDownloaded, setZipDownloaded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleFile = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCompleteZip = async () => {
    try {
      setIsZipping(true);
      const zipBlob = await createGodotProjectZip();
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'game_project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setZipDownloaded(true);
      setTimeout(() => setZipDownloaded(false), 4000);
    } catch (err) {
      console.error('Failed to create Godot ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[90vh] rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/40 text-white shadow-lg shadow-blue-950/60">
              <FolderArchive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-sky-300 to-blue-400">
                Complete Godot 4.x Project Exporter
              </h2>
              <p className="text-xs text-slate-400">
                Packaged into a single <code className="text-amber-300 font-mono">game_project.zip</code> with all scenes, scripts, and configuration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Primary Action: Single Click Download ZIP */}
            <button
              id="btn-download-complete-godot-zip"
              onClick={handleDownloadCompleteZip}
              disabled={isZipping}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-950/60 transition active:scale-95 disabled:opacity-50"
            >
              {isZipping ? (
                <>
                  <Archive className="w-4 h-4 animate-spin" />
                  <span>Packaging ZIP...</span>
                </>
              ) : zipDownloaded ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                  <span>ZIP Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-slate-950" />
                  <span>DOWNLOAD ALL AS ONE ZIP (.ZIP)</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice Banner */}
        <div className="bg-blue-950/50 border-b border-blue-900/50 px-6 py-2.5 flex items-center justify-between text-xs text-blue-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>One-Click Import:</strong> Extract <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">game_project.zip</code> and open the folder in Godot 4.x. Press <strong>F5 (Play Project)</strong> to run!
            </span>
          </div>
          <span className="text-[11px] text-blue-400 font-mono hidden md:inline">Godot 4.3+ Forward+</span>
        </div>

        {/* Body with Sidebar and Code Viewer */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="w-full md:w-80 bg-slate-950/90 border-r border-slate-800 p-4 overflow-y-auto shrink-0 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-2 flex items-center justify-between">
                <span>ZIP Structure ({GODOT_PROJECT_FILES.length} Files)</span>
                <span className="text-[10px] text-cyan-400 font-mono">game_project/</span>
              </div>

              <div className="space-y-1.5">
                {GODOT_PROJECT_FILES.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono flex items-center gap-2.5 transition ${
                      selectedFile.path === file.path
                        ? 'bg-blue-600/25 text-blue-300 border border-blue-500/50 font-semibold shadow-md'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {file.category === 'config' && <Settings className="w-4 h-4 text-amber-400 shrink-0" />}
                    {file.category === 'script' && <FileCode className="w-4 h-4 text-blue-400 shrink-0" />}
                    {file.category === 'scene' && <Layers className="w-4 h-4 text-emerald-400 shrink-0" />}
                    <div className="truncate">
                      <div className="text-slate-200">{file.path}</div>
                      <div className="text-[10px] text-slate-500 truncate">{file.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Download Callout Card */}
            <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950/70 border border-blue-800/40 text-[11px] text-slate-300">
              <div className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                <Archive className="w-3.5 h-3.5" /> Exact ZIP Architecture:
              </div>
              <pre className="text-[10px] font-mono text-slate-400 leading-tight bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 mb-2">
{`game_project/
├── project.godot
├── scenes/
│   └── main.tscn
└── scripts/
    ├── player.gd
    ├── game_manager.gd
    ├── puzzle_manager.gd
    ├── final_boss.gd
    └── hud.gd`}
              </pre>
              <button
                onClick={handleDownloadCompleteZip}
                disabled={isZipping}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Entire Project ZIP</span>
              </button>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {/* Action Bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800/80 bg-slate-900/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-300">game_project/{selectedFile.path}</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">({selectedFile.description})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={handleDownloadSingleFile}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Download single file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Single File</span>
                </button>
              </div>
            </div>

            {/* Code Content */}
            <pre className="flex-1 p-6 overflow-auto font-mono text-xs text-slate-300 leading-relaxed bg-[#0b0f19] select-text">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
