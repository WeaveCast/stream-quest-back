import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    this.logger.error(
      `Prisma error ${exception.code} on ${request.method} ${request.url}`,
      exception.stack,
    );

    switch (exception.code) {
      case 'P2025': {
        const meta = exception.meta as { modelName?: string };
        const model = meta?.modelName?.toLowerCase() || 'resource';
        throw new NotFoundException(`${this.capitalize(model)} not found`);
      }

      case 'P2002': {
        const target = (exception.meta?.target as string[]) || [];
        const field = target[0] || 'field';
        throw new ConflictException(`${this.capitalize(field)} already exists`);
      }

      default: {
        throw new InternalServerErrorException('Database error');
      }
    }
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
