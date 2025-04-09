'use client';

import { useState, useEffect, useRef } from 'react';

interface AudioPlayerProps {
  text: string;
}

export default function AudioPlayer({ text }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const waveformRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const textChunksRef = useRef<string[]>([]);
  const currentChunkIndexRef = useRef<number>(0);
  const retryCountRef = useRef<number>(0);

  // Initialize voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Cleanup function
  const cleanup = () => {
    window.speechSynthesis.cancel();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (waveformRef.current) {
      waveformRef.current.style.transform = 'scaleX(0)';
    }
    setIsPlaying(false);
    currentChunkIndexRef.current = 0;
    retryCountRef.current = 0;
  };

  // Split text into chunks when text changes
  useEffect(() => {
    if (!text) return;

    // Cleanup any ongoing speech
    cleanup();

    // Split text into smaller chunks of approximately 25 words
    const words = text.split(/\s+/);
    const chunkSize = 25;
    textChunksRef.current = [];
    
    for (let i = 0; i < words.length; i += chunkSize) {
      textChunksRef.current.push(words.slice(i, i + chunkSize).join(' '));
    }
    
    console.log(`Split text into ${textChunksRef.current.length} chunks`);
  }, [text]);

  const speakNextChunk = () => {
    if (currentChunkIndexRef.current >= textChunksRef.current.length) {
      console.log('Finished all chunks');
      cleanup();
      return;
    }

    // Cancel any ongoing speech before starting new chunk
    window.speechSynthesis.cancel();

    const chunk = textChunksRef.current[currentChunkIndexRef.current];
    console.log(`Speaking chunk ${currentChunkIndexRef.current + 1}/${textChunksRef.current.length}`);
    
    const newUtterance = new SpeechSynthesisUtterance(chunk);
    
    if (voices.length > 0) {
      const femaleVoice = voices.find(voice => voice.name.includes('Female'));
      newUtterance.voice = femaleVoice || voices[0];
    }

    newUtterance.rate = 1;
    newUtterance.pitch = 1;
    newUtterance.volume = 1;
    
    newUtterance.onstart = () => {
      console.log(`Started chunk ${currentChunkIndexRef.current + 1}`);
      setIsPlaying(true);
      startTimeRef.current = performance.now();
      animateWaveform();
      retryCountRef.current = 0;
    };
    
    newUtterance.onend = () => {
      console.log(`Completed chunk ${currentChunkIndexRef.current + 1}`);
      currentChunkIndexRef.current++;
      if (currentChunkIndexRef.current < textChunksRef.current.length) {
        // Add a small delay before speaking the next chunk
        setTimeout(() => {
          speakNextChunk();
        }, 200);
      } else {
        cleanup();
      }
    };

    newUtterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      
      // Retry logic
      if (retryCountRef.current < 3) {
        retryCountRef.current++;
        console.log(`Retrying chunk ${currentChunkIndexRef.current + 1} (attempt ${retryCountRef.current})`);
        setTimeout(() => {
          speakNextChunk();
        }, 500);
      } else {
        console.log(`Max retries reached for chunk ${currentChunkIndexRef.current + 1}, moving to next chunk`);
        currentChunkIndexRef.current++;
        if (currentChunkIndexRef.current < textChunksRef.current.length) {
          setTimeout(() => {
            speakNextChunk();
          }, 200);
        } else {
          cleanup();
        }
      }
    };

    utteranceRef.current = newUtterance;
    window.speechSynthesis.speak(newUtterance);
  };

  const animateWaveform = () => {
    if (!waveformRef.current) return;

    const totalChunks = textChunksRef.current.length;
    const currentChunk = currentChunkIndexRef.current;
    const progress = (currentChunk + 0.5) / totalChunks;

    waveformRef.current.style.transform = `scaleX(${progress})`;

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(animateWaveform);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } else {
      if (utteranceRef.current) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
        animateWaveform();
      } else {
        currentChunkIndexRef.current = 0;
        retryCountRef.current = 0;
        speakNextChunk();
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex flex-col items-center">
        <button
          onClick={togglePlayPause}
          className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mb-4 hover:bg-blue-700 transition-colors"
        >
          {isPlaying ? (
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>

        {/* Waveform Animation */}
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            ref={waveformRef}
            className="h-full bg-blue-500 rounded-full transform origin-left scale-x-0 transition-transform duration-300"
            style={{ width: '100%' }}
          />
        </div>

        {/* Selected Text Preview */}
        <div className="mt-4 text-white text-center max-h-32 overflow-y-auto">
          {text || 'Select text to read'}
        </div>
      </div>
    </div>
  );
} 