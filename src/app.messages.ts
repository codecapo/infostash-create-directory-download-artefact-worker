import {IsNotEmpty} from "class-validator/types/decorator/common/IsNotEmpty";

export class CreateDirectoryDownloadArtefact {
    processingLogRequestId: string;
    infostashId: string;
    mediaArtefactId: string;
    uploadLocation: string;
    folderLocation: string;
    newfileName: string;
    processingStage: string;
}