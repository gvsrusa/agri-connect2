# High-Level Architecture: Marketplace & Price Discovery

## 1. Overview

This document outlines the high-level architecture for the Marketplace & Price Discovery module of the AgriConnect application. This module enables farmers to list their produce for sale, browse listings, and check local market prices. It is built using Next.js, Tailwind CSS, and Supabase, and relies on the User Authentication & Language Selection module.

## 2. Key Components

The module comprises the following key components:

*   **Frontend (Next.js/React Components)**:
    *   `ProduceListingForm`: Component for creating and editing produce listings.
    *   `MarketplaceView`: Component for displaying, searching, and filtering produce listings.
    *   `PriceCheckView`: Component for looking up market prices.
    *   Shared UI elements (e.g., input fields, buttons, cards) styled with Tailwind CSS.
*   **Backend (Next.js API Routes / Server Components)**:
    *   API routes for CRUD operations on produce listings.
    *   API routes/server components for fetching and filtering marketplace listings.
    *   API routes/server components for fetching market price data.
    *   Server-side logic for data validation and interaction with Supabase.
*   **Database (Supabase - PostgreSQL)**:
    *   `produce_listings` table: Stores details of produce listed by farmers.
    *   `market_prices` table: Stores (or caches) market price data for various commodities.
    *   `crops` table: Stores a predefined list of supported crop types for consistency and localization.
    *   `market_locations` table: Stores a predefined list of market locations for price lookups.

## 3. Interactions & Data Flow

### 3.1. Creating a New Produce Listing

1.  **User Interaction (UI)**: Authenticated farmer navigates to the "Create Listing" page and fills out the `ProduceListingForm` (crop type, quantity, unit, price).
2.  **Client-Side Validation (UI)**: Basic validation (e.g., required fields, numeric inputs) is performed in the browser.
3.  **API Request (Frontend to Backend)**: On submission, the frontend sends a POST request (e.g., `/api/marketplace/listings`) with the listing data to a Next.js API route. The user's authentication token is included.
4.  **Server-Side Validation (Backend)**: The API route validates the incoming data thoroughly (e.g., data types, constraints, ensuring crop type is valid).
5.  **Database Interaction (Backend to Supabase)**: If validation passes, the API route constructs a new record and inserts it into the `produce_listings` table in Supabase, associating it with the authenticated `user_id`.
6.  **API Response (Backend to Frontend)**: The API route returns a success or error response to the frontend.
7.  **UI Update**: The frontend displays a success/error message and may redirect the user (e.g., to their listings or the marketplace).

### 3.2. Browsing/Searching/Filtering Marketplace Listings

1.  **User Interaction (UI)**: User navigates to the `MarketplaceView`. They can view all listings, or apply search terms (e.g., crop name fragment) and filters (e.g., crop type from a dropdown).
2.  **API Request (Frontend to Backend)**: The `MarketplaceView` component (potentially a Server Component or using `useEffect` for client-side fetching) requests listing data from a Next.js API route (e.g., `/api/marketplace/listings?crop_id=X&page=1`).
3.  **Database Query (Backend to Supabase)**: The API route constructs a Supabase query based on the search/filter parameters to fetch relevant records from the `produce_listings` table. This query will join with the `crops` table for localized crop names if necessary. Pagination will be implemented.
4.  **API Response (Backend to Frontend)**: The API route returns the fetched listings (and pagination info) to the frontend.
5.  **UI Update (UI)**: The `MarketplaceView` renders the listings.

### 3.3. Fetching and Displaying Market Prices

**MVP Approach (Manually Updated/Less Real-time):**

1.  **User Interaction (UI)**: User navigates to the `PriceCheckView` and selects a crop type and market location from dropdowns.
2.  **API Request (Frontend to Backend)**: The frontend sends a GET request (e.g., `/api/marketplace/prices?crop_id=X&location_id=Y`) to a Next.js API route.
3.  **Database Query (Backend to Supabase)**: The API route queries the `market_prices` table in Supabase for the latest price matching the selected crop and location. This table is assumed to be populated manually or via a simple batch process for MVP.
4.  **API Response (Backend to Frontend)**: The API route returns the price data.
5.  **UI Update (UI)**: The `PriceCheckView` displays the fetched price.

**Future API Integration:**

1.  **Scheduled Job/Webhook (External to Backend)**: A scheduled job (e.g., using a Vercel Cron Job or a Supabase Edge Function triggered on a schedule) or a webhook from a third-party price data provider calls a dedicated Next.js API route (e.g., `/api/marketplace/prices/ingest`).
2.  **Data Ingestion & Standardization (Backend)**: This API route fetches data from the external API, standardizes it (maps crop names, units, locations to internal representations), and updates/inserts it into the `market_prices` table in Supabase.
3.  **User Interaction (UI)**: Same as MVP, but the `market_prices` table now contains more up-to-date, automatically ingested data.
    *   Alternatively, for very real-time needs (if feasible and cost-effective), the `/api/marketplace/prices` route could directly call the external API, potentially with caching at the Next.js API layer or Supabase level to reduce external calls. This adds complexity and dependency.

## 4. Data Models (Supabase)

### 4.1. `users` (Managed by Clerk/NextAuth, referenced here)
    *   `id` (UUID, Primary Key) - Provided by Auth system
    *   Other auth-specific fields.
    *   (Application-specific user profile data like preferred language might be in a separate `user_profiles` table linked to this `id`).

### 4.2. `crops`
    *   `id` (SERIAL, Primary Key)
    *   `name_key` (TEXT, UNIQUE, NOT NULL) - e.g., "wheat", "tomato". Used for programmatic reference and as a key for localization strings.
    *   `default_name` (TEXT, NOT NULL) - Default name in a base language (e.g., English).
    *   `created_at` (TIMESTAMPTZ, default `now()`)
    *   *Note: Localized names will be handled via the application's localization system, using `name_key`.*

### 4.3. `market_locations`
    *   `id` (SERIAL, Primary Key)
    *   `name_key` (TEXT, UNIQUE, NOT NULL) - e.g., "delhi_azadpur_mandi", "mumbai_vashi_apmc".
    *   `default_name` (TEXT, NOT NULL) - Default name in a base language.
    *   `region` (TEXT, nullable) - e.g., "North India", "Maharashtra"
    *   `created_at` (TIMESTAMPTZ, default `now()`)
    *   *Note: Localized names will be handled via the application's localization system, using `name_key`.*

### 4.4. `produce_listings`
    *   `id` (UUID, Primary Key, default `gen_random_uuid()`)
    *   `user_id` (UUID, Foreign Key, REFERENCES `auth.users(id)` ON DELETE CASCADE, NOT NULL) - Links to the seller.
    *   `crop_id` (INTEGER, Foreign Key, REFERENCES `crops(id)` ON DELETE RESTRICT, NOT NULL)
    *   `quantity` (NUMERIC, NOT NULL, CHECK (`quantity` > 0))
    *   `quantity_unit` (TEXT, NOT NULL) - e.g., "kg", "quintal", "tonne".
    *   `price_per_unit` (NUMERIC, NOT NULL, CHECK (`price_per_unit` >= 0))
    *   `currency` (TEXT, NOT NULL, default 'INR') - e.g., "INR".
    *   `description` (TEXT, nullable) - Optional brief description by the farmer.
    *   `location_text` (TEXT, nullable) - Farmer-entered general location of produce (e.g., "Near Villupuram").
    *   `listing_timestamp` (TIMESTAMPTZ, default `now()`, NOT NULL)
    *   `updated_at` (TIMESTAMPTZ, default `now()`)
    *   `is_active` (BOOLEAN, default `true`, NOT NULL) - For soft deletes or marking as sold.
    *   `expires_at` (TIMESTAMPTZ, nullable) - Optional expiry for listings.

    **Indexes:**
    *   `idx_produce_listings_user_id` ON `user_id`
    *   `idx_produce_listings_crop_id` ON `crop_id`
    *   `idx_produce_listings_is_active_timestamp` ON `is_active`, `listing_timestamp` DESC (for marketplace view)
    *   Consider GIN/GIST index on `location_text` if free-text location search becomes important.
    *   Consider composite index on (`crop_id`, `is_active`, `listing_timestamp` DESC) for efficient filtering.

### 4.5. `market_prices`
    *   `id` (SERIAL, Primary Key)
    *   `crop_id` (INTEGER, Foreign Key, REFERENCES `crops(id)` ON DELETE CASCADE, NOT NULL)
    *   `market_location_id` (INTEGER, Foreign Key, REFERENCES `market_locations(id)` ON DELETE CASCADE, NOT NULL)
    *   `price` (NUMERIC, NOT NULL, CHECK (`price` >= 0))
    *   `price_unit` (TEXT, NOT NULL) - e.g., "per quintal", "per kg".
    *   `currency` (TEXT, NOT NULL, default 'INR')
    *   `price_timestamp` (TIMESTAMPTZ, NOT NULL) - When this price was recorded/fetched.
    *   `source_description` (TEXT, nullable) - e.g., "Agmarknet API", "Manual Update - Local Survey".
    *   `created_at` (TIMESTAMPTZ, default `now()`)

    **Indexes:**
    *   `idx_market_prices_crop_location_timestamp` ON `crop_id`, `market_location_id`, `price_timestamp` DESC (Unique constraint on (`crop_id`, `market_location_id`, `price_timestamp`) might be useful if we only want one price per timestamp, or use this index to fetch the latest).
    *   A unique constraint on (`crop_id`, `market_location_id`) if we only store the *latest* price and update it. If storing historical, then the timestamp is key. For MVP, storing latest and updating might be simpler.

## 5. API Design (Internal Next.js API Routes)

All API routes will be under `/api/marketplace/`. They will expect and return JSON. Authentication (user context) will be handled via Clerk/NextAuth middleware or helpers.

*   **Produce Listings:**
    *   `POST /api/marketplace/listings`: Create a new produce listing.
        *   Request Body: `{ crop_id, quantity, quantity_unit, price_per_unit, currency?, description?, location_text? }`
        *   Response: `{ id, ...listing_details }` or error.
    *   `GET /api/marketplace/listings`: Get a list of active produce listings (paginated, filterable).
        *   Query Params: `?crop_id=X&search=term&page=N&limit=M&user_id=Y` (for "my listings")
        *   Response: `{ data: [...listings], pagination: { total, page, limit, ... } }` or error.
    *   `GET /api/marketplace/listings/{listingId}`: Get details of a specific listing.
        *   Response: `{ ...listing_details }` or error.
    *   `PUT /api/marketplace/listings/{listingId}`: Update an existing listing (owned by the authenticated user).
        *   Request Body: Fields to update.
        *   Response: `{ ...updated_listing_details }` or error.
    *   `DELETE /api/marketplace/listings/{listingId}`: Deactivate/delete a listing (owned by the authenticated user).
        *   Response: Success/error message.

*   **Market Prices:**
    *   `GET /api/marketplace/prices`: Get market prices.
        *   Query Params: `?crop_id=X&location_id=Y`
        *   Response: `{ data: [...price_details] }` (could be an array if multiple sources/timestamps, or a single object for latest).
    *   `POST /api/marketplace/prices/ingest` (Internal/Admin/Scheduled Task): Endpoint for ingesting price data from external sources. Secured appropriately.
        *   Request Body: Depends on the data source format.
        *   Response: Success/error message.

*   **Supporting Data (e.g., for dropdowns):**
    *   `GET /api/marketplace/meta/crops`: Get list of supported crops.
        *   Response: `{ data: [{ id, name_key, default_name, localized_name_for_current_user }, ...] }`
    *   `GET /api/marketplace/meta/locations`: Get list of market locations.
        *   Response: `{ data: [{ id, name_key, default_name, localized_name_for_current_user }, ...] }`

## 6. Integration with External Price Data Sources

*   **MVP**: The `market_prices` table might be populated manually or via a simple script run periodically by an admin. The architecture allows for this via direct Supabase inserts or the `/api/marketplace/prices/ingest` endpoint.
*   **Future (API Integration)**:
    1.  **Identify Source(s)**: Select reliable public (e.g., Agmarknet, eNAM if APIs are available and usable) or private data providers.
    2.  **Ingestion Mechanism**:
        *   **Scheduled Pull**: A serverless function (e.g., Vercel Cron Job, Supabase Edge Function on a schedule) will run periodically (e.g., daily, hourly).
        *   This function will call the external price API.
        *   It will then transform/standardize the received data (map crop names, locations, units to internal `crop_id`, `market_location_id`).
        *   Finally, it will call the internal `/api/marketplace/prices/ingest` endpoint or directly update the `market_prices` table in Supabase.
    3.  **Data Caching**: The `market_prices` table itself acts as a cache.
    4.  **Error Handling & Monitoring**: Implement logging and alerts for failures in the ingestion process.
    5.  **Rate Limiting/API Keys**: Securely manage API keys for external services. Be mindful of rate limits.

## 7. Security Considerations

*   **Authentication**: All operations creating/modifying listings (`POST`, `PUT`, `DELETE /api/marketplace/listings/*`) will require user authentication via Clerk/NextAuth. The backend API routes will verify the user's session.
*   **Authorization (Supabase RLS)**:
    *   **`produce_listings` table**:
        *   Users can `SELECT` all `is_active = true` listings.
        *   Authenticated users can `INSERT` new listings (their `user_id` will be automatically set).
        *   Users can `UPDATE` or `DELETE` (or set `is_active = false`) only their own listings (i.e., where `auth.uid() = user_id`).
        *   RLS Policy Example for UPDATE: `CREATE POLICY "Users can update their own listings" ON produce_listings FOR UPDATE USING (auth.uid() = user_id);`
    *   **`market_prices`, `crops`, `market_locations` tables**:
        *   Generally, `SELECT` access for all authenticated users (or even public if price data is not sensitive).
        *   `INSERT`, `UPDATE`, `DELETE` restricted to admin roles or specific service roles (e.g., for the ingestion process).
*   **Input Validation**:
    *   **Client-Side**: Basic validation in forms for better UX.
    *   **Server-Side (API Routes)**: Crucial. All incoming data to API routes must be rigorously validated (data types, lengths, ranges, allowed values for enums/foreign keys like `crop_id`). Use libraries like Zod or Joi. This prevents malformed data and potential injection attacks.
*   **Data Privacy**: As per PRD, seller's personal contact details are not displayed on listings in MVP. The `user_id` in `produce_listings` is a UUID and doesn't directly expose PII.
*   **API Rate Limiting**: Consider rate limiting on API endpoints if abuse is a concern, especially for listing creation or price lookups. Vercel and Supabase offer some built-in protections.

## 8. Scalability & Performance

*   **Database**:
    *   **Indexing**: Proper indexing on Supabase tables (as defined in Data Models section) is critical for query performance, especially for filtering/sorting listings and looking up prices.
    *   **Connection Pooling**: Supabase handles connection pooling.
    *   **Read Replicas**: If read load becomes very high, Supabase offers read replicas (consider for future).
*   **API (Next.js)**:
    *   **Serverless Functions**: Next.js API routes on Vercel are serverless, scaling automatically with demand.
    *   **Caching**:
        *   Cache responses for frequently accessed, rarely changing data (e.g., list of crops, market locations) at the API layer or CDN.
        *   Consider caching strategies for market price data if direct external API calls are made frequently.
    *   **Efficient Queries**: Write optimized Supabase queries. Avoid N+1 problems. Use server components to fetch data server-side where appropriate to reduce client-server waterfalls.
*   **Frontend**:
    *   **Pagination/Infinite Scrolling**: For `MarketplaceView` to handle large numbers of listings without overwhelming the browser or backend.
    *   **Code Splitting**: Next.js handles this automatically, loading only necessary JavaScript.
    *   **Optimized Images**: If images are added to listings in the future.
*   **Listing Management**: The `is_active` flag allows for "soft deletion" and keeps the main query for active listings efficient. Periodically archive or hard-delete very old, inactive listings if necessary.

## 9. Localization

*   **Static UI Text**: Handled by the global localization system (e.g., `next-intl` or similar), using keys for labels, buttons, messages.
*   **Dynamic Data (Crop Names, Market Locations)**:
    *   The `crops` and `market_locations` tables store a `name_key` (e.g., "wheat", "delhi_azadpur_mandi").
    *   The localization files (e.g., `en.json`, `hi.json`) will contain entries for these keys:
        *   `en.json`: `{ "crops": { "wheat": "Wheat" }, "markets": { "delhi_azadpur_mandi": "Delhi Azadpur Mandi" } }`
        *   `hi.json`: `{ "crops": { "wheat": "गेहूँ" }, "markets": { "delhi_azadpur_mandi": "दिल्ली आज़ादपुर मंडी" } }`
    *   When fetching crop/location data, the backend can either:
        1.  Return the `name_key` and `default_name`, and the frontend uses the `name_key` with the i18n library to get the localized string.
        2.  The backend, aware of the user's current language (from session or request header), could join with a hypothetical `localized_strings` table or use a helper function to attach the correctly localized name before sending data to the client. Option 1 is generally cleaner and preferred with libraries like `next-intl`.
*   **User-Generated Content (e.g., `produce_listings.description`)**: This content will be stored as entered by the user in their language. It will not be automatically translated in MVP. Displaying it as-is is acceptable.
*   **Units (`quantity_unit`, `price_unit`)**: For MVP, these can be simple strings. If they need localization (e.g., "kg" vs "किलो"), they could also become keys in the localization files or a dedicated `units` table with localized versions. For simplicity, start with common abbreviations that might be understood across languages or use full words that are localized.

## 10. Dependencies

*   **User Authentication & Language Selection Module**: Essential for user identification and UI language.
*   **Supabase**: For database storage and RLS.
*   **Next.js/React/Tailwind CSS**: Core technology stack.
*   **Clerk/NextAuth**: For authentication.
*   **External Price Data Source(s)**: For market price information (specific source TBD for automated integration).