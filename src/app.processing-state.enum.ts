import {ProcessingState} from "@app/transactional-inbox-outbox/processing-state.enum";

export class AppProcessingState extends ProcessingState{
    public static readonly PROCESSING_STARTED = 'PROCESSING_STARTED';
    public static readonly PDF_DOWNLOADED = 'PDF_DOWNLOADED';
    public static readonly PDF_TRANSFORMED_TO_IMAGES = 'PDF_TRANSFORMED_TO_IMAGES';
    public static readonly IMAGES_TO_SENTENCES = 'PDF_TRANSFORMED_TO_IMAGES';
    public static readonly SENTENCES_TO_VECTOR_STORE = 'SENTENCES_TO_VECTOR_STORE';
}
