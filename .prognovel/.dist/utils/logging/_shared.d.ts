interface LogOptions {
    withBorders?: boolean;
    marginTop?: number;
    marginLeft?: number;
    marginBottom?: number;
    padding?: number;
    width?: number;
}
export declare class Log {
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    padding: number;
    width: number;
    borderText: string;
    withBorders: boolean;
    constructor(opts?: LogOptions);
    createLine(text: string): string;
    createWhitespace(space?: number): string;
    show(texts: string[]): void;
}
export {};
