# AgriConnect Web Application: Research Findings from PRD Analysis

This document synthesizes the key findings from the analysis of the AgriConnect Product Requirements Document (PRD) located at [`docs/PRD.md`](docs/PRD.md). It serves as a foundation for the SPARC Specification phase, including the definition of high-level acceptance tests and the Master Project Plan.

## 1. Project Goal

To develop the AgriConnect web application, a platform designed to empower small and marginal Indian farmers with essential tools and information, accessible via web browsers on various devices in multiple local languages.

## 2. Key Functional Requirements

Based on PRD Section 3 (The Features) and Section 4 (The Information):

*   **Language Selection:** Users can choose their preferred language for the application interface and content. ([`PRD.md:14`](docs/PRD.md:14))
*   **User Authentication:** Secure registration and login (Sign up / Log in) using Clerk/NextAuth, supporting methods like Google, phone number, or email/password. ([`PRD.md:15`](docs/PRD.md:15))
*   **Produce Marketplace:**
    *   **Create & Manage Listings:** Farmers can list their produce for sale via a simple web form (crop type, quantity, price). ([`PRD.md:16`](docs/PRD.md:16))
    *   **Browse Marketplace:** Users can view available produce listings from other farmers. ([`PRD.md:17`](docs/PRD.md:17))
*   **Market Price Discovery:** Users can look up real-time or frequently updated local commodity prices for key crops. ([`PRD.md:18`](docs/PRD.md:18))
*   **Crop Advisory:** Access to concise tips on common pests, diseases, and climate-related farming advice. ([`PRD.md:19`](docs/PRD.md:19))
*   **Post-Harvest Guidance:** Access to information on handling and storing harvests to reduce losses. ([`PRD.md:20`](docs/PRD.md:20))
*   **Transportation Services:**
    *   **Request Transportation:** Farmers can post requests for transporting their harvest. ([`PRD.md:21`](docs/PRD.md:21))
    *   **Browse Transporters:** Users can view a list of nearby transporters and their contact details. ([`PRD.md:22`](docs/PRD.md:22))
*   **User Feedback:** Users can submit comments or ratings on the application. ([`PRD.md:23`](docs/PRD.md:23))
*   **Data Management:** The application must handle: ([`PRD.md:26-35`](docs/PRD.md:26-35))
    *   Farmer profiles (user info, location, preferred language).
    *   Produce listings (crop type, quantity, price, seller ID).
    *   Market price data.
    *   Crop advisory content (text/images/media in multiple languages).
    *   Post-harvest guidance content (articles/checklists in multiple languages).
    *   Transporter details.
    *   Transport requests.
    *   User feedback.
    *   Localization strings for UI elements.

## 3. Key Non-Functional Requirements

Based on PRD Section 1, 2, 5, 6, 7:

*   **Accessibility:** ([`PRD.md:3`](docs/PRD.md:3), [`PRD.md:7`](docs/PRD.md:7), [`PRD.md:39`](docs/PRD.md:39), [`PRD.md:48`](docs/PRD.md:48))
    *   Designed for users with varying tech skills and limited digital literacy.
    *   Works on lower bandwidth.
    *   Simple, clean, uncluttered UI with large, high-contrast text and buttons.
    *   Minimal text, intuitive icons.
*   **Language Support:** ([`PRD.md:3`](docs/PRD.md:3), [`PRD.md:39`](docs/PRD.md:39), [`PRD.md:48`](docs/PRD.md:48))
    *   Support for multiple local Indian languages (e.g., Hindi, Marathi, English, Telugu, Tamil, Kannada, Malayalam, Punjabi initially).
    *   Easy language switching mechanism.
    *   Content (advisory, guidance, UI) available in selected languages.
*   **Responsiveness:** Optimized for various devices (smartphones, tablets, shared computers) via web browsers. ([`PRD.md:3`](docs/PRD.md:3), [`PRD.md:39`](docs/PRD.md:39), [`PRD.md:42`](docs/PRD.md:42))
*   **User-Friendliness:** Intuitive and easy-to-navigate interface. ([`PRD.md:3`](docs/PRD.md:3))
*   **Privacy:** User contact details and personal data must be kept private. ([`PRD.md:49`](docs/PRD.md:49))
*   **Offline Functionality:** Limited; viewing cached data (e.g., previously loaded advisory content in the last selected language) should be possible. ([`PRD.md:37`](docs/PRD.md:37), [`PRD.md:43`](docs/PRD.md:43))
*   **Performance:** Lightweight and fast, especially on lower bandwidth connections. ([`PRD.md:3`](docs/PRD.md:3))
*   **Maintainability:** Localization strings managed effectively (in code or dedicated system). Structured storage for multilingual content. ([`PRD.md:36`](docs/PRD.md:36))

## 4. Primary User Goals

Based on PRD Section 2 (User Goals) ([`PRD.md:8-11`](docs/PRD.md:8-11)):

*   **Sell crops effectively:** List produce easily and find local buyers at fair prices, aided by up-to-date market rates in their chosen language.
*   **Access expert advice:** Quickly get practical answers to common farming problems (pests, diseases, weather impacts) in their chosen language.
*   **Manage harvest and transport:** Learn how to store and handle harvest to avoid losses, and connect with transporters in their chosen language.

## 5. Core Application Features

Based on PRD Section 3 (Core Actions & Key Feature Deep Dive) ([`PRD.md:13-24`](docs/PRD.md:13-24)):

*   Language Selection
*   Authentication (Sign up/Log in via Clerk/NextAuth)
*   Marketplace (List Produce, Browse Listings)
*   Market Price Information
*   Crop Advisory
*   Post-Harvest Guidance
*   Transport Request & Browsing
*   Feedback Submission

## 6. Target User Base and Their Needs

Based on PRD Section 2 (Primary Users) ([`PRD.md:7`](docs/PRD.md:7)):

*   **Primary Users:** Small and marginal farmers in India.
*   **Characteristics:**
    *   Limited education and digital literacy.
    *   Potentially inconsistent internet access.
    *   Prefer interaction in their regional language.
    *   Access via smartphones, tablets, shared computers, or cyber cafes.
*   **Needs:**
    *   Simple, intuitive interface.
    *   Information and UI in local languages.
    *   Accessibility on low-bandwidth connections.
    *   Practical, actionable information relevant to their local context.
    *   Tools to improve income (better prices, reduced losses).

## 7. Specified Technologies, Platforms, or Constraints

Based on PRD Section 3, 4, 5, 6, 7:

*   **Authentication:** Clerk/NextAuth ([`PRD.md:15`](docs/PRD.md:15), [`PRD.md:27`](docs/PRD.md:27), [`PRD.md:46`](docs/PRD.md:46))
*   **Database:** Supabase (Cloud PostgreSQL) ([`PRD.md:36`](docs/PRD.md:36), [`PRD.md:47`](docs/PRD.md:47))
*   **Frontend Framework:** Next.js ([`PRD.md:42`](docs/PRD.md:42))
*   **Styling:** Tailwind CSS ([`PRD.md:39`](docs/PRD.md:39), [`PRD.md:42`](docs/PRD.md:42), [`PRD.md:55`](docs/PRD.md:55))
*   **Platform:** Web application accessible via standard web browsers. ([`PRD.md:42`](docs/PRD.md:42))
*   **Design:** Simple, clean, friendly, responsive, farm-friendly vibe with clear language switcher. Avoid cluttered screens. ([`PRD.md:39`](docs/PRD.md:39))

## 8. Success Criteria and "Definition of Done" Scenarios

Based on PRD Section 8 (Success Criteria) ([`PRD.md:57-62`](docs/PRD.md:57-62)):

The application is successful if it smoothly handles:

*   **Language Switching:** User selects a language, UI updates immediately and persists.
*   **Authentication:** Farmer can sign up/log in via Clerk/NextAuth with UI in selected language.
*   **Listing a Crop:** Logged-in farmer submits crop details (form in selected language), receives confirmation (in selected language), listing appears in marketplace, and data is saved in Supabase.
*   **Viewing Prices:** Farmer selects crop/market (UI in selected language), website displays accurate price (labels/data in selected language).
*   **Accessing Crop Advisory:** Farmer opens advisory topic (title in selected language), website displays correct guidance in selected language.

## 9. Out-of-Scope for MVP / Features to Avoid

Based on PRD Section 7 (Things to Avoid) ([`PRD.md:50-55`](docs/PRD.md:50-55)) and Section 10 (Future Dreams) ([`PRD.md:79-90`](docs/PRD.md:79-90)):

*   **No full transaction or payment processing in MVP.**
*   **No complex AI features in MVP** (e.g., advanced advisory, image recognition).
*   **Avoid requiring excessive data input.**
*   **No unsolicited communications.**
*   **Avoid cluttered layouts.**
*   PWA for better offline viewing (Future Dream).
*   In-app transactions (Future Dream).
*   Financial services (Future Dream).
*   Mechanization Marketplace (Future Dream).
*   Warehousing & Cold Storage listings (Future Dream).
*   Expanded Logistics (Future Dream).
*   Farmer Community features (Future Dream).
*   Enhanced Notifications (Web push/SMS) (Future Dream).
*   Voice Input/Output (Future Dream).
*   Expanded Language Support beyond initial set (Future Dream, though initial set is MVP).

This synthesized information provides a clear overview of the AgriConnect project as defined in the PRD, ready for use in the SPARC Specification phase.