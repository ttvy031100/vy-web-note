# Notes - Offline Rich Text Editor

A powerful, Google Docs / Word-lite note-taking application built with Next.js, TipTap, and Tailwind CSS. All data is stored locally in your browser using IndexedDB - no backend required!

## Features

### Rich Text Editing (WYSIWYG)
- **Text Formatting**: Bold, Italic, Underline, Strikethrough
- **Headings**: H1, H2, H3
- **Lists**: Bullet lists and numbered lists
- **Blocks**: Blockquotes and code blocks
- **Alignment**: Left, center, right, justify
- **Styling**: Font size presets, text color, highlight color
- **Undo/Redo**: Full history support

### Keyboard Shortcuts
- `Ctrl/Cmd + B` - Bold
- `Ctrl/Cmd + I` - Italic
- `Ctrl/Cmd + U` - Underline
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` - Redo

### Image Support
- **Paste Images**: Press `Ctrl/Cmd + V` to paste images from clipboard
- **Drag & Drop**: Drag image files directly into the editor
- **Persistent Storage**: Images are stored efficiently in IndexedDB
- **Image Manipulation**: Click to select, basic sizing controls

### Autosave
- **Debounced Autosave**: Automatically saves 5 seconds after you stop typing
- **Status Indicators**:
  - "Typing... autosave in Xs" - While you're editing
  - "Saving..." - During save operation
  - "Saved at HH:MM:SS" - After successful save
- **Safety Net**: Saves on page close/refresh to prevent data loss

### Offline-First
- No internet connection required
- All data stored locally in browser
- Fast and responsive
- Privacy-focused (your data never leaves your device)

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Navigate to the project directory:
```bash
cd notes-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Rich Text Editor**: TipTap (ProseMirror-based)
- **Styling**: Tailwind CSS
- **Storage**: IndexedDB (via `idb` library)
- **Icons**: Lucide React

## Storage Architecture

### How It Works

The app uses **IndexedDB**, a powerful client-side database built into modern browsers. Here's how data is structured:

#### Object Stores

1. **documents** - Stores the editor content
   - Key: `main-document`
   - Value: TipTap JSON content + timestamp
   
2. **images** - Stores image blobs
   - Key: Unique image ID (e.g., `img-1234567890-abc123`)
   - Value: Image blob + metadata

### Image Handling

When you paste or drop an image:

1. Extract the image file/blob from the event
2. Store the blob in IndexedDB and generate a unique `imageId`
3. Insert an image node in the editor with the `imageId` attribute
4. On load, resolve `imageId` to an object URL for display

This approach is much more efficient than base64 encoding:
- **Smaller storage footprint** (no base64 overhead)
- **Faster read/write** operations
- **Better memory usage** with object URLs

### Storage Benefits

✅ **Large Capacity**: Typically 50MB+ per origin (much more than localStorage's 5-10MB)  
✅ **Efficient Binary Storage**: No encoding overhead for images  
✅ **Asynchronous API**: Non-blocking operations  
✅ **Structured Data**: Organized with indexes and queries  

### Storage Limitations

⚠️ **Quota-based**: Storage depends on available disk space  
⚠️ **Per-origin**: Data is specific to the domain  
⚠️ **No Cloud Sync**: Data stays on the device  
⚠️ **Can be cleared**: Users or browsers can clear the data  

> **Important**: Treat IndexedDB as a cache, not as primary storage. For important documents, consider adding export functionality (JSON/Markdown/HTML) as a backup.

## Project Structure

```
notes-app/
├── app/
│   ├── globals.css          # Global styles + TipTap/Prose CSS
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page with editor
├── components/
│   ├── Editor.tsx           # TipTap editor component
│   └── Toolbar.tsx          # Rich text toolbar
├── hooks/
│   └── useAutosave.tsx      # Autosave logic + status UI
├── lib/
│   ├── custom-image.ts      # Custom TipTap image extension
│   └── storage.ts           # IndexedDB storage layer
└── package.json
```

## Key Components

### Storage Layer (`lib/storage.ts`)

```typescript
saveDocument(docJson)    // Save editor content
loadDocument()           // Load editor content
saveImage(blob)          // Store image, returns imageId
loadImage(imageId)       // Retrieve image as object URL
```

### Editor Component (`components/Editor.tsx`)

- Configures TipTap with all extensions
- Handles paste/drop events for images
- Manages keyboard shortcuts
- Triggers autosave on content changes

### Toolbar Component (`components/Toolbar.tsx`)

- Visual controls for all formatting options
- Active state indicators
- Color pickers for text/highlight
- Font size selector

### Autosave Hook (`hooks/useAutosave.tsx`)

- Debounced save with 5-second delay
- Status tracking and UI indicators
- beforeunload safety net

## Browser Compatibility

Works in all modern browsers that support:
- IndexedDB (Chrome, Firefox, Safari, Edge)
- ES6+ features
- CSS Grid/Flexbox

Minimum versions:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Customization

### Change Autosave Delay

In `app/page.tsx`, modify the `delay` parameter:

```typescript
const { status, triggerAutosave } = useAutosave({
  delay: 3000, // Change to 3 seconds
  onSave: async () => { ... }
});
```

### Add More Formatting Options

TipTap has many extensions. To add more:

1. Install the extension: `npm install @tiptap/extension-name`
2. Import in `components/Editor.tsx`
3. Add to extensions array
4. Add toolbar button in `components/Toolbar.tsx`

### Customize Styling

Edit `app/globals.css` for:
- Editor appearance (`.ProseMirror`)
- Prose typography (`.prose`)
- Color scheme

## Troubleshooting

### Images not loading after refresh

- Check browser DevTools → Application → IndexedDB → `notes-app-db` → `images`
- Ensure `imageId` attributes are saved in the document
- Check for quota exceeded errors in console

### Autosave not triggering

- Check console for errors
- Verify IndexedDB is not blocked (some privacy modes block it)
- Test in a different browser

### Content lost after browser clear

- This is expected behavior when clearing site data
- Consider adding export functionality for backups

## Future Enhancements

Potential features to add:
- 📤 Export to PDF/Markdown/HTML
- 📁 Multiple documents support
- 🔍 Search within document
- 📊 Document statistics (word count, etc.)
- 🎨 Custom themes
- 📱 PWA support for offline mobile use
- ☁️ Optional cloud sync

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js, TipTap, and Tailwind CSS
