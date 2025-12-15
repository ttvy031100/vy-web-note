'use client';

import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Type,
  Highlighter,
} from 'lucide-react';

interface ToolbarProps {
  editor: Editor | null;
}

export default function Toolbar({ editor }: ToolbarProps) {
  if (!editor) {
    return null;
  }

  const ButtonGroup = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2 last:border-r-0 last:pr-0 last:mr-0">
      {children}
    </div>
  );

  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        active ? 'bg-gray-200 text-blue-600' : 'text-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="flex items-center gap-2 p-2 overflow-x-auto">
        {/* Undo/Redo */}
        <ButtonGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo size={18} />
          </ToolbarButton>
        </ButtonGroup>

        {/* Text Formatting */}
        <ButtonGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough size={18} />
          </ToolbarButton>
        </ButtonGroup>

        {/* Headings */}
        <ButtonGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 size={18} />
          </ToolbarButton>
        </ButtonGroup>

        {/* Lists */}
        <ButtonGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </ToolbarButton>
        </ButtonGroup>

        {/* Other Blocks */}
        <ButtonGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Blockquote"
          >
            <Quote size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <Code size={18} />
          </ToolbarButton>
        </ButtonGroup>

        {/* Alignment */}
        <ButtonGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            active={editor.isActive({ textAlign: 'justify' })}
            title="Justify"
          >
            <AlignJustify size={18} />
          </ToolbarButton>
        </ButtonGroup>

        {/* Colors */}
        <ButtonGroup>
          <div className="flex items-center gap-1">
            <Type size={18} className="text-gray-600" />
            <input
              type="color"
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              value={editor.getAttributes('textStyle').color || '#000000'}
              className="w-8 h-8 cursor-pointer"
              title="Text Color"
            />
          </div>
          <div className="flex items-center gap-1">
            <Highlighter size={18} className="text-gray-600" />
            <input
              type="color"
              onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
              value={editor.getAttributes('highlight').color || '#ffff00'}
              className="w-8 h-8 cursor-pointer"
              title="Highlight Color"
            />
          </div>
        </ButtonGroup>

        {/* Font Size */}
        <ButtonGroup>
          <select
            onChange={(e) => {
              const size = e.target.value;
              if (size === 'default') {
                editor.chain().focus().unsetMark('textStyle').run();
              } else {
                editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
              }
            }}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
            title="Font Size"
          >
            <option value="default">Default</option>
            <option value="12px">Small</option>
            <option value="16px">Normal</option>
            <option value="20px">Large</option>
            <option value="24px">Larger</option>
            <option value="32px">Extra Large</option>
          </select>
        </ButtonGroup>
      </div>
    </div>
  );
}
