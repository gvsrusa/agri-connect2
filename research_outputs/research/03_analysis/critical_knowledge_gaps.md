# Critical Knowledge Gaps

This document lists unanswered questions, areas needing deeper exploration, and specific information gaps identified during the initial research and analysis phases. These gaps will inform targeted research queries in subsequent cycles.

## 1. Local Commodity Price Data Integration

*   **Gap (Partially Addressed)**: Specific API documentation, rate limits, authentication methods, and precise costs for private data providers (e.g., Ninjacart, DeHaat, Gramophone, Agrowave API access for price data).
    *   **Findings**: Publicly documented APIs for commodity price data from these specific Indian agri-tech companies are limited. Their focus is often on internal systems or direct B2B partnerships rather than open APIs. Some third-party general commodity APIs exist (e.g., API Ninjas, Commodities-API) with varying relevance to local Indian mandi prices, free tiers, and paid plans.
    *   **Remaining Gaps**:
        *   Confirmation of whether Ninjacart, DeHaat, Gramophone, or Agrowave offer any private/partner APIs for commodity price data and under what terms (direct outreach likely required).
        *   Detailed assessment of the granularity, accuracy, and coverage of local Indian mandi prices by third-party commodity APIs.
*   **Gap**: Detailed technical feasibility and example integrations of SAMB APIs (e.g., Rajmandi) into a Next.js/Supabase stack. Are there SDKs or common libraries?
*   **Gap**: Concrete examples or case studies of data normalization strategies successfully implemented when integrating prices from diverse Indian agricultural sources (Agmarknet, eNAM, SAMBs, private).
*   **Gap**: Up-to-date (2024/2025) ground-truth assessment of Agmarknet and eNAM data accuracy and timeliness for specific perishable commodities in key target regions for AgriConnect.
*   **Gap**: Availability and format of historical price data from various SAMBs beyond what's on their public portals.

## 2. Multilingual Support in Next.js

*   **Gap**: Performance benchmarks comparing `next-i18next`, `next-intl`, and `react-i18next` specifically for applications with a large number of Indian languages and significant content.
*   **Gap**: Best practices or established open-source solutions for managing complex pluralization rules for various Indian languages within popular i18n libraries.
*   **Gap**: Detailed case studies or expert opinions on the most effective and scalable translation workflow management (including TMS integration) for a project like AgriConnect targeting multiple Indian languages with continuous content updates.
*   **Gap**: Specific font rendering issues encountered with particular Indian language scripts on common low-cost Android devices prevalent in rural India, and proven solutions.

## 3. Localized Crop Advisory and Post-Harvest Guidance

*   **Gap (Partially Addressed)**: Availability of structured, API-accessible, and regularly updated crop advisory content from government sources (ICAR, KVKs, SAUs).
    *   **Findings**: Government sources like ICAR, KVKs, and SAUs primarily provide advisory content as PDFs, HTML pages, or via mobile apps (e.g., e-Kalpa), not through documented public APIs suitable for direct third-party integration. Content covers pests, diseases, climate adaptation, and post-harvest practices, with updates varying from weekly to seasonal.
    *   **Licensing**: Reuse for non-commercial purposes with attribution is generally allowed under policies like NDSAP, but commercial integration likely requires explicit permissions.
    *   **Remaining Gaps**:
        *   Confirmation of any pilot/upcoming public APIs for structured advisory data from these government bodies.
        *   Specific contact points or procedures within ICAR/SAUs for requesting data partnerships or permissions for commercial use.
        *   Detailed examples of successful, formal data-sharing agreements between government agricultural bodies and private tech platforms in India for advisory content.
*   **Gap**: Detailed evaluation criteria for assessing the quality, accuracy, and local relevance of advisory content from various private and NGO sources.
*   **Gap**: Examples of successful, sustainable models for curating and maintaining localized advisory content in multiple Indian languages, especially for post-harvest practices.
*   **Gap**: Specific examples of "simple media" (e.g., short videos, audio clips) formats and dissemination strategies that have proven most effective for low-literacy farmers in India for crop advisory.

## 4. Web Accessibility (WCAG 2.1 Level AA)

*   **Gap**: Practical examples and code snippets for implementing complex ARIA patterns (e.g., for custom widgets or dynamic content updates) within a Next.js/Tailwind CSS application that are specifically tested for Indian language screen reader compatibility.
*   **Gap**: Best practices for designing PWA offline experiences (using `next-pwa` or similar) that are highly intuitive for low-literacy users to understand caching status and offline content availability.
*   **Gap**: Comparative analysis of automated accessibility testing tools regarding their effectiveness in detecting issues specific to Indian language content and scripts.
*   **Gap**: Case studies on the impact of specific accessibility interventions (e.g., simplified UI, voice-assisted navigation) on usability for low-literacy, low-connectivity user groups in India.

## 5. Data Privacy and Security for Farmer Data

*   **Gap**: Detailed examples or templates for DPDPA-compliant consent notices and privacy policies tailored for an agricultural web application, available in multiple Indian languages, and understandable by users with low literacy.
*   **Gap**: Specific technical implementation details for enabling user data rights (access, correction, erasure, nomination) in a Supabase/PostgreSQL backend, particularly how nominations would be securely managed.
*   **Gap**: Best practices for conducting data protection impact assessments (DPIAs) under DPDPA for a platform like AgriConnect.
*   **Gap**: Guidance on "reasonable security safeguards" expected under DPDPA for a small to medium-scale application like AgriConnect, beyond standard encryption and RLS. Are there specific certifications or audit processes recommended for this scale?
*   **Gap**: Strategies for securely managing and versioning translated sensitive content (like privacy policies or consent forms) across multiple languages.

*(This list will be refined and prioritized for further research cycles.)*