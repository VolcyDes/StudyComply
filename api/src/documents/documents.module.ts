import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { AuthCommonModule } from '../auth/auth-common.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [AuthCommonModule, StorageModule],
  providers: [DocumentsService],
  controllers: [DocumentsController],
})
export class DocumentsModule {}
