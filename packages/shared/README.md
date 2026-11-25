# `@smartguide/shared`

SmartGuide monoreposidagi barcha servislar (`apps/api`, `apps/tourist`, `apps/dashboard`) foydalanadigan umumiy TypeScript tiplari va til konfiguratsiyasi.

## Asosiy eksportlar ([src/index.ts](src/index.ts))
- `SupportedLanguage`, `SUPPORTED_LANGUAGES`, `LANGUAGE_CODES` (`en`, `uz`, `ru`, `ja`, `ko`, `es`)
- `LandmarkSummary`, `LandmarkDetail`
- `GuideAskRequest`, `GuideAskResponse`
- `AnalyticsSummary`, `RevenueMetrics`, `LandmarkVisitMetric`, `LanguageBreakdownMetric`, `HourlyActivityPoint`, `RecentQuestionItem`

## Buyruqlar
```bash
npm run build --workspace=@smartguide/shared
npm run typecheck --workspace=@smartguide/shared
```

> ⚠️ **Qoida:** Ushbu faylga o'zgartirish kiritishdan oldin Frontend, Backend va AI dasturchilari kelishib olishi shart. O'zgartirishdan so'ng `npm run build:shared` ni ishga tushiring.
