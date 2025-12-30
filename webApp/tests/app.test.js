import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { inventoryApp, barcodeScannerApp } from '../app.js';

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

describe('Smart Pantry Scan', () => {
    let dom;

    beforeEach(() => {
        vi.useFakeTimers();
        dom = new JSDOM(html, { url: 'http://localhost' });
        global.document = dom.window.document;
        global.window = dom.window;

        const localStorageMock = (function() {
            let store = {};
            return {
                getItem(key) { return store[key] || null; },
                setItem(key, value) { store[key] = value.toString(); },
                clear() { store = {}; },
                removeItem(key) { delete store[key]; }
            };
        })();
        Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
        global.localStorage = window.localStorage;
        global.alert = vi.fn();
        global.Event = dom.window.Event;

        global.fetch = vi.fn();

        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });

        global.ZXing = {
            BrowserMultiFormatReader: class {
                constructor() {}
                decodeFromVideoDevice() {}
                reset() {}
            },
            BarcodeFormat: { EAN_13: 'EAN_13', UPC_A: 'UPC_A' },
            DecodeHintType: { POSSIBLE_FORMAST: 'POSSIBLE_FORMAST' }
        };

        window.barcodeScannerApp = barcodeScannerApp;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should have a logo', () => {
        inventoryApp.init(); // Initialize inventoryApp for this test
        const logo = document.querySelector('header img');
        expect(logo).not.toBeNull();
        expect(logo.alt).toBe('InHand Logo');
    });

    describe('Inventory Management (CRUD)', () => {
        beforeEach(() => {
            inventoryApp.init();
            inventoryApp.inventory = [
                { id: 1, name: 'Milk', quantity: 1, unit: 'Liter', isDiscrete: false, remainingRatio: 0.75, location: 'Refrigerator', dateAdded: '2025-11-20T10:00:00Z', perishableDate: '2026-02-26T10:00:00Z', imageSmallUrl: '', url: '' },
                { id: 2, name: 'Bananas', quantity: 6, unit: 'units', isDiscrete: true, remainingRatio: 1, location: 'Counter', dateAdded: '2025-11-25T11:30:00Z', perishableDate: '2026-02-24T11:30:00Z', imageSmallUrl: '', url: '' },
            ];
            inventoryApp.renderLocationFilters();
        });

        it('adds a new continuous item', () => {
            const initialCount = inventoryApp.inventory.length;
            document.getElementById('itemName').value = 'Almond Milk';
            document.getElementById('itemQuantityNumeric').value = '1';
            document.getElementById('itemUnit').value = 'L';
            document.getElementById('itemLocation').value = 'Fridge';
            document.getElementById('perishableDateInput').value = '2025-11-01';
            document.getElementById('isDiscrete').checked = false;

            const mockEvent = { preventDefault: vi.fn() };
            inventoryApp.handleFormSubmit(mockEvent);

            expect(inventoryApp.inventory.length).toBe(initialCount + 1);
            expect(inventoryApp.inventory[inventoryApp.inventory.length - 1].name).toBe('Almond Milk');
        });

        it('adds a new discrete item', () => {
            const initialCount = inventoryApp.inventory.length;
            document.getElementById('itemName').value = 'Eggs';
            document.getElementById('discreteItemQuantity').value = '12';
            document.getElementById('itemLocation').value = 'Fridge';
            document.getElementById('perishableDateInput').value = '2025-11-15';
            document.getElementById('isDiscrete').checked = true;

            const mockEvent = { preventDefault: vi.fn() };
            inventoryApp.handleFormSubmit(mockEvent);

            expect(inventoryApp.inventory.length).toBe(initialCount + 1);
            const newItem = inventoryApp.inventory[inventoryApp.inventory.length - 1];
            expect(newItem.name).toBe('Eggs');
            expect(newItem.quantity).toBe(12);
            expect(newItem.isDiscrete).toBe(true);
        });

        it('edits an existing item', () => {
            document.getElementById('itemId').value = '1';
            document.getElementById('itemName').value = 'Almond Milk';
            document.getElementById('itemLocation').value = 'Fridge';
            document.getElementById('perishableDateInput').value = '2025-10-26';
            document.getElementById('itemQuantityNumeric').value = '1';
            document.getElementById('isDiscrete').checked = false;

            const mockEvent = { preventDefault: vi.fn() };
            inventoryApp.handleFormSubmit(mockEvent);

            expect(inventoryApp.inventory[0].name).toBe('Almond Milk');
        });

        it('deletes a single item', () => {
            const itemToDelete = inventoryApp.inventory[0];
            inventoryApp.itemToDeleteId = itemToDelete.id;
            inventoryApp.handleDelete();
            expect(inventoryApp.inventory.find(item => item.id === itemToDelete.id)).toBeUndefined();
        });

        it('deletes multiple selected items', () => {
            const item1 = inventoryApp.inventory[0];
            const item2 = inventoryApp.inventory[1];
            inventoryApp.selectedItems = [item1.id, item2.id];
            inventoryApp.deleteSelectedItems();
            expect(inventoryApp.inventory.find(item => item.id === item1.id)).toBeUndefined();
            expect(inventoryApp.inventory.find(item => item.id === item2.id)).toBeUndefined();
        });
    });

    describe('Filtering and Sorting', () => {
        beforeEach(() => {
            inventoryApp.init();
            inventoryApp.inventory = [
                { id: 1, name: 'Milk', quantity: 1, unit: 'Liter', isDiscrete: false, remainingRatio: 0.75, location: 'Refrigerator', dateAdded: '2025-11-20T10:00:00Z', perishableDate: '2026-02-26T10:00:00Z', imageSmallUrl: '', url: '' },
                { id: 2, name: 'Bananas', quantity: 6, unit: 'units', isDiscrete: true, remainingRatio: 1, location: 'Counter', dateAdded: '2025-11-25T11:30:00Z', perishableDate: '2026-02-24T11:30:00Z', imageSmallUrl: '', url: '' },
                { id: 3, name: 'Canned Tomatoes', quantity: 2, unit: 'cans', isDiscrete: true, remainingRatio: 1, location: 'Pantry', dateAdded: '2025-11-15T14:00:00Z', perishableDate: '2026-03-25T14:00:00Z', imageSmallUrl: '', url: '' },
                { id: 4, name: 'Eggs', quantity: 12, unit: 'units', isDiscrete: true, remainingRatio: 1, location: 'Refrigerator', dateAdded: '2025-11-10T09:00:00Z', perishableDate: '2026-02-11T09:00:00Z', imageSmallUrl: '', url: '' },
                { id: 5, name: 'Bread', quantity: 1, unit: 'loaf', isDiscrete: false, remainingRatio: 0.5, location: 'Pantry', dateAdded: '2025-11-28T16:00:00Z', perishableDate: '2026-02-07T16:00:00Z', imageSmallUrl: '', url: '' },
                { id: 8, name: 'Apples', quantity: 5, unit: 'units', isDiscrete: true, remainingRatio: 1, location: 'Counter', dateAdded: '2025-11-14T10:00:00Z', perishableDate: '2026-02-08T10:00:00Z', imageSmallUrl: '', url: '' },
            ];
            inventoryApp.renderLocationFilters(); // To ensure location filters are rendered
            inventoryApp.render(); // Render to populate the table/cards for filtering/sorting
        });

        it('filters by item name', () => {
            document.getElementById('search').value = 'Milk';
            inventoryApp.handleFilterChange({ target: document.getElementById('search') });
            expect(inventoryApp.filteredInventory.length).toBe(1);
            expect(inventoryApp.filteredInventory[0].name).toBe('Milk');
        });

        it('filters by storage location', () => {
            const pantryCheckbox = document.querySelector('input[value="Pantry"]');
            pantryCheckbox.checked = true;
            inventoryApp.handleFilterChange({ target: pantryCheckbox });
            expect(inventoryApp.filteredInventory.every(item => item.location === 'Pantry')).toBe(true);
        });

        it('sorts by name', () => {
            const sortBy = document.getElementById('sortBy');
            sortBy.value = 'name_asc';
            inventoryApp.handleSortChange({ target: sortBy });
            expect(inventoryApp.filteredInventory[0].name).toBe('Apples');
        });

        it('filters by selected items', () => {
            inventoryApp.selectedItems = [1];
            inventoryApp.showSelectedItems = true;
            document.getElementById('search').value = '';
            inventoryApp.selectedLocationFilters = [];
            inventoryApp.showSpoiled = false;
            inventoryApp.showExpiringSoon = false;

            inventoryApp.applyFiltersAndSort();

            expect(inventoryApp.filteredInventory.length).toBe(1);
            expect(inventoryApp.filteredInventory[0].id).toBe(1);
        });

        it('additively filters by selected items and another filter', () => {
            inventoryApp.selectedItems = [1, 3];
            inventoryApp.showSelectedItems = true;
            inventoryApp.selectedLocationFilters = ['Refrigerator'];

            inventoryApp.applyFiltersAndSort();

            expect(inventoryApp.filteredInventory.length).toBe(1);
            expect(inventoryApp.filteredInventory[0].id).toBe(1);
        });

        it('removes the selected items filter when unchecked', () => {
            inventoryApp.selectedItems = [1];
            inventoryApp.selectedLocationFilters = ['Refrigerator'];
            inventoryApp.showSelectedItems = true;

            inventoryApp.applyFiltersAndSort();
            expect(inventoryApp.filteredInventory.length).toBe(1);

            inventoryApp.showSelectedItems = false;
            inventoryApp.applyFiltersAndSort();
            expect(inventoryApp.filteredInventory.length).toBe(2);
        });
    });

    describe('UI and Responsiveness', () => {
        beforeEach(() => {
            inventoryApp.init();
        });

        it('switches to card view on smaller screens', () => {
            Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
            window.dispatchEvent(new window.Event('resize'));
            expect(document.getElementById('inventory-table-container').classList.contains('hidden')).toBe(true);
            expect(document.getElementById('inventory-cards').classList.contains('hidden')).toBe(false);
        });

        it('switches theme and persists in localStorage', () => {
            const setItemSpy = vi.spyOn(window.localStorage, 'setItem');
            document.documentElement.classList.remove('dark');
            inventoryApp.toggleTheme();
            expect(setItemSpy).toHaveBeenCalledWith('theme', 'dark');
        });

        it('opens and closes the add/edit item modal', () => {
            const itemModal = document.getElementById('itemModal');
            expect(itemModal.classList.contains('hidden')).toBe(true);
            inventoryApp.openItemForm();
            expect(itemModal.classList.contains('hidden')).toBe(false);
            inventoryApp.closeModal(itemModal);
            vi.runAllTimers();
            expect(itemModal.classList.contains('hidden')).toBe(true);
        });

        it('opens and closes the confirmation modal', () => {
            const confirmModal = document.getElementById('confirmModal');
            expect(confirmModal.classList.contains('hidden')).toBe(true);
            inventoryApp.openConfirmModal(1);
            expect(confirmModal.classList.contains('hidden')).toBe(false);
            inventoryApp.closeModal(confirmModal);
            vi.runAllTimers();
            expect(confirmModal.classList.contains('hidden')).toBe(true);
        });
    });
});