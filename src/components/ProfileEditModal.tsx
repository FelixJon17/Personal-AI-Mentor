import React, { useRef, useState } from 'react';
import { X, Upload, RotateCcw, Check, UserCheck } from 'lucide-react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSaveAvatar: (newUrl: string) => void;
}

const DEFAULT_CHRISELLA_PHOTO = '/assets/aistudio/image_a4770d04.png';

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onSaveAvatar,
}) => {
  const [preview, setPreview] = useState(currentAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSaveAvatar(preview);
    onClose();
  };

  const handleResetDefault = () => {
    setPreview(DEFAULT_CHRISELLA_PHOTO);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-violet-100 max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50/80 to-purple-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Kelola Foto Profil</h2>
              <p className="text-xs text-slate-500">Unggah foto baru atau kembalikan ke foto awal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-5">
          {/* Circular Preview */}
          <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden shadow-xl ring-4 ring-violet-200 ring-offset-4 ring-offset-white bg-slate-100">
            <img
              src={preview}
              alt="Avatar Preview"
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_CHRISELLA_PHOTO;
              }}
            />
          </div>

          <p className="text-xs text-slate-500">
            Foto ini akan ditampilkan di bagian atas profil mentor dan pada percakapan.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl border border-violet-300 bg-violet-50 hover:bg-violet-100 text-violet-800 text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Unggah Foto dari Perangkat</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefault}
              className="w-full py-2 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kembalikan ke Foto Asli Chrisella Kurniawan</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
