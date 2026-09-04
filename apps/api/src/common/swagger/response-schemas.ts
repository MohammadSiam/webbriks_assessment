import type { SchemaObject } from "@nestjs/swagger";

export const userSchema: SchemaObject = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    email: { type: "string", format: "email" },
    name: { type: "string" },
  },
};

export const authResponseSchema: SchemaObject = {
  type: "object",
  properties: {
    user: userSchema,
    accessToken: { type: "string" },
  },
};

export const boardSchema: SchemaObject = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string" },
    description: { type: "string", nullable: true },
    ownerId: { type: "string", format: "uuid" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

export const boardMemberSchema: SchemaObject = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    boardId: { type: "string", format: "uuid" },
    userId: { type: "string", format: "uuid" },
    role: { type: "string", enum: ["VIEWER", "EDITOR"] },
    createdAt: { type: "string", format: "date-time" },
    user: userSchema,
  },
};

export const columnSchema: SchemaObject = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    boardId: { type: "string", format: "uuid" },
    title: { type: "string" },
    position: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

export const taskSchema: SchemaObject = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    boardId: { type: "string", format: "uuid" },
    columnId: { type: "string", format: "uuid" },
    title: { type: "string" },
    description: { type: "string", nullable: true },
    position: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

export const columnWithTasksSchema: SchemaObject = {
  type: "object",
  properties: {
    ...columnSchema.properties,
    tasks: { type: "array", items: taskSchema },
  },
};

export const boardAggregateSchema: SchemaObject = {
  type: "object",
  properties: {
    ...boardSchema.properties,
    myRole: { type: "string", enum: ["OWNER", "EDITOR", "VIEWER"] },
    columns: { type: "array", items: columnWithTasksSchema },
    members: { type: "array", items: boardMemberSchema },
  },
};

export function paginated(itemSchema: SchemaObject): SchemaObject {
  return {
    type: "object",
    properties: {
      items: { type: "array", items: itemSchema },
      total: { type: "number" },
      page: { type: "number" },
      limit: { type: "number" },
    },
  };
}

export function idResponseSchema(paramName = "id"): SchemaObject {
  return { type: "object", properties: { [paramName]: { type: "string", format: "uuid" } } };
}
