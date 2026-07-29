
import { X } from 'lucide-react';

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex overflow-y-auto p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl animate-scale-in flex flex-col m-auto z-10 max-h-full">
        <div className="flex flex-shrink-0 items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-bold text-text">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-text/45 hover:text-text rounded-xl hover:bg-muted/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
