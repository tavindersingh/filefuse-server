import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

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
      ContentLength: this.configService.get<number>('MAX_FILE_SIZE_LIMIT'),
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

  async downloadFileFromS3(
    key: string,
    fileName: string,
    response: Response,
    onDownloadFinished: () => void,
  ) {
    console.log('downloadFileFromS3', key);
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const { Body } = await this.s3Client.send(command);

      if (Body instanceof Readable) {
        response.set({
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        });
        Body.pipe(response)
          .on('finish', async () => {
            onDownloadFinished();
          })
          .on('error', (error) => {
            console.error('Error piping response:', error);
          });
      } else {
        throw new Error('Error: Body is not a ReadableStream');
      }
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
