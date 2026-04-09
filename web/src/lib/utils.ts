import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Matches shadcn-svelte / bits-ui typing for element refs on polymorphic components. */
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null;
};

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
