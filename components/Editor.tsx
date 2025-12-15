'use client';

import { useEditor, EditorContent, Editor as TiptapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { CustomImage, handleImagePaste, handleImageDrop } from '@/lib/custom-image';
import { useEffect, useCallback, useRef } from 'react';
import Toolbar from './Toolbar';

interface EditorProps {
  content: any;
  onUpdate: (editor: TiptapEditor) => void;
}

// Add fontSize support to TextStyle
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontSize || null,
        renderHTML: (attributes: any) => {
          if (!attributes.fontSize) {
            return {};
          }
          return {
            style: `font-size: ${attributes.fontSize}`,
          };
        },
      },
    };
  },
});

export default function Editor({ content, onUpdate }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      FontSize,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      CustomImage.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content: content || {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Welcome to Notes' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Start typing to create your document. All changes are automatically saved.',
            },
          ],
        },
      ],
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[500px] px-8 py-6',
      },
      handlePaste: (view, event) => {
        // Handle image paste
        handleImagePaste(event).then((imageData) => {
          if (imageData && editor) {
            editor.chain().focus().setImage({
              src: imageData.src,
              imageId: imageData.imageId,
            } as any).run();
          }
        });
        return false;
      },
      handleDrop: (view, event, slice, moved) => {
        // Handle image drop
        if (event.dataTransfer?.files.length) {
          handleImageDrop(event).then((imageData) => {
            if (imageData && editor) {
              const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });
              
              if (coordinates) {
                editor.chain().focus().insertContentAt(coordinates.pos, {
                  type: 'image',
                  attrs: {
                    src: imageData.src,
                    imageId: imageData.imageId,
                  },
                }).run();
              } else {
                editor.chain().focus().setImage({
                  src: imageData.src,
                  imageId: imageData.imageId,
                } as any).run();
              }
            }
          });
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate(editor);
    },
  });

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            editor?.chain().focus().toggleBold().run();
            break;
          case 'i':
            e.preventDefault();
            editor?.chain().focus().toggleItalic().run();
            break;
          case 'u':
            e.preventDefault();
            editor?.chain().focus().toggleUnderline().run();
            break;
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              editor?.chain().focus().redo().run();
            } else {
              e.preventDefault();
              editor?.chain().focus().undo().run();
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor]);

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm bg-white">
      <Toolbar editor={editor} />
      <div
        ref={editorRef}
        className="editor-container"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
