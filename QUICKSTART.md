# Quick Start Guide - Notes App

## Running the App

```bash
cd notes-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Key Features

### Rich Text Formatting
- **Bold** - Ctrl/Cmd+B
- *Italic* - Ctrl/Cmd+I
- <u>Underline</u> - Ctrl/Cmd+U
- ~~Strikethrough~~
- Headings (H1, H2, H3)
- Lists (bullet & numbered)
- Blockquotes
- Code blocks
- Text alignment
- Font sizes
- Text & highlight colors

### Images
- **Paste**: Ctrl/Cmd+V with image in clipboard
- **Drag & Drop**: Drop image files into editor
- Stored in IndexedDB (persistent across sessions)

### Autosave
- Automatically saves 5 seconds after last edit
- Shows countdown: "Typing... autosave in 5s"
- Saves on page close/refresh as backup

## Project Files

```
├── app/page.tsx              # Main app + autosave logic
├── components/
│   ├── Editor.tsx            # TipTap editor with image handling
│   └── Toolbar.tsx           # Formatting toolbar
├── hooks/useAutosave.tsx     # Autosave hook + status indicator
├── lib/
│   ├── storage.ts            # IndexedDB operations
│   └── custom-image.ts       # Image extension for TipTap
└── app/globals.css           # Styles
```

## How Storage Works

1. **Documents**: Saved as TipTap JSON in IndexedDB `documents` store
2. **Images**: Saved as Blobs in IndexedDB `images` store with unique IDs
3. **Image References**: Editor stores imageId, resolved to URL on load

## Testing Checklist

- [ ] Text formatting buttons work
- [ ] Keyboard shortcuts (Ctrl+B, I, U, Z)
- [ ] Paste image from clipboard
- [ ] Drag & drop image file
- [ ] Autosave triggers after typing stops
- [ ] Content persists after page refresh
- [ ] Images persist after page refresh
- [ ] Status indicator updates correctly

## Browser DevTools

To inspect storage:
1. Open DevTools (F12)
2. Go to Application tab
3. IndexedDB → notes-app-db
   - `documents`: See editor content
   - `images`: See stored images

## Common Issues

**Images not appearing**: Check IndexedDB images store has entries  
**Autosave not working**: Check console for IndexedDB errors  
**TypeScript errors**: Run `npm install` to ensure all deps installed

## Next Steps

Consider adding:
- Export to Markdown/HTML
- Multiple documents
- Search functionality
- Dark mode
- Document templates
