# Feature Overview Specification: Marketplace & Price Discovery

## 1. Introduction

This document outlines the specifications for the **Marketplace & Price Discovery** feature of the AgriConnect web application. This feature aims to empower farmers by providing them with tools to sell their produce and make informed pricing decisions based on current market data. This specification is derived from the AgriConnect User Blueprint ([`docs/PRD.md`](docs/PRD.md)), particularly Sections 3, 4, 5, and 7.

## 2. Feature Name

Marketplace & Price Discovery

## 3. Feature Goal

To enable farmers to list their produce for sale, browse available produce from others, and check current local market prices for informed decision-making.

## 4. User Stories

The following user stories capture the key functionalities from a user's perspective:

*   **US01**: As a farmer, I want to easily list my harvested crops (e.g., 50kg of wheat at ₹X per kg) using a simple web form in my selected language, so that potential buyers (other users of the platform) can see them.
*   **US02**: As a farmer, I want to view listings from other farmers, potentially in my area, to understand what's available in the marketplace, with information displayed in my selected language.
*   **US03**: As a farmer, I want to check the current market price for my crop (e.g., Wheat) in a nearby market location using a simple search/filter interface in my selected language, so I can set a fair price for my listing.
*   **US04**: As a user, I want to be able to search or filter marketplace listings (e.g., by crop type, and potentially by location if available) to quickly find relevant produce, with the interface in my selected language.
*   **US05**: As a user, I want to see clear and concise information on produce listings (including crop type, quantity, and price), presented in my selected language.

## 5. Functional Requirements

The system must perform the following functions:

*   **FR01: Create Produce Listing**: Provide a simple, intuitive web form allowing authenticated farmers to create a new produce listing.
    *   Inputs: Crop type (selectable list), quantity (e.g., kg, quintal), price per unit.
    *   Form labels and guidance to be displayed in the user's selected language.
*   **FR02: Store Produce Listing**: Securely store submitted produce listings in the Supabase PostgreSQL database, associating each listing with the seller's user ID and a timestamp.
*   **FR03: Display Marketplace Listings**: Present a browseable view of all active produce listings.
    *   Information displayed per listing: Crop type, quantity, price.
    *   Listings to be displayed in the user's selected language.
*   **FR04: Search and Filter Listings**: Allow users to search and/or filter marketplace listings.
    *   Minimum filter: by crop type.
    *   Potential filter: by location (if location data is captured and deemed in scope for MVP).
    *   Interface elements to be in the user's selected language.
*   **FR05: Market Price Lookup Interface**: Provide an interface for users to check current market prices for specific crops.
    *   Inputs: Crop type (selectable list), market location (selectable list or search, if available).
    *   Display: Current price for the selected crop in the specified market, including unit (e.g., ₹X per quintal).
    *   Price data and interface elements to be in the user's selected language.
*   **FR06: Language Support**: All user-facing aspects of this feature (forms, labels, displayed data, messages) must be rendered in the user's currently selected language.

## 6. Non-Functional Requirements

*   **NFR01: Usability**:
    *   Forms for listing produce must be simple and easy to complete, requiring minimal data input (PRD Line 16, 24, 53).
    *   Marketplace listings and price information must be displayed clearly and be easy to understand (PRD Line 39).
    *   Navigation within the feature should be intuitive.
*   **NFR02: Accessibility**:
    *   The feature must be accessible to users with low digital literacy, using minimal text and intuitive icons where appropriate (PRD Line 48).
    *   Ensure sufficient color contrast and legible font sizes for text and UI elements (PRD Line 39).
*   **NFR03: Performance**:
    *   Marketplace listings page should load quickly, even with a moderate number of listings.
    *   Market price lookups should return results promptly (PRD Line 24 "fast and clear").
*   **NFR04: Reliability**:
    *   Produce listings must be accurately stored and displayed as entered by the farmer.
    *   Market price data displayed should be accurate and reflect the latest available information from the source (PRD Line 29).
*   **NFR05: Localization**:
    *   All UI text, labels, messages, and dynamic content related to this feature must be fully localizable and displayed in the user's selected language (PRD Line 3, 14, 35, 48).
*   **NFR06: Responsiveness**:
    *   The UI for marketplace and price discovery must be responsive and adapt to various screen sizes (smartphones, tablets, desktops) (PRD Line 3, 39, 42).
*   **NFR07: Security & Privacy**:
    *   Only authenticated users can create listings.
    *   Seller's personal contact details are not to be displayed on listings in the MVP (as per PRD Line 49 "Privacy is critical" and PRD Line 51 "No full transaction... in MVP").

## 7. Data Requirements

The following data elements will be required, managed, and stored:

*   **Produce Listing Data** (stored in Supabase):
    *   `listing_id` (Primary Key, auto-generated)
    *   `user_id` (Foreign Key, references authenticated user)
    *   `crop_type` (Text, e.g., "Wheat", "Tomato"; potentially a foreign key to a `crops` table)
    *   `quantity` (Numeric)
    *   `quantity_unit` (Text, e.g., "kg", "quintal")
    *   `price_per_unit` (Numeric)
    *   `currency` (Text, e.g., "INR")
    *   `listing_timestamp` (Timestamp, creation date/time)
    *   `is_active` (Boolean, for managing listing status)
    *   `location_text` (Text, optional, farmer-entered general location if deemed necessary and in scope)
*   **Market Price Data** (source TBD, structure for internal use/caching if applicable):
    *   `crop_type` (Text)
    *   `market_location_identifier` (Text, e.g., market name or code)
    *   `price` (Numeric)
    *   `price_unit` (Text, e.g., "per quintal")
    *   `price_timestamp` (Timestamp, when the price was last updated/recorded)
*   **Supporting Data**:
    *   List of supported `crop_types` (for dropdowns, filtering).
    *   List of `market_locations` (for price lookup, if applicable).

## 8. UI/UX Considerations

*   **Listing Creation Form**:
    *   A simple, single-page form with clear labels in the selected language.
    *   Use dropdowns for selectable fields like crop type.
    *   Provide clear instructions or examples for quantity and price.
    *   Obvious "Submit" button.
    *   Success/error messages displayed clearly in the selected language.
*   **Marketplace View**:
    *   Clean, card-based, or list-based layout for produce listings.
    *   Each listing should clearly display crop type, quantity, and price.
    *   Prominent search and filter controls (e.g., dropdown for crop type).
    *   Pagination or infinite scrolling for large numbers of listings.
*   **Market Price Lookup**:
    *   Simple interface with dropdowns or search fields for crop type and market location.
    *   Clear display of the resulting price information.
*   **General**:
    *   Adherence to the overall AgriConnect style guide (simple, clean, friendly, Tailwind CSS, responsive) (PRD Line 39).
    *   Easy navigation to and from the Marketplace and Price Discovery sections.
    *   Visual cues and feedback for user actions.

## 9. Scope

### 9.1. In Scope (for MVP)

*   Authenticated farmers can create, view, and manage (e.g., mark as inactive/delete) their own produce listings (crop type, quantity, price).
*   All users can browse and view active produce listings from other farmers.
*   All users can search/filter marketplace listings, at a minimum by crop type.
*   All users can look up indicative local commodity prices for key crops via a search/filter interface (source of price data TBD, but UI/UX to support this).
*   All interactions and displayed information within this feature are in the user's selected language.
*   Data for listings is stored in Supabase.
*   The feature is accessible via web browsers on various devices (responsive design).

### 9.2. Out of Scope (for MVP)

*   Direct online transactions, payments, or order fulfillment (PRD Line 51).
*   Integrated communication or chat features between users regarding listings. Seller contact information will not be directly displayed on listings to facilitate transactions, aligning with privacy (PRD Line 49) and no-transaction MVP scope (PRD Line 51).
*   Logistics, shipping, or transport arrangements integrated with listings (these are separate features, see PRD Lines 21, 22).
*   User reviews, ratings for listings, or seller reputation systems.
*   Advanced AI-driven price suggestions or demand forecasting (PRD Line 52).
*   Bidding or auction mechanisms for listings.
*   Push notifications for new listings or price changes (Future Dream: PRD Line 88).

## 10. Dependencies

*   **User Authentication System (Clerk/NextAuth)**: Required for farmers to log in and create listings. User profiles will provide `user_id`. (PRD Line 15, 46)
*   **Language Selection Feature**: The Marketplace & Price Discovery feature relies on the global language selection mechanism to display all UI elements and content in the user's chosen language. (PRD Line 14)
*   **Database (Supabase PostgreSQL)**: Required for storing user profiles (via Auth system), produce listings, and potentially cached/managed market price reference data. (PRD Line 36, 47)
*   **Market Price Data Source**: An external or internal source for real-time or frequently updated local commodity prices is crucial. The specifics of this source (API, data feed) need to be determined and integrated. (PRD Line 18, 29)
*   **UI Framework & Styling (Next.js, Tailwind CSS)**: The feature's UI will be built using these technologies. (PRD Line 39, 42)
*   **Core Application Navigation**: Users need to be able to navigate to the "Marketplace" and "Market Prices" sections from the main application navigation.

## 11. Acceptance Criteria

*   **AC01**: A logged-in farmer can access a "Create Listing" form, fill in valid details (crop type, quantity, price) in their selected language, and submit the form. Upon successful submission, a confirmation message (in their language) is shown, and the new listing appears in the "Marketplace" view and is stored in Supabase.
*   **AC02**: Any user can navigate to the "Marketplace" section and view a list of active produce listings, with key details (crop, quantity, price) clearly displayed in their selected language.
*   **AC03**: Users can filter the marketplace listings by at least "crop type" using controls presented in their selected language. Filtered results update correctly.
*   **AC04**: Users can navigate to a "Market Prices" section, select a crop (and market location, if applicable) using an interface in their selected language, and the system displays the latest available market price for that selection, with all labels and data presented in their language.
*   **AC05**: If a farmer attempts to submit a listing form with invalid or missing data, appropriate error messages are displayed in their selected language, guiding them to correct the input.
*   **AC06**: The display of listings and market prices is responsive and usable across common device screen sizes (desktop, tablet, mobile).
*   **AC07**: All text elements within the Marketplace & Price Discovery feature (labels, buttons, messages, displayed data) correctly reflect the user's chosen language setting.