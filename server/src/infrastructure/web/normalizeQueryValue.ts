import { ParsedQs } from "qs";


export function normalizeQueryValue(
    value: string | string[] | ParsedQs | ParsedQs[] | undefined
): string | number | (string | number)[] | undefined {
    if (value === undefined) return undefined;

    if (Array.isArray(value)) {
        return value.map(v => v.toString());
    }

    if (typeof value === "object") {
        return JSON.stringify(value); // fallback for ParsedQs objects
    }

    // try to convert numeric strings to numbers
    if (!isNaN(Number(value))) {
        return Number(value);
    }

    return value.toString();
}
