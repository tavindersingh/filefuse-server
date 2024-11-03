import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateFileObjectDto } from './dto/create-file-object.dto';
import { FileObjectsService } from './file-objects.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { Request, Response } from 'express';
import { StorageService } from 'src/storage/storage.service';

@ApiTags('File Objects')
@Controller('file-objects')
export class FileObjectsController {
  constructor(
    private readonly fileObjectsService: FileObjectsService,
    private readonly storageService: StorageService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Post()
  async create(
    @Req() req: Request,
    @Body() createFileObjectDto: CreateFileObjectDto,
  ) {
    const userId = req.user['sub'];

    createFileObjectDto.userId = userId;
    return await this.fileObjectsService.create(createFileObjectDto);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get()
  findAll(@Req() req: Request) {
    const userId = req.user['sub'];

    return this.fileObjectsService.findAll({ userId });
  }

  @Get(':urlKey')
  findOne(@Param('urlKey') urlKey: string) {
    return this.fileObjectsService.findOne({ urlKey });
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: number) {
    const userId = req.user['sub'];

    return await this.fileObjectsService.remove(id, userId);
  }

  @Get(':urlKey/download')
  async downloadFile(@Param('urlKey') urlKey: string, @Res() res: Response) {
    const fileObject = await this.fileObjectsService.findOne({ urlKey });

    if (fileObject.downloadsCount <= 0) {
      throw new NotFoundException('File not found');
    }

    if (!fileObject) {
      throw new NotFoundException('File not found');
    }

    await this.storageService.downloadFileFromS3(
      fileObject.s3Key,
      fileObject.name,
      res,
      async () => {
        // await this.fileObjectsService.remove(fileObject.id, fileObject.userId);
        await this.fileObjectsService.update(fileObject.id, {
          downloadsCount: fileObject.downloadsCount - 1,
        });
      },
    );
  }
}
