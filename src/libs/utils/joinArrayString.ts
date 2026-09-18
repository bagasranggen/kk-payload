import { cleanArrayString } from './cleanArrayString';

export const joinArrayString = (arr: string[], join: string = ' ') => cleanArrayString(arr).join(join);
