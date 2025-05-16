# AgriConnect Master Project Plan

## Overall Project Goal (AI Verifiable)

The AgriConnect web application will empower small and marginal Indian farmers by providing essential tools and information.
**AI Verifiable End Goal:** The application is deployed and accessible, allowing users to successfully complete all core actions defined in the high-level acceptance tests (HLTs HLT_001 to HLT_010), verified by automated UI tests and backend data validation.

## Phase 1: Foundational Setup & Core User Management

**Phase AI Verifiable End Goal:** A basic Next.js application structure is in place, integrated with Clerk/NextAuth for user authentication and Supabase for database connectivity. Users can sign up, log in, log out, and select their preferred language, with these actions reflected in the UI and database. Successful execution of HLT_001 (Language Switching) and HLT_002 (User Signup/Login).

### Micro Tasks:

1.  **Task 1.1: Project Initialization & Basic Structure**
    *   **Description:** Initialize a new Next.js project. Set up basic project structure (folders for components, pages, services, styles, tests, docs). Integrate Tailwind CSS.
    *   **AI Verifiable Deliverable:** Next.js project created and runnable (`npm run dev`). Basic directory structure exists. Tailwind CSS is configured and a simple styled element is visible on the home page.
    *   **HLT Reference:** Foundational for all HLTs.

2.  **Task 1.2: Clerk/NextAuth Integration for Authentication**
    *   **Description:** Integrate Clerk/NextAuth into the Next.js application. Configure sign-up, log-in (Google, phone, email/password as per PRD), and log-out functionalities.
    *   **AI Verifiable Deliverable:** Users can successfully sign up, log in, and log out using Clerk/NextAuth. User sessions are managed. Relevant UI components for authentication are present. Clerk/NextAuth environment variables are configured.
    *   **HLT Reference:** HLT_002

3.  **Task 1.3: Supabase Database Setup & Integration**
    *   **Description:** Set up a Supabase project (PostgreSQL). Define initial schema for `users` (to store app-specific user data like preferred language, linking to Clerk/NextAuth ID) and `languages`. Establish secure connection from Next.js app to Supabase.
    *   **AI Verifiable Deliverable:** Supabase project is active. `users` and `languages` tables exist with specified columns. Application can successfully connect to Supabase and perform a basic read/write operation (e.g., storing/retrieving a test user's preferred language).
    *   **HLT Reference:** Foundational for HLT_002, HLT_001, and subsequent data-driven HLTs.

4.  **Task 1.4: Language Selection Implementation (UI & Backend)**
    *   **Description:** Implement UI components for language selection (e.g., dropdown in header/footer). Store user's language preference in Supabase user profile and in a client-side state (e.g., context/cookie). Implement basic i18n setup (e.g., using `next-i18next` or similar) with placeholder strings for initial languages (English, Hindi, Marathi).
    *   **AI Verifiable Deliverable:** Language switcher UI is present. Selecting a language updates the UI to show placeholder text in the selected language (e.g., "Welcome" vs. "स्वागत है"). User's language preference is saved to Supabase and persists across sessions.
    *   **HLT Reference:** HLT_001

5.  **Task 1.5: Basic UI Layout and Navigation Shell**
    *   **Description:** Create a basic responsive application shell (header, footer, main content area) using Tailwind CSS. Implement placeholder navigation links for core features (Marketplace, Market Prices, Crop Advisory, etc.).
    *   **AI Verifiable Deliverable:** Application has a consistent header and footer. Placeholder navigation links are present and navigate to empty placeholder pages. Layout is responsive on common screen sizes.
    *   **HLT Reference:** Foundational for all HLTs involving UI interaction.

## Phase 2: Marketplace Core Functionality

**Phase AI Verifiable End Goal:** Farmers can create, view, and manage their produce listings. Other users can browse these listings. All marketplace interactions support selected languages. Successful execution of HLT_003 (Create Crop Listing) and HLT_004 (Browse Marketplace).

### Micro Tasks:

1.  **Task 2.1: `produce_listings` Table Schema & API Endpoints**
    *   **Description:** Define and create the `produce_listings` table in Supabase (columns: `listing_id`, `seller_user_id`, `crop_type`, `quantity`, `price`, `description` (optional), `status`, `created_at`, `updated_at`). Create API routes/server actions in Next.js to create, read (all, by user, by ID), update, and delete listings.
    *   **AI Verifiable Deliverable:** `produce_listings` table exists in Supabase with correct schema. API endpoints for CRUD operations on listings are functional and can be successfully called (e.g., via Postman or automated tests), returning appropriate responses.
    *   **HLT Reference:** HLT_003, HLT_004

2.  **Task 2.2: "List Your Crop" Form Implementation**
    *   **Description:** Develop the web form for farmers to list their produce. Include fields for crop type, quantity, price, and an optional description. Ensure form labels and validation messages are internationalized. On submission, save data to Supabase via API.
    *   **AI Verifiable Deliverable:** "List Your Crop" form is accessible and functional. Submitting valid data creates a new record in the `produce_listings` table in Supabase. Form displays in the selected language. Validation errors are shown for invalid input.
    *   **HLT Reference:** HLT_003

3.  **Task 2.3: Marketplace Listing Display Page**
    *   **Description:** Create a page to display all available produce listings. Implement basic filtering/sorting (e.g., by crop type, date listed). Ensure listings are displayed clearly, showing key information (crop, quantity, price, seller info - anonymized if needed). UI must be in the selected language.
    *   **AI Verifiable Deliverable:** Marketplace page loads and displays listings from the `produce_listings` table. Information is accurate and presented in the selected language. Basic filtering/sorting works as expected.
    *   **HLT Reference:** HLT_004

4.  **Task 2.4: Manage My Listings Page (Optional for MVP, but good to plan)**
    *   **Description:** (Stretch for MVP, consider for future) Allow logged-in farmers to view, edit, or delete their own listings.
    *   **AI Verifiable Deliverable:** If implemented, farmers can view their own listings on a dedicated page and perform edit/delete operations, with changes reflected in Supabase.
    *   **HLT Reference:** Extends HLT_003

## Phase 3: Market Prices & Advisory Content

**Phase AI Verifiable End Goal:** Users can view local market prices for key crops and access crop advisory and post-harvest guidance content in their selected language. Successful execution of HLT_005 (View Market Prices), HLT_006 (Access Crop Advisory), and HLT_007 (Access Post-Harvest Guidance).

### Micro Tasks:

1.  **Task 3.1: `market_prices` Data Management**
    *   **Description:** Define schema for `market_prices` table (e.g., `crop_id`, `market_location_id`, `price`, `date_updated`). Implement a mechanism to populate/update this data (initially can be manual seed data, plan for future API integration if available). Create API endpoints to fetch price data.
    *   **AI Verifiable Deliverable:** `market_prices` table exists and contains sample data. API endpoint to fetch prices by crop/location is functional.
    *   **HLT Reference:** HLT_005

2.  **Task 3.2: Market Price Display UI**
    *   **Description:** Develop the UI for users to select a crop and market location (e.g., dropdowns) and view the latest price. Display information clearly in the selected language.
    *   **AI Verifiable Deliverable:** Market price lookup UI is functional. Selecting crop/location displays the correct price from Supabase in the selected language.
    *   **HLT Reference:** HLT_005

3.  **Task 3.3: `advisory_content` & `post_harvest_content` Data Management**
    *   **Description:** Define schemas for `advisory_content` and `post_harvest_content` tables in Supabase, supporting multilingual content (e.g., `content_id`, `language_code`, `title`, `body_text`, `category`, `image_url` (optional)). Populate with sample content for a few topics in initial languages. Create API endpoints to fetch content.
    *   **AI Verifiable Deliverable:** Content tables exist with sample multilingual data. API endpoints to fetch content by topic/language are functional.
    *   **HLT Reference:** HLT_006, HLT_007

4.  **Task 3.4: Advisory & Post-Harvest Content Display UI**
    *   **Description:** Develop UI pages to list and display advisory topics and post-harvest guidance. Ensure content is fetched based on the selected language and displayed in a readable format.
    *   **AI Verifiable Deliverable:** Users can navigate to advisory/guidance sections. Content is displayed correctly in the selected language.
    *   **HLT Reference:** HLT_006, HLT_007

5.  **Task 3.5: Localization String Management for All Content**
    *   **Description:** Ensure all static UI text (labels, buttons, messages) and dynamic content (crop names, advisory titles) are managed through the i18n system and translated for supported languages.
    *   **AI Verifiable Deliverable:** A review confirms all user-facing text is sourced from localization files/system. Switching languages updates all relevant text.
    *   **HLT Reference:** HLT_001 and all other HLTs.

## Phase 4: Transportation & Feedback

**Phase AI Verifiable End Goal:** Farmers can request transportation for their harvest, and users can browse available transporters. A feedback mechanism is in place. Successful execution of HLT_008 (Request Transportation), HLT_009 (Browse Transporters), and HLT_010 (Submit Feedback).

### Micro Tasks:

1.  **Task 4.1: `transport_requests` & `transporters` Data Management**
    *   **Description:** Define schemas for `transport_requests` (e.g., `request_id`, `farmer_user_id`, `produce_type`, `quantity`, `pickup_location`, `destination_location`, `date_needed`, `status`) and `transporters` (e.g., `transporter_id`, `name`, `contact_info` (private), `service_areas`, `capacity`). Populate `transporters` with sample data. Create API endpoints for CRUD operations.
    *   **AI Verifiable Deliverable:** Tables exist in Supabase. API endpoints are functional.
    *   **HLT Reference:** HLT_008, HLT_009

2.  **Task 4.2: "Request Transportation" Form & Display**
    *   **Description:** Develop the form for farmers to post transport requests. Implement UI to display posted requests (potentially for transporters or admins).
    *   **AI Verifiable Deliverable:** Transport request form is functional, saves data to Supabase. Requests can be viewed (details TBD by specific user roles). UI in selected language.
    *   **HLT Reference:** HLT_008

3.  **Task 4.3: "Browse Transporters" Page**
    *   **Description:** Develop a page to list available transporters with their details (excluding private contact info initially, focusing on service areas/capacity).
    *   **AI Verifiable Deliverable:** Transporter listing page displays sample transporter data from Supabase in the selected language.
    *   **HLT Reference:** HLT_009

4.  **Task 4.4: `user_feedback` Data Management & Form**
    *   **Description:** Define schema for `user_feedback` table (e.g., `feedback_id`, `user_id` (optional), `rating` (optional), `comments`, `timestamp`). Implement a simple feedback form.
    *   **AI Verifiable Deliverable:** `user_feedback` table exists. Feedback form is functional and saves data to Supabase. UI in selected language.
    *   **HLT Reference:** HLT_010

## Phase 5: Testing, Refinement & Deployment Preparation

**Phase AI Verifiable End Goal:** All HLTs pass. Code is reviewed, and basic deployment CI/CD is set up. Application is ready for initial user testing/beta.

### Micro Tasks:

1.  **Task 5.1: Comprehensive End-to-End Testing (HLT Execution)**
    *   **Description:** Manually and/or with automated UI tests (e.g., Playwright/Cypress if budget/time allows), execute all defined High-Level Acceptance Tests (HLT_001 to HLT_010). Document results and fix any identified bugs.
    *   **AI Verifiable Deliverable:** All HLTs pass. A test execution report is generated showing pass status for all HLTs.
    *   **HLT Reference:** All HLTs.

2.  **Task 5.2: Code Review & Refactoring**
    *   **Description:** Conduct peer code reviews for major components. Refactor code for clarity, performance, and maintainability based on feedback and best practices.
    *   **AI Verifiable Deliverable:** Code review sign-offs are documented. Identified refactoring tasks are completed. Static analysis tools (linters, formatters) pass without errors.

3.  **Task 5.3: Accessibility & Usability Review**
    *   **Description:** Perform a basic accessibility check (e.g., keyboard navigation, color contrast, ARIA attributes where needed). Review usability for target audience (simplicity, clarity).
    *   **AI Verifiable Deliverable:** Accessibility checklist (e.g., WCAG AA basics) shows compliance for key user flows. Usability feedback is documented and critical issues addressed.

4.  **Task 5.4: Documentation Update**
    *   **Description:** Ensure user-facing help text (if any) and internal technical documentation (e.g., README, API docs if generated) are up-to-date.
    *   **AI Verifiable Deliverable:** [`README.md`](README.md) is updated with setup and run instructions. Key architectural decisions are documented.

5.  **Task 5.5: Basic CI/CD Pipeline Setup**
    *   **Description:** Set up a basic CI/CD pipeline (e.g., using GitHub Actions or Vercel's built-in CI/CD) for automated builds, linting, and deployment to a staging/production environment on Vercel (or similar Next.js hosting).
    *   **AI Verifiable Deliverable:** CI pipeline successfully builds and deploys the main branch to a hosting provider. Linting/testing steps in CI pass.

---
**Note on AI Verifiability:** Many "AI Verifiable Deliverables" imply the ability for an AI to check file existence, run linters, execute scripts/tests and check exit codes, or query a database/API and validate the response structure/content against expected patterns. For UI elements, AI verification might involve checking for the presence of specific DOM elements (by ID, class, or text content in the selected language) or page navigation success.