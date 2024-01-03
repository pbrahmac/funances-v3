import type { ZonedDateTime } from '@internationalized/date';
import { clsx, type ClassValue } from 'clsx';
import type { RecordModel } from 'pocketbase';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { twMerge } from 'tailwind-merge';
import tailwindColors from 'tailwindcss/colors';
import type { DefaultColors } from 'tailwindcss/types/generated/colors';

// types
export type MenuItem = { title: string; link: string };

export type Expense = {
	id: string;
	date: any;
	expense: string;
	category: {
		id: string;
		name: string;
		color: string;
	};
	notes: string;
	amount: number;
};

export type ExpenseCategory = {
	id: string;
	name: string;
	color: string;
};

export type Income = {
	id: string;
	date: any;
	income: string;
	notes: string;
	gross_amount: number;
	benefits: number;
	retirement_401k: number;
	taxes: number;
	is_paycheck: boolean;
};

export type Allocation = {
	id: string;
	category: string;
	percentage: number;
};

export type AllocationStatus = {
	id: string;
	year: number;
	month: number;
	allocation: any;
	isAllocated: boolean;
};

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

// functions
export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, '');
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

export const serializeNonPOJOs = (obj: any) => {
	return structuredClone(obj);
};

export const getAvatarURL = (
	name: string | undefined,
	size = 120,
	variant = 'beam',
	colors = ['22577a', '38a3a5', '57cc99', '80ed99', 'c7f9cc']
) => {
	return name
		? `https://source.boringavatars.com/${variant}/${size}/${name}?colors=${colors.join(',')}`
		: '';
};

const hashStr = (str: string) => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const charCode = str.charCodeAt(i);
		hash += charCode;
	}
	return hash;
};

export const nameToColor = (type: string) => {
	const colors = Object.keys(tailwindColors).slice(8, Object.keys(tailwindColors).length - 5);
	const index = hashStr(type) % colors.length;
	return tailwindColors[colors[index] as keyof DefaultColors][500];
};

export const padTo2Digits = (num: number) => {
	return num.toString().padStart(2, '0');
};

export const formatDate = (
	dateToFormat: Date,
	includeTime: boolean = true,
	UTC: boolean = false
) => {
	const date = UTC
		? [
				dateToFormat.getUTCFullYear(),
				padTo2Digits(dateToFormat.getUTCMonth() + 1),
				padTo2Digits(dateToFormat.getUTCDate())
		  ].join('-')
		: [
				dateToFormat.getFullYear(),
				padTo2Digits(dateToFormat.getMonth() + 1),
				padTo2Digits(dateToFormat.getDate())
		  ].join('-');
	const time = UTC
		? [
				padTo2Digits(dateToFormat.getUTCMinutes()),
				padTo2Digits(dateToFormat.getUTCHours()),
				padTo2Digits(dateToFormat.getUTCSeconds())
		  ].join(':')
		: [
				padTo2Digits(dateToFormat.getMinutes()),
				padTo2Digits(dateToFormat.getHours()),
				padTo2Digits(dateToFormat.getSeconds())
		  ].join(':');
	return includeTime ? `${date} ${time}` : `${date}`;
};

export const formatDateNeat = (date: Date, condensed: boolean = false) => {
	return new Date(date).toLocaleDateString('en-us', {
		year: condensed ? '2-digit' : 'numeric',
		month: condensed ? '2-digit' : 'short',
		day: condensed ? '2-digit' : 'numeric',
		timeZone: 'PST'
	});
};

export const formatDatepickerString = (
	date = new Date(),
	timeZone: 'local' | 'UTC' = 'local'
): string => {
	if (timeZone === 'local') {
		return [
			date.getFullYear(),
			padTo2Digits(date.getMonth() + 1),
			padTo2Digits(date.getDate())
		].join('-');
	} else {
		return [
			date.getUTCFullYear(),
			padTo2Digits(date.getUTCMonth() + 1),
			padTo2Digits(date.getUTCDate())
		].join('-');
	}
};

export const formatCurrency = (amount: number): string => {
	if (amount == -1) {
		return '--';
	}
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2
	}).format(amount);
};

export const monthIdxToName = (idx: number, format: 'short' | 'long') => {
	if (idx < 0 || idx > 11) {
		return 'Invalid';
	}
	const monthMap = new Map([
		[0, 'January'],
		[1, 'February'],
		[2, 'March'],
		[3, 'April'],
		[4, 'May'],
		[5, 'June'],
		[6, 'July'],
		[7, 'August'],
		[8, 'September'],
		[9, 'October'],
		[10, 'November'],
		[11, 'December']
	]);

	if (format === 'short') {
		return monthMap.get(idx)?.slice(0, 3);
	} else if (format === 'long') {
		return monthMap.get(idx);
	} else {
		return 'Invalid';
	}
};

export const formatPercentage = (
	decimal: number,
	precision: number = 2,
	signed: boolean = false
) => {
	if (!isFinite(decimal) && decimal >= 0) {
		return signed ? '+∞%' : '∞%';
	}
	const percentage = `${(decimal * 100).toFixed(precision)}%`;
	return signed ? (decimal > 0 ? `+${percentage}` : percentage) : percentage;
};

export const calcLastMonthRatio = (
	data: number[] | undefined,
	month: 'thisMonth' | 'lastMonth'
) => {
	if (!data) {
		return '';
	}
	let [firstIdx, secondIdx] = [0, 0];
	if (data.length < 3 && data.length > 1) {
		[firstIdx, secondIdx] = [-1, -2];
	} else if (data.length < 2) {
		[firstIdx, secondIdx] = [0, 0];
	}
	[firstIdx, secondIdx] = month == 'thisMonth' ? [-1, -2] : [-2, -3];

	const [firstAmount, secondAmount] = [data.at(firstIdx) ?? 0, data.at(secondIdx) ?? 1];
	let ratio = firstAmount / secondAmount - 1;

	return firstIdx === 0 && secondIdx === 0
		? 'First month of the year!'
		: `${formatPercentage(ratio, 1, true)} from last month`;
};

/**
 * Aggregates expense totals by month
 * @param rawExpenseTotals raw expense total data from PocketBase
 */
export const monthlyTotalExpenses = (rawExpenseTotals: RecordModel[]) => {
	if (!rawExpenseTotals) {
		return;
	}
	const monthExpenseMap = new Map(
		[...Array(new Date().getMonth() + 1).keys()].map((num) => [num, 0])
	);

	rawExpenseTotals.forEach((item) => {
		const currMonth = item.month - 1;
		if (!monthExpenseMap.get(currMonth)) {
			monthExpenseMap.set(currMonth, item.amount);
		} else {
			const curr = monthExpenseMap.get(currMonth);
			monthExpenseMap.set(currMonth, curr + item.amount);
		}
	});

	return [...monthExpenseMap.values()];
};

/**
 * Aggregates income totals by month
 * @param rawIncomeTotals raw income total data from PocketBase
 */
export const monthlyTotalIncomes = (rawIncomeTotals: RecordModel[]) => {
	/**
	 * @type {Map<number, number>}
	 */
	const monthIncomeMap = new Map(
		[...Array(new Date().getMonth() + 1).keys()].map((num) => [num, 0])
	);

	rawIncomeTotals.forEach((income) => {
		const monthIdx = new Date(income.date).getMonth();
		const postTaxIncome =
			income.gross_amount - (income.benefits + income.retirement_401k + income.taxes);

		monthIncomeMap.set(monthIdx, (monthIncomeMap.get(monthIdx) ?? 0) + postTaxIncome);
	});
	return Array.from(monthIncomeMap.values());
};
