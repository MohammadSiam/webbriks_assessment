import { applyDecorators } from "@nestjs/common";
import { ApiResponse, type SchemaObject } from "@nestjs/swagger";

const ERROR_SCHEMA: SchemaObject = {
  type: "object",
  properties: {
    success: { type: "boolean", example: false },
    message: { type: "string" },
    error: { type: "string" },
  },
};

export function ApiSuccessResponse(status: number, dataSchema: SchemaObject) {
  return applyDecorators(
    ApiResponse({
      status,
      schema: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: dataSchema,
        },
      },
    }),
  );
}

export function ApiErrorResponses(...statuses: number[]) {
  return applyDecorators(...statuses.map((status) => ApiResponse({ status, schema: ERROR_SCHEMA })));
}
