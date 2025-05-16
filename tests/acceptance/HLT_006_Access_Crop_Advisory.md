# High-Level Acceptance Test: HLT_006_Access_Crop_Advisory

## 1. Test ID
HLT_006

## 2. Description
This test verifies that a user can access crop advisory content. This involves navigating to the crop advisory section, selecting a topic (title shown in their language), and viewing the guidance in their selected language. This covers requirements from [`PRD.md:19`](docs/PRD.md:19) and [`PRD.md:62`](docs/PRD.md:62).

## 3. Preconditions
*   The AgriConnect web application is deployed and accessible.
*   The Crop Advisory feature is implemented with a way to browse or select topics.
*   Sample crop advisory content (articles, tips) exists in the database for various topics and is available in multiple supported languages (e.g., English, Kannada).
*   The application supports language selection.

## 4. Steps

1.  **Navigate to Application:** Open a web browser and navigate to the AgriConnect application's home page.
2.  **Select Language (e.g., Kannada):** Use the language switcher to select a supported language (e.g., Kannada). Verify UI updates.
3.  **Navigate to Crop Advisory Section:** Click on the "Crop Advisory" or equivalent menu item/link (label should be in Kannada).
4.  **Observe Advisory Section Language:** Verify that the section title and any introductory text or category labels are in Kannada.
5.  **Browse/Select Advisory Topic:**
    *   Observe the list of available advisory topics. Their titles should be displayed in Kannada.
    *   Select a specific advisory topic (e.g., "Pest control for Cotton" / "ಹತ್ತಿಗೆ ಕೀಟ ನಿಯಂತ್ರಣ").
6.  **View Advisory Content:**
    *   The selected advisory content page/section should load.
    *   Verify that the title of the advisory content is in Kannada.
    *   Verify that the main body of the advisory text (e.g., paragraphs, lists, tips) is displayed in Kannada.
    *   If images or media are present, verify any associated captions or text overlays are in Kannada (if applicable).
7.  **Navigate to Another Topic (Optional):** Select a different advisory topic and verify its content is also displayed correctly in Kannada.

## 5. Expected Results

*   **ER1:** The user can successfully navigate to the Crop Advisory section.
*   **ER2:** UI elements within the Crop Advisory section (e.g., section title, topic category labels) are displayed in the selected language (Kannada).
*   **ER3:** Titles of individual advisory topics are listed in the selected language (Kannada).
*   **ER4:** Upon selecting a topic, the detailed advisory content (title, body text, captions) is displayed in the selected language (Kannada).
*   **ER5:** The content is readable and correctly formatted in the selected language.

## 6. AI Verifiable Outcome

*   **AIVO1 (Advisory Section Language):** AI verifies that key static UI elements in the Crop Advisory section (e.g., main section heading "Crop Advisory", any sub-headings for categories) are in the selected language (Kannada) by checking `innerText` or `textContent`.
    *   Example: AI checks for "ಬೆಳೆ ಸಲಹೆ" (Crop Advisory in Kannada).
*   **AIVO2 (Topic Title Language):** AI verifies that the titles of listed advisory topics are in Kannada. This might involve checking the `innerText` of several `<a>` tags or list items representing topics.
    *   Example: AI finds an element with text "ಹತ್ತಿಗೆ ಕೀಟ ನಿಯಂತ್ರಣ".
*   **AIVO3 (Advisory Content Display and Language):**
    *   AI clicks on a link for a specific advisory topic (identified by its Kannada title).
    *   AI verifies that the main content area now displays text.
    *   AI verifies that the heading of the displayed article matches the selected topic's Kannada title.
    *   AI verifies that a sample snippet of the article body text (a known translated sentence or paragraph) is present and in Kannada.
*   **AIVO4 (Content Persistence):** After navigating to a topic, AI can reload the page or navigate away and back (if state is preserved by URL) to ensure the content in the selected language is still displayed.

**Verification Method:** AI interacts with the DOM to select language, navigate to the advisory section, click on topic links (identified by Kannada text or consistent selectors). It then inspects the DOM of the content page to verify the language of headings and sample body text by checking `innerText` or `textContent` against expected Kannada strings.