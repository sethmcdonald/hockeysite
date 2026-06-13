# Product Canon

This document captures the initial language canon for the hockey decision intelligence platform so future product, design, and engineering work uses the same terms consistently.

## SAUCE

`SAUCE` is the platform's working label for synthesized decision support context. It should represent structured insight assembled from trusted inputs, not marketing fluff and not a promise of proprietary magic.

In the current scaffold, the term is documented only. No calculation pipeline or live data source is connected yet.

## ANCHOR

`ANCHOR` refers to a stable player, team, contract, or contextual reference point that helps normalize comparisons across seasons, cap environments, and roster decisions.

Anchors should be understandable to non-technical product users. When the platform surfaces an anchor, it should be possible to explain why that anchor exists and what it is stabilizing.

## Anchors Away

`Anchors Away` is a named product area or workflow focused on exploring how conclusions change when one or more anchors are removed, changed, or relaxed.

This concept should be framed as a scenario exploration tool, not a definitive recommendation engine.

## Historical contracts

Historical contracts are past player contract records used for comparison, context, and normalization. They should be treated as a curated analysis input, not as a promise that the platform already contains exhaustive league-wide coverage.

The initial scaffold intentionally avoids connecting to any paid or unofficial source. Future ingestion work should document provenance before any dataset is introduced.

## Cap percentage normalization

Cap percentage normalization means evaluating contract values relative to the salary cap environment of their time, rather than using raw nominal dollars alone.

This concept exists so historical and modern contracts can be compared more fairly across different cap eras. In the current scaffold it is a documented concept only; no normalization logic is implemented yet.

