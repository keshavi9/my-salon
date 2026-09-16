# Markdown Rules — SalonPro Docs

**Fixed 2026-07-14: this file was 0 bytes — an empty rule file that agents would silently skip. Populated with the conventions the other six rule files already follow inconsistently, so future edits actually follow a standard.**

## Structure
- Every rules file starts with `# Title — SalonPro <Scope>`
- Numbered `##` sections in a logical order; `---` horizontal rule between sections
- Tables for anything enumerable (fields, statuses, routes) — prefer tables over prose bullet lists for structured data

## Editing existing rule files
- When a fact changes (a decision, a fix, a status flip), **edit the line in place** and prefix with `**Fixed <date>:**` or `**RESOLVED:**` explaining what was wrong — don't just silently change it. Future readers (human or agent) need to know a contradiction existed and was resolved, not just see the corrected end-state.
- Cross-reference other rule files by name (e.g. `see memory.md Known Issues`) rather than repeating content — repeated facts drift out of sync, which is how the Postgres/MongoDB and role-enum contradictions in this repo happened in the first place.
- Never mark a checklist item `[x]` complete if a known issue elsewhere in the docs contradicts it. Use `[~]` for "exists but not functional" instead of silently checking it off.

## Status markers used across these docs
| Marker | Meaning |
|---|---|
| `[x]` | Fully done and verified working |
| `[~]` | File/route exists but is not functional yet |
| `[ ]` | Not started |
| `✅` | Same as `[x]`, used in table cells |
| `⚠️` | Flag — works, but has a known gap or risk |

## Tone
- Be blunt about gaps. A rules file that hides a broken route behind a green checkmark is worse than no documentation at all.
