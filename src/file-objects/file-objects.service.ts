import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { nanoid } from 'nanoid';
import { StorageService } from 'src/storage/storage.service';
import { LessThanOrEqual, Repository } from 'typeorm';
import { CreateFileObjectDto } from './dto/create-file-object.dto';
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

    return this.fileObjectRepository.save(createFileObjectDto);
  }

  async findAll(): Promise<FileObject[]> {
    return await this.fileObjectRepository.find();
  }

  async findOne(id: number): Promise<FileObject> {
    return await this.fileObjectRepository.findOne({
      where: { id },
    });
  }

  async remove(id: number) {
    const fileObject = await this.findOne(id);

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

      await this.remove(entry.id);
    }
  }
}
