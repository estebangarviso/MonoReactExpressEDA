/* eslint-disable @typescript-eslint/no-explicit-any */
import { PDFGenerationStatus } from './enums';
export interface UserPDFSocketEvent {
	userId: string;
	state: PDFGenerationStatus;
}

export interface IQueueCommon<D = any> {
	idTask: string;
	details: D;
}

export interface IQueueUserPdfDetails {
	userId: string;
}

export type TQueueUserPdf = IQueueCommon<IQueueUserPdfDetails>;
