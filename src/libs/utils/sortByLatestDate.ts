export const sortByLatestDate = (array: any[], dateKey: string) => {
    // @ts-ignore
    return [...array].sort((a: any, b: any) => new Date(b[dateKey]) - new Date(a[dateKey]));
};
