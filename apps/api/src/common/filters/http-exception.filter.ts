import {
  Catch,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter,
} from "@nestjs/common";
import type { Response } from "express";
import { STATUS_CODES } from "node:http";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const isObject = typeof body === "object" && body !== null;

      const rawMessage = isObject ? (body as Record<string, unknown>).message : body;
      const message = Array.isArray(rawMessage) ? rawMessage.join("; ") : String(rawMessage ?? exception.message);
      const error = isObject
        ? String((body as Record<string, unknown>).error ?? STATUS_CODES[status] ?? exception.name)
        : (STATUS_CODES[status] ?? exception.name);

      response.status(status).json({ success: false, message, error });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
      error: "Internal Server Error",
    });
  }
}
