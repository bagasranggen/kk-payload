export type ArrayStringProps = string[] | string;

export type ParametersProps<Props extends (...args: any[]) => any> = Parameters<Props>[0];
