import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 500, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Internal server error',
    description: 'Error message',
  })
  message: string | string[];
}

export class UnauthorizedResponseDto {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: 'Unauthorized' })
  message: string;
}

export class NotFoundResponseDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'Not found' })
  message: string;
}
