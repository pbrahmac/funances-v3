import { getLocalTimeZone, today } from '@internationalized/date';
import { z } from 'zod';

export const dateRangeSchema = z.object({
	start: z.string().default(today(getLocalTimeZone()).subtract({ months: 1 }).toString()),
	end: z.string().default(today(getLocalTimeZone()).toString())
});

export const datePresetSchema = z.object({
	preset: z.string().min(1)
});
