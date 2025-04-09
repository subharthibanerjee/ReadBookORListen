'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Book {
  id: string;
  title: string;
  url: string;
}

const availableBooks: Book[] = [
  {
    id: '1',
    title: 'AI by Hand Vol 1',
    url: '/AI_by_Hand_Vol_1._1710180752.pdf'
  },
  {
    id: '2',
    title: 'Harvard-55a',
    url: '/Harvard-55a.pdf'
  },
  {
    id: '3',
    title: 'Rahul Wireless Communication',
    url: '/Rahul_WirelessCom05.pdf'
  },
  {
    id: '4',
    title: 'Massive MIMO NR',
    url: '/Massive_MIMO_NR_1687307774.pdf'
  }
];

interface BookCarouselProps {
  onBookSelect: (bookUrl: string) => void;
}

export default function BookCarousel({ onBookSelect }: BookCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const slideLeft = () => {
    setActiveIndex((prev) => (prev === 0 ? availableBooks.length - 1 : prev - 1));
  };

  const slideRight = () => {
    setActiveIndex((prev) => (prev === availableBooks.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative overflow-hidden">
      <div className="flex justify-center items-center">
        <button
          onClick={slideLeft}
          className="absolute left-0 z-10 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition"
        >
          ←
        </button>
        
        <div className="flex items-center justify-center gap-4">
          <AnimatePresence>
            {availableBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: index === activeIndex ? 1 : 0.5,
                  scale: index === activeIndex ? 1 : 0.8,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="cursor-pointer"
                onClick={() => onBookSelect(book.url)}
              >
                <div className="w-48 h-64 bg-gray-800 rounded-lg flex items-center justify-center p-4 hover:bg-gray-700 transition">
                  <span className="font-palatino text-center">{book.title}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <button
          onClick={slideRight}
          className="absolute right-0 z-10 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition"
        >
          →
        </button>
      </div>
    </div>
  );
} 