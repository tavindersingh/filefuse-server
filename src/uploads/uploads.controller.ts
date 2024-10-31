import { Controller, Get, Query } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@Controller('uploads')
@ApiTags('Uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Get('upload-pre-signed-url')
  @ApiQuery({ name: 'fileName', required: true })
  async getUploadPreSignedUrl(@Query('fileName') fileName: string) {
    const presignedUrl =
      await this.uploadsService.getUploadPreSignedUrl(fileName);

    return {
      presignedUrl,
    };
  }

  @Get('access-pre-signed-url')
  async getAccessPreSignedUrl(@Query('key') key: string) {
    return await this.uploadsService.getAccessPreSignedUrl(key);
  }
}
