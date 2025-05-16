# High-Level Acceptance Test: HLT_005_View_Market_Prices

## 1. Test ID
HLT_005

## 2. Description
This test verifies that a user can look up real-time or frequently updated local commodity prices for key crops via a search/filter interface. The interface and displayed price information (labels and data presentation) should be in the user's selected language. This covers requirements from [`PRD.md:18`](docs/PRD.md:18) and [`PRD.md:61`](docs/PRD.md:61).

## 3. Preconditions
*   The AgriConnect web application is deployed and accessible.
*   The Market Prices feature is implemented with a search/filter interface.
*   A data source for commodity prices is integrated and provides data for various crops and market locations.
*   The application supports language selection, and UI elements for market price viewing are translatable.
*   Sample crop names and market location names are available for selection, with translations if the data source provides them or if they are managed locally.

## 4. Steps

1.  **Navigate to Application:** Open a web browser and navigate to the AgriConnect application's home page.
2.  **Select Language (e.g., Telugu):** Use the language switcher to select a supported language (e.g., Telugu). Verify UI updates.
3.  **Navigate to Market Prices Page:** Click on the "Market Prices" or equivalent menu item/link (label should be in Telugu).
4.  **Observe Page Language:** Verify that the page title, search/filter labels (e.g., "Select Crop", "Select Market"), and button texts are in Telugu.
5.  **Select Crop:** Using a dropdown or search input (labeled in Telugu), select a specific crop (e.g., "Paddy" / "వరి").
6.  **Select Market Location:** Using a dropdown or search input (labeled in Telugu), select a nearby market location (e.g., "Guntur Market" / "గుంటూరు మార్కెట్").
7.  **Initiate Price Search/View:** Click a "View Price" or "Search" button (if applicable, label in Telugu), or prices might load automatically after selections.
8.  **Verify Price Display:**
    *   Observe the displayed price information for the selected crop and market.
    *   Verify that labels for the price data (e.g., "Price:", "Per Quintal:", "Last Updated:") are in Telugu.
    *   Verify that the price value and unit are displayed clearly. (e.g., "₹X ప్రతి క్వింటాల్‌కు").
9.  **Test with Another Crop/Market:** Repeat steps 5-8 with a different crop and/or market location to ensure the interface updates correctly.

## 5. Expected Results

*   **ER1:** The user can successfully navigate to the Market Prices page.
*   **ER2:** All static UI elements on the Market Prices page (titles, labels for filters, button texts) are displayed in the selected language (Telugu).
*   **ER3:** The user can select a crop and a market location using the provided interface elements (which are labeled in Telugu).
*   **ER4:** Upon selection, the latest price for the chosen crop in the chosen market is displayed accurately.
*   **ER5:** Labels accompanying the price data (e.g., "Price:", "Unit:", "Date:") are in the selected language (Telugu).
*   **ER6:** The data presentation (numeric values, units) is clear and understandable alongside the Telugu labels.

## 6. AI Verifiable Outcome

*   **AIVO1 (Market Prices Page Language):** AI verifies that key static UI elements on the Market Prices page (e.g., page title "Market Prices", labels for "Select Crop" and "Select Market" dropdowns/inputs) are in the selected language (Telugu) by checking `innerText` or `textContent`.
    *   Example: AI checks for "పంటను ఎంచుకోండి" (Select Crop in Telugu).
*   **AIVO2 (Interaction and Price Display):**
    *   AI selects a predefined crop from the crop dropdown (e.g., by value or visible Telugu text).
    *   AI selects a predefined market from the market dropdown.
    *   AI clicks a "View Price" button (if present, identified by Telugu label) or waits for auto-load.
    *   AI verifies that a price information section/element becomes visible.
*   **AIVO3 (Price Data Labels Language):** Within the displayed price information, AI verifies that predefined labels (e.g., the text preceding the price value, unit, and update date) are in Telugu.
    *   Example: AI checks for "ధర:" (Price: in Telugu) before the price value.
*   **AIVO4 (Presence of Price Value):** AI verifies that a numeric price value is displayed within the price information section. (e.g., by checking for a pattern like "₹" followed by digits).

**Verification Method:** AI interacts with the DOM to select language, navigate, select options from dropdowns (or type into search inputs if applicable), and click buttons. It then inspects the DOM for the presence of price data and verifies the language of associated labels by checking `innerText` or `textContent` against expected Telugu strings.