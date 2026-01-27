'use client';

import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { useTheme } from 'next-themes';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  language?: 'typescript' | 'javascript';
}

export function CodeEditor({
  value,
  onChange,
  height = '400px',
  language = 'typescript',
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!editorRef.current) return;

    const isDark = theme === 'dark';

    // Create the editor view with extensions
    const view = new EditorView({
      doc: value,
      extensions: [
        basicSetup,
        javascript({ typescript: language === 'typescript', jsx: false }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newValue = update.state.doc.toString();
            onChange(newValue);
          }
        }),
        EditorView.theme({
          '&': {
            height,
            fontSize: '14px',
          },
          '.cm-scroller': {
            overflow: 'auto',
          },
          '.cm-content': {
            padding: '12px',
            minHeight: height,
          },
          '.cm-editor': {
            borderRadius: '0.375rem',
          },
          '.cm-focused': {
            outline: 'none',
          },
        }),
        ...(isDark ? [oneDark] : []),
      ],
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [language, theme, height, onChange]);

  // Update content when value prop changes externally
  useEffect(() => {
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value,
        },
      });
    }
  }, [value]);

  return (
    <div className='rounded-md border border-neutral-300 dark:border-neutral-800 overflow-hidden'>
      <div ref={editorRef} className='w-full' />
    </div>
  );
}
