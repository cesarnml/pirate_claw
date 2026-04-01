# Competitive Landscape

This note is intentionally lightweight. It captures a few nearby open-source products that overlap with Pirate Claw so future planning can stay grounded in where this repo is intentionally narrower, simpler, or more opinionated.

Do not treat this file as roadmap truth. It is a working comparison note, not a commitment document.

## Why Keep This Note

- preserve competitor context outside chat history
- clarify where Pirate Claw overlaps with existing tools
- make future scope discussions more explicit when asking "why not just use X?"

## Nearby Open-Source Products

## FlexGet

General-purpose automation engine for feeds and download workflows.

Common strengths:

- broad input support and rule-driven automation
- RSS and other source ingestion
- highly configurable pipeline behavior
- actions that can hand work off to download clients or folders

Why it matters for Pirate Claw:

- closest overlap to Pirate Claw's local rule-engine shape
- stronger as a generic automation toolbox than as a tight product with a narrow operator workflow

## autobrr

Automation tool focused on torrent and Usenet intake with direct client integration.

Common strengths:

- RSS, indexer, and announce-based automation
- web UI and notifications
- downloader integrations including Transmission
- stronger low-latency grabbing posture than a simple manual CLI

Why it matters for Pirate Claw:

- important overlap for future feed polling and downloader automation questions
- likely stronger at always-on acquisition than Pirate Claw's current local-manual model

## Sonarr

TV-focused internet PVR and library manager.

Common strengths:

- durable show tracking
- quality profiles and release management
- calendar and UI-driven workflows
- downloader integration and post-processing

Why it matters for Pirate Claw:

- demonstrates the value of durable TV identity and long-lived tracking
- much broader product scope than Pirate Claw's current local acquisition engine

## Radarr

Movie-focused acquisition and organization manager.

Common strengths:

- persistent movie tracking
- quality and release management
- downloader integration
- import and organization workflows

Why it matters for Pirate Claw:

- closer to a future movie-tracking product than Pirate Claw is today
- useful comparison point for how far Pirate Claw should or should not move toward library management

## Medusa

TV automation and library-management tool in the same broad family as Sonarr.

Common strengths:

- automated TV acquisition
- downloader integrations
- renaming and library-oriented workflows
- broader post-processing than Pirate Claw currently supports

Why it matters for Pirate Claw:

- reinforces that TV automation tools tend to sprawl once they own post-processing and library behavior

## Working Position For Pirate Claw

Pirate Claw appears best positioned between generic automation tools and full library managers:

- more product-shaped and identity-aware than a generic downloader automation script
- smaller and more hackable than a full Sonarr or Radarr-style system
- local-first and operator-driven rather than UI-first
- intentionally narrow around matching, dedupe, queueing, and later downloader lifecycle visibility

## Questions This Should Help Future Phases Answer

- where should Pirate Claw stay intentionally narrower than Sonarr or Radarr
- when is a feature true product value versus reimplementing existing media-manager behavior
- should downloader-side capabilities such as labels or placement rules be reused instead of rebuilt
- when does always-on automation become worth the operational complexity

## Maintenance Rule

Only update this note when competitor context materially changes a product decision, phase boundary, or differentiation argument.
