# High-Level Acceptance Test: HLT_003_Create_Crop_Listing

## 1. Test ID
HLT_003

## 2. Description
This test verifies that a logged-in farmer can successfully create a new crop listing. The process involves navigating to the listing form (in their selected language), submitting valid crop details, receiving a confirmation message (in their language), and seeing the new listing appear correctly in the marketplace feed. The data should be saved in Supabase. This covers requirements from [`PRD.md:16`](docs/PRD.md:16) and [`PRD.md:60`](docs/PRD.md:60).

## 3. Preconditions
*   The AgriConnect web application is deployed and accessible.
*   A user account for a farmer exists and the user is logged in.
*   The application supports language selection, and UI elements for crop listing are translatable.
*   The marketplace page/feed is accessible.
*   Supabase database is connected and writable.
*   Predefined list of crop types is available for selection in the form.

## 4. Steps

1.  **Login as Farmer:** Log in to the application with farmer credentials.
2.  **Select Language (e.g., Hindi):** Ensure the desired language (e.g., Hindi) is selected via the language switcher. Verify UI updates.
3.  **Navigate to Create Listing Form:**
    *   Navigate to the "Marketplace" section.
    *   Click on the "List Your Crop" or equivalent button (label in selected language).
4.  **Observe Form Language:** Verify that labels and instructions on the crop listing form are in the selected language (Hindi).
5.  **Fill Crop Listing Form:** Enter valid details for the crop:
    *   **Crop Type:** Select a crop from the dropdown (e.g., "Wheat" / "गेहूँ").
    *   **Quantity:** Enter a numeric value (e.g., "50").
    *   **Unit:** Select a unit (e.g., "kg" / "किग्रा"). (Assuming unit is part of quantity or a separate field).
    *   **Price per Unit:** Enter a numeric value (e.g., "2000").
    *   **Price Unit:** Select a price unit (e.g., "per Quintal" / "प्रति क्विंटल"). (Assuming this is part of price or a separate field).
    *   (Any other mandatory fields like location if applicable, though PRD implies simple form).
6.  **Submit Listing Form:** Click the "Submit Listing" or equivalent button (label in selected language).
7.  **Verify Confirmation Message:** Observe if a success confirmation message is displayed in the selected language (e.g., "आपका लिस्टिंग सफलतापूर्वक सबमिट किया गया है।").
8.  **Verify Redirection (Optional):** Note if the user is redirected (e.g., back to the marketplace or their listings page).
9.  **Verify Listing in Marketplace:** Navigate to the marketplace feed/page.
10. **Locate New Listing:** Find the newly created listing. Verify that the details (crop type, quantity, price in selected language) match the submitted information.
11. **Verify Data in Supabase (Indirect/Conceptual):** Conceptually, the data for this new listing should now exist in the `produce_listings` table in Supabase, linked to the farmer's user ID. This is verified by the listing appearing in the UI.

## 5. Expected Results

*   **ER1:** The crop listing form is accessible and its labels/instructions are in the selected language.
*   **ER2:** The farmer can successfully fill and submit the crop listing form with valid data.
*   **ER3:** Upon successful submission, a confirmation message is displayed in the selected language.
*   **ER4:** The newly created crop listing appears in the marketplace feed with the correct details (crop type, quantity, price) displayed in the selected language.
*   **ER5:** The listing data is correctly persisted in the backend database (Supabase).

## 6. AI Verifiable Outcome

*   **AIVO1 (Form Language):** AI verifies that key labels on the crop listing form (e.g., "Crop Type", "Quantity", "Price", "Submit" button) are in the selected language (e.g., Hindi) by checking `innerText` or `textContent`.
*   **AIVO2 (Submission & Confirmation):**
    *   AI fills the form fields with test data.
    *   AI clicks the submit button.
    *   AI verifies the appearance of a success message element containing expected text in the selected language.
*   **AIVO3 (Listing Appearance in Marketplace):**
    *   AI navigates to the marketplace page.
    *   AI searches for a unique identifier of the newly created listing (e.g., by looking for a combination of crop type, quantity, and price submitted, or a specific listing card structure).
    *   AI verifies that the displayed details (crop type, quantity, price) within the found listing match the submitted data and are in the selected language.
*   **AIVO4 (Data Persistence Check - Conceptual for UI AI):** While direct DB verification is out of scope for UI AI, the consistent appearance of the listing (AIVO3) after submission and potential page reload/re-navigation serves as an indirect verification of persistence. The AI can check if the item persists after navigating away and back to the marketplace.

**Verification Method:** AI interacts with the DOM to select language, navigate, input data into forms, click buttons. It then inspects the DOM for success messages in the correct language and for the presence and correctness of the new listing in the marketplace view, checking text content and attributes of relevant HTML elements.