import { PartialType } from '@nestjs/swagger';
import { CreateFileObjectDto } from './create-file-object.dto';

export class UpdateFileObjectDto extends PartialType(CreateFileObjectDto) {}
