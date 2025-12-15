import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface NotesDB extends DBSchema {
  documents: {
    key: string;
    value: {
      id: string;
      content: any;
      updatedAt: number;
    };
  };
  images: {
    key: string;
    value: {
      id: string;
      blob: Blob;
      createdAt: number;
    };
  };
}

const DB_NAME = 'notes-app-db';
const DB_VERSION = 1;
const DOCUMENT_ID = 'main-document';

let dbInstance: IDBPDatabase<NotesDB> | null = null;

/**
 * Initialize and get the IndexedDB instance
 */
async function getDB(): Promise<IDBPDatabase<NotesDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<NotesDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('documents')) {
        db.createObjectStore('documents', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('images')) {
        db.createObjectStore('images', { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

/**
 * Save document content to IndexedDB
 * @param docJson - TipTap JSON content
 */
export async function saveDocument(docJson: any): Promise<void> {
  try {
    const db = await getDB();
    await db.put('documents', {
      id: DOCUMENT_ID,
      content: docJson,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Failed to save document:', error);
    throw error;
  }
}

/**
 * Load document content from IndexedDB
 * @returns TipTap JSON content or null if not found
 */
export async function loadDocument(): Promise<any | null> {
  try {
    const db = await getDB();
    const doc = await db.get('documents', DOCUMENT_ID);
    return doc?.content || null;
  } catch (error) {
    console.error('Failed to load document:', error);
    return null;
  }
}

/**
 * Save image blob to IndexedDB
 * @param blob - Image blob to store
 * @returns imageId - Unique identifier for the stored image
 */
export async function saveImage(blob: Blob): Promise<string> {
  try {
    const db = await getDB();
    const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await db.put('images', {
      id: imageId,
      blob,
      createdAt: Date.now(),
    });
    
    return imageId;
  } catch (error) {
    console.error('Failed to save image:', error);
    throw error;
  }
}

/**
 * Load image blob from IndexedDB and convert to object URL
 * @param imageId - Unique identifier for the image
 * @returns Object URL for the image or null if not found
 */
export async function loadImage(imageId: string): Promise<string | null> {
  try {
    const db = await getDB();
    const image = await db.get('images', imageId);
    
    if (!image) {
      return null;
    }
    
    // Create object URL from blob
    const objectURL = URL.createObjectURL(image.blob);
    return objectURL;
  } catch (error) {
    console.error('Failed to load image:', error);
    return null;
  }
}

/**
 * Get all stored images (useful for cleanup or debugging)
 */
export async function getAllImages(): Promise<string[]> {
  try {
    const db = await getDB();
    const images = await db.getAllKeys('images');
    return images;
  } catch (error) {
    console.error('Failed to get all images:', error);
    return [];
  }
}

/**
 * Delete an image from IndexedDB
 * @param imageId - Unique identifier for the image
 */
export async function deleteImage(imageId: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('images', imageId);
  } catch (error) {
    console.error('Failed to delete image:', error);
    throw error;
  }
}

/**
 * Storage explanation:
 * 
 * This storage layer uses IndexedDB, a client-side database built into modern browsers.
 * 
 * Architecture:
 * - Two object stores: 'documents' (editor content) and 'images' (image blobs)
 * - Document content is stored as TipTap JSON format
 * - Images are stored as Blob objects with unique IDs
 * - Image references in the document use custom imageId attributes
 * 
 * Benefits of IndexedDB:
 * - Much larger storage capacity than localStorage (typically 50MB+ per origin)
 * - Efficient binary data storage (no base64 encoding overhead)
 * - Asynchronous API (non-blocking)
 * - Structured storage with indexes
 * 
 * Limitations:
 * - Storage quota depends on available disk space and browser
 * - Data is origin-specific (per domain)
 * - No built-in sync across devices
 * - Can be cleared by user or browser (treat as cache, not primary storage)
 * 
 * Image Handling:
 * - When user pastes/drops an image, we extract the Blob
 * - Store Blob in IndexedDB and get a unique imageId
 * - Insert image node in editor with custom attribute containing imageId
 * - On load, resolve imageId to object URL for display
 * - Object URLs are memory-efficient and don't duplicate data
 */
