/* eslint-disable unicorn/filename-case */
import {
	PDF_CHANNEL,
	PDFGenerationStatus,
	type UserPDFSocketEvent,
} from '@demo/common';
import { useEffect, useState } from 'react';
import { default as useAsyncUserBoxStore } from '../../../app/stores/user-box.store.ts';

const endpoint =
	import.meta.env.VITE_BFF_BASE_URL +
	import.meta.env.VITE_BFF_SSE_PDF_ENDPOINT;

export const SSEPDFChannelProvider: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const [pdfSent, setPdfSent] = useState(false);
	const pdfState = useAsyncUserBoxStore((state) => state.pdfState);
	const setPdfState = useAsyncUserBoxStore((state) => state.setPdfState);
	const downloadUserPdf = useAsyncUserBoxStore(
		(state) => state.downloadUserPdf,
	);

	useEffect(() => {
		if (pdfState === PDFGenerationStatus.READY && !pdfSent) {
			// download the PDF
			(async () => {
				await downloadUserPdf();
				setPdfSent(true);
			})();
		}
	}, [pdfState]);

	useEffect(() => {
		let mount = true;
		let eventSource: EventSource;
		let timer: NodeJS.Timeout;
		const createEvents = () => {
			// close connection if open
			if (eventSource) {
				eventSource.close();
			}
			// establishing an SSE connection
			eventSource = new EventSource(endpoint);
			eventSource.addEventListener('open', () => {
				console.log('SSE connection established');
			});
			eventSource.addEventListener(
				PDF_CHANNEL,
				(event: MessageEvent<string>) => {
					// if the component is mounted, we set the state
					// of the list with the received data
					if (mount) {
						const parsedData = JSON.parse(
							event.data,
						) as UserPDFSocketEvent;
						setPdfState(parsedData.state);
					}
				},
			);
			// if an error occurs, we wait a second
			// and call the connection function again
			eventSource.addEventListener('error', () => {
				timer = setTimeout(() => {
					createEvents();
				}, 1000);
			});
		};
		createEvents();

		// before unmounting the component, we clean
		// the timer and close the connection
		return () => {
			mount = false;
			clearTimeout(timer);
			eventSource.close();
		};
	}, []);

	return <>{children}</>;
};
