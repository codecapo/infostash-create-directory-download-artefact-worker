import { Injectable } from '@nestjs/common';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import crypto from 'node:crypto';
import { MultipartFile } from '@fastify/multipart';

@Injectable()
export class DigitalOceanSpacesService {
  private readonly url = process.env.OBJECT_STORE_URL;

  private readonly s3Client = new S3Client({
    endpoint: this.url, // Find your endpoint in the control panel, under Settings. Prepend "https://".
    forcePathStyle: false, // Configures to use subdomain/virtual calling format.
    region: process.env.OBJECT_STORE_REGION, // Must be "us-east-1" when creating new Spaces. Otherwise, use the region in your endpoint (for example, nyc3).
    credentials: {
      accessKeyId: process.env.OBJECT_STORE_ACCESS_ID,
      secretAccessKey: process.env.OBJECT_STORE_ACCESS_SECRET,
    },
  });

  public async uploadArtefact(file: MultipartFile) {
    const uploadObjectName = crypto.randomUUID();
    const uploadContentBuffer = await file.toBuffer();
    const mimeType = file.mimetype;

    const objectStoreName = process.env.OBJECT_STORE_NAME;
    const key = `documents/${uploadObjectName}`;

    const command = new PutObjectCommand({
      Bucket: objectStoreName,
      Key: key,
      Body: uploadContentBuffer,
      ContentType: mimeType,
    });

    const uploaded = await this.s3Client.send(command);

    if (uploaded) {
      return {
        uploadedLink: `https://${objectStoreName}.${process.env.OBJECT_STORE_REGION}.digitaloceanspaces.com/${key}`,
        uploadedObjectName: `${uploadObjectName}`,
      };
    }
  }

  public async downloadArtefact(uploadedArtefactLocation: string) {
    const url = new URL(uploadedArtefactLocation);
    const bucketName = url.hostname.split('.')[0];
    const key = url.pathname.slice(1);

    // Create the GetObjectCommand
    const getObjectCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    return await this.s3Client.send(getObjectCommand);
  }
}
