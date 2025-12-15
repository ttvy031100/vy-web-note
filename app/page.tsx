'use client';

import { useState, useEffect } from 'react';
import { Editor as TiptapEditor } from '@tiptap/react';
import dynamic from 'next/dynamic';
import { saveDocument, loadDocument, loadImage } from '@/lib/storage';
import { useAutosave, AutosaveIndicator } from '@/hooks/useAutosave';

// Dynamically import Editor to avoid SSR issues
const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });

export default function Home() {
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editor, setEditor] = useState<TiptapEditor | null>(null);

  // Load document on mount
  useEffect(() => {
    const loadDoc = async () => {
      try {
        const savedContent = await loadDocument();
        if (savedContent) {
          // Resolve image URLs from imageIds
          const resolvedContent = await resolveImageUrls(savedContent);
          setContent(resolvedContent);
        }
      } catch (error) {
        console.error('Failed to load document:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDoc();
  }, []);

  // Recursively resolve image URLs in content
  const resolveImageUrls = async (content: any): Promise<any> => {
    if (!content) return content;

    if (content.type === 'image' && content.attrs?.imageId) {
      const url = await loadImage(content.attrs.imageId);
      if (url) {
        return {
          ...content,
          attrs: {
            ...content.attrs,
            src: url,
          },
        };
      }
    }

    if (content.content && Array.isArray(content.content)) {
      const resolvedChildren = await Promise.all(
        content.content.map((child: any) => resolveImageUrls(child))
      );
      return {
        ...content,
        content: resolvedChildren,
      };
    }

    return content;
  };

  // Autosave hook
  const { status, triggerAutosave } = useAutosave({
    delay: 5000, // 5 seconds
    onSave: async () => {
      if (editor) {
        const json = editor.getJSON();
        await saveDocument(json);
      }
    },
  });

  // Handle editor updates
  const handleEditorUpdate = (updatedEditor: TiptapEditor) => {
    setEditor(updatedEditor);
    triggerAutosave();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">📝 Notes</h1>
            <span className="text-sm text-gray-500 hidden sm:inline">
              Your offline document editor
            </span>
          </div>
          <AutosaveIndicator status={status} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <Editor content={content} onUpdate={handleEditorUpdate} />
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            <span className="font-medium">💡 Tips:</span> Use{' '}
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+B</kbd> for bold,{' '}
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+I</kbd> for italic,{' '}
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+U</kbd> for underline
          </p>
          <p className="mt-2">
            Paste or drag & drop images directly into the editor. All data is stored locally.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500 border-t border-gray-200 mt-12">
        <p>
          Built with Next.js, TipTap, and Tailwind CSS. All data stored locally in your browser.
        </p>
      </footer>
    </div>
  );
}
