import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UnsupportedMediaTypeException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { extname, join } from 'path';
import { createReadStream, existsSync } from 'fs';
import type { Response } from 'express';
import { StorageService } from '../storage/storage.service';

function safeFileName(original: string) {
  return original.replace(/[^a-zA-Z0-9._-]/g, '_');
}

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    private readonly docs: DocumentsService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  findAll(@Req() req: any) {
    return this.docs.findAll(req.user.sub);
  }

  @Post()
  create(
    @Req() req: any,
    @Body() body: { title: string; type: string; expiresAt: string },
  ) {
    return this.docs.create(req.user.sub, body);
  }

  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { title?: string; type?: string; expiresAt?: string },
  ) {
    const updated = await this.docs.update(req.user.sub, id, body);
    if (!updated) throw new NotFoundException('Document not found');
    return updated;
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const count = await this.docs.delete(req.user.sub, id);
    if (count === 0) throw new NotFoundException('Document not found');
    return { deleted: true };
  }

  // ---- Upload PDF ----
  @Post(':id/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      // If S3 is configured -> memoryStorage (we need file.buffer)
      // Else -> diskStorage in uploads/
      storage: process.env.S3_BUCKET
        ? memoryStorage()
        : diskStorage({
            destination: join(process.cwd(), 'uploads'),
            filename: (_req, file, cb) => {
              const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
              const ext = extname(file.originalname || '.pdf') || '.pdf';
              cb(null, `${unique}${ext}`);
            },
          }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async uploadPdf(@Req() req: any, @Param('id') id: string) {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) throw new NotFoundException('No file uploaded');

    const isPdf =
      file.mimetype === 'application/pdf' ||
      file.originalname.toLowerCase().endsWith('.pdf');

    if (!isPdf) throw new UnsupportedMediaTypeException('Only PDF files are allowed');

    // S3 mode
    if (this.storage.isEnabled()) {
      const buf = (file as any).buffer as Buffer | undefined;
      if (!buf) throw new NotFoundException('File buffer missing (S3 mode)');

      const key = this.storage.buildKey({
        userId: req.user.sub,
        docId: id,
        originalName: file.originalname,
      });

      await this.storage.putPdf({
        key,
        buffer: buf,
        mime: file.mimetype || 'application/pdf',
      });

      const updated = await this.docs.attachFile(req.user.sub, id, {
        path: key, // store key in DB internally (never exposed)
        originalname: safeFileName(file.originalname),
        mimetype: file.mimetype || 'application/pdf',
        size: file.size,
      });

      if (!updated) throw new NotFoundException('Document not found');
      return updated;
    }

    // Local disk mode
    const updated = await this.docs.attachFile(req.user.sub, id, {
      path: file.path,
      originalname: safeFileName(file.originalname),
      mimetype: file.mimetype,
      size: file.size,
    });

    if (!updated) throw new NotFoundException('Document not found');
    return updated;
  }

  // ---- Remove attached PDF ----
  @Delete(':id/file')
  async removePdf(@Req() req: any, @Param('id') id: string) {
    // If S3 enabled: delete object first (best-effort), then clear DB
    if (this.storage.isEnabled()) {
      const meta = await this.docs.getFileMeta(req.user.sub, id);
      if (!meta) throw new NotFoundException('Document not found');
      if (meta.filePath) {
        try {
          await this.storage.deleteObject(meta.filePath);
        } catch {
          // ignore
        }
      }
    }

    const updated = await this.docs.removeFile(req.user.sub, id);
    if (!updated) throw new NotFoundException('Document not found');
    return updated;
  }

  // ---- Download PDF (JWT protected) ----
  @Get(':id/file')
  async downloadPdf(@Req() req: any, @Param('id') id: string, @Res() res: Response) {
    const meta = await this.docs.getFileMeta(req.user.sub, id);
    if (!meta) throw new NotFoundException('Document not found');
    if (!meta.filePath || !meta.fileName) throw new NotFoundException('No file attached');

    res.setHeader('Content-Type', meta.fileMime || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${meta.fileName}"`);

    // S3 mode
    if (this.storage.isEnabled()) {
      const stream = await this.storage.getObjectStream(meta.filePath);
      stream.pipe(res);
      return;
    }

    // Local disk mode
    if (!existsSync(meta.filePath)) throw new NotFoundException('File missing on server');
    const stream = createReadStream(meta.filePath);
    stream.pipe(res);
  }
}
