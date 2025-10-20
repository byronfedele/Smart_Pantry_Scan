# Smart Pantry Scan

This project is an inventory management application for your pantry, designed to help reduce food waste and provide recipe suggestions.

## Current Status

The project is currently undergoing a refactoring. The original React Native application has been moved to the `old_react_native` directory, and a web application is available in the `webApp` directory.

## Project Structure

*   `/old_react_native`: Contains the previous version of the React Native application.
*   `/webApp`: Contains the web application version of the pantry scanner.

## Web Application Features Implemented (SmartPantryScan.html):

*   **Responsive Design:** The inventory display dynamically switches between a traditional table view on larger screens and a card-based view optimized for mobile devices.
*   **Intuitive Selection:**
    *   **Long-Press to Select All:** On mobile (card view), long-press any item to bring up a prompt to "Select All Items".
    *   **Long-Press for Item Options:** Long-press an *already selected* item to access "Selection Options," allowing you to "Clear All Selections" or "Deselect This Item."
*   **Streamlined Item Addition:** The "Scan Barcode" functionality is now integrated directly into the "Add New Item" form. Click "Add Manually," then use the embedded "Scan Barcode" button to populate the form automatically.
*   **Floating Action Buttons:** Key actions like "Add Manually" and "Delete Selected" (when applicable) are accessible via floating buttons at the bottom right of the screen. Text labels have been removed from these buttons for improved visual conciseness.
*   **Clear Filters:** The "Clear Filters" button now correctly resets all filter options, including "Show Spoiled" and "Expiring in X days" checkboxes, and the expiring days input field.
*   **Perishable Date Feature:** Replaced the perishable days input with a date picker and quick add buttons. The logic now uses a `perishableDate` field throughout the application.
*   **Improved Barcode Scanner Functionality and UX:**
    *   Implemented flashlight toggle control for better scanning in low-light conditions.
    *   Added a visual scan area guide to assist users in positioning barcodes.
    *   Configured ZXing library to focus on common 1D food-related barcode formats (EAN_13, UPC_A, EAN_8, UPC_E, CODE_128) for improved accuracy.
    *   Added an audio cue (beep) on successful barcode detection for enhanced user feedback.
    *   Addressed and resolved camera access and flashlight control issues.
*   **Rearranged Inventory Table Columns:** Reordered the inventory table columns to: Name, Amount Remaining, Spoilage In, Added, and Location.
*   **Improved Dark Mode Visibility:** Addressed visibility issues for input fields in dark mode by changing their border color for better contrast. Adjusted background colors for "Filters & Search" and "Inventory Table" sections in dark mode to enhance visual contrast.
*   **Discrete Item Quantity Counter:** Introduced a discrete item quantity counter with up/down buttons that appears when the "Is Discrete Item" checkbox is selected. This replaces the continuous quantity input and slider for discrete items.
*   **"Expiring Soon" Filter:** Implemented a "Show Expiring Soon" checkbox filter to display only expired or near-expiration items. Set the default value for "Expiring in X days" to 3 days.
*   **"Show Spoiled" Filter:** Implemented a "Show Spoiled" checkbox filter to display only expired or near-expiration items.
*   **Improved Item Editing and Deletion UX:** Table rows are now clickable to open the edit form. Added a hover effect to table rows. Moved delete functionality into the item edit form.
*   **Location Suggestions:** The "Add/Edit Item" form now provides autocomplete suggestions for the "Storage Location" field, populated with unique locations from the inventory.
*   **Scan-to-Interact Feature:** When a barcode is scanned, the app now first performs a local search for matching items. If matches are found, a new interaction modal is displayed, allowing the user to select a specific item to edit or remove. Each item now includes a unique ID, a barcode field, and a `lastModified` timestamp.
*   **Barcode Scanning and Advanced Inventory Features:** Users can scan product barcodes using their camera. The app fetches product information from the Open Food Facts API. Items now have a "Perishable (days)" property and the inventory table displays a "Spoilage in" column. The app distinguishes between discrete and continuous items, with a slider for continuous items. Implemented multi-select and bulk deletion. Added a visual loading indicator for LLM initialization.

## How to Get Started with the Web Application:

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

---
Last Updated: October 19, 2025