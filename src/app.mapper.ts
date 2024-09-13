import {CreateDirectoryDownloadArtefact} from "./app.messages";
import {Injectable, Logger} from "@nestjs/common";

@Injectable()
export class AppMapper {

    private logger = new Logger(AppMapper.name)

    public mapMessageToCreateDirectoryDownloadArtefact(queueMsg:string) : CreateDirectoryDownloadArtefact {
        const parseMsg: CreateDirectoryDownloadArtefact = JSON.parse(queueMsg)

        if (parseMsg.processingLogRequestId == null) throw Error(`processingLogRequestId is null, please provide filename in payload`)
        if (parseMsg.infostashId == null) throw Error(`infostashId is null, please provide filename in payload`)
        if (parseMsg.mediaArtefactId == null) throw Error(`mediaArtefactId is null, please provide filename in payload`)
        if (parseMsg.newfileName == null) throw Error(`newfileName is null, please provide filename in payload`)
        if (parseMsg.uploadLocation == null) throw Error(`uploadLocation is null, please provide filename in payload`)
        if (parseMsg.folderLocation == null) throw Error(`folderLocation is null, please provide filename in payload`)
        if (parseMsg.processingStage == null) throw Error(`processingStage is null, please provide filename in payload`)

        return parseMsg
    }
}