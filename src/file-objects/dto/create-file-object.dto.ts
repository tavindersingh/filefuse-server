import { ApiProperty } from '@nestjs/swagger';

export class CreateFileObjectDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  s3Key: string;

  urlKey: string;
  downloadsCount: number;
  autoDelete: boolean;
  expiryAt: Date;
}
