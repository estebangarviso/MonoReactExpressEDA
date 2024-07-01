import { PDFGenerationStatus } from '@demo/common';
import { Suspense, useEffect, useRef, useState } from 'react';
import { SSEPDFChannelProvider } from '#libs/ui';
import { default as useAsyncUserBoxStore } from '../../../stores/user-box.store.js';
import ProgressBar from './ProgressBar.jsx';

const UsersBox = () => {
	const progressRef = useRef(null);
	const fetchPdf = useAsyncUserBoxStore((state) => state.queueUserPdf);
	const setUser = useAsyncUserBoxStore((state) => state.setUser);
	const listUsers = useAsyncUserBoxStore((state) => state.listUsers);
	const selectedUser = useAsyncUserBoxStore((state) => state.selectedUser);
	const progress = useAsyncUserBoxStore((state) => state.progress);
	const pdfState = useAsyncUserBoxStore((state) => state.pdfState);
	const isLoading = useAsyncUserBoxStore((state) => state.loading);
	const [users, setUsers] = useState([]);

	/**
	 * Download PDF invoice for selected invoice
	 */
	const handleDownloadPdf = async () => {
		if (!selectedUser) return;
		await fetchPdf();
	};

	/**
	 * Fetch users list
	 */
	useEffect(() => {
		const fetchUsers = async () => {
			const users = await listUsers();
			setUsers(users);
		};

		void fetchUsers();

		return () => {
			setUsers([]);
		};
	}, [listUsers]);

	return (
		<div className='mx-auto container'>
			{selectedUser ? (
				<SSEPDFChannelProvider>
					<button
						className={`flex items-center justify-center border-2 border-blue-500 rounded px-4 py-2 text-blue-500 font-bold transition-colors duration-300 space-x-4 hover:bg-blue-500 hover:text-white ${pdfState === PDFGenerationStatus.READY ? 'motion-safe:animate-bounce' : ''}`}
						onClick={() => setUser(null)}
						type='button'
					>
						<i className='mdi-arrow-left text-2xl' />
						Back
					</button>
					<div className='mx-auto container'>
						<h2 className='text-center text-2xl text-blue-700 font-bold'>
							# User {selectedUser.id}
						</h2>
						<div className='flex justify-center'>
							<button
								className='mt-4 flex items-center justify-center rounded bg-blue-500 px-4 py-2 text-white font-bold transition-colors duration-300 space-x-4 hover:bg-blue-700 disabled:opacity-50'
								disabled={
									isLoading ||
									pdfState === PDFGenerationStatus.READY
								}
								onClick={handleDownloadPdf}
							>
								<i className='mdi-download text-2xl' /> Download
								PDF User Information
								{pdfState === PDFGenerationStatus.PENDING && (
									<i className='mdi-loading animate-spin text-2xl text-blue-700 dark:text-blue-500' />
								)}
								{pdfState === PDFGenerationStatus.READY && (
									<i className='mdi-check text-2xl text-green-700 dark:text-green-500' />
								)}
								{pdfState === PDFGenerationStatus.FAILED && (
									<i className='mdi-close text-2xl text-red-700 dark:text-red-500' />
								)}
							</button>
						</div>

						<ProgressBar
							className={`mt-4 ${isLoading ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
							progress={progress}
							ref={progressRef}
						/>
					</div>
				</SSEPDFChannelProvider>
			) : (
				<>
					<p className='text-lg text-gray-700 font-bold font-italic'>
						Select a user to download their data.
					</p>
					<div className='relative overflow-x-auto shadow-md sm:rounded-lg'>
						<table className='w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400'>
							<thead className='bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400'>
								<tr>
									<th className='px-6 py-3' scope='col'>
										Name
									</th>
									<th className='px-6 py-3' scope='col'>
										Email
									</th>
									<th className='px-6 py-3' scope='col'>
										<span className='sr-only'>Actions</span>
									</th>
								</tr>
							</thead>
							<tbody className='border-b bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600'>
								<Suspense fallback={<p>Loading...</p>}>
									{users.map((user) => (
										<tr
											className='border-b bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600'
											key={user.id}
										>
											<th
												className='whitespace-nowrap px-6 py-4 text-gray-900 font-medium dark:text-white'
												scope='row'
											>
												{user.firstName} {user.lastName}
											</th>
											<td className='px-6 py-4'>
												{user.email}
											</td>
											<td className='px-6 py-4 text-right'>
												<button
													className='text-blue-500 hover:text-blue-700'
													onClick={() =>
														setUser(user)
													}
												>
													Select
												</button>
											</td>
										</tr>
									))}
								</Suspense>
							</tbody>
						</table>
					</div>
				</>
			)}
		</div>
	);
};
export default UsersBox;
