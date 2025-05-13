# Feature Overview Specification: Transport Connections

## 1. Feature Name
Transport Connections

## 2. Feature Goal
To facilitate connections between farmers needing to transport their produce to market and local transport providers, thereby improving market access for farmers.

## 3. User Stories
Derived from the AgriConnect User Blueprint ([`docs/PRD.md`](docs/PRD.md)):

*   **US-TC01**: As a farmer, I want to post a request for transport, specifying my produce type, quantity, pickup location, and desired transport date, so that available transporters can become aware of my need.
*   **US-TC02**: As a farmer, I want to browse a list of available transporters in my area, along with their contact information and service details (like vehicle type or capacity), so I can directly contact them to arrange transport.
*   **US-TC03**: As an administrator (managing transporter listings for MVP), I want to be able to add, view, and manage a list of vetted transport providers, including their contact details, service areas, and vehicle information.
*   **US-TC04**: As a transporter (viewing requests via admin or a future interface), I want to see transport requests posted by farmers, including produce details, quantity, location, and date, so I can identify potential jobs.
*   **US-TC05**: As any user (farmer, admin), I want all information, forms, and listings related to transport connections to be presented clearly in my preferred language.

## 4. Functional Requirements

*   **FR-TC01**: The system must provide a web form for authenticated farmers to submit a transport request.
    *   The form must capture: produce type, quantity, pickup location (e.g., address, village/district), desired transport date, and farmer's contact preference (as per their profile or specified).
    *   Form labels and instructions must be displayed in the user's selected language.
*   **FR-TC02**: The system must store submitted transport requests in the Supabase PostgreSQL database, linking them to the farmer's user ID.
*   **FR-TC03**: The system must provide an interface for administrators to view submitted transport requests. (For MVP, transporters do not directly view these in-app).
*   **FR-TC04**: The system must provide an interface for administrators to create, update, and manage a list of transport providers.
    *   Transporter details to include: name, contact information (phone number, possibly email), service area(s), vehicle type(s) and capacity, and a brief description of services.
*   **FR-TC05**: The system must display a list of available, admin-vetted transporters on a dedicated page accessible to users (farmers).
    *   The listing should show key details like transporter name, contact information, and service area.
    *   The transporter list page and details must be displayed in the user's selected language.
*   **FR-TC06**: All user interface elements (forms, buttons, labels, messages) related to the Transport Connections feature must be localized and displayed in the user's selected language, as per [`docs/PRD.md#L14`](docs/PRD.md:14).

## 5. Non-Functional Requirements

*   **NFR-TC01 (Usability)**: Forms for submitting transport requests must be simple, intuitive, and require minimal data entry. Transporter listings must be clear, easy to read, and scannable. (Ref: [`docs/PRD.md#L39`](docs/PRD.md:39))
*   **NFR-TC02 (Accessibility)**: The feature must adhere to general web accessibility guidelines, ensuring high-contrast text, keyboard navigability, and compatibility with assistive technologies. (Ref: [`docs/PRD.md#L48`](docs/PRD.md:48))
*   **NFR-TC03 (Reliability)**: Transport request data and transporter information must be accurately stored, retrieved, and displayed without corruption or loss.
*   **NFR-TC04 (Security)**: Personal contact information of farmers (in requests) and transporters (in listings) must be handled securely, respecting user privacy as outlined in [`docs/PRD.md#L49`](docs/PRD.md:49). Access to raw request data should be restricted.
*   **NFR-TC05 (Performance)**: Pages related to transport connections (request form, transporter listings) must load quickly and be responsive, even on lower bandwidth connections, as per the general application goals in [`docs/PRD.md#L3`](docs/PRD.md:3).
*   **NFR-TC06 (Localization)**: All textual content, including labels, messages, and data presentation, must be fully translatable and displayed correctly in all supported languages.
*   **NFR-TC07 (Maintainability)**: The code for managing transport requests and transporter listings should be modular and well-documented to facilitate future enhancements (e.g., direct transporter accounts).

## 6. Data Requirements

*   **Transport Request Data** (Ref: [`docs/PRD.md#L33`](docs/PRD.md:33)):
    *   `request_id` (Primary Key, UUID)
    *   `farmer_user_id` (Foreign Key to User profiles, UUID)
    *   `produce_type` (Text, e.g., "Tomatoes", "Wheat")
    *   `quantity` (Text, e.g., "50 kg", "2 quintals")
    *   `pickup_location_description` (Text, e.g., "Near Ram's shop, Anaj Mandi Road, Village X")
    *   `pickup_latitude` (Numeric, Optional)
    *   `pickup_longitude` (Numeric, Optional)
    *   `destination_description` (Text, Optional for MVP, e.g., "Main Market, City Y")
    *   `desired_transport_date` (Date)
    *   `contact_preference` (Text, e.g., "Phone", "Platform Message" - for future)
    *   `request_status` (Text, e.g., "Open", "Fulfilled", "Cancelled" - MVP defaults to "Open")
    *   `created_at` (Timestamp)
    *   `updated_at` (Timestamp)
*   **Transporter Data (Admin-Managed for MVP)** (Ref: [`docs/PRD.md#L32`](docs/PRD.md:32)):
    *   `transporter_id` (Primary Key, UUID)
    *   `name` (Text)
    *   `contact_phone` (Text)
    *   `contact_email` (Text, Optional)
    *   `service_areas_description` (Text, e.g., "Villages within 20km of Town A", "District B")
    *   `vehicle_types` (Text array or JSON, e.g., ["Small Truck (up to 1 ton)", "Tractor-Trolley"])
    *   `vehicle_capacity_description` (Text, Optional, e.g., "Up to 3 tons", "Max 10 quintals")
    *   `service_description` (Text, Optional, e.g., "Specializes in perishable goods")
    *   `is_active` (Boolean, for admin to enable/disable listing)
    *   `created_at` (Timestamp)
    *   `updated_at` (Timestamp)

## 7. UI/UX Considerations

*   **Transport Request Form**:
    *   Intuitive layout with clear labels in the user's selected language.
    *   Use appropriate input types (e.g., date picker for `desired_transport_date`).
    *   Provide clear instructions or examples for fields like `pickup_location_description`.
    *   Include client-side and server-side validation with user-friendly error messages.
    *   A clear "Submit Request" button.
    *   Confirmation message upon successful submission (e.g., "Your transport request has been posted.").
*   **Transporter Listings Page**:
    *   Display transporters in a clear, list-based format.
    *   Each entry should prominently show transporter name, contact information, and primary service area.
    *   Consider allowing basic filtering (e.g., by service area if data structure supports it) or sorting in future iterations. For MVP, a simple list is sufficient.
    *   Ensure contact details are easily accessible (e.g., clickable phone numbers `tel:` links).
*   **General**:
    *   Responsive design to ensure usability on various screen sizes (mobile, tablet, desktop).
    *   Consistent styling with the rest of the AgriConnect application (Tailwind CSS).
    *   Easy navigation to and from the Transport Connections feature.
    *   All UI elements must respect the selected language.

## 8. Acceptance Criteria

*   **AC-TC01**: A logged-in farmer can successfully navigate to the "Request Transportation" form.
*   **AC-TC02**: The farmer can fill in all mandatory fields (produce type, quantity, pickup location, desired date) in the transport request form and submit it.
*   **AC-TC03**: Upon successful submission, the transport request is saved to the database with the correct farmer association and details.
*   **AC-TC04**: An administrator can view a list of submitted transport requests with all relevant details.
*   **AC-TC05**: An administrator can add a new transporter with their details (name, contact, service area, vehicle info) into the system.
*   **AC-TC06**: An administrator can update or deactivate existing transporter listings.
*   **AC-TC07**: A user (farmer) can navigate to the "Browse Transporters" page and view a list of active, admin-entered transporters.
*   **AC-TC08**: The transporter list displays at least the transporter's name, contact information, and service area.
*   **AC-TC09**: All forms, labels, buttons, and displayed information within the Transport Connections feature are correctly shown in the user's selected language (e.g., Hindi, English).

## 9. Scope (MVP)

*   **In Scope for MVP**:
    *   Farmers can post transport requests through a web form ([`docs/PRD.md#L21`](docs/PRD.md:21)).
    *   Users (farmers) can view a list of transporters with their contact details ([`docs/PRD.md#L22`](docs/PRD.md:22)).
    *   Transporter information is pre-vetted and entered/managed by system administrators.
    *   The feature is available in multiple languages, consistent with the overall application.
    *   Basic storage and display of transport requests for admin review.
*   **Out of Scope for MVP** (Potential Future Enhancements, Ref: [`docs/PRD.md#L51`](docs/PRD.md:51)):
    *   Direct booking, scheduling, or confirmation of transport services through the platform.
    *   Payment processing or integration for transport services.
    *   Real-time GPS tracking of transporters or goods.
    *   Transporter user accounts for them to manage their own listings, view, or bid on requests directly.
    *   Rating or review systems for farmers or transporters.
    *   Automated matching algorithms between farmer requests and transporters.
    *   Notifications to transporters about new requests.

## 10. Dependencies

*   **User Authentication**: Users (farmers) must be authenticated ([`docs/PRD.md#L15`](docs/PRD.md:15), [`docs/PRD.md#L46`](docs/PRD.md:46)) to post transport requests. Relies on Clerk/NextAuth.
*   **Language Selection**: The feature must integrate with the application's language selection mechanism to display content in the user's preferred language ([`docs/PRD.md#L14`](docs/PRD.md:14)).
*   **Admin Interface**: An administrative interface is required for managing transporter listings and viewing transport requests.
*   **Database**: Supabase PostgreSQL is used for storing transport requests and transporter data ([`docs/PRD.md#L47`](docs/PRD.md:47)).