# High-Level Acceptance Test: HLT_007_Access_Post_Harvest_Guidance

## 1. Test ID
HLT_007

## 2. Description
This test verifies that a user can access guidance on handling and storing harvests to reduce losses. This involves navigating to the post-harvest guidance section, selecting a relevant topic (title shown in their language), and viewing the guidance in their selected language. This covers the requirement from [`PRD.md:20`](docs/PRD.md:20).

## 3. Preconditions
*   The AgriConnect web application is deployed and accessible.
*   The Post-Harvest Guidance feature is implemented with a way to browse or select topics/articles.
*   Sample post-harvest guidance content (articles, checklists) exists in the database for various crops or general practices and is available in multiple supported languages (e.g., English, Punjabi).
*   The application supports language selection.

## 4. Steps

1.  **Navigate to Application:** Open a web browser and navigate to the AgriConnect application's home page.
2.  **Select Language (e.g., Punjabi):** Use the language switcher to select a supported language (e.g., Punjabi). Verify UI updates.
3.  **Navigate to Post-Harvest Guidance Section:** Click on the "Post-Harvest Guidance" or equivalent menu item/link (label should be in Punjabi).
4.  **Observe Section Language:** Verify that the section title and any introductory text or category labels are in Punjabi.
5.  **Browse/Select Guidance Topic:**
    *   Observe the list of available guidance topics/articles. Their titles should be displayed in Punjabi.
    *   Select a specific guidance topic (e.g., "Proper storage of Wheat" / "ਕਣਕ ਦਾ ਸਹੀ ਭੰਡਾਰਨ").
6.  **View Guidance Content:**
    *   The selected guidance content page/section should load.
    *   Verify that the title of the guidance content is in Punjabi.
    *   Verify that the main body of the guidance text (e.g., paragraphs, steps, checklists) is displayed in Punjabi.
    *   If images or media are present, verify any associated captions or text overlays are in Punjabi (if applicable).
7.  **Navigate to Another Topic (Optional):** Select a different guidance topic and verify its content is also displayed correctly in Punjabi.

## 5. Expected Results

*   **ER1:** The user can successfully navigate to the Post-Harvest Guidance section.
*   **ER2:** UI elements within the Post-Harvest Guidance section (e.g., section title, topic category labels) are displayed in the selected language (Punjabi).
*   **ER3:** Titles of individual guidance topics/articles are listed in the selected language (Punjabi).
*   **ER4:** Upon selecting a topic, the detailed guidance content (title, body text, captions) is displayed in the selected language (Punjabi).
*   **ER5:** The content is readable and correctly formatted in the selected language.

## 6. AI Verifiable Outcome

*   **AIVO1 (Guidance Section Language):** AI verifies that key static UI elements in the Post-Harvest Guidance section (e.g., main section heading "Post-Harvest Guidance") are in the selected language (Punjabi) by checking `innerText` or `textContent`.
    *   Example: AI checks for "ਵਾਢੀ ਤੋਂ ਬਾਅਦ ਦੀ ਸੇਧ" (Post-Harvest Guidance in Punjabi).
*   **AIVO2 (Topic Title Language):** AI verifies that the titles of listed guidance topics are in Punjabi. This might involve checking the `innerText` of several `<a>` tags or list items.
    *   Example: AI finds an element with text "ਕਣਕ ਦਾ ਸਹੀ ਭੰਡਾਰਨ".
*   **AIVO3 (Guidance Content Display and Language):**
    *   AI clicks on a link for a specific guidance topic (identified by its Punjabi title).
    *   AI verifies that the main content area now displays text.
    *   AI verifies that the heading of the displayed article matches the selected topic's Punjabi title.
    *   AI verifies that a sample snippet of the article body text (a known translated sentence or paragraph) is present and in Punjabi.

**Verification Method:** AI interacts with the DOM to select language, navigate to the guidance section, click on topic links (identified by Punjabi text or consistent selectors). It then inspects the DOM of the content page to verify the language of headings and sample body text by checking `innerText` or `textContent` against expected Punjabi strings.