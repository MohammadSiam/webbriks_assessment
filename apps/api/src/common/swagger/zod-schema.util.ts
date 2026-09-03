import type { SchemaObject } from "@nestjs/swagger";
import type { ZodSchema } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export function toApiBodySchema(schema: ZodSchema): SchemaObject {
  return zodToJsonSchema(schema, { target: "openApi3" }) as SchemaObject;
}
