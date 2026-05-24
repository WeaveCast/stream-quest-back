import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiParamOptions,
  ApiQuery,
  ApiQueryOptions,
  ApiResponse,
  ApiResponseOptions,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import {
  ErrorResponseDto,
  UnauthorizedResponseDto,
} from '../../dto/error-response.dto';
import { Public } from '../../decorators/public.decorator';

interface ApiPublicRouteOptions {
  responses?: ApiResponseOptions[];
  queries?: ApiQueryOptions[];
  params?: ApiParamOptions[];
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
    ...(options.params ?? []).map((p) => ApiParam(p)),
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
    Public(),
    ApiOperation({ summary }),
    ...(options.queries ?? []).map((q) => ApiQuery(q)),
    ...(options.params ?? []).map((p) => ApiParam(p)),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: ErrorResponseDto,
    }),
    ...(options.responses ?? []).map((r) => ApiResponse(r)),
  );
}
