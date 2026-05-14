---
name: claude-certification
description: Use when studying or practicing for the Claude Certified Architect (Foundations) exam across all 5 domains, or when someone asks for certification practice questions, exam prep, or wants to test knowledge of Claude agentic systems, tool design, Claude Code, prompt engineering, or context management.
---

# Claude Certified Architect (Foundations) — Full Exam Practice

## Language

**Default language is English.** Respond in English unless the user explicitly asks to switch to another language. This rule applies to all questions, feedback, and explanations throughout the session.

---

## Exam Overview

| Domain | Topic | Weight |
|---|---|---|
| 1 | Agentic Architecture & Orchestration | 27% |
| 2 | Tool Design & MCP Integration | 18% |
| 3 | Claude Code Configuration & Workflows | 20% |
| 4 | Prompt Engineering & Structured Output | 20% |
| 5 | Context Management & Reliability | 15% |

**Passing score:** 720/1000. Format: scenario-based multiple choice, one correct answer, three plausible distractors.

**The exam rewards:**
- Deterministic solutions over probabilistic ones when stakes are high
- Proportionate fixes (don't over-engineer)
- Root cause tracing (identify WHERE in the pipeline the failure originates)
- Low-effort, high-leverage fixes as first steps

---

## Session Format

### On Session Start

1. Greet the user in their language
2. Ask: **"¿Quieres practicar un dominio específico o todos los dominios? / Do you want to practice a specific domain or all domains?"**
3. Ask how many questions they want (default: 15)
4. Begin immediately — no teaching upfront

### Question Format

- Present ONE question at a time
- Scenario-based: describe a real production situation, then ask what to do
- Options A, B, C, D — one correct, three plausible distractors
- Wait for the user to answer before showing the next question
- Show question number and domain: e.g., **Question 3/15 — Domain 1**

### After Each Answer

Show:
1. **CORRECT ✅** or **INCORRECT ❌**
2. **Why the correct answer is right** (2–3 sentences, grounded in the concept)
3. **Why each wrong answer is wrong** — one sentence per distractor explaining the specific flaw

### After All Questions

Show:
- Final score (X/Y)
- List of questions answered incorrectly
- Offer to re-drill weak domains

---

## Domain 1: Agentic Architecture & Orchestration (27%)

### Key concepts to test

**Agentic loop (1.1)**
- Correct termination: check `stop_reason` field — `"end_turn"` = done, `"tool_use"` = continue
- Anti-pattern 1: checking `if response.content[0].type == "text"` — wrong because model can return text AND tool_use simultaneously
- Anti-pattern 2: checking for natural language signals ("I'm done") — ambiguous and unreliable
- Anti-pattern 3: arbitrary iteration caps as primary stopping mechanism
- Tool results MUST be appended to conversation history before next turn

**Multi-agent orchestration (1.2)**
- Hub-and-spoke: coordinator at centre, subagents never communicate directly
- Critical isolation: subagents do NOT inherit coordinator's history. Everything must be explicit in their prompt.
- Narrow decomposition failure: root cause is always the coordinator's decomposition logic, NOT downstream agents
- The exam tests tracing failures to their origin

**Subagent invocation (1.3)**
- Coordinator's `allowedTools` must include "Task" to spawn subagents
- Parallel spawning: emit multiple Task calls in ONE coordinator response (faster)
- `fork_session`: independent branches from shared baseline
- Context passing must include structured metadata (source URLs, doc names, page numbers) for attribution

**Workflow enforcement (1.4)**
- Prompt-based guidance = probabilistic (non-zero failure rate)
- Programmatic hooks/gates = deterministic (works every time)
- Rule: financial, security, compliance → programmatic. Style/formatting → prompt is fine.
- Handoff summaries must be self-contained (human agent has no transcript access)

**SDK Hooks (1.5)**
- PostToolUse: intercepts AFTER execution, BEFORE model processes result → normalise data formats
- Tool call interception: intercepts BEFORE execution → block/redirect based on business rules
- A single compliance failure → use hook, never a prompt

**Task decomposition (1.6)**
- Fixed sequential (prompt chaining): predetermined steps, reliable, cannot adapt
- Dynamic adaptive: generates subtasks from discoveries, flexible, less predictable
- Attention dilution: too many files in one pass → inconsistent depth. Fix: per-file passes + separate cross-file integration pass

**Session management (1.7)**
- `--resume`: use when context is still valid
- `fork_session`: use for divergent approaches from same baseline
- Fresh start + summary injection: use when files changed or context is stale
- After code modifications: inform agent of SPECIFIC file changes, not re-explore everything

---

## Domain 2: Tool Design & MCP Integration (18%)

### Key concepts to test

**Tool descriptions (2.1)**
- Descriptions are THE mechanism for tool selection (not supplementary)
- Minimal descriptions ("Retrieves customer information") cause misrouting between similar tools
- Fix for misrouting: expand descriptions. NOT few-shot examples (wrong root cause), NOT routing classifiers (over-engineered first step)
- Good description includes: purpose, input format, example queries, edge cases, explicit "use THIS vs THAT" boundaries
- System prompt keyword conflicts can override well-written descriptions

**Error handling (2.2)**
- Four error categories: Transient (retry), Validation (fix input), Business (not retryable, alternative workflow), Permission (escalate)
- Critical distinction: access failure (tool couldn't reach source → consider retry) vs valid empty result (source reached, no matches → do NOT retry)
- Error metadata: `errorCategory`, `isRetryable` boolean, human-readable description

**Tool distribution (2.3)**
- Optimal: 4-5 tools per agent, scoped to role
- `tool_choice` options: `"auto"` (default), `"any"` (must call a tool), `{"type": "tool", "name": "X"}` (force specific tool)
- Scoped cross-role tools: give synthesis agent a constrained verify_fact instead of routing through coordinator for 85% simple lookups

**MCP configuration (2.4)**
- Project-level: `.mcp.json` in repo → version-controlled, shared with team
- User-level: `~/.claude.json` → personal, NOT shared
- `${GITHUB_TOKEN}` syntax in `.mcp.json` keeps credentials out of version control
- Use existing community servers first; build custom only for team-specific workflows

**Built-in tools (2.5)**
- Grep: searches file CONTENTS. Use to find function callers, imports, error messages
- Glob: matches file PATHS. Use to find files by extension or naming pattern
- Edit: targeted modification with unique text anchors. Fallback: Read + Write for full file
- Exploration order: Grep entry points → Read to follow imports. Do NOT read all files upfront.

---

## Domain 3: Claude Code Configuration & Workflows (20%)

### Key concepts to test

**CLAUDE.md hierarchy (3.1)**
- User-level (`~/.claude/CLAUDE.md`): only YOU, not version-controlled, NOT shared via git
- Project-level (`.claude/CLAUDE.md` or root `CLAUDE.md`): everyone, version-controlled
- Directory-level: applies when working in that specific directory only
- Exam trap: new team member not getting instructions → root cause is user-level instead of project-level config
- `/memory` command: debugging tool for inconsistent behaviour across sessions
- `@import` syntax for modular organisation; `.claude/rules/` for topic-specific rule files

**Custom commands and skills (3.2)**
- `.claude/commands/` = project-scoped, shared via git
- `~/.claude/commands/` = personal, not shared
- Skill frontmatter: `context: fork` (isolated sub-agent, verbose output stays contained), `allowed-tools` (restricts tools), `argument-hint` (prompts for parameters)
- Skills = on-demand, task-specific. CLAUDE.md = always-loaded, universal standards. Never mix these.

**Path-specific rules (3.3)**
- `.claude/rules/` files with YAML frontmatter `paths: ["**/*.test.tsx"]`
- Advantage over directory CLAUDE.md: glob patterns match files across the ENTIRE codebase
- Loads ONLY when editing matching files → token efficiency

**Plan mode vs direct execution (3.4)**
- Plan mode when: large-scale changes, multiple valid approaches, architectural decisions, multi-file modifications (45+ files)
- Direct execution when: well-understood single-file bug fix, clear limited scope
- Explore subagent: isolates verbose discovery from main conversation, returns summaries
- Common pattern: plan mode for investigation → direct execution for implementation

**Iterative refinement (3.5)**
- Concrete input/output examples beat prose descriptions every time (2-3 examples)
- Test-driven iteration: write tests first, share failures
- Interview pattern: have Claude ask questions before implementing
- Batch feedback when fixes interact; sequential when issues are independent

**CI/CD integration (3.6)**
- `-p` flag: non-interactive mode. Without it, CI job hangs waiting for input. THIS IS TESTED.
- `--output-format json --json-schema`: machine-parseable structured findings
- Same session that generated code is LESS effective at reviewing it (retains reasoning context)
- Re-reviews: include prior findings, instruct to report ONLY new/unaddressed issues

---

## Domain 4: Prompt Engineering & Structured Output (20%)

### Key concepts to test

**Explicit criteria (4.1)**
- Vague: "be conservative." Specific: "Flag only when claimed behaviour contradicts actual code. Skip style preferences."
- High false positive rates in ONE category destroy trust in ALL categories
- Fix: temporarily disable high-FP categories while improving prompts for them
- Severity calibration requires actual CODE EXAMPLES, not prose descriptions

**Few-shot prompting (4.2)**
- Most effective technique for consistency — beats more instructions or confidence thresholds
- Deploy when: inconsistent formatting, inconsistent judgment on ambiguous cases, extraction misses existing information
- Construct: 2-4 examples, each showing REASONING for choice over plausible alternatives
- Enables generalisation to novel patterns, not just memorisation

**Structured output with tool_use (4.3)**
- `tool_use` with JSON schema eliminates syntax errors. Prompt-based JSON can produce malformed output.
- `tool_use` does NOT prevent: semantic errors (line items not summing to total), field placement errors, fabrication
- `tool_choice "any"`: must call a tool, chooses which (guaranteed structured output, unknown doc types)
- Schema: use optional/nullable fields to PREVENT fabrication. "unclear" enum for ambiguous cases. "other" + detail string for extensible categories.

**Validation-retry loops (4.4)**
- Retry with: original document + failed extraction + specific validation error
- Effective for: format mismatches, structural errors, misplaced values
- NOT effective for: information genuinely absent from source
- `detected_pattern` fields: track what triggered each finding, enables systematic prompt improvement

**Batch processing (4.5)**
- Batch API: 50% cost savings, up to 24-hour window, no latency SLA, does NOT support multi-turn tool calling
- Synchronous API: blocking workflows (pre-merge checks, developer waits for result)
- Batch API: latency-tolerant workflows (overnight reports, weekly audits)
- Exam trap: using batch for everything. Keep blocking workflows synchronous.

**Multi-instance review (4.6)**
- Same session reviewing its own output = less effective (retains reasoning context, less likely to question decisions)
- Independent instance without prior context catches more subtle issues
- Per-file local passes + separate cross-file integration pass = prevents attention dilution
- Confidence-based routing: low-confidence findings → human review. Calibrate with labelled validation sets.

---

## Domain 5: Context Management & Reliability (15%)

### Key concepts to test

**Context preservation (5.1)**
- Progressive summarisation trap: compresses specific values ("$247.83 for order #8891") into vague summaries
- Fix: persistent "case facts" block with transactional facts. Include in every prompt. Never summarise it.
- "Lost in the middle" effect: models process beginning and end reliably, middle may be missed. Fix: key summaries at the START, explicit section headers.
- Trim verbose tool results to relevant fields BEFORE appending to context
- Upstream agent optimisation: return structured key facts, not verbose reasoning chains

**Escalation and ambiguity (5.2)**
- Valid triggers: explicit human request (honour IMMEDIATELY, no investigation first), policy gaps, inability to make progress
- Invalid triggers: sentiment/frustration, self-reported confidence scores
- Frustration nuance: if issue is straightforward + customer is frustrated → acknowledge + offer resolution. Only escalate if customer REITERATES human preference after you offer help.
- Ambiguous customer match: ask for additional identifiers. Do NOT select based on heuristics.

**Error propagation (5.3)**
- Structured error context: failure type, what was attempted, partial results, alternative approaches
- Anti-pattern 1: silent suppression (empty result marked success) → prevents any recovery
- Anti-pattern 2: workflow termination on single failure → throws away partial results
- Access failure vs valid empty result (same as Domain 2 — reinforced across domains)
- Coverage annotations: note which findings are well-supported vs which areas have gaps

**Codebase exploration (5.4)**
- Context degradation: agent references "typical patterns" instead of specific classes → context filled with discovery output
- Mitigation: scratchpad files (write findings to file), subagent delegation, summary injection before next phase, `/compact`
- Crash recovery: each agent exports structured state to manifest file; coordinator loads manifest on resume

**Human review and confidence (5.5)**
- 97% overall accuracy can hide 40% error rate on a specific document type
- Always validate by document type AND field segment before automating
- Stratified random sampling of high-confidence extractions detects novel error patterns
- Field-level confidence calibration with labelled validation sets

**Information provenance (5.6)**
- Each finding needs: claim + source URL + document name + relevant excerpt + publication date
- Two conflicting credible sources: annotate BOTH with attribution. Do NOT arbitrarily select one.
- Temporal awareness: different dates explain different numbers (not contradictions)
- Rendering: financial data → tables, news → prose, technical findings → structured lists

---

## Question Generation Guidelines

When generating questions:

1. **Always scenario-based** — describe a real production situation (agent behaving unexpectedly, CI breaking, misrouted tool call, etc.)
2. **One clearly correct answer** — grounded in the concepts above
3. **Three plausible distractors** — use the specific wrong patterns the exam favours:
   - The probabilistic fix when a deterministic one is needed
   - The downstream component when the coordinator is the root cause
   - The over-engineered solution when a simple fix is correct
   - Conflating access failure with valid empty result
   - User-level config when project-level is needed
4. **Cover all domains proportionally** over a full session: ~4 D1, ~3 D2, ~3 D3, ~3 D4, ~2 D5 per 15 questions
5. **Vary difficulty**: some questions test direct recall, others require multi-step reasoning

---

## Distractor Bank (reuse these patterns)

| Situation | Correct answer | Common distractors |
|---|---|---|
| High-stakes compliance failure | Programmatic hook/gate | Enhanced system prompt, few-shot examples, routing classifier |
| Agent terminates prematurely | Check `stop_reason` | Check content type, add iteration cap, parse natural language |
| Multi-agent coverage gap | Coordinator decomposition | Web search subagent, synthesis subagent, retrieval subagent |
| Tool misrouting | Expand tool descriptions | Add routing classifier, merge tools, add few-shot |
| New team member not getting instructions | Move to project-level CLAUDE.md | Update user-level, add to skills, use /memory |
| CI pipeline hangs | Add `-p` flag | Add `--timeout`, add `--non-interactive`, use batch API |
| Tool returns empty array, agent retries | Treat as valid empty result, no retry | Retry with backoff, escalate immediately, check permissions |
| Synthesis report has no attribution | Fix context passing (add structured metadata) | Fix synthesis agent prompt, fix web search agent, fix coordinator |