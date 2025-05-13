# AgriConnect - Master Project Plan

## 1. Introduction

This document outlines the master project plan for AgriConnect, a web application designed to empower small and marginal Indian farmers with essential tools and information. This plan is derived from the project's primary blueprint, the Product Requirements Document (PRD), and subsequent research, feature specification, and high-level architectural design activities.

**Project Goal**: To provide an accessible, multilingual web platform offering a basic marketplace, local market price discovery, crop advisory, post-harvest guidance, and simple transport connections.

## 2. Foundational Documents

*   **User Blueprint (PRD)**: [`docs/PRD.md`](docs/PRD.md) - The primary source of project requirements and scope.
*   **Initial Feasibility Research**: Summarized findings from research conducted by `@ResearchPlanner_Strategic` are located within the [`research_outputs/research/`](research_outputs/research/) directory. Key areas included commodity price data sourcing, multilingual support, crop advisory content, web accessibility, and data privacy.

## 3. Core Features & Modules (MVP)

The following core features have been defined for the Minimum Viable Product (MVP), each with a detailed specification and high-level architecture:

### 3.1. User Authentication & Language Selection
*   **Purpose**: Enables users to securely register/log in and select their preferred language for the application.
*   **Specification**: [`docs/specs/UserAuthentication_LanguageSelection_overview.md`](docs/specs/UserAuthentication_LanguageSelection_overview.md)
*   **Architecture**: [`docs/architecture/UserAuthentication_LanguageSelection_architecture.md`](docs/architecture/UserAuthentication_LanguageSelection_architecture.md)

### 3.2. Marketplace & Price Discovery
*   **Purpose**: Allows farmers to list produce for sale, browse listings, and check local commodity prices.
*   **Specification**: [`docs/specs/Marketplace_Price_Discovery_overview.md`](docs/specs/Marketplace_Price_Discovery_overview.md)
*   **Architecture**: [`docs/architecture/Marketplace_Price_Discovery_architecture.md`](docs/architecture/Marketplace_Price_Discovery_architecture.md)

### 3.3. Crop Advisory & Post-Harvest Guidance
*   **Purpose**: Provides farmers with practical advice on crop management and post-harvest practices.
*   **Specification**: [`docs/specs/Crop_Advisory_Post-Harvest_Guidance_overview.md`](docs/specs/Crop_Advisory_Post-Harvest_Guidance_overview.md)
*   **Architecture**: [`docs/architecture/Crop_Advisory_Post-Harvest_Guidance_architecture.md`](docs/architecture/Crop_Advisory_Post-Harvest_Guidance_architecture.md)

### 3.4. Transport Connections
*   **Purpose**: Facilitates connections between farmers needing transport and local providers.
*   **Specification**: [`docs/specs/Transport_Connections_overview.md`](docs/specs/Transport_Connections_overview.md)
*   **Architecture**: [`docs/architecture/Transport_Connections_architecture.md`](docs/architecture/Transport_Connections_architecture.md)

### 3.5. Provide Feedback
*   **Purpose**: Allows users to submit feedback on the application's usability and content.
*   **Specification**: [`docs/specs/Provide_Feedback_overview.md`](docs/specs/Provide_Feedback_overview.md)
*   **Architecture**: [`docs/architecture/Provide_Feedback_architecture.md`](docs/architecture/Provide_Feedback_architecture.md)

## 4. Technology Stack

*   **Frontend Framework**: Next.js (React)
*   **Styling**: Tailwind CSS
*   **Authentication**: Clerk/NextAuth
*   **Database**: Supabase (PostgreSQL)
*   **Internationalization (i18n)**: `next-intl` or similar

## 5. High-Level Project Roadmap

1.  **Phase 1: Project Initialization (Completed)**
    *   Activities: Blueprint analysis ([`docs/PRD.md`](docs/PRD.md)), initial feasibility research, feature decomposition (specifications), high-level architectural design for all core modules, and creation of this Master Project Plan.
2.  **Phase 2: Framework Scaffolding**
    *   Activities: Setup Next.js project structure, integrate Clerk for authentication, connect to Supabase, configure Tailwind CSS, and implement the `next-intl` based internationalization framework.
3.  **Phase 3: Test Planning & Specification**
    *   Activities: For each defined feature module, create detailed test plans and test specification documents.
4.  **Phase 4: Feature Development Cycle 1 - Core User Experience**
    *   Modules: User Authentication & Language Selection, Provide Feedback.
    *   Activities: Detailed design, coding, unit testing, integration testing.
5.  **Phase 5: Feature Development Cycle 2 - Marketplace & Pricing**
    *   Module: Marketplace & Price Discovery.
    *   Activities: Detailed design, coding, unit testing, integration testing.
6.  **Phase 6: Feature Development Cycle 3 - Advisory Content**
    *   Module: Crop Advisory & Post-Harvest Guidance.
    *   Activities: Detailed design, coding, unit testing, integration testing, initial content population.
7.  **Phase 7: Feature Development Cycle 4 - Logistics**
    *   Module: Transport Connections.
    *   Activities: Detailed design, coding, unit testing, integration testing, initial transporter data population (admin).
8.  **Phase 8: System Integration Testing & User Acceptance Testing (UAT)**
    *   Activities: End-to-end testing of all integrated features, UAT with target user representatives.
9.  **Phase 9: Deployment & Launch (MVP)**
    *   Activities: Prepare production environment, deploy the application, monitor initial launch.

## 6. Next Steps (Immediate)

*   **Pheromone State Update**: Dispatch project initialization summary to `@orchestrator-pheromone-scribe` to update the global project state, register key documents, and signal readiness for the next phase.
*   **Framework Scaffolding**: Initiate tasks for setting up the foundational project structure and technology integrations as outlined in Phase 2 of the roadmap.
*   **Test Planning**: Begin creating test plans for the defined feature modules (Phase 3).

This Master Project Plan will be a living document and updated as the project progresses.