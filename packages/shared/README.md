# `@smartguide/shared`

SmartGuide monoreposidagi barcha servislar (`apps/api`, `apps/tourist`, `apps/dashboard`) o'rtasidagi yagona TypeScript API kontraktlari.

## Asosiy Kontrakt Guruhlari ([src/index.ts](src/index.ts))
- **Tillar va Qiziqishlar:** `SupportedLanguage` (`en, uz, ru, ja, ko, es`), `TravelVibe` (`legends, architecture, photography, royalty, spiritual`)
- **Emotsional Roadmap:** `GenerateRoadmapRequest`, `GenerateRoadmapResponse`, `RoadmapStop`
- **Obida va Jonli Suhbat:** `LandmarkSummary`, `LandmarkDetail`, `GuideAskRequest`, `GuideAskResponse`, `GuideFeedbackRequest`
- **B2B Experience Intelligence:** `AnalyticsSummary`, `SignalTopicMetric`, `SentimentMetric`, `CuriosityGapItem`, `RevenueMetrics`

## Buyruqlar
```bash
npm run build --workspace=@smartguide/shared
npm run typecheck --workspace=@smartguide/shared
```

> ⚠️ **Qoida:** `src/index.ts` ni o'zgartirishdan oldin 3 dasturchi kelishib oladi va keyin `npm run build:shared` ishga tushiriladi.
