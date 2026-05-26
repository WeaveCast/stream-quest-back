import { ApiResponseOptions } from '@nestjs/swagger';

export const PAGINATION_QUERIES = [
  {
    name: 'limit',
    type: Number,
    description: 'Number of items per page (1-100)',
    example: 10,
    required: false,
  },
  {
    name: 'cursor',
    type: String,
    description: 'Cursor ID from previous page response',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  },
  {
    name: 'direction',
    enum: ['forward', 'backward'],
    description: 'Navigation direction',
    example: 'forward',
    required: false,
  },
];

export function customErrorResponse(
  status: number,
  message: string,
  description?: string,
) {
  return {
    status,
    description: description || message,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: status },
            message: { type: 'string', example: message },
          },
        },
      },
    },
  };
}

export function multipleErrorResponses(
  status: number,
  examples: Array<{ summary: string; message: string }>,
  description?: string,
): ApiResponseOptions {
  const examplesObject: Record<
    string,
    { summary: string; value: { statusCode: number; message: string } }
  > = {};

  examples.forEach((ex, idx) => {
    examplesObject[`example${idx + 1}`] = {
      summary: ex.summary,
      value: {
        statusCode: status,
        message: ex.message,
      },
    };
  });

  return {
    status,
    description: description || 'Error',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: status },
            message: { type: 'string' },
          },
        },
        examples: examplesObject,
      },
    },
  };
}
