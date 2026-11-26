# `@smartguide/shared`

Current common TypeScript contracts for API, tourist and dashboard. The source of truth is [src/index.ts](src/index.ts).

Implemented type groups: `SupportedLanguage`, `LandmarkSummary`, `LandmarkDetail`, `GuideAskRequest`, `GuideAskResponse`, `AnalyticsSummary` and existing analytics/revenue metrics. The five Khiva landmark slugs and six languages describe the current pilot, not the product's national scope.

National trips, discoveries, legacy roadmap generation, guide feedback and optional experience insights are **not yet exported by this package**. Frontend transitional types live in the relevant app libraries. Earlier README entries listing those as shared exports were premature. Agree additions with backend/AI owners before changing shared source.

```bash
npm run build --workspace=@smartguide/shared
npm run typecheck --workspace=@smartguide/shared
```

This branch corrects documentation only in this package; shared runtime types are unchanged. [API status](../../documentation/API_CONTRACT.md)
