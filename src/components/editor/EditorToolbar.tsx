import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Copy, Download } from 'lucide-react';

interface EditorToolbarProps {
  onReset: () => void;
  onCopy: () => void;
  onDownload: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ onReset, onCopy, onDownload }) => {
  const buttons = [
    { icon: RotateCcw, label: 'Reset', handler: onReset },
    { icon: Copy, label: 'Copy', handler: onCopy },
    { icon: Download, label: 'Download', handler: onDownload },
  ];

  return (
    <div className="flex items-center gap-1">
      {buttons.map(({ icon: Icon, label, handler }) => (
        <motion.button
          key={label}
          className="relative group p-2 rounded-lg text-[var(--text-secondary)] hover:text-white transition-all duration-200 hover:bg-white/[0.06]"
          onClick={handler}
          title={label}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          <Icon size={15} />
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--secondary)] border border-white/[0.08] text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg z-50">
            {label}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export default EditorToolbar;
