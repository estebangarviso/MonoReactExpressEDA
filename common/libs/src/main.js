/**
 * Enum for the status of the PDF generation.
 *
 * @enum {string} PDFGenerationStatus
 * @readonly
 */
export const PDFGenerationStatus = Object.freeze({
	IDLE: 'IDLE',
	PENDING: 'PENDING',
	READY: 'READY',
	FAILED: 'FAILED',
});

export const PDF_CHANNEL = 'pdf:channel';