import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryFileObjectDto {
  id?: number;
  userId?: string;

  @ApiPropertyOptional()
  urlKey?: string;
}
