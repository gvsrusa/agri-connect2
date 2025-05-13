# High-Level Architecture: Transport Connections Module

## 1. Introduction

This document outlines the high-level architecture for the **Transport Connections** module of the AgriConnect project. The primary goal of this module is to facilitate connections between farmers needing to transport their produce and local transport providers.

This architecture is based on the requirements detailed in the following documents:
*   **Feature Overview Specification**: [`docs/specs/Transport_Connections_overview.md`](docs/specs/Transport_Connections_overview.md)
*   **Project Requirements Document (PRD)**: [`docs/PRD.md`](docs/PRD.md)

The technology stack for this module, consistent with the overall project, includes:
*   **Frontend Framework**: Next.js (with React)
*   **Styling**: Tailwind CSS
*   **Authentication**: Clerk or NextAuth (as per project choice)
*   **Database & Backend Services**: Supabase (PostgreSQL)

## 2. Architectural Goals

The design of the Transport Connections module aims to achieve the following:
*   **Modularity**: Components are designed to be distinct and maintainable, allowing for easier development and future enhancements.
*   **Security**: Prioritizing the protection of user data, especially personal contact information, through robust authentication, authorization, and data handling practices.
*   **Scalability**: Ensuring the system can handle a growing number of users, transport requests, and transporter listings.
*   **Maintainability**: Code and components will be structured logically and documented to simplify updates and extensions.
*   **Usability & Accessibility**: Adhering to NFRs for ease of use and accessibility for all users.
*   **Localization**: Full support for multiple languages across all user-facing elements.

## 3. Key Components

The module will be composed of frontend UI components, backend API logic, and database tables.

### 3.1. Frontend (Next.js/React Components)

*   **`TransportRequestForm.tsx`**:
    *   A React component allowing authenticated farmers to submit new transport requests.
    *   Includes fields for produce type, quantity, pickup location, desired date, etc., as specified in [`docs/specs/Transport_Connections_overview.md#L44`](docs/specs/Transport_Connections_overview.md:44).
    *   Performs client-side validation and interacts with the backend API for submission.
    *   Displays localized labels, placeholders, and messages.
*   **`TransportRequestListAdminView.tsx`**:
    *   A React component for administrators to view submitted transport requests.
    *   Displays request details fetched from the backend.
    *   May include basic filtering or sorting capabilities for admin convenience.
*   **`TransporterDirectoryList.tsx`**:
    *   A React component for users (primarily farmers) to browse a list of admin-vetted transporters.
    *   Displays key transporter information (name, contact, service area).
    *   Provides easily accessible contact details (e.g., `tel:` links for phone numbers).
    *   Displays localized content.
*   **`AdminTransporterManagementPanel.tsx`**:
    *   A dedicated UI section (likely part of a broader admin dashboard) for administrators to perform CRUD (Create, Read, Update, Delete) operations on transporter listings.
    *   Includes forms for adding/editing transporter details and a list view with management actions.

### 3.2. Backend (Next.js API Routes / Server Components)

Next.js API routes will handle the business logic and data interactions.

*   **`pages/api/transport/requests.ts`**:
    *   `POST`: Handles submission of new transport requests from `TransportRequestForm.tsx`.
        *   Requires farmer authentication.
        *   Performs server-side validation of input data.
        *   Saves the request to the `transport_requests` table in Supabase.
    *   `GET`: Fetches transport requests, primarily for the `TransportRequestListAdminView.tsx`.
        *   Requires admin authentication.
        *   Retrieves data from the `transport_requests` table.
*   **`pages/api/transport/transporters.ts`**:
    *   `GET`: Fetches the list of active, admin-vetted transporters for public display in `TransporterDirectoryList.tsx`.
        *   No authentication required for this read-only public endpoint.
        *   Retrieves data from the `transporters` table where `is_active = true`.
*   **`pages/api/admin/transport/transporters.ts`** (and `pages/api/admin/transport/transporters/[id].ts`):
    *   `POST`: Creates a new transporter listing (Admin only).
    *   `PUT /:transporterId`: Updates an existing transporter listing (Admin only).
    *   `DELETE /:transporterId`: Deactivates (soft delete by setting `is_active = false`) or deletes a transporter listing (Admin only).
        *   Requires admin authentication for all operations.

### 3.3. Database (Supabase - PostgreSQL)

Two primary tables will be used in Supabase:

*   **`transport_requests`**: Stores details of transport requests submitted by farmers.
*   **`transporters`**: Stores details of transport providers, managed by administrators for MVP.

## 4. Interactions and Data Flow

### 4.1. Farmer Submitting a Transport Request
1.  **Farmer (Authenticated)**: Accesses the "Request Transport" page.
2.  **UI (`TransportRequestForm.tsx`)**: Farmer fills in the form. Client-side validation occurs.
3.  **API Call**: On submit, a `POST` request is made to `/api/transport/requests` with form data.
4.  **Backend (API Route)**:
    *   Verifies farmer's authentication status.
    *   Performs server-side validation.
    *   If valid, inserts a new record into the `transport_requests` table in Supabase, associating it with `farmer_user_id`.
5.  **Response**: API returns a success or error message.
6.  **UI**: Displays confirmation or error to the farmer.

### 4.2. Admin Viewing Transport Requests
1.  **Admin (Authenticated)**: Accesses the transport request management page.
2.  **UI (`TransportRequestListAdminView.tsx`)**: Makes a `GET` request to `/api/transport/requests`.
3.  **Backend (API Route)**:
    *   Verifies admin's authentication and authorization.
    *   Queries the `transport_requests` table in Supabase.
4.  **Response**: API returns the list of requests.
5.  **UI**: Displays the requests to the admin.

### 4.3. User Browsing Transporter Directory
1.  **User (Farmer/Visitor)**: Accesses the "Browse Transporters" page.
2.  **UI (`TransporterDirectoryList.tsx`)**: Makes a `GET` request to `/api/transport/transporters`.
3.  **Backend (API Route)**: Queries the `transporters` table in Supabase for records where `is_active = true`.
4.  **Response**: API returns the list of active transporters.
5.  **UI**: Displays the transporter directory.

### 4.4. Admin Managing Transporters
1.  **Admin (Authenticated)**: Accesses the transporter management panel.
2.  **UI (`AdminTransporterManagementPanel.tsx`)**: Admin performs actions (add, edit, deactivate).
3.  **API Call**: UI makes appropriate `POST`, `PUT`, or `DELETE` requests to `/api/admin/transport/transporters` or `/api/admin/transport/transporters/[id]`.
4.  **Backend (API Route)**:
    *   Verifies admin's authentication and authorization.
    *   Performs the requested CRUD operation on the `transporters` table in Supabase.
5.  **Response**: API returns success or error.
6.  **UI**: Updates the display and provides feedback to the admin.

## 5. Data Models (Supabase)

Schema details are derived from [`docs/specs/Transport_Connections_overview.md#L44`](docs/specs/Transport_Connections_overview.md:44).

### 5.1. `transport_requests` Table
```sql
CREATE TABLE transport_requests (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_user_id UUID NOT NULL REFERENCES auth.users(id), -- Assuming Clerk/NextAuth syncs users to an 'auth.users' table or similar
    produce_type TEXT NOT NULL,
    quantity TEXT NOT NULL,
    pickup_location_description TEXT NOT NULL,
    pickup_latitude NUMERIC,
    pickup_longitude NUMERIC,
    destination_description TEXT, -- Optional for MVP
    desired_transport_date DATE NOT NULL,
    contact_preference TEXT DEFAULT 'Phone', -- Or based on farmer's profile
    request_status TEXT NOT NULL DEFAULT 'Open', -- e.g., ENUM('Open', 'Fulfilled', 'Cancelled')
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_transport_requests_farmer_user_id ON transport_requests(farmer_user_id);
CREATE INDEX idx_transport_requests_desired_transport_date ON transport_requests(desired_transport_date);
CREATE INDEX idx_transport_requests_status ON transport_requests(request_status);
```

### 5.2. `transporters` Table
```sql
CREATE TABLE transporters (
    transporter_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT,
    service_areas_description TEXT NOT NULL,
    vehicle_types TEXT[], -- Array of text, e.g., ARRAY['Small Truck', 'Tractor-Trolley']
    vehicle_capacity_description TEXT,
    service_description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_transporters_is_active ON transporters(is_active);
-- Consider GIN index for service_areas_description if text search is needed later
-- CREATE INDEX idx_transporters_service_areas_gin ON transporters USING GIN (to_tsvector('simple', service_areas_description));
```
*Note: `auth.users(id)` is a placeholder; the actual reference will depend on the User Authentication module's Supabase integration.*

## 6. API Design (Internal - Next.js)

API contracts define the interface between frontend and backend.

### 6.1. `/api/transport/requests`
*   **`POST`** (Submit new request)
    *   **Authentication**: Required (Farmer role).
    *   **Request Body**: JSON object matching fields in `TransportRequestForm.tsx`.
        ```json
        {
          "produce_type": "Tomatoes",
          "quantity": "50 kg",
          "pickup_location_description": "Near Ram's shop, Anaj Mandi Road, Village X",
          "pickup_latitude": null,
          "pickup_longitude": null,
          "destination_description": null,
          "desired_transport_date": "2025-06-15",
          "contact_preference": "Phone"
        }
        ```
    *   **Response**:
        *   `201 Created`: `{ "request_id": "uuid", ...other_request_details }`
        *   `400 Bad Request`: Validation errors.
        *   `401 Unauthorized`: Not authenticated.
        *   `403 Forbidden`: Not authorized (e.g., not a farmer).
        *   `500 Internal Server Error`.
*   **`GET`** (Fetch requests - Admin)
    *   **Authentication**: Required (Admin role).
    *   **Query Parameters**: `?status=Open&page=1&limit=10&sortBy=created_at&order=desc`
    *   **Response**:
        *   `200 OK`: `{ "data": [request1, request2, ...], "pagination": { "total": 100, "page": 1, "limit": 10 } }`
        *   `401 Unauthorized` / `403 Forbidden`.

### 6.2. `/api/transport/transporters`
*   **`GET`** (Fetch active transporters - Public)
    *   **Authentication**: None.
    *   **Query Parameters**: `?page=1&limit=20` (future: `?area_search=query`)
    *   **Response**:
        *   `200 OK`: `{ "data": [transporter1, transporter2, ...], "pagination": { ... } }`

### 6.3. `/api/admin/transport/transporters`
*   **`POST`** (Create transporter - Admin)
    *   **Authentication**: Required (Admin role).
    *   **Request Body**: JSON object with transporter details.
    *   **Response**: `201 Created` with new transporter details.
*   **`PUT /api/admin/transport/transporters/:transporterId`** (Update transporter - Admin)
    *   **Authentication**: Required (Admin role).
    *   **Request Body**: JSON object with fields to update.
    *   **Response**: `200 OK` with updated transporter details.
*   **`DELETE /api/admin/transport/transporters/:transporterId`** (Deactivate transporter - Admin)
    *   **Authentication**: Required (Admin role).
    *   **Action**: Sets `is_active = false`.
    *   **Response**: `200 OK` or `204 No Content`.

## 7. Security Considerations

*   **Authentication & Authorization**:
    *   Leverage Clerk/NextAuth for robust user authentication.
    *   Implement role-based access control (RBAC) within Next.js API routes. Middleware can check user roles (e.g., 'farmer', 'admin') before allowing access to specific endpoints or actions.
*   **Supabase Row Level Security (RLS)**:
    *   **`transport_requests` table**:
        *   Farmers can `INSERT` new requests.
        *   Farmers can `SELECT`, `UPDATE` (e.g., status to 'Cancelled'), `DELETE` their *own* requests. (Update/Delete might be post-MVP for farmers).
        *   Admins can `SELECT` all requests.
        *   Example RLS policy for farmer select: `(auth.uid() = farmer_user_id)`
    *   **`transporters` table**:
        *   Public can `SELECT` records where `is_active = true`.
        *   Admins have full `SELECT`, `INSERT`, `UPDATE`, `DELETE` privileges.
*   **Input Validation**:
    *   **Client-Side**: For immediate feedback in forms (e.g., using libraries like Formik/Yup or React Hook Form with Zod).
    *   **Server-Side**: Crucial validation in all API routes using libraries like Zod to ensure data integrity and prevent malicious inputs before database interaction.
*   **Data Privacy**:
    *   Farmer PII in `transport_requests` (contact details, precise locations if captured) should only be accessible to authorized admins.
    *   Transporter contact information is public by design for MVP.
*   **Admin Interface Security**:
    *   Ensure the admin panel itself is protected by strong authentication and authorization.
    *   Consider audit logging for critical admin actions (post-MVP).
*   **CSRF Protection**: Next.js API routes generally offer protection when used with standard patterns (e.g., non-GET requests with JSON bodies).
*   **Rate Limiting**: Consider for API endpoints, especially `POST /api/transport/requests` and public `GET /api/transport/transporters`, to prevent abuse (can be implemented at the Next.js middleware level or via a gateway).

## 8. Scalability & Performance

*   **Database (Supabase)**:
    *   Utilize appropriate indexing on tables as defined (e.g., on `farmer_user_id`, `desired_transport_date`, `request_status` for `transport_requests`; `is_active` for `transporters`).
    *   Supabase handles connection pooling and underlying database scaling.
    *   For high-read scenarios on the transporter list, Next.js Incremental Static Regeneration (ISR) or server-side caching strategies can be employed for the `/api/transport/transporters` endpoint or the page displaying it.
*   **API (Next.js)**:
    *   Next.js serverless functions (API routes) scale well for typical loads.
    *   Ensure database queries are optimized (e.g., select only necessary fields).
    *   Implement pagination for all list-based API responses.
*   **Frontend (Next.js/React)**:
    *   Leverage Next.js features like code splitting and dynamic imports.
    *   Optimize React component rendering (e.g., `React.memo`, `useCallback`, `useMemo`).
    *   Lazy load images and non-critical UI elements.

## 9. Localization

The module must support multilingual display as per [`docs/PRD.md#L14`](docs/PRD.md:14) and [`docs/specs/Transport_Connections_overview.md#FR-TC06`](docs/specs/Transport_Connections_overview.md:30).

*   **UI Text**:
    *   Use a dedicated i18n library (e.g., `next-intl`, `react-i18next`) integrated with Next.js.
    *   Store translation strings in structured files (e.g., JSON) per language for all static UI elements (labels, buttons, messages, placeholders).
*   **Dynamic Data**:
    *   **User-Entered Text**: Fields like `produce_type`, `pickup_location_description`, `service_areas_description` will be stored and displayed in the language they were entered. No automatic translation for MVP.
    *   **Predefined Lists/Enums**: If fields like `produce_type` or `vehicle_types` evolve to use predefined, system-managed lists, these lists should have translatable labels. For MVP, `produce_type` is free text. `vehicle_types` is a text array.
*   **Data Formatting**: Dates, numbers, and quantities should be formatted according to the user's locale and language preference, leveraging browser APIs (Intl) or i18n library capabilities.
*   **Language Context**: The application's global language selection mechanism must provide the current language context to all components and potentially to API routes if language-specific data fetching logic were ever needed (not anticipated for MVP).

## 10. Deployment Considerations

*   **Frontend & API**: Deployed on Vercel, leveraging its Next.js optimizations and serverless function capabilities.
*   **Database**: Supabase cloud platform handles database provisioning, backups, and maintenance.
*   **Environment Variables**: Securely manage API keys, database connection strings, and other sensitive configuration using Vercel environment variables and Supabase settings.

## 11. Future Considerations (Post-MVP)

This architecture provides a foundation for future enhancements, including:
*   Direct transporter accounts for self-management of listings and viewing/bidding on requests.
*   Notifications system (e.g., for new requests relevant to transporters).
*   Rating and review system for farmers and transporters.
*   Integration with mapping services for precise location input/display.
*   Advanced search and filtering capabilities for requests and transporters.
*   Direct booking and status tracking within the platform.