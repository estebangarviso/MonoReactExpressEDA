import { useMemo } from 'react';

export const useDob = (minAge = 0, maxAge = 100) => {
	const currenTime = new Date();
	const currentYear = currenTime.getFullYear();
	const currentMonth = currenTime.getMonth() + 1;
	const minYear = currentYear - maxAge;
	const maxYear = currentYear - minAge;
	const minDate = new Date(`${minYear}-${currentMonth}-01`);
	const maxDate = new Date(`${maxYear}-${currentMonth}-01`);
	return useMemo(() => ({ maxDate, minDate }), [minDate, maxDate]);
};
