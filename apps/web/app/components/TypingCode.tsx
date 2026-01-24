'use client';

import { useEffect, useState } from 'react';

export function TypingCode({ code }: { code: string }) {
  const [displayedCode, setDisplayedCode] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < code.length) {
      const timer = setTimeout(
        () => {
          setDisplayedCode(code.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        },
        20 + Math.random() * 30,
      );
      return () => clearTimeout(timer);
    } else {
      const cursorTimer = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 530);
      return () => clearInterval(cursorTimer);
    }
  }, [currentIndex, code]);

  const highlightCode = (text: string) => {
    const parts: Array<{ text: string; color: string }> = [];

    const commentRegex = /(\/\/.*)/g;
    const keywordRegex =
      /\b(export|import|interface|default|const|let|from|type|return)\b/g;
    const stringRegex = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
    const numberRegex = /\b\d+\b/g;
    const specialRegex = /([{}[\](),:;])/g;

    let lastIndex = 0;
    const matches: Array<{ start: number; end: number; color: string }> = [];

    [
      commentRegex,
      keywordRegex,
      stringRegex,
      numberRegex,
      specialRegex,
    ].forEach((regex, idx) => {
      const colors = [
        'text-gray-500',
        'text-emerald-400',
        'text-green-400',
        'text-yellow-400',
        'text-teal-400',
      ];
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          color: colors[idx] ?? 'text-gray-300',
        });
      }
    });

    matches.sort((a, b) => a.start - b.start);
    const merged: Array<{ start: number; end: number; color: string }> = [];
    matches.forEach((match) => {
      const last = merged[merged.length - 1];
      if (!last || match.start >= last.end) {
        merged.push(match);
      } else if (match.end > last.end) {
        last.end = match.end;
      }
    });

    merged.forEach((match) => {
      if (match.start > lastIndex) {
        parts.push({
          text: text.slice(lastIndex, match.start),
          color: 'text-gray-300',
        });
      }
      parts.push({
        text: text.slice(match.start, match.end),
        color: match.color,
      });
      lastIndex = Math.max(lastIndex, match.end);
    });

    if (lastIndex < text.length) {
      parts.push({ text: text.slice(lastIndex), color: 'text-gray-300' });
    }

    return parts.length > 0 ? parts : [{ text, color: 'text-gray-300' }];
  };

  const highlightedParts = highlightCode(displayedCode);

  return (
    <pre className='text-xs sm:text-sm font-mono overflow-x-auto whitespace-pre-wrap'>
      <code>
        {highlightedParts.map((part, index) => (
          <span key={index} className={part.color}>
            {part.text}
          </span>
        ))}
        {showCursor && (
          <span className='text-emerald-400 animate-pulse'>▊</span>
        )}
      </code>
    </pre>
  );
}
