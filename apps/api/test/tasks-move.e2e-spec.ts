import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('Tasks Move (e2e)', () => {
  let app: INestApplication;
  let ownerToken: string;
  let viewerToken: string;
  let boardId: string;
  let columnAId: string;
  let columnBId: string;
  let otherBoardColumnId: string;
  let taskIds: string[];

  const suffix = Date.now();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const server = app.getHttpServer();

    const ownerRes = await request(server)
      .post('/auth/register')
      .send({ email: `move-owner-${suffix}@example.com`, password: 'password123', name: 'Move Owner' });
    ownerToken = ownerRes.body.data.accessToken;

    const viewerRes = await request(server)
      .post('/auth/register')
      .send({ email: `move-viewer-${suffix}@example.com`, password: 'password123', name: 'Move Viewer' });
    viewerToken = viewerRes.body.data.accessToken;

    const boardRes = await request(server)
      .post('/boards')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Move Test Board' });
    boardId = boardRes.body.data.id;

    await request(server)
      .post(`/boards/${boardId}/members`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: `move-viewer-${suffix}@example.com`, role: 'VIEWER' });

    const colARes = await request(server)
      .post(`/boards/${boardId}/columns`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Column A' });
    columnAId = colARes.body.data.id;

    const colBRes = await request(server)
      .post(`/boards/${boardId}/columns`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Column B' });
    columnBId = colBRes.body.data.id;

    taskIds = [];
    for (const title of ['Task 1', 'Task 2', 'Task 3']) {
      const res = await request(server)
        .post(`/columns/${columnAId}/tasks`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ title });
      taskIds.push(res.body.data.id);
    }

    const otherBoardRes = await request(server)
      .post('/boards')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Other Board' });
    const otherBoardId = otherBoardRes.body.data.id;

    const otherColRes = await request(server)
      .post(`/boards/${otherBoardId}/columns`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Other Column' });
    otherBoardColumnId = otherColRes.body.data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('reorders a task within the same column', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/tasks/${taskIds[2]}/move`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ targetColumnId: columnAId, targetIndex: 0 })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.columnId).toBe(columnAId);

    const boardRes = await request(app.getHttpServer())
      .get(`/boards/${boardId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    const colA = boardRes.body.data.columns.find((c: { id: string }) => c.id === columnAId);
    expect(colA.tasks.map((t: { id: string }) => t.id)).toEqual([taskIds[2], taskIds[0], taskIds[1]]);
  });

  it('moves a task into an empty column', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/tasks/${taskIds[0]}/move`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ targetColumnId: columnBId, targetIndex: 0 })
      .expect(200);

    expect(res.body.data.columnId).toBe(columnBId);

    const boardRes = await request(app.getHttpServer())
      .get(`/boards/${boardId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    const colB = boardRes.body.data.columns.find((c: { id: string }) => c.id === columnBId);
    expect(colB.tasks.map((t: { id: string }) => t.id)).toEqual([taskIds[0]]);
  });

  it('moves a task across columns to a specific index', async () => {
    await request(app.getHttpServer())
      .patch(`/tasks/${taskIds[1]}/move`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ targetColumnId: columnBId, targetIndex: 0 })
      .expect(200);

    const boardRes = await request(app.getHttpServer())
      .get(`/boards/${boardId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    const colB = boardRes.body.data.columns.find((c: { id: string }) => c.id === columnBId);
    expect(colB.tasks.map((t: { id: string }) => t.id)).toEqual([taskIds[1], taskIds[0]]);
  });

  it('rejects a move to a column belonging to a different board', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/tasks/${taskIds[2]}/move`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ targetColumnId: otherBoardColumnId, targetIndex: 0 })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('rejects a move from a VIEWER without edit access', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/tasks/${taskIds[2]}/move`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ targetColumnId: columnBId, targetIndex: 0 })
      .expect(403);

    expect(res.body.success).toBe(false);
  });

  it('returns 404 for a nonexistent task', async () => {
    await request(app.getHttpServer())
      .patch('/tasks/00000000-0000-0000-0000-000000000000/move')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ targetColumnId: columnAId, targetIndex: 0 })
      .expect(404);
  });
});
