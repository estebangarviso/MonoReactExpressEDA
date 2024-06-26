import { PDFGenerationStatus } from "./enums";
export interface UserPDFSocketEvent {
  userId: string;
  state: PDFGenerationStatus;
}
