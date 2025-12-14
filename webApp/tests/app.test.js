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

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should have a title', () => {
        inventoryApp.init(); // Initialize inventoryApp for this test
        const title = document.querySelector('h1');
        expect(title.textContent).toBe('Smart Pantry Scan');
    });

    describe('Inventory Management (CRUD)', () => {
        beforeEach(() => {
            inventoryApp.init();
            inventoryApp.inventory = [
                { id: 1, name: 'Milk', quantity: 1, unit: 'Liter', isDiscrete: false, remainingRatio: 0.75, location: 'Refrigerator', dateAdded: '2025-11-20T10:00:00Z', perishableDate: '2026-02-26T10:00:00Z', imageSmallUrl: '', url: '' },
                { id: 2, name: 'Bananas', quantity: 6, unit: 'units', isDiscrete: true, remainingRatio: 1, location: 'Counter', dateAdded: '2025-11-25T11:30:00Z', perishableDate: '2026-02-24T11:30:00Z', imageSmallUrl: '', url: '' },
                { id: 3, name: 'Canned Tomatoes', quantity: 2, unit: 'cans', isDiscrete: true, remainingRatio: 1, location: 'Pantry', dateAdded: '2025-11-15T14:00:00Z', perishableDate: '2026-03-25T14:00:00Z', imageSmallUrl: '', url: '' },
                { id: 4, name: 'Eggs', quantity: 12, unit: 'units', isDiscrete: true, remainingRatio: 1, location: 'Refrigerator', dateAdded: '2025-11-10T09:00:00Z', perishableDate: '2026-02-11T09:00:00Z', imageSmallUrl: '', url: '' },
                { id: 5, name: 'Bread', quantity: 1, unit: 'loaf', isDiscrete: false, remainingRatio: 0.5, location: 'Pantry', dateAdded: '2025-11-28T16:00:00Z', perishableDate: '2026-02-07T16:00:00Z', imageSmallUrl: '', url: '' },
                { id: 6, name: 'Yogurt', quantity: 4, unit: 'cups', isDiscrete: true, remainingRatio: 1, location: 'Refrigerator', dateAdded: '2025-11-18T08:00:00Z', perishableDate: '2026-02-11T08:00:00Z', imageSmallUrl: '', url: '' },
                { id: 7, name: 'Coffee Beans', quantity: 500, unit: 'grams', isDiscrete: false, remainingRatio: 0.8, location: 'Pantry', dateAdded: '2025-11-17T13:00:00Z', perishableDate: '2026-03-25T13:00:00Z', imageSmallUrl: '', url: '' },
                { id: 8, name: 'Apples', quantity: 5, unit: 'units', isDiscrete: true, remainingRatio: 1, location: 'Counter', dateAdded: '2025-11-14T10:00:00Z', perishableDate: '2026-02-08T10:00:00Z', imageSmallUrl: '', url: '' },
                { id: 9, name: 'Cheese', quantity: 200, unit: 'grams', isDiscrete: false, remainingRatio: 0.6, location: 'Refrigerator', dateAdded: '2025-11-13T15:00:00Z', perishableDate: '2026-02-23T15:00:00Z', imageSmallUrl: '', url: '' },
                { id: 10, name: 'Pasta', quantity: 1, unit: 'box', isDiscrete: true, remainingRatio: 1, location: 'Pantry', dateAdded: '2025-11-12T12:00:00Z', perishableDate: '2027-03-22T12:00:00Z', imageSmallUrl: '', url: '' },
            ];
            inventoryApp.renderLocationFilters(); // To ensure location filters are rendered
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
                { id: 6, name: 'Yogurt', quantity: 4, unit: 'cups', isDiscrete: true, remainingRatio: 1, location: 'Refrigerator', dateAdded: '2025-11-18T08:00:00Z', perishableDate: '2026-02-11T08:00:00Z', imageSmallUrl: '', url: '' },
                { id: 7, name: 'Coffee Beans', quantity: 500, unit: 'grams', isDiscrete: false, remainingRatio: 0.8, location: 'Pantry', dateAdded: '2025-11-17T13:00:00Z', perishableDate: '2026-03-25T13:00:00Z', imageSmallUrl: '', url: '' },
                { id: 8, name: 'Apples', quantity: 5, unit: 'units', isDiscrete: true, remainingRatio: 1, location: 'Counter', dateAdded: '2025-11-14T10:00:00Z', perishableDate: '2026-02-08T10:00:00Z', imageSmallUrl: '', url: '' },
                { id: 9, name: 'Cheese', quantity: 200, unit: 'grams', isDiscrete: false, remainingRatio: 0.6, location: 'Refrigerator', dateAdded: '2025-11-13T15:00:00Z', perishableDate: '2026-02-23T15:00:00Z', imageSmallUrl: '', url: '' },
                { id: 10, name: 'Pasta', quantity: 1, unit: 'box', isDiscrete: true, remainingRatio: 1, location: 'Pantry', dateAdded: '2025-11-12T12:00:00Z', perishableDate: '2027-03-22T12:00:00Z', imageSmallUrl: '', url: '' },
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
            const nameHeader = document.querySelector('th[data-sort="name"]');
            inventoryApp.handleSort({ target: nameHeader });
            inventoryApp.render();
            expect(inventoryApp.filteredInventory[0].name).toBe('Bread');
        });
    });

    describe('Barcode Scanning', () => {
        beforeEach(() => {
            inventoryApp.init();
            inventoryApp.inventory = [
                { id: 1, name: 'Milk', quantity: 1, unit: 'Liter', isDiscrete: false, remainingRatio: 0.75, location: 'Refrigerator', dateAdded: '2025-11-20T10:00:00Z', perishableDate: '2026-02-26T10:00:00Z', imageSmallUrl: '', url: '' },
                { id: 2, name: 'Bananas', quantity: 6, unit: 'units', isDiscrete: true, remainingRatio: 1, location: 'Counter', dateAdded: '2025-11-25T11:30:00Z', perishableDate: '2026-02-24T11:30:00Z', imageSmallUrl: '', url: '' },
                { id: 3, name: 'Canned Tomatoes', quantity: 2, unit: 'cans', isDiscrete: true, remainingRatio: 1, location: 'Pantry', dateAdded: '2025-11-15T14:00:00Z', perishableDate: '2026-03-25T14:00:00Z', imageSmallUrl: '', url: '' },
                { id: 4, name: 'Eggs', quantity: 12, unit: 'units', isDiscrete: true, r1emainingRatio: 1, location: 'Refrigerator', dateAdded: '2025-11-10T09:00:00Z', perishableDate: '2026-02-11T09:00:00Z', imageSmallUrl: '', url: '' },
                { id: 5, name: 'Bread', quantity: 1, unit: 'loaf', isDiscrete: false, remainingRatio: 0.5, location: 'Pantry', dateAdded: '2025-11-28T16:00:00Z', perishableDate: '2026-02-07T16:00:00Z', imageSmallUrl: '', url: '' },
                { id: 6, name: 'Yogurt', quantity: 4, unit: 'cups', isDiscrete: true, remainingRatio: 1, location: 'Refrigerator', dateAdded: '2025-11-18T08:00:00Z', perishableDate: '2026-02-11T08:00:00Z', imageSmallUrl: '', url: '' },
                { id: 7, name: 'Coffee Beans', quantity: 500, unit: 'grams', isDiscrete: false, remainingRatio: 0.8, location: 'Pantry', dateAdded: '2025-11-17T13:00:00Z', perishableDate: '2026-03-25T13:00:00Z', imageSmallUrl: '', url: '' },
                { id: 8, name: 'Apples', quantity: 5, unit: 'units', isDiscrete: true, remainingRatio: 1, location: 'Counter', dateAdded: '2025-11-14T10:00:00Z', perishableDate: '2026-02-08T10:00:00Z', imageSmallUrl: '', url: '' },
                { id: 9, name: 'Cheese', quantity: 200, unit: 'grams', isDiscrete: false, remainingRatio: 0.6, location: 'Refrigerator', dateAdded: '2025-11-13T15:00:00Z', perishableDate: '2026-02-23T15:00:00Z', imageSmallUrl: '', url: '' },
                { id: 10, name: 'Pasta', quantity: 1, unit: 'box', isDiscrete: true, remainingRatio: 1, location: 'Pantry', dateAdded: '2025-11-12T12:00:00Z', perishableDate: '2027-03-22T12:00:00Z', imageSmallUrl: '', url: '' },
            ];
            inventoryApp.renderLocationFilters(); // To ensure location filters are rendered
            inventoryApp.render(); // Render to populate the table/cards for filtering/sorting
        });
        it('pre-fills the form when a new barcode is scanned', async () => {
            const mockResponse = { status: 1, product: { product_name: 'Organic Milk' } };
            fetch.mockResolvedValue({ json: () => Promise.resolve(mockResponse) });
            await barcodeScannerApp.fetchAndOpenForm('123456789');
            expect(document.getElementById('itemName').value).toBe('Organic Milk');
        });

        it('handles API error during barcode scanning', async () => {
            fetch.mockRejectedValue(new Error('API is down'));
            const consoleErrorSpy = vi.spyOn(console, 'error');
            await barcodeScannerApp.fetchAndOpenForm('123456789');
            expect(consoleErrorSpy).toHaveBeenCalledWith('API Error:', new Error('API is down'));
        });

        it('opens the interaction modal when an existing barcode is scanned', async () => {
            inventoryApp.inventory.push({ id: 3, name: 'Test Item', barcode: '12345', location: 'Pantry', perishableDate: '2025-12-31T12:00:00Z', dateAdded: '2025-01-01T12:00:00Z', remainingRatio: 1, isDiscrete: false });
            await barcodeScannerApp.fetchData('12345');
            const interactionModal = document.getElementById('interactionModal');
            expect(interactionModal.classList.contains('hidden')).toBe(false);
        });
    });

    describe('Form Logic and Validation', () => {
        beforeEach(() => {
            inventoryApp.init();
            inventoryApp.inventory = [
                { id: 1, name: 'Milk', quantity: 1, unit: 'Liter', isDiscrete: false, remainingRatio: 0.75, location: 'Refrigerator', dateAdded: '2025-11-20T10:00:00Z', perishableDate: '2026-02-26T10:00:00Z', imageSmallUrl: '', url: '' },
                { id: 2, name: 'Bananas', quantity: 6, unit: 'units', isDiscrete: true, remainingRatio: 1, location: 'Counter', dateAdded: '2025-11-25T11:30:00Z', perishableDate: '2026-02-24T11:30:00Z', imageSmallUrl: '', url: '' },
                { id: 3, name: 'Canned Tomatoes', quantity: 2, unit: 'cans', isDiscrete: true, remainingRatio: 1, location: 'Pantry', dateAdded: '2025-11-15T14:00:00Z', perishableDate: '2026-03-25T14:00:00Z', imageSmallUrl: '', url: '' },
                { id: 4, name: 'Eggs', quantity: 12, unit: 'units', isDiscrete: true, remainingRatio: 1, location: 'Refrigerator', dateAdded: '2025-11-10T09:00:00Z', perishableDate: '2026-02-11T09:00:00Z', imageSmallUrl: '', url: '' },
                { id: 5, name: 'Bread', quantity: 1, unit: 'loaf', isDiscrete: false, remainingRatio: 0.5, location: 'Pantry', dateAdded: '2025-11-28T16:00:00Z', perishableDate: '2026-02-07T16:00:00Z', imageSmallUrl: '', url: '' },
                { id: 6, name: 'Yogurt', quantity: 4, unit: 'cups', isDiscrete: true, remainingRatio: 1, location: 'Refrigerator', dateAdded: '2025-11-18T08:00:00Z', perishableDate: '2026-02-11T08:00:00Z', imageSmallUrl: '', url: '' },
                { id: 7, name: 'Coffee Beans', quantity: 500, unit: 'grams', isDiscrete: false, remainingRatio: 0.8, location: 'Pantry', dateAdded: '2025-11-17T13:00:00Z', perishableDate: '2026-03-25T13:00:00Z', imageSmallUrl: '', url: '' },
                { id: 8, name: 'Apples', quantity: 5, unit: 'units', isDiscrete: true, remainingRatio: 1, location: 'Counter', dateAdded: '2025-11-14T10:00:00Z', perishableDate: '2026-02-08T10:00:00Z', imageSmallUrl: '', url: '' },
                { id: 9, name: 'Cheese', quantity: 200, unit: 'grams', isDiscrete: false, remainingRatio: 0.6, location: 'Refrigerator', dateAdded: '2025-11-13T15:00:00Z', perishableDate: '2026-02-23T15:00:00Z', imageSmallUrl: '', url: '' },
                { id: 10, name: 'Pasta', quantity: 1, unit: 'box', isDiscrete: true, remainingRatio: 1, location: 'Pantry', dateAdded: '2025-11-12T12:00:00Z', perishableDate: '2027-03-22T12:00:00Z', imageSmallUrl: '', url: '' },
            ];
            inventoryApp.renderLocationFilters(); // To ensure location filters are rendered
            inventoryApp.render(); // Render to populate the table/cards for filtering/sorting
        });
        it('toggles input fields when "Is Discrete" is checked', () => {
            const continuousInput = document.getElementById('continuousQuantityInput');
            const discreteInput = document.getElementById('discreteQuantityCounter');
            document.getElementById('isDiscrete').checked = true;
            document.getElementById('isDiscrete').dispatchEvent(new window.Event('change'));
            expect(continuousInput.classList.contains('hidden')).toBe(true);
            expect(discreteInput.classList.contains('hidden')).toBe(false);
        });

        it('adds an item when required fields are present', () => {
            const initialCount = inventoryApp.inventory.length;
            document.getElementById('itemName').value = 'Test Item';
            document.getElementById('itemLocation').value = 'Test Location';
            document.getElementById('perishableDateInput').value = '2025-01-01';
            document.getElementById('isDiscrete').checked = false; // Ensure correct mode
            document.getElementById('itemQuantityNumeric').value = '1';

            const mockEvent = { preventDefault: vi.fn() };
            inventoryApp.handleFormSubmit(mockEvent);

            expect(inventoryApp.inventory.length).toBe(initialCount + 1);
        });

        it('prevents form submission if required fields are empty', () => {
            const initialCount = inventoryApp.inventory.length;
            const mockEvent = { preventDefault: vi.fn() };
            inventoryApp.handleFormSubmit(mockEvent);
            expect(inventoryApp.inventory.length).toBe(initialCount);
        });
    });

    describe('UI and Responsiveness', () => {
        beforeEach(() => {
            inventoryApp.init();
            inventoryApp.inventory = [
                { id: 1, name: 'Milk', quantity: 1, unit: 'Liter', isDiscrete: false, remainingRatio: 0.75, location: 'Refrigerator', dateAdded: '2025-11-20T10:00:00Z', perishableDate: '2026-02-26T10:00:00Z', imageSmallUrl: '', url: '' },
                { id: 2, name: 'Bananas', quantity: 6, unit: 'units', isDiscrete: true, remainingRatio: 1, location: 'Counter', dateAdded: '2025-11-25T11:30:00Z', perishableDate: '2026-02-24T11:30:00Z', imageSmallUrl: '', url: '' },
                { id: 3, name: 'Canned Tomatoes', quantity: 2, unit: 'cans', isDiscrete: true, remainingRatio: 1, location: 'Pantry', dateAdded: '2025-11-15T14:00:00Z', perishableDate: '2026-03-25T14:00:00Z', imageSmallUrl: '', url: '' },
                { id: 4, name: 'Eggs', quantity: 12, unit: 'units', isDiscrete: true, remainingRatio: 1, location: 'Refrigerator', dateAdded: '2025-11-10T09:00:00Z', perishableDate: '2026-02-11T09:00:00Z', imageSmallUrl: '', url: '' },
                { id: 5, name: 'Bread', quantity: 1, unit: 'loaf', isDiscrete: false, remainingRatio: 0.5, location: 'Pantry', dateAdded: '2025-11-28T16:00:00Z', perishableDate: '2026-02-07T16:00:00Z', imageSmallUrl: '', url: '' },
                { id: 6, name: 'Yogurt', quantity: 4, unit: 'cups', isDiscrete: true, remainingRatio: 1, location: 'Refrigerator', dateAdded: '2025-11-18T08:00:00Z', perishableDate: '2026-02-11T08:00:00Z', imageSmallUrl: '', url: '' },
                { id: 7, name: 'Coffee Beans', quantity: 500, unit: 'grams', isDiscrete: false, remainingRatio: 0.8, location: 'Pantry', dateAdded: '2025-11-17T13:00:00Z', perishableDate: '2026-03-25T13:00:00Z', imageSmallUrl: '', url: '' },
                { id: 8, name: 'Apples', quantity: 5, unit: 'units', isDiscrete: true, remainingRatio: 1, location: 'Counter', dateAdded: '2025-11-14T10:00:00Z', perishableDate: '2026-02-08T10:00:00Z', imageSmallUrl: '', url: '' },
                { id: 9, name: 'Cheese', quantity: 200, unit: 'grams', isDiscrete: false, remainingRatio: 0.6, location: 'Refrigerator', dateAdded: '2025-11-13T15:00:00Z', perishableDate: '2026-02-23T15:00:00Z', imageSmallUrl: '', url: '' },
                { id: 10, name: 'Pasta', quantity: 1, unit: 'box', isDiscrete: true, remainingRatio: 1, location: 'Pantry', dateAdded: '2025-11-12T12:00:00Z', perishableDate: '2027-03-22T12:00:00Z', imageSmallUrl: '', url: '' },
            ];
            inventoryApp.renderLocationFilters(); // To ensure location filters are rendered
            inventoryApp.render(); // Render to populate the table/cards for filtering/sorting
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
        })
