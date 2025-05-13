# High-Level Architecture: Crop Advisory & Post-Harvest Guidance

## 1. Introduction

This document outlines the high-level architecture for the **Crop Advisory & Post-Harvest Guidance** module of the AgriConnect application. This module aims to provide farmers with accessible, practical, and localized information on crop management and post-harvest best practices.

This architectural design is based on the requirements and context provided in:
*   User Blueprint (PRD): [`docs/PRD.md`](docs/PRD.md)
*   Feature Overview Specification: [`docs/specs/Crop_Advisory_Post-Harvest_Guidance_overview.md`](docs/specs/Crop_Advisory_Post-Harvest_Guidance_overview.md)

## 2. Architectural Goals

The architecture is designed to meet the following key goals:
*   **Accessibility**: Adherence to WCAG 2.1 Level AA, support for low-bandwidth connections, and comprehensive multilingual support.
*   **Usability**: Simple, intuitive navigation, responsive design for various devices, and clear presentation of information.
*   **Maintainability**: Easy management (CRUD operations and translations) of advisory and guidance content.
*   **Scalability**: Ability to handle a growing library of content, an increasing number of users, and additional languages.
*   **Performance**: Fast page load times and efficient content retrieval.
*   **Reliability**: Ensuring information is accurate, up-to-date, and consistently available.

## 3. Key Components

The module will be integrated within the Next.js monolithic application structure, with distinct frontend, backend, and data components.

### 3.1. Frontend (Next.js/React)
*   **`LanguageContext`**: Consumes language preference from the global state (provided by the User Authentication & Language Selection module) to ensure content is displayed in the user's chosen language.
*   **UI Components**:
    *   `AdvisoryHomeComponent`: Displays categories for crop advisories (e.g., Pests, Diseases, Climate Adaptation).
    *   `PostHarvestHomeComponent`: Displays categories for post-harvest guidance (e.g., Storage, Handling).
    *   `CategoryListComponent`: Lists topics within a selected category, localized.
    *   `TopicDetailComponent`: Renders the full content (text, images) of a specific advisory or guidance topic, localized.
    *   `SearchInterfaceComponent`: Provides a UI for users to search content across both advisory and post-harvest sections.
    *   Reusable components for displaying content cards, navigation elements, etc.

### 3.2. Backend (Next.js API Routes / Server Components)
Next.js API routes and/or Server Components will handle data fetching and business logic.
*   `GET /api/guidance/languages`: Lists available languages for content.
*   `GET /api/guidance/categories?type={advisory|post_harvest}&lang={code}`: Fetches localized categories.
*   `GET /api/guidance/topics?category_slug={slug}&crop_slug={slug}&lang={code}&page={num}&limit={num}`: Fetches a paginated list of localized topics.
*   `GET /api/guidance/topic/{topic_slug}?lang={code}`: Fetches detailed content for a specific topic in the specified language.
*   `GET /api/guidance/search?q={query}&lang={code}&type={advisory|post_harvest|all}&page={num}&limit={num}`: Performs search and returns localized results.
*   `GET /api/guidance/crops?lang={code}`: Fetches localized crop names.
*   **Admin API Routes (Protected)**: Endpoints for CRUD operations on content, categories, crops, and translations. These will require authentication and authorization (admin/editor roles).
    *   e.g., `POST /api/guidance/admin/topics`, `PUT /api/guidance/admin/topics/{id}`

### 3.3. Data Storage (Supabase - PostgreSQL)
Supabase will serve as the primary data store for structured content.
*   Tables for languages, crops, categories, advisory topics, and their respective translations/content versions.
*   Relationships will link these entities (e.g., a topic belongs to a category and optionally a crop).

### 3.4. Content Management Interface (Admin)
*   For MVP, Supabase Studio's table editor, secured with Row Level Security (RLS) and appropriate user roles (managed via Clerk/NextAuth custom claims or a roles table), can be used for content management.
*   Alternatively, simple custom Next.js pages can be built for admin CRUD operations, interacting with the protected Admin API Routes.
*   This interface will allow administrators to create, update, delete, and translate content.

## 4. Content Management Strategy

### 4.1. Storage
Content (text, image URLs, metadata) will be stored in structured tables within Supabase (PostgreSQL). This approach is chosen over Markdown files in the repository for dynamic content due to better querying capabilities, easier management of relationships, and more robust handling of multilingual versions.

### 4.2. Structure
*   **Topics**: Core content units (e.g., "Whitefly in Cotton," "Proper Onion Storage"). Each topic will have a unique slug.
*   **Categories**: Topics will be grouped into categories (e.g., "Pests," "Diseases," "Storage Techniques," "Handling Practices"). Categories will also have slugs and types ("advisory" or "post_harvest").
*   **Crops**: Topics can be associated with specific crops (e.g., "Cotton," "Onion").
*   **Multilingual Content**: Each topic will have multiple `topic_content_versions`, one for each supported language, containing the translated title, body, and summary. Similarly, `category_translations` and `crop_translations` will store localized names.

### 4.3. Updating/Maintenance
*   Authorized administrators/content editors will use the Content Management Interface to manage content.
*   The architecture is designed to allow future integration with external content sources/APIs by providing a clear internal data model into which external data can be transformed and ingested.

## 5. Interactions & Data Flow

### 5.1. Browsing/Navigating Content
1.  User selects a language (handled by global language selection).
2.  User navigates to "Crop Advisory" or "Post-Harvest Guidance".
3.  Frontend component (e.g., `AdvisoryHomeComponent`) calls a Next.js API route/server component (e.g., `GET /api/guidance/categories?type=advisory&lang=hi`).
4.  The backend queries Supabase for categories, joining with `category_translations` for the selected language.
5.  Categories are displayed. User selects a category.
6.  Frontend component (`CategoryListComponent`) calls API (e.g., `GET /api/guidance/topics?category_slug=pests&lang=hi`).
7.  Backend queries Supabase for topics in that category, joining with `topic_content_versions` for the selected language.
8.  List of topics is displayed. User selects a topic.
9.  Frontend component (`TopicDetailComponent`) calls API (e.g., `GET /api/guidance/topic/cotton-whitefly?lang=hi`).
10. Backend retrieves the specific `topic_content_versions` for the topic and language.
11. Content is rendered.

### 5.2. Searching for Topics
1.  User enters a search term in `SearchInterfaceComponent`.
2.  Component calls `GET /api/guidance/search?q={term}&lang={code}`.
3.  Backend API uses Supabase's full-text search capabilities on `topic_content_versions` (title, summary, body), filtered by the selected language.
4.  Search results (list of matching topics) are returned and displayed.

### 5.3. Displaying Content in User's Language
*   The user's selected language (from `LanguageContext`) is passed as a parameter in all API calls for content.
*   Backend queries are constructed to fetch the specific language version from `topic_content_versions`, `category_translations`, etc.
*   If a translation is missing, a fallback strategy (e.g., show in default language like English with a notification) will be implemented.

## 6. Data Models (Supabase - PostgreSQL)

Key tables include:

*   **`languages`**
    *   `code` (TEXT, PK) - ISO 639-1 (e.g., "en", "hi")
    *   `name` (TEXT, UNIQUE) - (e.g., "English", "हिन्दी")

*   **`crops`**
    *   `id` (UUID, PK)
    *   `name_key` (TEXT, UNIQUE) - Programmatic key (e.g., "cotton")
    *   `created_at` (TIMESTAMPTZ)

*   **`crop_translations`**
    *   `crop_id` (UUID, FK to `crops.id`, PK)
    *   `language_code` (TEXT, FK to `languages.code`, PK)
    *   `name` (TEXT) - Localized crop name
    *   `description` (TEXT, nullable)

*   **`categories`**
    *   `id` (UUID, PK)
    *   `slug` (TEXT, UNIQUE) - (e.g., "pests", "storage-techniques")
    *   `type` (TEXT) - "advisory" or "post_harvest"
    *   `created_at` (TIMESTAMPTZ)

*   **`category_translations`**
    *   `category_id` (UUID, FK to `categories.id`, PK)
    *   `language_code` (TEXT, FK to `languages.code`, PK)
    *   `name` (TEXT) - Localized category name
    *   `description` (TEXT, nullable)

*   **`advisory_topics`** (Central content entity)
    *   `id` (UUID, PK)
    *   `slug` (TEXT, UNIQUE) - For user-friendly URLs
    *   `category_id` (UUID, FK to `categories.id`)
    *   `crop_id` (UUID, FK to `crops.id`, nullable)
    *   `image_url` (TEXT, nullable) - URL for a primary image
    *   `published_at` (TIMESTAMPTZ, nullable) - For draft/published status
    *   `created_at` (TIMESTAMPTZ)
    *   `updated_at` (TIMESTAMPTZ)

*   **`topic_content_versions`**
    *   `id` (UUID, PK)
    *   `topic_id` (UUID, FK to `advisory_topics.id`)
    *   `language_code` (TEXT, FK to `languages.code`)
    *   `title` (TEXT) - Localized title
    *   `content_body` (TEXT) - Localized content (can store Markdown or HTML)
    *   `summary` (TEXT, nullable) - Localized brief summary
    *   `version` (INTEGER, default: 1) - For simple versioning, primarily to track updates.
    *   `created_at` (TIMESTAMPTZ)
    *   `updated_at` (TIMESTAMPTZ)
    *   UNIQUE (`topic_id`, `language_code`) - Ensures one active version per language for a topic.

*   (Optional) `tags`, `tag_translations`, `topic_tags` for finer-grained organization if needed later.

## 7. API Design (Internal Next.js)

API endpoints will be namespaced, e.g., under `/api/guidance/`.

*   `GET /api/guidance/languages`: Lists supported languages.
*   `GET /api/guidance/categories?type={advisory|post_harvest}&lang={code}`: Lists localized categories.
*   `GET /api/guidance/topics?category_slug={slug}&crop_slug={slug}&lang={code}&page={num}&limit={num}`: Lists localized topics.
*   `GET /api/guidance/topic/{topic_slug}?lang={code}`: Gets a specific localized topic.
*   `GET /api/guidance/search?q={query}&lang={code}&type={advisory|post_harvest|all}&page={num}&limit={num}`: Performs search.
*   `GET /api/guidance/crops?lang={code}`: Lists localized crops.

**Admin APIs (Protected):**
Standard RESTful endpoints for CRUD operations on `topics`, `categories`, `crops`, and their `translations`/`content_versions`. Example:
*   `POST /api/guidance/admin/topics` (Create new topic master record)
*   `PUT /api/guidance/admin/topics/{topic_id}` (Update topic master record)
*   `POST /api/guidance/admin/topics/{topic_id}/contents` (Create new language version for a topic)
*   `PUT /api/guidance/admin/topics/{topic_id}/contents/{content_id}` (Update specific language version)

Server Components may directly access Supabase for data fetching, reducing reliance on some public API routes for server-rendered pages. API routes remain essential for client-side interactions, search, and admin operations.

## 8. Offline Access/Caching Strategy

*   **PWA Implementation**: The application will be a Progressive Web App.
*   **Service Workers**: A service worker will be used to cache:
    *   Application shell (HTML, CSS, JavaScript).
    *   Static assets (icons, images).
    *   API responses for content (categories, topic lists, individual topics).
*   **Caching Strategy**:
    *   **Stale-While-Revalidate** for lists (categories, topics) to show cached data quickly while fetching updates.
    *   **Cache-First** for individual topic content after it has been viewed once.
    *   The service worker will cache content in the language it was viewed in.
*   **User Experience**: Clear indication of offline status or content served from cache.
*   This strategy supports viewing previously accessed content in low/no bandwidth situations.

## 9. Security Considerations

*   **Public Content**: Advisory and guidance content is generally public. No specific access controls for viewing.
*   **Admin Interface & APIs**:
    *   Authentication: All admin functionalities and APIs will be protected by Clerk/NextAuth.
    *   Authorization: Role-Based Access Control (RBAC) will be implemented. Only users with "admin" or "content_editor" roles (e.g., via Clerk custom claims or a Supabase `user_roles` table) can perform CRUD operations on content.
*   **Supabase Row Level Security (RLS)**:
    *   RLS will be enabled on all content-related tables.
    *   Default policies will allow read access to published content for all users (anonymous and authenticated).
    *   Write policies (INSERT, UPDATE, DELETE) will strictly check for authenticated users with the appropriate roles.
*   **Input Validation**: All API inputs, especially for admin operations, will be validated to prevent XSS, SQLi, etc.
*   **Data Privacy**: User-specific data is not directly handled by this module, but it relies on the language preference from the user profile.

## 10. Scalability & Performance

*   **Database (Supabase)**:
    *   Utilize proper indexing on foreign keys, slugs, language codes, and fields used in search queries.
    *   Implement full-text search indexing for `topic_content_versions.title` and `topic_content_versions.content_body`.
*   **Application (Next.js)**:
    *   Leverage Next.js features like Server Components, Incremental Static Regeneration (ISR) for content pages where appropriate to serve from CDN and reduce server load.
    *   Efficient data fetching patterns.
    *   API response pagination for all list views.
*   **CDN**: Serve static assets (images from Supabase Storage) via CDN.
*   **Performance Monitoring**: (Post-MVP) Implement monitoring to identify and address performance bottlenecks.

## 11. Localization of Content (Dynamic Content)

*   **Strategy**:
    *   The `languages` table defines all supported languages.
    *   `topic_content_versions` stores the actual translated `title`, `content_body`, and `summary` for each topic in each language.
    *   `category_translations` and `crop_translations` store localized names for these entities.
*   **Retrieval & Display**:
    *   User's selected language (from `LanguageContext`) is passed to all data-fetching functions/API calls.
    *   Backend queries fetch content specific to the `language_code`.
    *   Fallback mechanism: If a translation is unavailable for a topic in the user's selected language, display it in a default language (e.g., English) with a clear notification.
*   **Content Management Workflow**:
    *   Admin interface allows creating a base topic (e.g., in English).
    *   Subsequently, translations for other supported languages can be added/edited for that topic, linked via `topic_id`.
*   **URL Structure**: `next-intl` will likely handle language prefixes in URLs (e.g., `/hi/advisory/topic-slug`). API calls use `lang` query parameter.

## 12. Dependencies

*   **User Authentication & Language Selection Module**: For user identity and preferred language.
*   **Supabase**: Database, potentially Storage for images.
*   **Next.js, React, Tailwind CSS**: Core technology stack.
*   **`next-intl`**: For UI string localization and language-aware routing.
*   **Reliable Agricultural Knowledge Source**: For curating accurate content.

## 13. Open Questions / Future Considerations

*   **Admin Interface Choice**: Detailed decision on custom admin pages vs. relying solely on Supabase Studio for MVP.
*   **Advanced Content Versioning**: If a full history of changes to content (beyond the current version per language) is needed. (Out of scope for MVP).
*   **Enhanced Search**: Faceted search, filtering by tags, more sophisticated ranking. (MVP is basic keyword search).
*   **Real-time External API Integration**: For fetching content from third-party advisory services. (Post-MVP; current architecture focuses on internally managed content but is adaptable).