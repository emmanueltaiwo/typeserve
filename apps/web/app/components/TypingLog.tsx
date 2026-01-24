'use client';

import { useEffect, useState } from 'react';

const logOutput = `📖 Loading configuration...
✅ Configuration loaded successfully
📖 Parsing types...
   This may take a while depending on the number of types and project size (est 5.0s).
✅ Types parsed in 10.7s
🚀 Attempting to start your server on port 7002...
✅ TypeServe running on http://localhost:7002/api (started in 10.11s)
📋 Available routes:
   GET /api/users → User[]
   GET /api/users/:id → User
   GET /api/posts → Post[]
   POST /api/posts → Post
GET /api/users 200 78ms
GET /api/posts 200 6ms
GET /api/users 200 26ms
POST /api/posts 200 3ms`;

export function TypingLog() {
  const [displayedLog, setDisplayedLog] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    // Start typing after a short delay (after install command finishes)
    const startTimer = setTimeout(() => {
      setStarted(true);
    }, 2000);

    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (!started) return;

    if (currentIndex < logOutput.length) {
      const char = logOutput[currentIndex];
      // Faster typing for newlines and spaces, slower for regular chars
      const delay =
        char === '\n' ? 100 : char === ' ' ? 30 : 15 + Math.random() * 20;

      const timer = setTimeout(() => {
        setDisplayedLog(logOutput.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      // Blinking cursor after typing is complete
      const cursorTimer = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 530);
      return () => clearInterval(cursorTimer);
    }
  }, [currentIndex, started]);

  // Color code different parts of the log
  const renderLogLine = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      if (!line) return <br key={lineIndex} />;

      // Color code based on content
      let colorClass = 'text-gray-300';
      if (line.includes('✅')) {
        colorClass = 'text-emerald-400';
      } else if (line.includes('🚀') || line.includes('📖')) {
        colorClass = 'text-blue-400';
      } else if (line.includes('📋')) {
        colorClass = 'text-cyan-400';
      } else if (line.includes('GET') || line.includes('POST')) {
        if (line.includes('200')) {
          colorClass = 'text-green-400';
        } else {
          colorClass = 'text-yellow-400';
        }
      } else if (
        line.trim().startsWith('GET') ||
        line.trim().startsWith('POST')
      ) {
        colorClass = 'text-gray-400';
      }

      return (
        <span key={lineIndex} className={colorClass}>
          {line}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <pre className='text-xs sm:text-sm font-mono overflow-x-auto whitespace-pre-wrap bg-black/50 p-4 sm:p-6 rounded border border-emerald-500/20'>
      <code>
        {renderLogLine(displayedLog)}
        {showCursor && (
          <span className='text-emerald-400 animate-pulse'>▊</span>
        )}
      </code>
    </pre>
  );
}
