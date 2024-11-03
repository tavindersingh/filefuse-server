import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { nanoid } from 'nanoid';
import { StorageService } from 'src/storage/storage.service';
import {
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { CreateFileObjectDto } from './dto/create-file-object.dto';
import { QueryFileObjectDto } from './dto/query-file-object.dto';
import { UpdateFileObjectDto } from './dto/update-file-object.dto';
import { FileObject } from './entities/file-object.entity';

@Injectable()
export class FileObjectsService {
  constructor(
    @InjectRepository(FileObject)
    private fileObjectRepository: Repository<FileObject>,
    private storageService: StorageService,
  ) {}

  async create(createFileObjectDto: CreateFileObjectDto) {
    createFileObjectDto.urlKey = nanoid(10);

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    createFileObjectDto.expiryAt = expirationDate;

    if (createFileObjectDto.s3Key.startsWith('https://')) {
      createFileObjectDto.s3Key = createFileObjectDto.s3Key.split('/').pop();
    }

    return this.fileObjectRepository.save(createFileObjectDto);
  }

  async findAll(
    queryFileObjectDto: Partial<QueryFileObjectDto>,
  ): Promise<FileObject[]> {
    const query: FindOptionsWhere<FileObject> = {};
    if (queryFileObjectDto.id) {
      query.id = queryFileObjectDto.id;
    }

    if (queryFileObjectDto.urlKey) {
      query.urlKey = queryFileObjectDto.urlKey;
    }

    if (queryFileObjectDto.userId) {
      query.userId = queryFileObjectDto.userId;
    }

    query.expiryAt = LessThanOrEqual(new Date());
    query.downloadsCount = MoreThanOrEqual(1);

    return await this.fileObjectRepository.find({ where: query });
  }

  async findOne(
    queryFileObjectDto: Partial<QueryFileObjectDto>,
  ): Promise<FileObject> {
    const query: FindOptionsWhere<FileObject> = {};
    if (queryFileObjectDto.id) {
      query.id = queryFileObjectDto.id;
    }

    if (queryFileObjectDto.urlKey) {
      query.urlKey = queryFileObjectDto.urlKey;
    }

    if (queryFileObjectDto.userId) {
      query.userId = queryFileObjectDto.userId;
    }

    query.expiryAt = LessThanOrEqual(new Date());
    query.downloadsCount = MoreThanOrEqual(1);

    const fileObject = await this.fileObjectRepository.findOne({
      where: query,
    });

    if (!fileObject) {
      throw new NotFoundException('File not found');
    }

    return fileObject;
  }

  async remove(id: number, userId: string): Promise<FileObject> {
    const fileObject = await this.findOne({ id });

    if (!fileObject) {
      throw new NotFoundException('File not found');
    }

    if (fileObject.userId !== userId) {
      throw new NotFoundException('Unauthorized Request');
    }

    await this.storageService.deleteFile(fileObject.s3Key);

    await this.fileObjectRepository.delete(id);

    return fileObject;
  }

  async removeWithoutUserId(id: number): Promise<FileObject> {
    const fileObject = await this.findOne({ id });

    if (!fileObject) {
      throw new NotFoundException('File not found');
    }

    await this.storageService.deleteFile(fileObject.s3Key);

    await this.fileObjectRepository.delete(id);

    return fileObject;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    await this.deleteExpiredEntries();
  }

  async deleteExpiredEntries() {
    const currentDate = new Date();
    const expiredEntries = await this.fileObjectRepository.find({
      where: { expiryAt: LessThanOrEqual(currentDate) },
    });

    for (const entry of expiredEntries) {
      await this.storageService.deleteFile(entry.s3Key);

      await this.removeWithoutUserId(entry.id);
    }
  }

  async update(
    id: number,
    updateFileObjectDto: Partial<UpdateFileObjectDto>,
  ): Promise<FileObject> {
    const fileObject = await this.findOne({ id });

    if (!fileObject) {
      throw new NotFoundException('File not found');
    }

    return await this.fileObjectRepository.save({
      ...fileObject,
      ...updateFileObjectDto,
    });
  }
}
