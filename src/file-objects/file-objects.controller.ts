import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateFileObjectDto } from './dto/create-file-object.dto';
import { FileObjectsService } from './file-objects.service';

@ApiTags('File Objects')
@Controller('file-objects')
export class FileObjectsController {
  constructor(private readonly fileObjectsService: FileObjectsService) {}

  @Post()
  async create(@Body() createFileObjectDto: CreateFileObjectDto) {
    return await this.fileObjectsService.create(createFileObjectDto);
  }

  @Get()
  findAll() {
    return this.fileObjectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileObjectsService.findOne(+id);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.fileObjectsService.remove(id);
  }
}
