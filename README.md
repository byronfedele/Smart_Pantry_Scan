# Smart Pantry Scan

The main mission of Smart Pantry Scan is to empower you to make informed decisions when it comes to buying food products and using them intelligently and efficiently, ultimately helping to reduce food waste.

This application provides a simple and effective way to manage your pantry inventory. It's available as a web app that runs in any modern browser and as a native Android application.

## Key Features

-   **Manual & Barcode Entry:** Add items to your inventory either by manually typing them in or by scanning their barcode to automatically fetch product information.
-   **Inventory Management:** View, edit, and delete items in your pantry. The app tracks quantities, locations, and perishable dates.
-   **Discrete vs. Continuous Items:** Differentiates between items with a discrete count (e.g., 6 cans of soup) and continuous items (e.g., a bottle of milk), with appropriate controls for each.
-   **Spoilage Tracking:** The app highlights items that are about to expire or have already spoiled.
-   **Advanced Filtering & Sorting:** Easily find items in your inventory by name, location, or expiration status. Sort your inventory by multiple criteria to quickly see what you need.
-   **Responsive Design:** The UI adapts to your screen size, offering a table view on desktop and a card view on mobile.
-   **Dark/Light Theme:** Automatically adapts to your system's theme and allows you to toggle between dark and light modes.
-   **Local Storage:** All data is stored locally in your browser or on your device, ensuring privacy and offline access.

## How to Get Started

### Web App

The web app is the quickest way to try out Smart Pantry Scan.

1.  **Navigate to the `webApp` directory:**
    ```bash
    cd webApp
    ```
2.  **Start a local server:** If you have Python installed, you can use its built-in server:
    ```bash
    # For Python 3
    python -m http.server
    ```
3.  **Open in browser:** Open your web browser and navigate to `http://localhost:8000`.

### Android App

The native Android app provides the best experience on mobile devices.

1.  **Sync Web Assets:** Before building the Android app, you must sync the web app's assets with the Capacitor project. From the root directory, run:
    ```bash
    npm run sync
    ```
2.  **Open in Android Studio:**
    ```bash
    npm run open:android
    ```
3.  **Build and Run:** In Android Studio, you can build and run the app on an emulator or a connected physical device using the standard "Run 'app'" command (play button).

## Testing

This project uses [Vitest](https://vitest.dev/) for unit and integration testing.

1.  **Navigate to the `webApp` directory:**
    ```bash
    cd webApp
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the test suite:**
    ```bash
    npm test
    ```

## Future Plans

The next phase of development will focus on further polishing the user experience and adding more value-driven features.

-   **Monetization:** A "Donate" button will be added to allow users to support the app's development.
-   **Polish & Release:** Final UI polish and quality checks will be performed before submitting the app to the Google Play Store.
-   **Recipe Suggestions:** A feature to suggest recipes based on the items in your inventory is being considered.