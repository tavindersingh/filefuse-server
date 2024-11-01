import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateFileObjectDto } from './dto/create-file-object.dto';
import { FileObjectsService } from './file-objects.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { Request } from 'express';

@ApiTags('File Objects')
@Controller('file-objects')
export class FileObjectsController {
  constructor(private readonly fileObjectsService: FileObjectsService) {}

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

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.fileObjectsService.findOne(+id);
  // }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: number) {
    const userId = req.user['sub'];

    return await this.fileObjectsService.remove(id, userId);
  }
}
