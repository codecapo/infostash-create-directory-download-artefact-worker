import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as os from 'os';

import { pipeline } from 'stream/promises';
import { DigitalOceanSpacesService } from '@app/digital-ocean-spaces';

@Injectable()
export class AppService {
  private logger = new Logger(AppService.name);

  constructor(
    private readonly digitalOceanSpacesService: DigitalOceanSpacesService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  public async createPdfDirectoryAndDownload(
    artefactId: string,
    infostashId: string,
    newfilename: string,
    uploadLocation: string,
  ) {
    const osPlatform = os.tmpdir();
    const pdfFolder = `${osPlatform}/${infostashId}`;
    const file = `${pdfFolder}/${artefactId}/pdf/${newfilename}.pdf`;
    const fileLocation = `${pdfFolder}/${artefactId}/pdf`;

    try {
      // Create directory
      await fsp.mkdir(fileLocation, { recursive: true });
      this.logger.debug(`Directory created or already exists: ${fileLocation}`);

      // Create write stream
      const writeStream = fs.createWriteStream(file);

      // Download and write file
      const download =
        await this.digitalOceanSpacesService.downloadArtefact(uploadLocation);
      await pipeline(download.Body.transformToWebStream, writeStream);
      this.logger.debug(`Downloaded file from location ${uploadLocation}`);

      // Get file stats
      const fileStat = await fsp.stat(file);

      return {
        fileSize: fileStat.size,
        fileDownloadIsoDateTime: fileStat.ctime,
      };
    } catch (error) {
      this.logger.error(
        `Error in createPdfDirectoryAndDownload: ${error.message}`,
      );
      throw error;
    }
  }
}
