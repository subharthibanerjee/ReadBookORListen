'use client';

import { useState, useEffect } from 'react';

interface TextItem {
  str: string;
  transform: number[];
  fontName: string;
  fontSize: number;
}

interface PageText {
  items: TextItem[];
  styles: {
    fontSize: number;
    fontFamily: string;
  };
}

interface TextReaderProps {
  text: PageText[];
  onTextSelect: (text: string) => void;
}

export default function TextReader({ text, onTextSelect }: TextReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection) {
      const selectedText = selection.toString();
      onTextSelect(selectedText);
    }
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, []);

  if (!text || !Array.isArray(text)) {
    return <div className="text-gray-400">No text available</div>;
  }

  const processTextItems = (items: TextItem[]) => {
    const lines: { text: string; type: 'title' | 'header' | 'normal' }[] = [];
    let currentLine = '';
    let lastY = items[0]?.transform[5] || 0;
    let isFirstLine = true;

    items.forEach((item, index) => {
      const currentY = item.transform[5];
      const isNewLine = Math.abs(currentY - lastY) > 5;

      if (isNewLine && currentLine) {
        let type: 'title' | 'header' | 'normal' = 'normal';
        
        if (isFirstLine) {
          type = 'title';
          isFirstLine = false;
        } else if (
          item.fontSize > 14 || 
          currentLine.trim().toUpperCase() === currentLine.trim() ||
          currentLine.trim().endsWith(':') ||
          /^[IVX]+\./.test(currentLine.trim()) || // Roman numerals
          /^\d+\./.test(currentLine.trim()) // Numbered sections
        ) {
          type = 'header';
        }
        
        lines.push({ text: currentLine.trim(), type });
        currentLine = '';
      }

      currentLine += item.str;
      lastY = currentY;

      // Add the last line
      if (index === items.length - 1) {
        let type: 'title' | 'header' | 'normal' = 'normal';
        if (isFirstLine) {
          type = 'title';
        } else if (
          item.fontSize > 14 || 
          currentLine.trim().toUpperCase() === currentLine.trim() ||
          currentLine.trim().endsWith(':') ||
          /^[IVX]+\./.test(currentLine.trim()) ||
          /^\d+\./.test(currentLine.trim())
        ) {
          type = 'header';
        }
        lines.push({ text: currentLine.trim(), type });
      }
    });

    return lines;
  };

  const currentPageLines = processTextItems(text[currentPage]?.items || []);

  return (
    <div className="flex flex-col h-[600px]">
      {/* Page Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-white">
          Page {currentPage + 1} of {text.length}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(text.length - 1, currentPage + 1))}
          disabled={currentPage === text.length - 1}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Page Content */}
      <div className="bg-black text-white p-8 rounded-lg shadow-lg flex-1 overflow-y-auto">
        {currentPageLines.map((line, index) => (
          <div
            key={index}
            className={`mb-2 ${
              line.type === 'title' 
                ? 'text-2xl font-bold mb-6 text-center' 
                : line.type === 'header' 
                  ? 'text-xl font-bold mb-4' 
                  : 'text-base'
            }`}
          >
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
} 