import Image from '@tiptap/extension-image';
import { saveImage, loadImage } from './storage';

/**
 * Custom Image extension that stores images in IndexedDB
 * Extends TipTap's Image extension to handle blob storage
 */
export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      // Store imageId instead of src for IndexedDB-stored images
      imageId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-image-id'),
        renderHTML: (attributes) => {
          if (!attributes.imageId) {
            return {};
          }
          return {
            'data-image-id': attributes.imageId,
          };
        },
      },
      // Keep src for display and external images
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImage:
        (options: { src?: string; alt?: string; title?: string; imageId?: string }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

/**
 * Handle image paste from clipboard
 */
export async function handleImagePaste(event: ClipboardEvent): Promise<{ imageId: string; src: string } | null> {
  const items = event.clipboardData?.items;
  if (!items) return null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.indexOf('image') !== -1) {
      const blob = item.getAsFile();
      if (blob) {
        try {
          const imageId = await saveImage(blob);
          const src = await loadImage(imageId);
          if (src) {
            return { imageId, src };
          }
        } catch (error) {
          console.error('Failed to handle pasted image:', error);
        }
      }
    }
  }
  return null;
}

/**
 * Handle image drop from drag and drop
 */
export async function handleImageDrop(event: DragEvent): Promise<{ imageId: string; src: string } | null> {
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return null;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type.indexOf('image') !== -1) {
      try {
        const imageId = await saveImage(file);
        const src = await loadImage(imageId);
        if (src) {
          return { imageId, src };
        }
      } catch (error) {
        console.error('Failed to handle dropped image:', error);
      }
    }
  }
  return null;
}
