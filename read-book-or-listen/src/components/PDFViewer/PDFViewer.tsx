'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PDFViewerProps {
  pdfUrl: string;
  onTextSelect: (text: string) => void;
}

export default function PDFViewer({ pdfUrl, onTextSelect }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
          const text = selection.toString().trim();
          setSelectedText(text);
          onTextSelect(text);
        }
      }, 100);
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [onTextSelect]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'right') {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 flex items-center justify-between z-10">
        <button
          onClick={() => handleSwipe('left')}
          className="p-4 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
          disabled={currentPage === 1}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={() => handleSwipe('right')}
          className="p-4 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <motion.div
        key={currentPage}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full"
      >
        <iframe
          src={`${pdfUrl}#page=${currentPage}`}
          className="w-full h-full"
          title="PDF Viewer"
        />
      </motion.div>

      {selectedText && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <p className="text-white">{selectedText}</p>
        </div>
      )}
    </div>
  );
} 