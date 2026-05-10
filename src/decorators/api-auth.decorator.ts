import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiQueryOptions,
  ApiResponse,
  ApiResponseOptions,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ErrorResponseDto,
  UnauthorizedResponseDto,
} from '../dto/error-response.dto';

interface ApiPublicRouteOptions {
  responses?: ApiResponseOptions[];
  queries?: ApiQueryOptions[];
}

export function ApiAuthRoute(
  summary: string,
  options: ApiPublicRouteOptions = {},
) {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    ApiCookieAuth(),
    ApiOperation({ summary }),
    ...(options.queries ?? []).map((q) => ApiQuery(q)),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
      type: UnauthorizedResponseDto,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: ErrorResponseDto,
    }),
    ...(options.responses ?? []).map((r) => ApiResponse(r)),
  );
}

export function ApiPublicRoute(
  summary: string,
  options: ApiPublicRouteOptions = {},
) {
  return applyDecorators(
    ApiOperation({ summary }),
    ...(options.queries ?? []).map((q) => ApiQuery(q)),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: ErrorResponseDto,
    }),
    ...(options.responses ?? []).map((r) => ApiResponse(r)),
  );
}
