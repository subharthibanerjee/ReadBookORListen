'use client';

import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar/SearchBar';
import TextReader from '@/components/TextReader/TextReader';
import AudioPlayer from '@/components/AudioPlayer/AudioPlayer';
import BookCarousel from '@/components/BookCarousel/BookCarousel';
import { extractTextFromPDF } from '@/utils/pdfUtils';

// Load PDF.js from CDN
const loadPDFJS = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      // Set worker source
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(true);
    };
    document.head.appendChild(script);
  });
};

export default function Home() {
  const [selectedText, setSelectedText] = useState<string>('');
  const [currentBook, setCurrentBook] = useState<string>('/Harvard-55a.pdf');
  const [bookText, setBookText] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPDFJSLoaded, setIsPDFJSLoaded] = useState<boolean>(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadPDFJS();
        setIsPDFJSLoaded(true);
      } catch (error) {
        console.error('Error loading PDF.js:', error);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    const loadBook = async () => {
      if (!isPDFJSLoaded) return;

      try {
        setIsLoading(true);
        const fullUrl = `${window.location.origin}${currentBook}`;
        const text = await extractTextFromPDF(fullUrl);
        setBookText(text);
      } catch (error) {
        console.error('Error loading book:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      loadBook();
    }
  }, [currentBook, isPDFJSLoaded]);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
          {/* Text Reader */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : (
              <TextReader
                text={bookText}
                onTextSelect={(text) => setSelectedText(text)}
              />
            )}
          </div>

          {/* Audio Player */}
          <div className="lg:col-span-2">
            <AudioPlayer text={selectedText} />
          </div>
        </div>

        {/* Book Recommendations */}
        <div className="mt-12">
          <h2 className="text-2xl font-palatino mb-6">Recommended Books</h2>
          <BookCarousel onBookSelect={(book) => {
            setCurrentBook(book);
          }} />
        </div>
      </div>
    </main>
  );
} 