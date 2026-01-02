const { Camera } = typeof Capacitor !== 'undefined' && Capacitor.Plugins ? Capacitor.Plugins : { Camera: null };

export const inventoryApp = {
    inventory: [],
    filteredInventory: [],
    currentPage: 1,
    itemsPerPage: 10,
    sortConfig: { key: 'spoilage', direction: 'asc' },
    itemToDeleteId: null,
    selectedItems: [],
    selectedLocationFilters: [],
    showSelectedItems: false,
    showSpoiled: false,
    showExpiringSoon: false,
    expiringDays: 3,

    init() {
        this.initDOMElements();
        this.loadTheme();
        // Re-check theme after a short delay to catch system theme in mobile webviews
        setTimeout(() => this.loadTheme(), 50);
        this.loadInventory();
        this.addEventListeners();
        this.render();
        if (typeof window !== 'undefined' && window.barcodeScannerApp) {
            window.barcodeScannerApp.init(this);
        }
    },

    initDOMElements() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.donateBtn = document.getElementById('donateBtn');
        this.addItemBtn = document.getElementById('addItemBtn');
        this.scanBarcodeInFormBtn = document.getElementById('scanBarcodeInFormBtn');
        this.scanBarcodeBtn = document.getElementById('scanBarcodeBtn');
        this.itemModal = document.getElementById('itemModal');
        this.closeItemModalBtn = document.getElementById('closeItemModalBtn');
        this.cancelBarcodeScanBtn = document.getElementById('cancelBarcodeScanBtn');
        this.interactionModal = document.getElementById('interactionModal');
        this.interactionList = document.getElementById('interactionList');
        this.interactionCancelBtn = document.getElementById('interactionCancelBtn');
        this.interactionAddNewBtn = document.getElementById('interactionAddNewBtn');
        this.confirmModal = document.getElementById('confirmModal');
        this.confirmCancelBtn = document.getElementById('confirmCancelBtn');
        this.confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        this.selectAllCheckbox = document.getElementById('selectAllCheckbox');
        this.deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
        this.itemForm = document.getElementById('itemForm');
        this.itemImage = document.getElementById('itemImage');
        this.itemUrl = document.getElementById('itemUrl');
        this.itemQuantityNumeric = document.getElementById('itemQuantityNumeric');
        this.itemUnit = document.getElementById('itemUnit');
        this.tableBody = document.getElementById('inventory-table-body');
        this.inventoryTableContainer = document.getElementById('inventory-table-container');
        this.inventoryCardsContainer = document.getElementById('inventory-cards');
        this.inventoryCardList = document.getElementById('inventory-card-list');
        this.paginationContainer = document.getElementById('pagination');
        this.filterInputs = document.querySelectorAll('#filters input, #filters select, #search');
        this.locationFiltersContainer = document.getElementById('locationFilters');
        this.locationDatalist = document.getElementById('location-list');
        this.noResultsDiv = document.getElementById('no-results');
        this.barcodeVideo = document.getElementById('barcodeVideo');
        this.barcodeStatusEl = document.getElementById('barcodeStatus');
        this.toggleFlashlightBtn = document.getElementById('toggleFlashlightBtn');
        this.isDiscrete = document.getElementById('isDiscrete');
        this.continuousQuantityInput = document.getElementById('continuousQuantityInput');
        this.discreteQuantityCounter = document.getElementById('discreteQuantityCounter');
        this.discreteItemQuantity = document.getElementById('discreteItemQuantity');
        this.decrementDiscreteQuantity = document.getElementById('decrementDiscreteQuantity');
        this.incrementDiscreteQuantity = document.getElementById('incrementDiscreteQuantity');
        this.remainingQuantitySliderContainer = document.getElementById('remainingQuantitySliderContainer');
        this.remainingRatio = document.getElementById('remainingRatio');
        this.remainingRatioValue = document.getElementById('remainingRatioValue');
        this.perishableDateInput = document.getElementById('perishableDateInput');
        this.quickAdd1Day = document.getElementById('quickAdd1Day');
        this.quickAdd7Days = document.getElementById('quickAdd7Days');
        this.quickAdd1Month = document.getElementById('quickAdd1Month');
        this.quickAdd1Year = document.getElementById('quickAdd1Year');
        this.resetPerishableDate = document.getElementById('resetPerishableDate');
        this.clearAllFiltersBtn = document.getElementById('clearAllFiltersBtn');
        this.deleteItemBtn = document.getElementById('deleteItemBtn');
        this.showSpoiledCheckbox = document.getElementById('showSpoiled');
        this.showSelectedCheckbox = document.getElementById('showSelected');
        this.showExpiringSoonCheckbox = document.getElementById('showExpiringSoon');
        this.expiringDaysInput = document.getElementById('expiringDays');
        this.sortBy = document.getElementById('sortBy');
    },

    addEventListeners() {
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.donateBtn.addEventListener('click', () => window.open('https://ko-fi.com/kofisupporter49538', '_blank'));
        this.addItemBtn.addEventListener('click', () => this.openItemForm());
        this.scanBarcodeInFormBtn.addEventListener('click', () => window.barcodeScannerApp.startScan());
        this.scanBarcodeBtn.addEventListener('click', () => window.barcodeScannerApp.startScan());
        this.closeItemModalBtn.addEventListener('click', () => this.closeModal(this.itemModal));
        this.cancelBarcodeScanBtn.addEventListener('click', () => window.barcodeScannerApp.stopScan());
        this.toggleFlashlightBtn.addEventListener('click', () => window.barcodeScannerApp.toggleFlashlight());
        this.itemForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.interactionCancelBtn.addEventListener('click', () => this.closeModal(this.interactionModal));
        this.interactionAddNewBtn.addEventListener('click', () => this.addNewItemFromInteraction());
        this.interactionList.addEventListener('click', (e) => this.handleInteraction(e));
        this.confirmCancelBtn.addEventListener('click', () => this.closeModal(this.confirmModal));
        this.confirmDeleteBtn.addEventListener('click', () => this.handleDelete());
        this.selectAllCheckbox.addEventListener('change', (e) => this.toggleAllCheckboxes(e.target.checked));
        this.deleteSelectedBtn.addEventListener('click', () => this.openConfirmDeleteSelectedModal());
        this.tableBody.addEventListener('click', (e) => this.handleTableActions(e));
        this.inventoryCardsContainer.addEventListener('click', (e) => this.handleCardActions(e));

        this.inventoryCardList.addEventListener('contextmenu', (e) => {
            const card = e.target.closest('div[data-id]');
            if (card) {
                e.preventDefault();
                const itemId = parseInt(card.dataset.id, 10);
                if (this.selectedItems.includes(itemId)) {
                    this.showClearSelectionOptions(itemId);
                } else {
                    this.showSelectAllConfirmation();
                }
            }
        });

        this.paginationContainer.addEventListener('click', (e) => this.handlePaginationClick(e));
        this.filterInputs.forEach(input => input.addEventListener('input', (e) => this.handleFilterChange(e)));
        this.locationFiltersContainer.addEventListener('change', (e) => this.handleFilterChange(e));
        this.clearAllFiltersBtn.addEventListener('click', () => this.clearAllFilters());
        this.deleteItemBtn.addEventListener('click', () => this.openConfirmModal(document.getElementById('itemId').value));
        this.showSpoiledCheckbox.addEventListener('change', (e) => this.handleFilterChange(e));
        this.showSelectedCheckbox.addEventListener('change', (e) => this.handleFilterChange(e));
        this.showExpiringSoonCheckbox.addEventListener('change', (e) => this.handleFilterChange(e));
        this.expiringDaysInput.addEventListener('input', (e) => this.handleFilterChange(e));
        this.sortBy.addEventListener('change', (e) => this.handleSortChange(e));
        window.addEventListener('resize', () => this.render());

        this.isDiscrete.addEventListener('change', () => {
            if (this.isDiscrete.checked) {
                this.continuousQuantityInput.classList.add('hidden');
                this.discreteQuantityCounter.classList.remove('hidden');
                this.remainingQuantitySliderContainer.style.display = 'none';
                this.itemQuantityNumeric.required = false;
            } else {
                this.continuousQuantityInput.classList.remove('hidden');
                this.discreteQuantityCounter.classList.add('hidden');
                this.remainingQuantitySliderContainer.style.display = 'block';
                this.itemQuantityNumeric.required = true;
            }
        });
        this.remainingRatio.addEventListener('input', () => {
            this.remainingRatioValue.textContent = `${this.remainingRatio.value}%`;
        });
        this.decrementDiscreteQuantity.addEventListener('click', () => {
            let currentValue = parseInt(this.discreteItemQuantity.value, 10);
            if (currentValue > 0) this.discreteItemQuantity.value = currentValue - 1;
        });
        this.incrementDiscreteQuantity.addEventListener('click', () => {
            let currentValue = parseInt(this.discreteItemQuantity.value, 10);
            this.discreteItemQuantity.value = currentValue + 1;
        });

        this.quickAdd1Day.addEventListener('click', () => this.handleQuickAdd(1, 'days'));
        this.quickAdd7Days.addEventListener('click', () => this.handleQuickAdd(7, 'days'));
        this.quickAdd1Month.addEventListener('click', () => this.handleQuickAdd(1, 'months'));
        this.quickAdd1Year.addEventListener('click', () => this.handleQuickAdd(1, 'years'));
        this.resetPerishableDate.addEventListener('click', () => this.handleResetPerishableDate());
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            // Only apply system theme if user has NOT made a manual selection
            if (!localStorage.getItem('theme')) {
                const isDark = e.matches;
                document.documentElement.classList.toggle('dark', isDark);
                this.updateThemeIcons(isDark);
            }
        });
    },

    clearAllFilters() {
        document.getElementById('search').value = '';
        this.selectedLocationFilters = [];
        this.showSpoiled = false;
        this.showSelectedItems = false;
        this.showExpiringSoon = false;
        this.expiringDays = 3;
        // Reset all checkboxex and inputs in the filter section
        document.querySelectorAll('#filters input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
        document.querySelectorAll('#locationFilters input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
        document.getElementById('expiringDays').value = 3;
        // Reset sort dropdown to default
        this.sortBy.value = 'spoilage_asc';
        this.handleSortChange({ target: this.sortBy }); // Apply sort change
        this.currentPage = 1;
        this.render();
    },

    loadTheme() {
        const userPreference = localStorage.getItem('theme');
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const isDark = userPreference ? userPreference === 'dark' : systemPreference === 'dark';
        
        document.documentElement.classList.toggle('dark', isDark);
        // Show sun in dark mode, moon in light mode
        document.getElementById('theme-icon-light').classList.toggle('hidden', !isDark);
        document.getElementById('theme-icon-dark').classList.toggle('hidden', isDark);
    },

    toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        this.updateThemeIcons(isDark);
    },

    updateThemeIcons(isDark) {
        document.getElementById('theme-icon-light').classList.toggle('hidden', !isDark);
        document.getElementById('theme-icon-dark').classList.toggle('hidden', isDark);
    },

    loadInventory() {
        const stored = localStorage.getItem('inventory');
        if (stored) {
            this.inventory = JSON.parse(stored);
        } else {
            this.inventory = [
                { id: 1, name: 'Milk', quantity: 1, unit: 'Liter', isDiscrete: false, remainingRatio: 0.75, location: 'Refrigerator', dateAdded: '2025-09-28T10:00:00Z', perishableDate: '2025-10-26T10:00:00Z', imageSmallUrl: '', url: '' },
                { id: 2, name: 'Bananas', quantity: 6, unit: 'units', isDiscrete: true, remainingRatio: 1, location: 'Counter', dateAdded: '2025-09-29T11:30:00Z', perishableDate: '2025-10-24T11:30:00Z', imageSmallUrl: '', url: '' },
            ];
        }
    },

    saveInventory() {
        localStorage.setItem('inventory', JSON.stringify(this.inventory));
    },

    openModal(modal) {
        modal.classList.remove('hidden');
        modal.firstElementChild.classList.add('modal-enter-active');
    },

    closeModal(modal) {
        modal.firstElementChild.classList.remove('modal-enter-active');
        setTimeout(() => {
            modal.classList.add('hidden');
            if (modal.id === 'confirmModal') {
                const deselectThisBtn = document.getElementById('deselectThisBtn');
                if (deselectThisBtn) deselectThisBtn.remove();
            }
        }, 300);
    },

    openItemForm(item = null) {
        this.itemForm.reset();
        document.getElementById('modalTitle').textContent = item ? 'Edit Item' : 'Add New Item';
        this.scanBarcodeInFormBtn.classList.toggle('hidden', !!item);

        const itemIdInput = document.getElementById('itemId');
        const itemBarcodeInput = document.getElementById('itemBarcode');
        const itemImageElement = document.getElementById('itemImage'); // Moved declaration here

        itemIdInput.value = item ? item.id : '';
        itemBarcodeInput.value = item ? item.barcode : '';
        this.currentItemDateAdded = item ? new Date(item.dateAdded) : new Date();

        if (item) {
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemLocation').value = item.location;
            
            const itemImageElement = document.getElementById('itemImage'); // Get reference to image element
            if (item.imageSmallUrl) { // Check if there's a stored image URL
                itemImageElement.src = item.imageSmallUrl;
                itemImageElement.classList.remove('hidden'); // Show the image
            } else {
                itemImageElement.src = ''; // Set to empty string
                itemImageElement.classList.add('hidden'); // Hide the image
            }

            document.getElementById('itemUrl').value = item.url || '';
            document.getElementById('isDiscrete').checked = item.isDiscrete || false;

            if (item.isDiscrete) {
                this.discreteItemQuantity.value = item.quantity;
            } else {
                document.getElementById('itemQuantityNumeric').value = item.quantity;
                document.getElementById('itemUnit').value = item.unit || '';
                this.remainingRatio.value = (item.remainingRatio !== undefined) ? (item.remainingRatio * 100) : 100;
                this.remainingRatioValue.textContent = `${this.remainingRatio.value}%`;
            }
            this.perishableDateInput.value = item.perishableDate ? item.perishableDate.split('T')[0] : '';
        } else {
            // Handle item image for new item
            itemImageElement.src = ''; // Always empty src for new items
            itemImageElement.classList.add('hidden'); // Always hidden for new items
            document.getElementById('isDiscrete').checked = false;
            document.getElementById('itemQuantityNumeric').value = 1;
            document.getElementById('itemUnit').value = '';
            this.remainingRatio.value = 100;
            this.remainingRatioValue.textContent = '100%';
            const oneWeekFromNow = new Date();
            oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
            this.perishableDateInput.valueAsDate = oneWeekFromNow;
        }

        this.deleteItemBtn.classList.toggle('hidden', !item);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const minDate = new Date(Math.max(today.getTime(), this.currentItemDateAdded.getTime()));
        this.perishableDateInput.min = minDate.toISOString().split('T')[0];

        this.isDiscrete.dispatchEvent(new Event('change'));
        this.openModal(this.itemModal);
    },

    openConfirmModal(id) {
        this.itemToDeleteId = id;
        this.openModal(this.confirmModal);
    },

    handleQuickAdd(amount, unit) {
        const currentDate = new Date(this.perishableDateInput.value || new Date());
        let newDate = new Date(currentDate);
        if (unit === 'days') newDate.setDate(newDate.getDate() + amount);
        if (unit === 'months') newDate.setMonth(newDate.getMonth() + amount);
        if (unit === 'years') newDate.setFullYear(newDate.getFullYear() + amount);
        this.perishableDateInput.valueAsDate = newDate;
    },

    handleResetPerishableDate() {
        this.perishableDateInput.valueAsDate = new Date();
    },

    handleFormSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('itemId').value;
        const isDiscrete = document.getElementById('isDiscrete').checked;

        const name = document.getElementById('itemName').value;
        const location = document.getElementById('itemLocation').value;
        const perishableDate = document.getElementById('perishableDateInput').value;
        const quantityNumeric = document.getElementById('itemQuantityNumeric').value;

        if (!name || !location || !perishableDate) {
            return;
        }

        if (!isDiscrete && !quantityNumeric) {
            return;
        }

        const newItem = {
            barcode: document.getElementById('itemBarcode').value,
            name: document.getElementById('itemName').value,
            quantity: isDiscrete ? parseInt(this.discreteItemQuantity.value, 10) : parseInt(document.getElementById('itemQuantityNumeric').value, 10),
            unit: isDiscrete ? '' : document.getElementById('itemUnit').value,
            isDiscrete: isDiscrete,
            remainingRatio: isDiscrete ? 1 : (parseInt(document.getElementById('remainingRatio').value, 10) / 100),
            location: document.getElementById('itemLocation').value,
            perishableDate: document.getElementById('perishableDateInput').value ? new Date(document.getElementById('perishableDateInput').value).toISOString() : null,
            lastModified: new Date().toISOString(),
            imageSmallUrl: (document.getElementById('itemImage').src === window.location.href || document.getElementById('itemImage').src === '') ? '' : document.getElementById('itemImage').src,
            url: document.getElementById('itemUrl').value,
        };

        if (id) {
            const index = this.inventory.findIndex(item => item.id == id);
            if (index !== -1) {
                newItem.dateAdded = this.inventory[index].dateAdded;
                this.inventory[index] = { ...this.inventory[index], ...newItem };
            }
        } else {
            newItem.id = Date.now();
            newItem.dateAdded = new Date().toISOString();
            this.inventory.push(newItem);
        }
        this.saveInventory();
        this.render();
        this.closeModal(this.itemModal);
    },

    handleDelete() {
        const idToDelete = parseInt(this.itemToDeleteId, 10);
        this.inventory = this.inventory.filter(item => item.id !== idToDelete);
        this.saveInventory();
        this.render();
        this.closeModal(this.confirmModal);
        this.closeModal(this.itemModal);
    },

    handleTableActions(e) {
        const itemCheckbox = e.target.closest('.item-checkbox');
        if (itemCheckbox) {
            this.handleItemCheckboxChange(parseInt(itemCheckbox.dataset.id, 10), itemCheckbox.checked);
            return;
        }
        const row = e.target.closest('tr[data-id]');
        if (row) {
            const item = this.inventory.find(i => i.id == row.dataset.id);
            if (item) this.openItemForm(item);
        }
    },

    handleCardActions(e) {
        const itemCheckbox = e.target.closest('.item-checkbox');
        if (itemCheckbox) {
            this.handleItemCheckboxChange(parseInt(itemCheckbox.dataset.id, 10), itemCheckbox.checked);
            return;
        }
        const card = e.target.closest('div[data-id]');
        if (card) {
            const item = this.inventory.find(i => i.id == card.dataset.id);
            if (item) this.openItemForm(item);
        }
    },

    handlePaginationClick(e) {
        const pageBtn = e.target.closest('.page-btn');
        if (pageBtn && !pageBtn.disabled) {
            this.currentPage = parseInt(pageBtn.dataset.page, 10);
            this.render();
        }
    },

    handleFilterChange(e) {
        const target = e.target;
        if (target.matches('#locationFilters input[type="checkbox"]')) {
            const location = target.value;
            if (target.checked) {
                if (!this.selectedLocationFilters.includes(location)) this.selectedLocationFilters.push(location);
            } else {
                this.selectedLocationFilters = this.selectedLocationFilters.filter(loc => loc !== location);
            }
        } else if (target.matches('#showSpoiled')) {
            this.showSpoiled = target.checked;
        } else if (target.matches('#showSelected')) {
            this.showSelectedItems = target.checked;
        } else if (target.matches('#showExpiringSoon')) {
            this.showExpiringSoon = target.checked;
        } else if (target.matches('#expiringDays')) {
            this.expiringDays = parseInt(target.value, 10);
        } else if (target.matches('#sortBy')) {
            this.handleSortChange(e);
        }
        this.currentPage = 1;
        this.render();
    },

    handleSortChange(e) {
        const [key, direction] = e.target.value.split('_');
        this.sortConfig = { key, direction };
        this.currentPage = 1;
        this.render();
    },

    render() {
        this.applyFiltersAndSort();
        const isMobileView = window.innerWidth < 768;
        this.inventoryTableContainer.classList.toggle('hidden', isMobileView);
        this.inventoryCardsContainer.classList.toggle('hidden', !isMobileView);
        if (isMobileView) this.renderCards();
        else this.renderTable();
        this.renderPagination();
        this.renderLocationFilters();
        this.renderLocationDatalist();
    },

    applyFiltersAndSort() {
        const searchTerm = document.getElementById('search').value.toLowerCase();
        this.filteredInventory = this.inventory.filter(item => {
            const daysRemaining = item.perishableDate ? Math.floor((new Date(item.perishableDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
            const isSpoiled = daysRemaining !== null && daysRemaining < 0;
            const isExpiringSoon = this.showExpiringSoon && daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= this.expiringDays;
            
            const showSelectedFilter = !this.showSelectedItems || this.selectedItems.includes(item.id);

            return item.name.toLowerCase().includes(searchTerm) &&
                (this.selectedLocationFilters.length === 0 || this.selectedLocationFilters.includes(item.location)) &&
                (!this.showSpoiled || isSpoiled) &&
                (!this.showExpiringSoon || isExpiringSoon) &&
                showSelectedFilter;
        });

        this.filteredInventory.sort((a, b) => {
            let aVal, bVal;
            if (this.sortConfig.key === 'spoilage') {
                aVal = a.perishableDate ? new Date(a.perishableDate) : Infinity;
                bVal = b.perishableDate ? new Date(b.perishableDate) : Infinity;
            } else if (this.sortConfig.key === 'amountRemaining') {
                aVal = a.isDiscrete ? a.quantity : a.remainingRatio;
                bVal = b.isDiscrete ? b.quantity : b.remainingRatio;
            } else {
                aVal = a[this.sortConfig.key];
                bVal = b[this.sortConfig.key];
            }
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return this.sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            if (aVal > bVal) return this.sortConfig.direction === 'asc' ? 1 : -1;
            if (aVal < bVal) return this.sortConfig.direction === 'asc' ? -1 : 1;
            return 0;
        });
    },

    renderTable() {
        this.tableBody.innerHTML = '';
        const pageItems = this.filteredInventory.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
        this.noResultsDiv.classList.toggle('hidden', pageItems.length > 0);

        pageItems.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'border-b border-secondary-light dark:border-tertiary-dark hover:bg-secondary-light dark:hover:bg-tertiary-dark cursor-pointer';
            row.dataset.id = item.id;
            const isSelected = this.selectedItems.includes(item.id);
            const daysRemaining = item.perishableDate ? Math.floor((new Date(item.perishableDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
            let expiryText = daysRemaining !== null ? (daysRemaining < 0 ? '<span class="text-red-500 font-bold">Expired!</span>' : (daysRemaining <= 3 ? `<span class="text-orange-500 font-bold">${daysRemaining} days left</span>` : `${daysRemaining} days left`)) : 'N/A';
            if (daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= this.expiringDays) {
                row.classList.add('bg-warning-bg', 'dark:bg-[#2C1810]');
                expiryText = `<span class="text-warning-text dark:text-[#FDBA74] font-bold">${daysRemaining} days left</span>`;
            }
            row.innerHTML = `
                <td class="p-4"><input type="checkbox" class="item-checkbox h-4 w-4 text-brand-green focus:ring-brand-green border-gray-300 rounded" data-id="${item.id}" ${isSelected ? 'checked' : ''}></td>
                <td class="p-4">${item.name}</td>
                <td class="p-4">
                    ${item.isDiscrete ? `<span>${item.quantity}</span>` :
                    `<div class="flex items-center">
                        <div class="w-24 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${item.remainingRatio * 100}%" title="${(item.remainingRatio * 100).toFixed(0)}% Remaining"></div>
                        </div>
                        <span class="text-sm ml-2">${(item.remainingRatio * 100).toFixed(0)}%</span>
                    </div>`}
                </td>
                <td class="p-4">${expiryText}</td>
                <td class="p-4 hidden-sm">${new Date(item.dateAdded).toLocaleDateString()}</td>
                <td class="p-4 hidden-sm">${item.location}</td>`;
            this.tableBody.appendChild(row);
        });
    },

    renderCards() {
        this.inventoryCardList.innerHTML = '';
        const pageItems = this.filteredInventory.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
        this.noResultsDiv.classList.toggle('hidden', pageItems.length > 0);

        pageItems.forEach(item => {
            const isSelected = this.selectedItems.includes(item.id);
            const daysRemaining = item.perishableDate ? Math.floor((new Date(item.perishableDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
            let expiryText = daysRemaining !== null ? (daysRemaining < 0 ? '<span class="text-red-500 font-bold">Expired!</span>' : (daysRemaining <= 3 ? `<span class="text-orange-500 font-bold">${daysRemaining} days left</span>` : `${daysRemaining} days left`)) : 'N/A';
            const card = document.createElement('div');
            card.className = 'bg-surface-light dark:bg-surface-dark rounded-card shadow-md p-4 relative cursor-pointer';
            if (daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= this.expiringDays) {
                card.classList.add('bg-warning-bg', 'dark:bg-[#2C1810]');
                expiryText = `<span class="text-warning-text dark:text-[#FDBA74] font-bold">${daysRemaining} days left</span>`;
            }
            card.dataset.id = item.id;
            card.innerHTML = `
                <div class="absolute top-2 right-2">
                    <input type="checkbox" class="item-checkbox h-4 w-4 text-brand-green focus:ring-brand-green border-gray-300 rounded" data-id="${item.id}" ${isSelected ? 'checked' : ''}>
                </div>
                <h3 class="text-lg font-semibold text-text-main dark:text-text-inv mb-1">${item.name}</h3>
                <p class="text-sm text-text-muted dark:text-text-muted-dark mb-2">Location: ${item.location}</p>
                <div class="mb-2">
                    <span class="text-sm font-medium text-neutral-dark dark:text-neutral-light">Amount: </span>
                    ${item.isDiscrete ? `<span>${item.quantity} ${item.unit || ''}</span>` :
                    `<div class="flex items-center mt-1">
                        <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${item.remainingRatio * 100}%" title="${(item.remainingRatio * 100).toFixed(0)}% Remaining"></div>
                        </div>
                        <span class="text-sm ml-2">${(item.remainingRatio * 100).toFixed(0)}%</span>
                    </div>`}
                </div>
                <p class="text-sm text-neutral-dark dark:text-neutral-light">Spoilage: ${expiryText}</p>`;
            this.inventoryCardList.appendChild(card);
        });
    },

    renderPagination() {
        const totalPages = Math.ceil(this.filteredInventory.length / this.itemsPerPage);
        this.paginationContainer.innerHTML = '';
        if (totalPages <= 1) return;
    },

    renderLocationFilters() {
        const locations = [...new Set(this.inventory.map(item => item.location))].sort();
        this.locationFiltersContainer.innerHTML = locations.map(location => `
            <div class="flex items-center">
                <input type="checkbox" value="${location}" id="loc-${location}" class="h-4 w-4 text-primary-dark focus:ring-primary-dark border-gray-300 rounded" ${this.selectedLocationFilters.includes(location) ? 'checked' : ''}>
                <label for="loc-${location}" class="ml-2 text-sm font-medium text-neutral-dark dark:text-neutral-light">${location}</label>
            </div>`).join('');
    },

    renderLocationDatalist() {
        const locations = [...new Set(this.inventory.map(item => item.location))].sort();
        this.locationDatalist.innerHTML = locations.map(location => `<option value="${location}"></option>`).join('');
    },

    toggleAllCheckboxes(checked) {
        document.querySelectorAll('.item-checkbox').forEach(checkbox => {
            checkbox.checked = checked;
            this.handleItemCheckboxChange(parseInt(checkbox.dataset.id, 10), checked);
        });
    },

    handleItemCheckboxChange(itemId, checked) {
        if (checked) {
            if (!this.selectedItems.includes(itemId)) this.selectedItems.push(itemId);
        } else {
            this.selectedItems = this.selectedItems.filter(id => id !== itemId);
        }
        this.updateDeleteButtonState();
        this.render(); // Ensure UI updates immediately after selection changes
    },

    updateDeleteButtonState() {
        this.deleteSelectedBtn.classList.toggle('hidden', this.selectedItems.length < 2);
    },

    openConfirmDeleteSelectedModal() {
        if (this.selectedItems.length > 0) {
            this.openModal(this.confirmModal);
            document.getElementById('confirmModalTitle').textContent = `Delete ${this.selectedItems.length} Items`;
            document.querySelector('#confirmModal p').textContent = `Are you sure you want to delete ${this.selectedItems.length} selected items? This action cannot be undone.`;
            this.confirmDeleteBtn.onclick = () => this.deleteSelectedItems();
        }
    },

    deleteSelectedItems() {
        this.inventory = this.inventory.filter(item => !this.selectedItems.includes(item.id));
        this.selectedItems = [];
        this.saveInventory();
        this.render();
        this.closeModal(this.confirmModal);
        this.updateDeleteButtonState();
        this.selectAllCheckbox.checked = false;
    },

    toggleAllCardsCheckboxes(forceChecked = null) {
        const allCardCheckboxes = document.querySelectorAll('#inventory-card-list .item-checkbox');
        const targetCheckedState = (forceChecked !== null) ? forceChecked : !Array.from(allCardCheckboxes).every(cb => cb.checked);
        allCardCheckboxes.forEach(checkbox => {
            checkbox.checked = targetCheckedState;
            this.handleItemCheckboxChange(parseInt(checkbox.dataset.id, 10), targetCheckedState);
        });
    },

    clearAllSelections() {
        this.selectedItems = [];
        document.querySelectorAll('.item-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateDeleteButtonState();
        this.render();
    },

    showSelectAllConfirmation() {
        this.openModal(this.confirmModal);
        document.getElementById('confirmModalTitle').textContent = 'Select All Items';
        document.querySelector('#confirmModal p').textContent = 'Do you want to select all visible items?';
        this.confirmDeleteBtn.textContent = 'Yes, Select All';
        this.confirmDeleteBtn.onclick = () => {
            this.toggleAllCardsCheckboxes(true);
            this.closeModal(this.confirmModal);
            this.confirmDeleteBtn.textContent = 'Delete';
        };
        this.confirmCancelBtn.onclick = () => {
            this.closeModal(this.confirmModal);
            this.confirmDeleteBtn.textContent = 'Delete';
        };
    },

    showClearSelectionOptions(itemId) {
        this.openModal(this.confirmModal);
        document.getElementById('confirmModalTitle').textContent = 'Selection Options';
        document.querySelector('#confirmModal p').innerHTML = 'What would you like to do with the selected items?';
        this.confirmDeleteBtn.textContent = 'Clear All Selections';
        this.confirmDeleteBtn.onclick = () => {
            this.clearAllSelections();
            this.closeModal(this.confirmModal);
            this.confirmDeleteBtn.textContent = 'Delete';
        };
        let deselectThisBtn = document.getElementById('deselectThisBtn');
        if (!deselectThisBtn) {
            deselectThisBtn = document.createElement('button');
            deselectThisBtn.id = 'deselectThisBtn';
            deselectThisBtn.className = 'py-2 px-4 rounded-lg bg-neutral-light dark:bg-neutral-dark';
            this.confirmCancelBtn.parentNode.insertBefore(deselectThisBtn, this.confirmCancelBtn);
        }
        deselectThisBtn.textContent = 'Deselect This Item';
        deselectThisBtn.onclick = () => {
            this.handleItemCheckboxChange(itemId, false);
            this.closeModal(this.confirmModal);
            this.confirmDeleteBtn.textContent = 'Delete';
            this.render();
        };
        this.confirmCancelBtn.onclick = () => {
            this.closeModal(this.confirmModal);
            this.confirmDeleteBtn.textContent = 'Delete';
        };
    },

    openInteractionModal(items, barcode) {
        this.interactionList.innerHTML = '';
        items.forEach(item => {
            const daysRemaining = item.perishableDate ? Math.floor((new Date(item.perishableDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
            let expiryText = daysRemaining !== null ? (daysRemaining < 0 ? '<span class="text-red-500 font-bold">Expired!</span>' : (daysRemaining <= 3 ? `<span class="text-orange-500 font-bold">${daysRemaining} days left</span>` : `${daysRemaining} days left`)) : 'N/A';
            const itemElement = document.createElement('div');
            itemElement.className = 'p-3 bg-white dark:bg-tertiary-dark rounded-lg flex justify-between items-center';
            itemElement.innerHTML = `
                <div>
                    <p class="font-semibold">${item.name}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Spoilage: ${expiryText}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Modified: ${new Date(item.lastModified).toLocaleString()}</p>
                </div>
                <div class="flex space-x-2">
                    <button class="edit-item-btn p-2 text-blue-600 hover:text-blue-800" data-id="${item.id}" title="Edit">Edit</button>
                    <button class="delete-item-btn p-2 text-red-600 hover:text-red-800" data-id="${item.id}" title="Delete">Delete</button>
                </div>`;
            this.interactionList.appendChild(itemElement);
        });
        this.interactionAddNewBtn.dataset.barcode = barcode;
        this.openModal(this.interactionModal);
    },

    handleInteraction(e) {
        const editBtn = e.target.closest('.edit-item-btn');
        if (editBtn) this.editItem(parseInt(editBtn.dataset.id, 10));
        const deleteBtn = e.target.closest('.delete-item-btn');
        if (deleteBtn) this.deleteItem(parseInt(deleteBtn.dataset.id, 10));
    },

    deleteItem(id) {
        this.inventory = this.inventory.filter(item => item.id !== id);
        this.saveInventory();
        this.render();
        this.closeModal(this.interactionModal);
    },

    editItem(id) {
        const item = this.inventory.find(i => i.id === id);
        if (item) {
            this.closeModal(this.interactionModal);
            this.openItemForm(item);
        }
    },

    addNewItemFromInteraction() {
        const barcode = this.interactionAddNewBtn.dataset.barcode;
        this.closeModal(this.interactionModal);
        window.barcodeScannerApp.fetchAndOpenForm(barcode);
    }
};

export const barcodeScannerApp = {
    inventoryApp: null,
    codeReader: null,
    isTorchOn: false,
    videoTrack: null,
    cameraPlugin: typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Camera
        ? window.Capacitor.Plugins.Camera
        : null,

    init(inventoryApp) {
        this.inventoryApp = inventoryApp;
        if (typeof ZXing !== 'undefined') {
            const hints = new Map();
            const formats = [ZXing.BarcodeFormat.EAN_13, ZXing.BarcodeFormat.UPC_A, ZXing.BarcodeFormat.EAN_8, ZXing.BarcodeFormat.UPC_E, ZXing.BarcodeFormat.CODE_128];
            hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, formats);
            this.codeReader = new ZXing.BrowserMultiFormatReader(hints);
        }
    },

    async startScan() {
        const videoElement = document.getElementById('barcodeVideo');
        const modal = document.getElementById('barcodeScanModal');
        const statusEl = document.getElementById('barcodeStatus');

        this.inventoryApp.openModal(modal);
        statusEl.textContent = 'Requesting camera access...';

        try {
            // Conditionally check and request camera permissions using Capacitor's Camera plugin
            if (this.cameraPlugin) {
                let permissions = await this.cameraPlugin.checkPermissions();
                if (permissions.camera !== 'granted') {
                    permissions = await this.cameraPlugin.requestPermissions({ permissions: ['camera'] });
                    if (permissions.camera !== 'granted') {
                        statusEl.textContent = 'Camera access denied. Please grant camera permission in your device settings.';
                        this.inventoryApp.toggleFlashlightBtn.classList.add('hidden');
                        this.stopScan(); // Stop scan and close modal if permission not granted
                        return; // Exit if permission not granted
                    }
                }
            }

            this.codeReader.decodeFromVideoDevice(undefined, videoElement, (result, err) => {
                if (result) {
                    statusEl.textContent = `Found barcode: ${result.getText()}`;
                    this.playScanSuccessSound();
                    this.fetchData(result.getText());
                    this.stopScan();
                }
                if (err && !(err instanceof ZXing.NotFoundException)) {
                    console.error(err);
                    statusEl.textContent = `Error: ${err}`;
                }
            });
            statusEl.textContent = 'Searching for barcode...';

            videoElement.addEventListener('loadedmetadata', () => {
                if (videoElement.srcObject) {
                    const track = videoElement.srcObject.getVideoTracks()[0];
                    if (track) {
                        this.videoTrack = track;
                        const capabilities = track.getCapabilities();
                        if (capabilities.torch) {
                            this.inventoryApp.toggleFlashlightBtn.classList.remove('hidden');
                            this.inventoryApp.toggleFlashlightBtn.classList.remove('bg-yellow-500');
                            this.inventoryApp.toggleFlashlightBtn.classList.add('bg-gray-500');
                        } else {
                            this.inventoryApp.toggleFlashlightBtn.classList.add('hidden');
                        }
                    } else {
                        this.inventoryApp.toggleFlashlightBtn.classList.add('hidden');
                    }
                } else {
                    this.inventoryApp.toggleFlashlightBtn.classList.add('hidden');
                }
                if (statusEl.textContent === 'Requesting camera access...' || statusEl.textContent.includes('Camera access denied')) {
                    statusEl.textContent = 'Searching for barcode...';
                }
            }, { once: true });

        } catch (err) {
            console.error('Camera Error:', err);
            statusEl.textContent = 'Camera access denied or not available.';
            this.inventoryApp.toggleFlashlightBtn.classList.add('hidden');
        }
    },

    stopScan() {
        if (this.codeReader) {
            this.codeReader.reset();
        }
        this.inventoryApp.closeModal(document.getElementById('barcodeScanModal'));
        if (this.isTorchOn && this.videoTrack) {
            this.videoTrack.applyConstraints({ advanced: [{ torch: false }] });
            this.isTorchOn = false;
        }
        this.inventoryApp.toggleFlashlightBtn.classList.add('hidden');
        this.videoTrack = null;
    },

    async toggleFlashlight() {
        if (!this.videoTrack) return;
        this.isTorchOn = !this.isTorchOn;
        try {
            await this.videoTrack.applyConstraints({ advanced: [{ torch: this.isTorchOn }] });
            this.inventoryApp.toggleFlashlightBtn.classList.toggle('bg-yellow-500', this.isTorchOn);
            this.inventoryApp.toggleFlashlightBtn.classList.toggle('bg-gray-500', !this.isTorchOn);
        } catch (error) {
            console.error('Error setting torch:', error);
            this.isTorchOn = !this.isTorchOn;
        }
    },

    async fetchData(barcode) {
        const statusEl = document.getElementById('barcodeStatus');
        statusEl.textContent = `Checking inventory for ${barcode}...`;
        const matchingItems = this.inventoryApp.inventory.filter(item => item.barcode === barcode);
        if (matchingItems.length > 0) {
            this.inventoryApp.openInteractionModal(matchingItems, barcode);
            this.stopScan();
        } else {
            this.fetchAndOpenForm(barcode);
        }
    },

    playScanSuccessSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15);
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
        } catch (e) {
            console.warn('Web Audio API not supported or failed to play sound:', e);
        }
    },

    async fetchAndOpenForm(barcode) {
        const statusEl = document.getElementById('barcodeStatus');
        statusEl.textContent = `Fetching data for ${barcode}...`;
        const apiUrl = `https://world.openfoodfacts.net/api/v2/product/${barcode}?fields=product_name,quantity,image_front_url,image_small_url,url`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data.status === 1 && data.product && data.product.product_name) {
                const rawQuantity = data.product.quantity || '';
                let parsedQuantity = { quantity: 1, unit: 'units' };
                const match = rawQuantity.match(/(\d+)\s*([a-zA-Z]+)/);
                if (match) {
                    parsedQuantity.quantity = parseInt(match[1], 10);
                    parsedQuantity.unit = match[2];
                } else {
                    const numMatch = rawQuantity.match(/(\d+)/);
                    if (numMatch) parsedQuantity.quantity = parseInt(numMatch[1], 10);
                    else if (rawQuantity.length > 0) {
                        parsedQuantity.quantity = 1;
                        parsedQuantity.unit = rawQuantity;
                    }
                }
                this.inventoryApp.openItemForm();
                document.getElementById('itemBarcode').value = barcode;
                document.getElementById('itemName').value = data.product.product_name || '';
                document.getElementById('itemQuantityNumeric').value = parsedQuantity.quantity;
                document.getElementById('itemUnit').value = parsedQuantity.unit;
                document.getElementById('itemImage').src = data.product.image_small_url || '';
                if (data.product.image_small_url) document.getElementById('itemImage').classList.remove('hidden');
                document.getElementById('itemUrl').value = data.product.url || '';
                const date = new Date();
                date.setDate(date.getDate() + 7);
                document.getElementById('perishableDateInput').valueAsDate = date;
            } else {
                alert(`Product not found for barcode: ${barcode}`);
            }
        } catch (err) {
            console.error('API Error:', err);
            alert('Failed to fetch product data.');
        }
        this.stopScan();
    }
};

if (typeof window !== 'undefined') {
    window.inventoryApp = inventoryApp;
    window.barcodeScannerApp = barcodeScannerApp;
    document.addEventListener('DOMContentLoaded', () => {
        inventoryApp.init();
    });
}