import {Injectable, Logger} from '@nestjs/common';
import * as fs from 'fs';
import * as fsp from "fs/promises";
import {pipeline} from "stream/promises";
import {DigitalOceanSpacesService} from "@app/digital-ocean-spaces";

@Injectable()
export class AppService {
    private logger = new Logger(AppService.name)

    constructor(private readonly digitalOceanSpacesService: DigitalOceanSpacesService) {
    }

    getHello(): string {
        return 'Hello World!';
    }

    public async createPdfDirectoryAndDownload(artefactId: string, folderLocation: string, newfilename: string, uploadLocation: string) {

        const pdfFolder = `${folderLocation}`;
        const file = `${pdfFolder}/${artefactId}/pdf/${newfilename}.pdf`;
        const fileLocation = `${pdfFolder}/${artefactId}/pdf`;

        fs.mkdir(fileLocation, {recursive: true}, () => {});

        const folderExists = fs.existsSync(fileLocation);

        if (folderExists) {
            this.logger.debug(
              `Directory exists: ${fileLocation}, skipping directory creation`,
            );

            fs.writeFile(file, '', () => {});
            const fileExists = fs.existsSync(file);

            if (fileExists) {
                this.logger.debug(`File exists: ${file}, overwriting current file`);

                const writeStream = fs.createWriteStream(file);

                const download = await this.digitalOceanSpacesService.downloadArtefact(
                  uploadLocation,
                );

                await pipeline(download.Body.transformToWebStream, writeStream);
                this.logger.debug(
                  `Downloaded file from location ${uploadLocation}`,
                );

                const fileStat = await fsp.stat(file)

                return {
                    fileDownloaded: true,
                    fileSize: fileStat.size,
                    fileDownloadIsoDateTime: fileStat.ctime
                }
            }
        }
    }
}
