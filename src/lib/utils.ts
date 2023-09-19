import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import tailwindColors from 'tailwindcss/colors';
import type { DefaultColors } from 'tailwindcss/types/generated/colors';

// types
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
	amount: any;
};

export type ExpenseCategory = {
	id: string;
	name: any;
	color: any;
};

export type Income = {
	id: string;
	date: any;
	income: string;
	notes: string;
	gross_amount: any;
	benefits: any;
	retirement_401k: any;
	taxes: any;
	is_paycheck: boolean;
};

// functions
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
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

export function getAvatarURL(
	name: string,
	size = 120,
	variant = 'beam',
	colors = ['22577a', '38a3a5', '57cc99', '80ed99', 'c7f9cc']
) {
	return name
		? `https://source.boringavatars.com/${variant}/${size}/${name}?colors=${colors.join(',')}`
		: '';
}

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

export const formatDate = (dateToFormat: Date, includeTime: boolean = true) => {
	const padTo2Digits = (num: number) => {
		return num.toString().padStart(2, '0');
	};
	const date = [
		dateToFormat.getFullYear(),
		padTo2Digits(dateToFormat.getMonth() + 1),
		padTo2Digits(dateToFormat.getDate())
	].join('-');
	const time = [
		padTo2Digits(dateToFormat.getMinutes()),
		padTo2Digits(dateToFormat.getHours()),
		padTo2Digits(dateToFormat.getSeconds())
	].join(':');
	return includeTime ? `${date} ${time}` : `${date} 00:00:00`;
};

export const formatDateNeat = (date: Date, condensed: boolean = false) => {
	return new Date(date).toLocaleDateString('en-us', {
		year: condensed ? '2-digit' : 'numeric',
		month: condensed ? '2-digit' : 'short',
		day: condensed ? '2-digit' : 'numeric'
	});
};

export const formatDatepickerString = (date = new Date(), timeZone: 'local' | 'UTC' = 'local') => {
	if (timeZone === 'local') {
		return `${date.getFullYear()}-${
			date.getMonth() < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
		}-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`;
	} else {
		return `${date.getUTCFullYear()}-${
			date.getUTCMonth() < 10 ? '0' + (date.getUTCMonth() + 1) : date.getUTCMonth() + 1
		}-${date.getUTCDate() < 10 ? '0' + date.getUTCDate() : date.getUTCDate()}`;
	}
};

export const formatCurrency = (amount: number): string => {
	if (amount == -1) {
		return '--';
	}
	const formatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2
	});

	return formatter.format(amount);
};
