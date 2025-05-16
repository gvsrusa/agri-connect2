# High-Level Acceptance Test: HLT_009_Browse_Transporters

## 1. Test ID
HLT_009

## 2. Description
This test verifies that a user can view a list of nearby transporters and their contact details on a dedicated page. The information and UI elements should be displayed in the user's selected language. This covers the requirement from [`PRD.md:22`](docs/PRD.md:22).

## 3. Preconditions
*   The AgriConnect web application is deployed and accessible.
*   The "Browse Transporters" feature is implemented and accessible.
*   There are existing transporter profiles in the database with details like name, capacity, contact info, and service areas. Some of this data might be available for display in multiple languages or alongside translated labels.
*   The application supports language selection.

## 4. Steps

1.  **Navigate to Application:** Open a web browser and navigate to the AgriConnect application's home page.
2.  **Select Language (e.g., Malayalam):** Use the language switcher to select a supported language (e.g., Malayalam). Verify UI updates.
3.  **Navigate to Browse Transporters Page:** Click on the "Find Transporters" or "Transport Services" then "Browse Transporters" or equivalent menu item/link (label should be in Malayalam).
4.  **Observe Transporters Page:**
    *   Verify that the page title and static UI elements (e.g., filter labels, sort options if any) are displayed in Malayalam.
    *   Observe the list of available transporters.
5.  **Inspect Transporter Listings:** For a few sample transporter profiles:
    *   Verify that information like transporter name, capacity, service areas, and contact details (if shown directly) is presented clearly.
    *   Verify that labels associated with transporter details (e.g., "Name:", "Capacity:", "Contact:") are in Malayalam.
6.  **Test Filtering/Sorting (if applicable):** If filtering or sorting options are available (e.g., by location, capacity):
    *   Apply a filter or sort option (UI for these options should be in Malayalam).
    *   Verify that the displayed transporter listings update according to the selected criteria and are still presented correctly in Malayalam.

## 5. Expected Results

*   **ER1:** The user can successfully navigate to the "Browse Transporters" page.
*   **ER2:** All static UI elements on the page (titles, labels, button texts for filters/sort) are displayed in the selected language (Malayalam).
*   **ER3:** Transporter listings are displayed in a clear, understandable format.
*   **ER4:** Labels for details within each transporter profile (e.g., "Name:", "Capacity:") are in the selected language (Malayalam).
*   **ER5 (if applicable):** Filtering and sorting functionalities work as expected, and the results are displayed correctly in the selected language.

## 6. AI Verifiable Outcome

*   **AIVO1 (Transporters Page Language):** AI verifies that key static UI elements on the "Browse Transporters" page (e.g., page title "Transporters", filter/sort button labels) are in the selected language (Malayalam) by checking `innerText` or `textContent`.
    *   Example: AI checks for "ട്രാൻസ്പോർട്ടർമാർ" (Transporters in Malayalam).
*   **AIVO2 (Transporter Card Labels Language):** For a sample transporter listing card, AI verifies that predefined labels (e.g., the text preceding the name, capacity, contact info) are in Malayalam.
    *   Example: AI checks for "പേര്:" (Name: in Malayalam) before the transporter's name.
*   **AIVO3 (Presence of Transporter Listings):** AI verifies that at least one transporter item/card is present in the DOM, indicating data is being loaded.
*   **AIVO4 (Filtering/Sorting Functionality - if applicable):**
    *   AI selects a filter/sort option (e.g., clicks a "Sort by Capacity" button with a Malayalam label).
    *   AI verifies that the order or content of displayed listings changes. Continued language consistency is also checked.

**Verification Method:** AI interacts with the DOM to select language, navigate, and identify elements. It checks `innerText` or `textContent` of titles, labels, and button texts against expected Malayalam strings. It also checks for the presence of transporter listing elements and can perform basic checks on filtering/sorting by observing changes in displayed data.