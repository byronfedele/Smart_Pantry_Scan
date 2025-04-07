# Smart Pantry Scan

A mobile application for scanning food barcodes and managing your home pantry inventory. Built with React Native, this app aims to simplify tracking the food items you have on hand, helping you reduce waste and stay organized.

## Current Status

This project is currently in the early stages of development. The core functionality implemented so far includes:

* **Barcode Scanning:** Users can use their device's camera to scan food product barcodes.
* **Open Food Facts Integration:** Upon scanning, the app queries the Open Food Facts API to retrieve product information (name, image, etc.).

<del>* **Basic Inventory Management (Local):**
    * Users can add scanned products to their personal inventory.
    * The app stores basic information about each inventory item locally on the device using SQLite. This includes:
        * Product Name
        * Quantity in Possession
        * Storage Location (user-defined)
        * Expiration Date (user-input)
        * User Notes
        * Scan Timestamp
    * Users can (in future iterations) view, update, and delete items from their local inventory.
</del>
## Planned Features

Future development will focus on:

* **User Interface (UI) and User Experience (UX) Improvements:** Enhancing the visual design and making the app more intuitive to use.
* **Advanced Inventory Management:**
    * Filtering and sorting inventory items (e.g., by location, expiration date).
    * Setting reminders for expiring items.
    * Potentially tracking purchase dates.
* **User Accounts and Data Synchronization (Long-Term):** Implementing user registration and login to allow users to sync their inventory across multiple devices using a backend API and a central database.
* **Product Details Caching:** Storing frequently accessed product information locally to reduce API calls.
* **Potential Future Features:** Exploring ideas like recipe suggestions based on inventory, community sharing of product information, and more.

## Technologies Used

* **React Native:** A framework for building native mobile apps using JavaScript and React.
* **TypeScript:** A superset of JavaScript that adds static typing.
* **Expo Camera:** A library for accessing the device's camera for barcode scanning.
* **Open Food Facts API:** A free and open database of food products.
* **react-native-sqlite-storage:** A library for local data storage using SQLite.
* **Git:** Version control system for tracking changes.
* **GitHub:** Platform for hosting the Git repository.

## Getting Started (For Developers)

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/byronfedele/Smart_Pantry_Scan.git](https://www.google.com/search?q=https://github.com/byronfedele/Smart_Pantry_Scan.git)
    cd Smart_Pantry_Scan
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up your development environment:** Ensure you have Node.js, npm or Yarn, and the React Native CLI installed. For running on iOS, you'll need Xcode; for Android, you'll need Android Studio.

4.  **Run the application:**
    ```bash
    npx react-native run-ios  # For iOS
    npx react-native run-android # For Android
    # or
    yarn ios
    yarn android
    ```

## Contributing

Contributions are welcome! If you have ideas for new features, bug fixes, or improvements, please feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE). See the `LICENSE` file for more information.

---

**Note:** This README reflects the current state of the project as of April 7, 2025. The "Planned Features" section outlines the general direction and may evolve over time.
