import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';
import { SupabaseBucket } from 'src/enums/supabase-bucket-enum';

@Injectable({ scope: Scope.REQUEST })
export class SupabaseService {
  private clientInstance: SupabaseClient;

  constructor(@Inject(REQUEST) private readonly request: Request) {}

  public getClient() {
    if (this.clientInstance) {
      return this.clientInstance;
    }

    this.clientInstance = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_ANON_KEY as string,
    );

    return this.clientInstance;
  }

  private extractFileExtension(mimetype: string) {
    return mimetype.split('/')[1];
  }

  public async uploadToPublicStorage(
    bucketName: SupabaseBucket,
    file: Express.Multer.File,
    fileName?: string,
  ) {
    const fileExtension = this.extractFileExtension(file.mimetype);
    const filePath = `${fileName || ''}.${fileExtension}`;

    const { data, error } = await this.getClient()
      .storage.from(bucketName)
      .upload(filePath, file.buffer);

    if (error)
      throw new InternalServerErrorException('upload failed: ' + error.message);

    const uploadedFilePublicUrl = this.getClient()
      .storage.from(bucketName)
      .getPublicUrl(data.path);

    return uploadedFilePublicUrl.data.publicUrl;
  }

  getFileNameFromUrl(url: string, folderName: string): string | null {
    const index = url.indexOf(folderName);

    if (folderName.includes('/')) {
      throw new Error("Folder contains a forward slash ('/').");
    }

    if (index !== -1) {
      const result = url.substring(index + `${folderName}/`.length);
      return result;
    } else {
      return null;
    }
  }

  public async deleteFromPublicStorage(
    bucketName: SupabaseBucket,
    url: string,
  ) {
    const fileName = this.getFileNameFromUrl(url, bucketName);
    const { error } = await this.getClient()
      .storage.from(bucketName)
      .remove([fileName]);

    if (error)
      throw new InternalServerErrorException('upload failed: ' + error.message);
  }
}
