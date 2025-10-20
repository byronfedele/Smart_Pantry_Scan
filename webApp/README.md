# Smart Pantry Scan Web App

This is the web application component of the Smart Pantry Scan project, an inventory manager designed to help reduce food waste and provide recipe suggestions.

## Features Implemented:

*   **Responsive Design:** The inventory display dynamically switches between a traditional table view on larger screens and a card-based view optimized for mobile devices.
*   **Intuitive Selection:**
    *   **Long-Press to Select All:** On mobile (card view), long-press any item to bring up a prompt to "Select All Items".
    *   **Long-Press for Item Options:** Long-press an *already selected* item to access "Selection Options," allowing you to "Clear All Selections" or "Deselect This Item."
*   **Streamlined Item Addition:** The "Scan Barcode" functionality is now integrated directly into the "Add New Item" form. Click "Add Manually," then use the embedded "Scan Barcode" button to populate the form automatically.
*   **Floating Action Buttons:** Key actions like "Add Manually" and "Delete Selected" (when applicable) are accessible via floating buttons at the bottom right of the screen.
*   **Clear Filters:** The "Clear Filters" button now correctly resets all filter options, including "Show Spoiled" and "Expiring in X days" checkboxes.

## How to Get Started:

This web application is a single HTML file that runs directly in your web browser.

1.  **Navigate to the `webApp` directory:**
    If you're in the project's root directory, go to the `webApp` folder.
2.  **Open `SmartPantryScan.html`:**
    Simply open the `SmartPantryScan.html` file in your preferred web browser (e.g., Chrome, Firefox, Safari). You can do this by double-clicking the file or dragging it into an open browser window.
3.  **Start Managing Your Pantry!**
    *   **Add Items:** Click the floating "Add Manually" button (bottom right) to open the item form. From there, you can either fill in details manually or click the embedded "Scan Barcode" button to use your device's camera to scan a product.
    *   **View Inventory:** Your items will be displayed in a responsive table or card view.
    *   **Filter & Sort:** Use the "Filters & Search" section to find specific items or sort your inventory.
    *   **Select & Delete:** Select multiple items using checkboxes (or long-press on cards) and use the floating "Delete Selected" button to remove them.

## Data Storage:

This application uses your browser's local storage to save your pantry inventory. Your data is stored locally on your device and is not sent to any server. Clearing your browser's local storage for this site will delete your inventory data.
