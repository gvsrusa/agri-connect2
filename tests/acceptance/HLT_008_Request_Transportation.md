# High-Level Acceptance Test: HLT_008_Request_Transportation

## 1. Test ID
HLT_008

## 2. Description
This test verifies that a logged-in farmer can post a request for help transporting their harvest to market using a web form. The form and confirmation messages should be in the selected language. This covers the requirement from [`PRD.md:21`](docs/PRD.md:21).

## 3. Preconditions
*   The AgriConnect web application is deployed and accessible.
*   A user account for a farmer exists and the user is logged in.
*   The "Request Transportation" feature is implemented with a web form.
*   The application supports language selection, and UI elements for transport requests are translatable.
*   Supabase database is connected and writable for storing transport requests.

## 4. Steps

1.  **Login as Farmer:** Log in to the application with farmer credentials.
2.  **Select Language (e.g., Tamil):** Ensure the desired language (e.g., Tamil) is selected via the language switcher. Verify UI updates.
3.  **Navigate to Request Transportation Form:**
    *   Navigate to the "Transport Services" or equivalent section.
    *   Click on the "Request Transport" or equivalent button (label in selected language).
4.  **Observe Form Language:** Verify that labels and instructions on the transport request form are in the selected language (Tamil).
5.  **Fill Transport Request Form:** Enter valid details:
    *   **Type of Produce:** Enter text (e.g., "Tomatoes" / "தக்காளி").
    *   **Quantity:** Enter text (e.g., "500 kg" / "500 கிலோ").
    *   **Pickup Date:** Select a date from a date picker.
    *   **Pickup Location:** Enter text for address or select from a map/dropdown if available (e.g., "My Farm, Village Name" / "என் பண்ணை, கிராமத்தின் பெயர்").
    *   **Destination Market (Optional):** Enter text (e.g., "City Market" / "நகர சந்தை").
    *   **Contact Information:** (Should be pre-filled or confirmable, ensure privacy).
6.  **Submit Request Form:** Click the "Submit Request" or equivalent button (label in selected language).
7.  **Verify Confirmation Message:** Observe if a success confirmation message is displayed in the selected language (e.g., "உங்கள் போக்குவரத்து கோரிக்கை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.").
8.  **Verify Request in User's History (if applicable):** If there's a section for users to view their past requests, navigate there and check if the new request appears with correct details in Tamil.
9.  **Verify Data in Supabase (Indirect/Conceptual):** Conceptually, the data for this new transport request should now exist in the `transport_requests` table in Supabase. This is indirectly verified by the confirmation and potential visibility in request history.

## 5. Expected Results

*   **ER1:** The transport request form is accessible, and its labels/instructions are in the selected language (Tamil).
*   **ER2:** The farmer can successfully fill and submit the transport request form with valid data.
*   **ER3:** Upon successful submission, a confirmation message is displayed in the selected language.
*   **ER4:** The transport request data is correctly persisted in the backend database (Supabase).
*   **ER5 (if applicable):** The newly submitted request appears in the user's transport request history, with details displayed correctly in Tamil.

## 6. AI Verifiable Outcome

*   **AIVO1 (Form Language):** AI verifies that key labels on the transport request form (e.g., "Type of Produce", "Quantity", "Pickup Date", "Submit" button) are in the selected language (Tamil) by checking `innerText` or `textContent`.
    *   Example: AI checks for "பொருளின் வகை" (Type of Produce in Tamil).
*   **AIVO2 (Submission & Confirmation):**
    *   AI fills the form fields with test data (text inputs, date selection).
    *   AI clicks the submit button.
    *   AI verifies the appearance of a success message element containing expected text in the selected language.
*   **AIVO3 (Request in History - if applicable):**
    *   AI navigates to the user's transport request history page.
    *   AI searches for an identifier of the newly created request (e.g., by looking for a combination of produce type and date).
    *   AI verifies that the displayed details within the found request match the submitted data and labels are in Tamil.
*   **AIVO4 (Data Persistence Check - Conceptual):** Similar to crop listing, consistent appearance in history (if feature exists) or successful submission confirmation serves as an indirect UI-level check of persistence.

**Verification Method:** AI interacts with the DOM to select language, navigate, input data into forms (including date pickers if automatable), and click buttons. It then inspects the DOM for success messages in Tamil and, if applicable, for the presence and correctness of the new request in a history view, checking text content of relevant HTML elements.