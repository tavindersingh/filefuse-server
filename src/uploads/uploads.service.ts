import { Injectable } from '@nestjs/common';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class UploadsService {
  constructor(private readonly storageService: StorageService) {}

  async getUploadPreSignedUrl(fileName: string) {
    return await this.storageService.getUploadPreSignedUrl(fileName);
  }

  async getAccessPreSignedUrl(key: string) {
    return await this.storageService.getAccessPreSignedUrl(key);
  }
}
