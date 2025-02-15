import { PDFGenerationStatus } from '@demo/common';
import { create } from 'zustand';

export interface IUser {
	id: string;
	birthDate: string;
	email: string;
	firstName: string;
	lastName: string;
	roleId: number;
}

export interface ISignUpFields extends Omit<IUser, 'id' | 'roleId'> {
	password: string;
}

const queueUserPDFeEndpoint =
	import.meta.env.VITE_BFF_BASE_URL +
	import.meta.env.VITE_BFF_USER_PDF_ENDPOINT;

const listEnpoint =
	import.meta.env.VITE_BFF_BASE_URL +
	import.meta.env.VITE_BFF_USER_LIST_ENDPOINT;

const downloadUserPDFEndpoint =
	import.meta.env.VITE_BFF_BASE_URL +
	import.meta.env.VITE_BFF_USER_PDF_DOWNLOAD_ENDPOINT;

export interface UserBoxState {
	downloadUserPdf: () => Promise<void>;
	listUsers: () => Promise<IUser[]>;
	loading: boolean;
	pdfState: PDFGenerationStatus;
	progress: number;
	queueUserPdf: () => Promise<void>;
	ready: boolean;
	selectedUser: IUser | null;
	setPdfState: (state: PDFGenerationStatus) => void;
	setUser: (invoice: IUser | null) => void;
}
const useAsyncUserBoxStore = create<UserBoxState>((set, get) => ({
	downloadUserPdf: async () => {
		const selectedUserId = get().selectedUser?.id;
		if (!selectedUserId) return;
		set({ loading: true, progress: 0, ready: false });
		const body = JSON.stringify({ userId: selectedUserId });
		// stream the PDF file
		const response = await fetch(downloadUserPDFEndpoint, {
			body,
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
		});
		const reader = response.body?.getReader();

		if (!reader) {
			console.error('Failed to fetch PDF');
			set({ loading: false });
			return;
		}

		const total = Number(response.headers.get('Content-Length'));
		let received = 0;
		const chunks: Uint8Array[] = [];

		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				set({ loading: false, ready: true });
				break;
			}

			if (value) {
				received += value.length;
				chunks.push(value);
				set({ progress: (received / total) * 100 });
			}
		}

		// create link and download
		const blob = new Blob(chunks, { type: 'application/pdf' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `user-${selectedUserId}.pdf`;
		a.click();
	},
	listUsers: async () => {
		try {
			const response = await fetch(listEnpoint, {
				headers: {
					'Content-Type': 'application/json',
				},
				method: 'GET',
			});
			const data = await response.json();

			return data;
		} catch (error) {
			console.error(error);
			return [];
		}
	},
	loading: false,
	pdfState: PDFGenerationStatus.IDLE,
	progress: 0,
	queueUserPdf: async () => {
		const selectedUserId = get().selectedUser?.id;
		if (!selectedUserId) return;
		const body = JSON.stringify({ userId: selectedUserId });
		// queue the PDF file
		await fetch(queueUserPDFeEndpoint, {
			body,
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
		});
	},
	ready: false,
	selectedUser: null,
	setPdfState: (state: PDFGenerationStatus) => set({ pdfState: state }),
	setUser: (user: IUser | null) => set({ selectedUser: user }),
}));

export default useAsyncUserBoxStore;
