import { Option } from 'payload';

export const ENTRIES_TYPE_HANDLES = {} as const;

export const ENTRIES_TYPE_OPTIONS_HANDLES: Record<string, Exclude<Option, string>> = {} as const;
