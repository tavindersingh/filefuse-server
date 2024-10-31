import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileObject } from './entities/file-object.entity';
import { FileObjectsController } from './file-objects.controller';
import { FileObjectsService } from './file-objects.service';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([FileObject]), StorageModule],
  controllers: [FileObjectsController],
  providers: [FileObjectsService],
})
export class FileObjectsModule {}
