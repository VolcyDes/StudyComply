import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private readonly bucket = process.env.S3_BUCKET || '';
  private readonly region = process.env.S3_REGION || 'eu-west-3';
  private readonly s3: S3Client | null;

  constructor() {
    if (!this.bucket) {
      this.s3 = null;
      return;
    }

    this.s3 = new S3Client({
      region: this.region,
      credentials:
        process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.S3_ACCESS_KEY_ID,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            }
          : undefined,
      endpoint: process.env.S3_ENDPOINT || undefined, // optional (MinIO / S3-compatible)
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true' ? true : undefined,
    });
  }

  isEnabled() {
    return !!this.s3;
  }

  buildKey(params: { userId: string; docId: string; originalName: string }) {
    const ext = extname(params.originalName || '.pdf') || '.pdf';
    const id = randomUUID();
    return `users/${params.userId}/documents/${params.docId}/${id}${ext}`;
  }

  async putPdf(params: { key: string; buffer: Buffer; mime: string }) {
    if (!this.s3) throw new Error('S3 not configured');
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: params.key,
        Body: params.buffer,
        ContentType: params.mime || 'application/pdf',
      }),
    );
  }

  async getObjectStream(key: string) {
    if (!this.s3) throw new Error('S3 not configured');
    const out = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    if (!out.Body) throw new Error('Empty S3 body');
    return out.Body as any;
  }

  async deleteObject(key: string) {
    if (!this.s3) throw new Error('S3 not configured');
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
