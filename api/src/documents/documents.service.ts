import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  // What we expose to clients (no filePath)
  private readonly publicSelect = {
    id: true,
    title: true,
    type: true,
    expiresAt: true,
    createdAt: true,
    userId: true,
    fileName: true,
    fileMime: true,
    fileSize: true,
  } as const;

  async create(userId: string, body: { title: string; type: string; expiresAt: string }) {
    return this.prisma.document.create({
      data: {
        title: body.title,
        type: body.type,
        expiresAt: new Date(body.expiresAt),
        userId,
      },
      select: this.publicSelect,
    });
  }

  async findAll(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: this.publicSelect,
    });
  }

  async update(
    userId: string,
    id: string,
    body: { title?: string; type?: string; expiresAt?: string },
  ) {
    const existing = await this.prisma.document.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!existing) return null;

    return this.prisma.document.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.type !== undefined ? { type: body.type } : {}),
        ...(body.expiresAt !== undefined ? { expiresAt: new Date(body.expiresAt) } : {}),
      },
      select: this.publicSelect,
    });
  }

  async delete(userId: string, id: string) {
    const existing = await this.prisma.document.findFirst({
      where: { id, userId },
      select: { id: true, filePath: true },
    });
    if (!existing) return 0;

    // best-effort delete file if present
    if (existing.filePath && existsSync(existing.filePath)) {
      try {
        await unlink(existing.filePath);
      } catch {
        // ignore
      }
    }

    await this.prisma.document.delete({ where: { id } });
    return 1;
  }

  async attachFile(
    userId: string,
    id: string,
    file: { path: string; originalname: string; mimetype: string; size: number },
  ) {
    const existing = await this.prisma.document.findFirst({
      where: { id, userId },
      select: { id: true, filePath: true },
    });
    if (!existing) return null;

    // delete old file if present (best-effort)
    if (existing.filePath && existsSync(existing.filePath)) {
      try {
        await unlink(existing.filePath);
      } catch {
        // ignore
      }
    }

    return this.prisma.document.update({
      where: { id },
      data: {
        filePath: file.path,
        fileName: file.originalname,
        fileMime: file.mimetype,
        fileSize: file.size,
      },
      select: this.publicSelect,
    });
  }

  // Internal use ONLY for streaming file
  async getFileMeta(userId: string, id: string) {
    return this.prisma.document.findFirst({
      where: { id, userId },
      select: {
        id: true,
        filePath: true,
        fileName: true,
        fileMime: true,
        fileSize: true,
      },
    });
  }

  async removeFile(userId: string, id: string) {
    const existing = await this.prisma.document.findFirst({
      where: { id, userId },
      select: { id: true, filePath: true },
    });
    if (!existing) return null;

    if (existing.filePath && existsSync(existing.filePath)) {
      try {
        await unlink(existing.filePath);
      } catch {
        // ignore
      }
    }

    return this.prisma.document.update({
      where: { id },
      data: {
        filePath: null,
        fileName: null,
        fileMime: null,
        fileSize: null,
      },
      select: this.publicSelect,
    });
  }
}
