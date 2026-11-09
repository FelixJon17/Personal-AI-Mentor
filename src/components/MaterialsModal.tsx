import React, { useRef, useState } from 'react';
import {
  X,
  Upload,
  FileText,
  Trash2,
  CheckCircle,
  AlertCircle,
  File,
  Image as ImageIcon,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { LearningMaterial } from '../types';
import { uploadMaterialFile } from '../services/api';

interface MaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: LearningMaterial[];
  onAddMaterial: (material: LearningMaterial) => void;
  onToggleMaterial: (id: string) => void;
  onDeleteMaterial: (id: string) => void;
  onLoadSampleMaterial: (sampleType: 'tech' | 'business') => void;
}

export const MaterialsModal: React.FC<MaterialsModalProps> = ({
  isOpen,
  onClose,
  materials,
  onAddMaterial,
  onToggleMaterial,
  onDeleteMaterial,
  onLoadSampleMaterial,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const newMaterial = await uploadMaterialFile(file);
        onAddMaterial(newMaterial);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Gagal memproses file materi.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (name: string, type: string) => {
    const lower = name.toLowerCase();
    if (lower.endsWith('.pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (lower.endsWith('.docx') || lower.endsWith('.doc'))
      return <FileText className="w-5 h-5 text-blue-500" />;
    if (lower.endsWith('.pptx') || lower.endsWith('.ppt'))
      return <FileText className="w-5 h-5 text-amber-500" />;
    if (type.startsWith('image/') || lower.match(/\.(png|jpe?g|webp)$/))
      return <ImageIcon className="w-5 h-5 text-emerald-500" />;
    return <File className="w-5 h-5 text-violet-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-violet-100 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50/80 to-purple-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Materi Pembelajaran AI</h2>
              <p className="text-xs text-slate-500">
                Knowledge Base utama yang digunakan Chrisella Kurniawan untuk membimbingmu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Upload Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFileUpload(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-violet-500 bg-violet-50/70 scale-[1.01]'
                : 'border-violet-200 bg-violet-50/20 hover:bg-violet-50/50 hover:border-violet-300'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files)}
              multiple
              accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md,image/png,image/jpeg,image/webp"
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 mb-3">
                <Upload className="w-6 h-6 animate-bounce" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Tarik & letakkan file materi di sini, atau{' '}
                <span className="text-violet-600 underline">pilih dari perangkat</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Mendukung format: <span className="font-semibold text-slate-700">PDF, DOCX, PPT, PPTX, TXT, dan Gambar (PNG/JPG)</span>
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-violet-700 bg-violet-100/70 px-2.5 py-1 rounded-full font-medium">
                <Sparkles className="w-3 h-3" />
                <span>Kamu dapat menambahkan file baru kapan saja tanpa menghapus materi sebelumnya</span>
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          {isUploading && (
            <div className="p-3 bg-violet-50 border border-violet-200 rounded-xl flex items-center gap-3 text-sm text-violet-800 animate-pulse">
              <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Sedang memproses dan membaca materi pembelajaran... Mohon tunggu sebentar.</span>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-sm text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Quick Sample Loaders if empty */}
          {materials.length === 0 && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                Belum punya file materi saat ini? Coba muat contoh materi instan:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onLoadSampleMaterial('tech')}
                  className="text-left p-2.5 bg-white hover:bg-violet-50 border border-slate-200 hover:border-violet-300 rounded-lg transition-all group"
                >
                  <p className="text-xs font-bold text-slate-800 group-hover:text-violet-700">
                    💻 Modul: Artificial Intelligence & Algoritma
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    Konsep Machine Learning, Supervised Learning, Neural Networks, rumus loss function, dan contoh kasus.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => onLoadSampleMaterial('business')}
                  className="text-left p-2.5 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-lg transition-all group"
                >
                  <p className="text-xs font-bold text-slate-800 group-hover:text-purple-700">
                    📊 Modul: Manajemen Bisnis & Keuangan Digital
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    Analisis SWOT, Break-Even Point, Rasio Likuiditas, Strategi Pemasaran 4P, dan Studi Kasus Startup.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Uploaded Materials List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Daftar Materi Tersimpan ({materials.length})
              </h3>
              {materials.length > 0 && (
                <span className="text-[11px] text-slate-400">
                  {materials.filter((m) => m.active).length} materi aktif dijadikan acuan mentor
                </span>
              )}
            </div>

            {materials.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                Belum ada materi pembelajaran yang diunggah. Unggah materi pertama kamu di atas!
              </div>
            ) : (
              <div className="space-y-2.5">
                {materials.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-start justify-between p-3.5 rounded-xl border transition-all ${
                      m.active
                        ? 'bg-white border-violet-200 shadow-xs ring-1 ring-violet-100'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
                      <div className="mt-0.5 p-2 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                        {getFileIcon(m.name, m.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 truncate">{m.name}</p>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {formatFileSize(m.size)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{m.summary}</p>
                        <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                          <span>{m.charCount.toLocaleString()} karakter</span>
                          <span>•</span>
                          <span>Diunggah {new Date(m.uploadedAt).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {/* Toggle Active Button */}
                      <button
                        type="button"
                        onClick={() => onToggleMaterial(m.id)}
                        className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                          m.active
                            ? 'text-violet-700 bg-violet-100 hover:bg-violet-200'
                            : 'text-slate-400 bg-slate-200/70 hover:bg-slate-300'
                        }`}
                        title={m.active ? 'Materi aktif (digunakan)' : 'Materi dinonaktifkan'}
                      >
                        <CheckCircle className={`w-4 h-4 ${m.active ? 'text-violet-600' : 'text-slate-400'}`} />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => onDeleteMaterial(m.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus materi ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Chrisella Kurniawan otomatis menyesuaikan jawabannya dengan materi aktif.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-colors shadow-xs"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
