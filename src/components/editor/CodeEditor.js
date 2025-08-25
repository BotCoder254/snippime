import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';

const CodeEditor = ({ 
  value = '', 
  onChange, 
  language = 'javascript', 
  theme = 'light',
  placeholder = 'Enter your code here...',
  readOnly = false 
}) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  const getLanguageExtension = (lang) => {
    switch (lang.toLowerCase()) {
      case 'javascript':
      case 'js':
      case 'typescript':
      case 'ts':
        return javascript();
      case 'python':
      case 'py':
        return python();
      case 'css':
        return css();
      case 'html':
        return html();
      default:
        return javascript();
    }
  };

  useEffect(() => {
    if (!editorRef.current) return;

    const extensions = [
      basicSetup,
      getLanguageExtension(language),
      EditorView.theme({
        '&': {
          fontSize: '14px',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
        },
        '.cm-content': {
          padding: '16px',
          minHeight: '200px'
        },
        '.cm-focused': {
          outline: 'none'
        },
        '.cm-editor': {
          borderRadius: '8px'
        },
        '.cm-scroller': {
          fontFamily: 'inherit'
        }
      }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && onChange) {
          onChange(update.state.doc.toString());
        }
      }),
      EditorState.readOnly.of(readOnly)
    ];

    if (theme === 'dark') {
      extensions.push(oneDark);
    }

    const state = EditorState.create({
      doc: value,
      extensions
    });

    const view = new EditorView({
      state,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [language, theme, readOnly]);

  useEffect(() => {
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      const transaction = viewRef.current.state.update({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value
        }
      });
      viewRef.current.dispatch(transaction);
    }
  }, [value]);

  return (
    <div className="relative">
      <div 
        ref={editorRef}
        className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
      />
      {!value && !readOnly && (
        <div className="absolute top-4 left-4 text-gray-400 dark:text-gray-500 pointer-events-none font-mono text-sm">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default CodeEditor;