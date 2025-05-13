# High-Level Architecture: Provide Feedback Module

## 1. Overview
This document outlines the high-level architecture for the "Provide Feedback" module of the AgriConnect application. This module enables users to submit feedback about the application, which will be used for continuous improvement. The design adheres to the specifications outlined in [`docs/specs/Provide_Feedback_overview.md`](docs/specs/Provide_Feedback_overview.md) and leverages the existing project technology stack: Next.js, Tailwind CSS, Clerk/NextAuth for authentication, and Supabase for the database.

## 2. Key Components
The "Provide Feedback" module will consist of the following key components:

*   **Feedback UI Component (React/Next.js)**: A client-side React component, built with Next.js and styled with Tailwind CSS, that renders the feedback form. This component will be responsible for capturing user input (textual comments, optional rating) and handling form submission. It will utilize `next-intl` for localization of all UI text.
*   **Feedback API Route (Next.js)**: A server-side API route (e.g., `pages/api/feedback.ts`) within the Next.js application. This route will handle `POST` requests from the Feedback UI Component. Its responsibilities include:
    *   Receiving feedback data.
    *   Performing input validation.
    *   Retrieving `user_id` if the user is authenticated (via Clerk/NextAuth).
    *   Retrieving the current `language_code` from the user's session or request.
    *   Interacting with the Supabase client to store the feedback data.
    *   Returning appropriate success or error responses.
*   **Supabase `user_feedback` Table (PostgreSQL)**: A table in the Supabase PostgreSQL database dedicated to storing all submitted feedback.

## 3. Interactions and Data Flow

### 3.1. User Accessing and Submitting Feedback
1.  **Access**: The user accesses the feedback form, likely through a persistent link/button (e.g., in the footer or a user menu). This action renders the **Feedback UI Component**.
2.  **Localization**: The **Feedback UI Component** uses `next-intl` to display all labels, placeholders, and button text in the user's currently selected language.
3.  **Input**: The user fills in the feedback form, providing textual comments and an optional rating (if implemented).
4.  **Submission**: The user clicks the "Submit" button. The **Feedback UI Component** initiates an asynchronous `POST` request to the **Feedback API Route** (`/api/feedback`) with the form data (comments, rating, current page context if captured).

### 3.2. Data Validation and Storage
1.  **API Reception**: The **Feedback API Route** receives the `POST` request.
2.  **Authentication Check**: The API route checks if the user is authenticated using Clerk/NextAuth. If authenticated, the `user_id` is retrieved.
3.  **Language Identification**: The API route identifies the `language_code` active during the submission (e.g., from `next-intl` context passed or re-derived).
4.  **Input Validation**: Server-side validation is performed on the received data (e.g., ensuring `feedback_text` is not empty, rating is within range if provided).
5.  **Data Preparation**: The API route prepares the data object for insertion into Supabase, including `feedback_text`, `rating` (nullable), `user_id` (nullable, but present for authenticated users as per MVP), `submitted_at` (generated server-side), `language_code_at_submission`, and optional `page_context`.
6.  **Database Interaction**: The API route uses the Supabase client library to insert a new record into the **`user_feedback` Table**.
7.  **Response**:
    *   On successful insertion, the API route returns a success response (e.g., HTTP 201 Created) to the **Feedback UI Component**.
    *   On failure (validation error, database error), it returns an appropriate error response (e.g., HTTP 400 Bad Request, HTTP 500 Internal Server Error).
8.  **UI Confirmation**: The **Feedback UI Component** receives the response.
    *   On success, it displays a confirmation message to the user in their selected language (e.g., "Thank you for your feedback!").
    *   On error, it may display an error message.

### 3.3. Data Flow Diagram (Conceptual)
```
[User] --1. Access & Input--> [Feedback UI Component (Next.js Frontend)]
   |                                      |
   |                                      | 2. POST /api/feedback (JSON: {text, rating?, page_context?})
   |                                      V
   |                             [Feedback API Route (Next.js Backend)]
   |                                      |
   |                                      | 3. Validate Data, Get user_id (Clerk), Get lang_code
   |                                      V
   |                             [Supabase Client]
   |                                      |
   |                                      | 4. INSERT INTO user_feedback
   |                                      V
   |                             [Supabase `user_feedback` Table]
   |                                      |
   |                                      | 5. Success/Error
   |                                      V
   |                             [Feedback API Route (Next.js Backend)]
   |                                      |
   |                                      | 6. HTTP Response (201 / 4xx / 5xx)
   |                                      V
[User] <--7. Display Confirmation/Error-- [Feedback UI Component (Next.js Frontend)]
```

## 4. Data Models (Supabase)
A single table, `user_feedback`, will be created in the Supabase (PostgreSQL) database.

**Table: `user_feedback`**

| Column Name                 | Data Type                     | Constraints & Notes                                                                 |
|-----------------------------|-------------------------------|-------------------------------------------------------------------------------------|
| `feedback_id`               | `UUID`                        | Primary Key, Default: `gen_random_uuid()`                                           |
| `user_id`                   | `UUID`                        | Foreign Key referencing `auth.users(id)` (or relevant users table). Nullable (though MVP implies authenticated users, future might allow anonymous). |
| `feedback_text`             | `TEXT`                        | Not Null. Stores the textual feedback.                                              |
| `rating`                    | `SMALLINT`                    | Nullable. Stores quantitative rating (e.g., 1-5). Check constraint: `rating >= 1 AND rating <= 5`. |
| `submitted_at`              | `TIMESTAMPTZ`                 | Not Null, Default: `now()`. Timestamp of submission.                                |
| `language_code_at_submission` | `VARCHAR(10)`               | Not Null. Stores the language code (e.g., 'en', 'hi') of the UI at submission time. |
| `page_context`              | `TEXT`                        | Nullable. Optional: URL or identifier of the page from which feedback was submitted. |
| `user_agent`                | `TEXT`                        | Nullable. Optional: User's browser/device agent string for context.                 |
| `reviewed_by_admin_id`      | `UUID`                        | Nullable. Foreign Key referencing an admin users table (if applicable for tracking review status). |
| `review_notes`              | `TEXT`                        | Nullable. Notes added by an admin during review.                                    |
| `status`                    | `VARCHAR(50)`                 | Nullable. E.g., 'new', 'under_review', 'resolved', 'archived'. Default: 'new'.      |

*Indexes:*
*   Primary key on `feedback_id`.
*   Index on `user_id` (if frequently queried by user).
*   Index on `submitted_at`.
*   Index on `status`.

## 5. API Design (Internal)
A single API endpoint will be created within the Next.js application.

*   **Endpoint**: `POST /api/feedback`
*   **Method**: `POST`
*   **Description**: Submits new feedback from a user.
*   **Request Body (JSON)**:
    ```json
    {
      "feedback_text": "string (required)",
      "rating": "integer (optional, 1-5)",
      "page_context": "string (optional)"
    }
    ```
*   **Authentication**: Leverages Clerk/NextAuth. The API route will extract `user_id` if the user is authenticated. Anonymous submissions are not planned for MVP but the `user_id` field in the database is nullable to support this future possibility.
*   **Responses**:
    *   `201 Created`: Feedback successfully submitted.
        ```json
        { "message": "Feedback submitted successfully." }
        ```
    *   `400 Bad Request`: Invalid input (e.g., missing `feedback_text`, invalid `rating`).
        ```json
        { "error": "Invalid input. Feedback text is required." }
        ```
    *   `401 Unauthorized`: User not authenticated (if strict authentication is enforced and anonymous is disallowed).
    *   `403 Forbidden`: User authenticated but not authorized (not typically applicable for feedback submission).
    *   `500 Internal Server Error`: Unexpected server-side error.
        ```json
        { "error": "An unexpected error occurred." }
        ```

## 6. Security Considerations
*   **Input Validation**:
    *   **Client-side**: Basic validation in the **Feedback UI Component** for better UX (e.g., required fields).
    *   **Server-side**: Robust validation in the **Feedback API Route** is crucial. This includes checking for required fields, data types, length limits (e.g., for `feedback_text` to prevent abuse), and range for `rating`.
*   **Data Protection**:
    *   Feedback data, especially if it contains `user_id`, should be protected. Supabase Row Level Security (RLS) policies should be configured for the `user_feedback` table.
        *   Admins should have read access to all feedback.
        *   Regular users should not have direct read access to this table via the client-side Supabase SDK (all interactions via the secure API route).
    *   Consider if feedback text could contain PII. While users are discouraged, the system should treat all feedback text as potentially sensitive.
*   **Rate Limiting**: Consider implementing rate limiting on the `/api/feedback` endpoint to prevent abuse (e.g., spam submissions). This can be done at the Next.js middleware level or using a service.
*   **Cross-Site Scripting (XSS)**: Ensure that feedback text is properly sanitized if it's ever displayed back in an admin interface (though displaying it to users is out of MVP scope). Storing raw input is generally fine, but rendering requires care. Next.js/React inherently provide some XSS protection when rendering data.
*   **SQL Injection**: Using the Supabase client library with parameterized queries (which it does by default) mitigates SQL injection risks.
*   **Authentication Context**: Ensure `user_id` is reliably obtained from the authenticated session (Clerk/NextAuth) and not from user-supplied data in the request body.

## 7. Localization
*   **UI Localization**: The **Feedback UI Component** will use the `next-intl` library, consistent with the rest of the AgriConnect application, to render all user-facing strings (labels, placeholders, buttons, confirmation/error messages) in the user's selected language.
*   **Language of Submission**: The `language_code_at_submission` field in the `user_feedback` table will store the language context in which the feedback was submitted. This is important for administrators to understand the feedback in its original linguistic context. The **Feedback API Route** will be responsible for capturing this, likely from the `next-intl` context available server-side or passed from the client.

## 8. Admin Review Support
While a full admin interface for reviewing feedback is out of scope for this module's MVP architecture, the data model for `user_feedback` is designed to support this future capability:
*   The `user_feedback` table includes fields like `reviewed_by_admin_id`, `review_notes`, and `status`.
*   Administrators would require a separate interface (future feature) to query, view, and update these fields in the `user_feedback` table.
*   Supabase RLS policies will be critical to ensure only authorized administrators can access and manage feedback data.

## 9. Scalability and Performance
*   The chosen stack (Next.js on Vercel, Supabase) is inherently scalable.
*   The feedback submission process is a relatively low-frequency operation for individual users.
*   Database indexing on `user_feedback` table (e.g., on `submitted_at`, `status`, `user_id`) will be important for efficient querying by admins as data grows.
*   The API route should be lightweight and efficient.
*   The Feedback UI component should be optimized for fast loading, especially on mobile devices with potentially slower connections, by keeping it simple and minimizing large assets.

## 10. Dependencies
*   **User Authentication & Language Selection Module**: Relies on the existing authentication (Clerk/NextAuth) to identify users and the language selection mechanism (`next-intl`) for UI localization.
*   **Next.js**: Framework for UI and API route.
*   **React**: Library for building the UI component.
*   **Tailwind CSS**: For styling the UI component.
*   **Supabase**: PostgreSQL database and client library for data storage.
*   **`next-intl`**: For internationalization.