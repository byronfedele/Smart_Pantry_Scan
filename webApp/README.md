# Smart Pantry Scan Web App

This is the web application component of the Smart Pantry Scan project, an inventory manager designed to help reduce food waste and provide recipe suggestions.

## Project Status

The web application is currently complete and ready for testing. You can interact with a local storage version of the app directly in your browser.

## How to Get Started (Local Web App)

1.  **Navigate to the `webApp` directory:**
    If you're in the project's root directory, go to the `webApp` folder.
2.  **Open `SmartPantryScan.html`:**
    Simply open the `SmartPantryScan.html` file in your preferred web browser (e.g., Chrome, Firefox, Safari). You can do this by double-clicking the file or dragging it into an open browser window.
3.  **Start Managing Your Pantry!**
    *   **Add Items:** Click the floating "Add Manually" button (bottom right) to open the item form. From there, you can either fill in details manually or click the embedded "Scan Barcode" button to use your device's camera to scan a product.
    *   **View Inventory:** Your items will be displayed in a responsive table or card view.
    *   **Filter & Sort:** Use the "Filters & Search" section to find specific items or sort your inventory.
    *   **Select & Delete:** Select multiple items using checkboxes (or long-press on cards) and use the floating "Delete Selected" button to remove them.

## Implemented Features (Test Cases)

### 1. Inventory Management (CRUD Operations)
*   **Adding Items:**
    *   Should be able to add a new continuous item with all fields filled correctly.
    *   Should be able to add a new discrete item with all fields filled correctly.
    *   Should automatically set the 'Date Added' to the current date for new items.
    *   Should correctly handle adding an item with an empty 'Unit' field.
    *   Should correctly handle adding an item with an empty 'Perishable Date' field.
*   **Editing Items:**
    *   Should be able to edit an existing item's name, quantity, unit, location, and perishable date.
    *   Should preserve the original 'Date Added' when an item is edited.
    *   Should correctly switch between continuous and discrete when editing an item.
*   **Deleting Items:**
    *   Should be able to delete a single item from the inventory.
    *   Should be able to delete multiple selected items at once.
    *   Should show a confirmation modal before deleting a single item.
    *   Should show a confirmation modal before deleting multiple items.

### 2. Filtering and Sorting
*   **Filtering:**
    *   Should filter the inventory correctly by item name.
    *   Should filter the inventory correctly by storage location.
    *   Should correctly show only spoiled items when the 'Show Spoiled' filter is active.
    *   Should correctly show only items expiring soon when the 'Expiring in X days' filter is active.
    *   Should be able to combine multiple filters (e.g., name and location).
    *   Should clear all active filters when the 'Clear Filters' button is clicked.
*   **Sorting:**
    *   Should sort the inventory by 'Date Added' (Newest/Oldest).
    *   Should sort the inventory by 'Spoilage in' (Soonest/Latest).
    *   Should sort the inventory by 'Amount Remaining' (Most/Least).
    *   Should sort the inventory by 'Name' (A-Z/Z-A).
    *   Should maintain the current sort order when filters are applied.

### 3. Barcode Scanning
*   **Scanning a New Item:**
    *   Should open the 'Add New Item' form with the product data pre-filled when a new barcode is scanned.
    *   Should correctly parse the quantity and unit from the barcode data.
*   **Scanning an Existing Item:**
    *   Should open an interaction modal showing the existing item(s) with the same barcode.
    *   Should allow the user to edit or delete the existing item from the interaction modal.
    *   Should allow the user to add a new item with the same barcode from the interaction modal.
*   **Handling Not Found Barcodes:**
    *   Should show an alert or message when a scanned barcode is not found in the Open Food Facts database.

### 4. Form Logic and Validation
*   **'Is Discrete' Checkbox:**
    *   Should correctly show/hide the 'Quantity'/'Unit' fields and the 'Number of Items' counter when the 'Is Discrete' checkbox is toggled.
*   **Perishable Date:**
    *   Should correctly add/subtract time when the quick add buttons are used.
    *   Should prevent the perishable date from being set in the past.
    *   Should reset the perishable date to the current date when the 'Reset' button is clicked.
*   **Required Fields:**
    *   Should prevent the form from being submitted if any of the required fields ('Item Name', 'Quantity' for continuous items, 'Storage Location', 'Perishable Date') are empty.

### 5. UI and Responsiveness
*   **View Switching:**
    *   Should automatically switch to the card view on mobile and the table view on desktop.
*   **Modals:**
    *   Should correctly open and close all modal dialogs (Add/Edit Item, Confirmation, Interaction, Barcode Scan).
*   **Theme Switching:**
    *   Should correctly switch between dark and light mode and persist the selected theme in local storage.

## Data Storage:

This application uses your browser's local storage to save your pantry inventory. Your data is stored locally on your device and is not sent to any server. Clearing your browser's local storage for this site will delete your inventory data.

## Future Plans (Phase 1: MVP Launch)

The focus for Phase 1 is speed, adoption, and validating the core product's features.

*   **Mobile Wrapper (Hybrid App with Capacitor):**
    *   Initialize a Capacitor project.
    *   Copy the current HTML/JS/CSS into the web assets folder.
    *   Configure the wrapper to build for Android.
*   **Monetization (Donate Button):**
    *   Set up an account with a payment service (e.g., PayPal, Stripe, Buy Me a Coffee).
    *   Add a clear, non-intrusive "Support This App / Donate" button in your HTML that links to your donation page.
*   **Polish & Release (Google Play Store):**
    *   Finalize: Polish the UI and perform final quality checks on all core features (especially saving/loading from localStorage).
    *   Build: Generate the production Android build file (.aab).
    *   Launch: Submit the app to the Google Play Store.