import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWriteStream } from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { sdkStreamMixin } from '@smithy/util-stream-node';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;

  private readonly logger = new Logger(StorageService.name);

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      endpoint: configService.get<string>('B2_ENDPOINT'),
      region: configService.get<string>('B2_REGION'),
      credentials: {
        accessKeyId: configService.get<string>('B2_ACCESS_KEY_ID'),
        secretAccessKey: configService.get<string>('B2_SECRET_ACCESS_KEY'),
      },
    });

    this.bucketName = this.configService.get<string>('B2_BUCKET');
  }

  async getUploadPreSignedUrl(fileName: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: `${uuidv4()}-${fileName}`,
      ContentType: 'video/mp4',
    });

    return await getSignedUrl(this.s3Client, command, {
      expiresIn: 24 * 60 * 60,
    });
  }

  async getAccessPreSignedUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, {
      expiresIn: 60 * 60,
    });
  }

  async deleteFile(key: string) {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(deleteCommand);
      console.log(response);
      this.logger.log(`Deleted expired entry with Key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete entry with Key: ${key}`, error);
    }
  }

  async downloadFileFromS3(key: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      console.log(__dirname);

      const response = await this.s3Client.send(command);
      const downloadPath = path.join(__dirname, 'temp', key);
      const writeStream = createWriteStream(downloadPath);

      console.log(downloadPath);

      const nodeStream = sdkStreamMixin(response.Body as Readable);

      return new Promise<string>((resolve, reject) => {
        nodeStream
          .pipe(writeStream)
          .on('error', reject)
          .on('close', () => resolve(downloadPath));
      });
    } catch (error) {
      console.error('Error downloading file from S3:', error);
    }
  }

  async createNewFolder() {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: 'new-folder/',
      }),
    );
  }
}
