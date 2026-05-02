import { Menu } from "@/lib/types/menu";

export type BagItem = {
    menu: Menu;
    quantity: number;
};

const BAG_STORAGE_KEY = "foody-bag";
export const FOODY_BAG_UPDATED_EVENT = "foody:bag-updated";

function isBrowser(): boolean {
    return typeof window !== "undefined";
}

export function getBagItems(): BagItem[] {
    if (!isBrowser()) return [];
    try {
        const raw = window.localStorage.getItem(BAG_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as BagItem[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function setBagItems(items: BagItem[]): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(FOODY_BAG_UPDATED_EVENT));
}

export function addMenuToBag(menu: Menu, quantity = 1): void {
    const items = getBagItems();
    const existingIndex = items.findIndex((item) => item.menu.id === menu.id);
    if (existingIndex >= 0) {
        items[existingIndex] = {
            ...items[existingIndex],
            quantity: items[existingIndex].quantity + quantity,
        };
    } else {
        items.push({ menu, quantity });
    }
    setBagItems(items);
}

export function getBagCount(): number {
    return getBagItems().reduce((sum, item) => sum + item.quantity, 0);
}

export function updateBagItemQuantity(menuId: number, quantity: number): void {
    const items = getBagItems();
    if (quantity <= 0) {
        setBagItems(items.filter((item) => item.menu.id !== menuId));
        return;
    }
    const nextItems = items.map((item) =>
        item.menu.id === menuId ? { ...item, quantity } : item
    );
    setBagItems(nextItems);
}

export function removeMenuFromBag(menuId: number): void {
    const items = getBagItems();
    setBagItems(items.filter((item) => item.menu.id !== menuId));
}

export function getBagSubtotal(): number {
    return getBagItems().reduce(
        (sum, item) => sum + item.quantity * Number(item.menu.price),
        0
    );
}
