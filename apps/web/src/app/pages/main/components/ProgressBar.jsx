import { forwardRef } from 'react';

/**
 * Progress bar component.
 */
const ProgressBar = forwardRef(({ progress, ...otherProps }, ref) => {
	return (
		<div
			className='h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700'
			ref={ref}
			{...otherProps}
		>
			<div
				className={`${
					progress === 100 ? 'bg-green-600' : 'bg-yellow-600'
				} text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full`}
				style={{ width: `${progress}%` }}
			>
				{progress}%
			</div>
		</div>
	);
});
export default ProgressBar;
