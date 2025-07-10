export interface StorageService {
  upload(buffer: Buffer, path: string): Promise<string>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  getSignedUrl(path: string, expiresIn?: number): Promise<string>;
}

export class LocalStorageService implements StorageService {
  async upload(buffer: Buffer, path: string): Promise<string> {
    // Placeholder implementation
    return path;
  }

  async download(path: string): Promise<Buffer> {
    // Placeholder implementation
    return Buffer.from('');
  }

  async delete(path: string): Promise<void> {
    // Placeholder implementation
  }

  async getSignedUrl(path: string, expiresIn?: number): Promise<string> {
    // Placeholder implementation
    return `file://${path}`;
  }
}