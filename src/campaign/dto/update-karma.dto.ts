import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class UpdateKarmaDto {
  @ApiProperty({
    example: 10,
    description: 'Karma value for the campaign',
  })
  @IsInt()
  karmaValue: number;
}
