# URL Canon for Phase 1 Seed

**Date:** 2026-05-04
**Status:** Accepted

## Context

The current build publishes some work under noncanonical paths, especially `/residential/`, while the Phase 1 PRD and GBP workbook use `/residential-roofing/`.

## Decision

The Phase 1 Seed canon is the GBP workbook path set. Residential routes publish under `/residential-roofing/`. Existing `/residential/` routes become redirects or are removed after canonical pages are built.

## Rationale

GBP destination URLs, sitemap logic, reverse-silo links, and spreadsheet tracking need one source of truth before production.
