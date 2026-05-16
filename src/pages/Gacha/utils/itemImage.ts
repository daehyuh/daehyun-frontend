import type {SyntheticEvent} from "react";

const ITEM_IMAGE_EXTENSIONS = ["webp", "gif", "png"] as const;

export const getItemImageUrl = (
    name: string,
    extension: typeof ITEM_IMAGE_EXTENSIONS[number] = ITEM_IMAGE_EXTENSIONS[0]
) => `image/Items/${name.replace(': ', '')}.${extension}`;

export const setFallbackItemImage = (event: SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget;
    const currentExtensionIndex = Number(target.dataset.imageExtensionIndex ?? "0");
    const nextExtensionIndex = currentExtensionIndex + 1;

    if (nextExtensionIndex < ITEM_IMAGE_EXTENSIONS.length) {
        target.dataset.imageExtensionIndex = String(nextExtensionIndex);
        target.src = getItemImageUrl(
            target.dataset.itemName ?? target.alt,
            ITEM_IMAGE_EXTENSIONS[nextExtensionIndex]
        );
        return;
    }

    target.style.visibility = 'hidden';
};
