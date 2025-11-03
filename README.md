# Smart Pantry Scan

## Project Overview

Smart Pantry Scan is an innovative inventory management system designed to empower users to efficiently track pantry items, significantly reduce food waste, and discover personalized recipe suggestions. Our goal is to create a seamless and intelligent solution for modern household management.

## Current State

The project is currently under active development, with components for both mobile and web platforms:

*   **Mobile Application (Android):** The core mobile experience is being developed in React Native, focusing on a robust and intuitive user interface for on-the-go pantry management.
*   **Web Application:** A foundational web application, located in the `webApp/` directory, provides an HTML-based interface demonstrating key inventory functionalities. This serves as a preview and a stepping stone for a more comprehensive web platform.

## Future Plans

Our roadmap for Smart Pantry Scan includes exciting advancements:

*   **Enhanced Item Recognition:** We plan to replace traditional barcode scanning with a sophisticated camera-based system powered by an on-device Large Language Model (LLM). This will enable intelligent item recognition, making inventory updates effortless.
*   **Advanced Food Waste Reduction:** Features will be implemented to proactively help users minimize waste, including smart expiration date tracking, consumption analytics, and timely reminders.
*   **Personalized Recipe Suggestions:** The system will offer tailored recipe recommendations based on the ingredients currently available in the user's pantry, inspiring culinary creativity and reducing food waste.
*   **Flexible Quantity Management:** We will introduce a more intuitive and granular system for managing ingredient quantities:
    *   **Continuous Amounts:** For items like liquids or bulk goods, a slider interface will allow users to precisely indicate remaining quantities.
    *   **Discrete Amounts:** For individual items (e.g., "apples," "cans"), an up/down counter will provide easy quantity adjustments.
    *   A dedicated checkbox in the "Add New Item" form will allow users to easily classify items as discrete or continuous.
*   **MVP Launch (Phase 1):** The initial mobile version will target an ad-free, donate-only monetization model. It will be wrapped using Capacitor for cross-platform compatibility and released on the Google Play Store, focusing on speed, adoption, and validating core product features.

## Getting Started

To explore and contribute to the Smart Pantry Scan project:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/Smart_Pantry_Scan.git
    cd Smart_Pantry_Scan
    ```
    *(Note: Replace `https://github.com/your-username/Smart_Pantry_Scan.git` with the actual repository URL if different.)*

2.  **Web Application:**
    To view the current web application, navigate to the `webApp/` directory and open `SmartPantryScan.html` in your web browser. You can also serve it with a simple HTTP server:
    ```bash
    cd webApp
    python -m http.server 8000
    ```
    Then, open your browser to `http://localhost:8000/SmartPantryScan.html`.

3.  **Mobile Application (Android - Development):**
    *(Instructions for setting up and running the React Native Android app will be added here as development progresses.)*

## Contributing

We welcome contributions to the Smart Pantry Scan project! Please refer to our `CONTRIBUTING.md` (to be created) for guidelines on how to get involved.
