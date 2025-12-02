export type ImageEntry = {
    id: string;
    originalSrc: string;
    resolvedSrc: string;
    alt?: string;
};

export type PreviewState = {
    images: ImageEntry[];
    index: number;
    zoom: number;
    offset: {
        x: number;
        y: number;
    };
};

export const PREVIEW_DEFAULT_ZOOM = 1;
export const PREVIEW_MIN_ZOOM = 0.5;
export const PREVIEW_MAX_ZOOM = 3.5;
export const PREVIEW_ZOOM_STEP = 0.2;

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
