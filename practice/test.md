# Claude Certified Architect (Foundations) — Practice Test

**15 questions | Passing score: 72% (11/15)**
Domains: D1 Agentic Architecture (27%) · D2 Tool Design (18%) · D3 Claude Code (20%) · D4 Prompt Engineering (20%) · D5 Context Management (15%)

---

## Question 1/15 — Domain 1: Agentic Architecture

Your agentic loop runs a model that returns a response containing both a `text` block ("I'll look that up now") and a `tool_use` block. Your current code checks `if response.content[0].type == "text": break`. The agent exits immediately without calling the tool. What is the root cause?

**A.** The model is not following instructions — add a system prompt telling it to suppress text while using tools.  
**B.** The loop termination check is wrong — you should check `stop_reason == "end_turn"` to determine when the agent is done.  
**C.** The loop needs an iteration cap to prevent runaway execution.  
**D.** Tool results are not being appended to the conversation history.  

<details>
<summary>Answer</summary>

**CORRECT: B**

**Why B is right:** The `stop_reason` field is the authoritative signal for loop termination. `"end_turn"` means the model is done; `"tool_use"` means it wants to call a tool and the loop should continue. Checking `content[0].type` is wrong because the model can return both `text` and `tool_use` blocks simultaneously — the first block type tells you nothing about whether the turn is complete.

**Why A is wrong:** The model is behaving correctly (returning both text and tool use is valid). The bug is in the termination logic, not the model's output.  
**Why C is wrong:** An iteration cap is an anti-pattern as a *primary* stopping mechanism, and adding one here doesn't fix the early-exit bug.  
**Why D is wrong:** The agent exits before it reaches the tool-call step, so history appending is not the issue causing this specific failure.

</details>

---

## Question 2/15 — Domain 1: Agentic Architecture

A multi-agent research pipeline has a coordinator that spawns three subagents: `web_search`, `document_retrieval`, and `synthesis`. The final report consistently omits citations for claims made about documents the retrieval agent found. Logs confirm the retrieval agent correctly returned content with source URLs. Where is the root cause?

**A.** The synthesis agent's prompt does not instruct it to include citations.  
**B.** The web search agent is overwriting the retrieval agent's source metadata.  
**C.** The coordinator is not including structured source metadata (URLs, doc names) in the context it passes to the synthesis agent.  
**D.** The retrieval agent is not returning source URLs in a machine-readable format.  

<details>
<summary>Answer</summary>

**CORRECT: C**

**Why C is right:** Subagents do not inherit the coordinator's history — everything they receive must be explicitly passed. If the coordinator strips or omits structured metadata (source URLs, document names, page numbers) when building the synthesis agent's prompt, no amount of fixing the synthesis agent will help.

**Why A is wrong:** Prompting the synthesis agent to "include citations" is a probabilistic fix; it cannot cite sources it was never given. The root cause is upstream.  
**Why B is wrong:** Logs confirm the retrieval agent returned correct data. The failure is in how the coordinator forwards that data, not in the source agent.  
**Why D is wrong:** The retrieval agent is confirmed to return source URLs — the format is not the stated problem.

</details>

---

## Question 3/15 — Domain 1: Agentic Architecture

Your team wants to ensure that every outbound payment request processed by an agentic workflow is logged to an audit table before execution — with zero tolerance for missed entries. Which approach guarantees this?

**A.** Add a system prompt instruction: "Always log payment requests to the audit table before executing them."  
**B.** Include 3–4 few-shot examples in the prompt showing the agent logging before executing.  
**C.** Implement a `PostToolUse` hook that intercepts after the payment tool is called and logs the entry programmatically.  
**D.** Implement a tool call interception hook that runs before the payment tool executes and writes the audit entry.  

<details>
<summary>answer</summary>

**CORRECT: D**

**Why D is right:** A tool call interception hook fires *before* execution — guaranteed, every time, regardless of model behavior. This is the deterministic solution for a compliance-critical requirement. Financial and audit workflows require programmatic gates, not probabilistic prompt guidance.

**Why C is wrong:** `PostToolUse` fires *after* execution — if the payment executes and the hook fails, the payment is already sent with no audit record. The log must precede the action.  
**Why A is wrong:** System prompt instructions are probabilistic. A non-zero failure rate is unacceptable for audit compliance.  
**Why B is wrong:** Few-shot examples improve consistency but do not eliminate the failure rate. Still probabilistic.

</details>

---

## Question 4/15 — Domain 1: Agentic Architecture

You are resuming a long-running code migration session. The agent was interrupted overnight. Since the session ended, three source files were modified by another developer. Which session resume strategy is correct?

**A.** Use `--resume` to reload the previous session context — it already knows the codebase.  
**B.** Use `fork_session` to branch from the last known-good state.  
**C.** Start a fresh session and inject a summary that explicitly lists the three changed files and what changed.  
**D.** Use `--resume` and instruct the agent to re-explore all files to detect changes.  

<details>
<summary>Answer</summary>

**CORRECT: C**

**Why C is right:** When files have changed, the prior context is stale. `--resume` would give the agent outdated beliefs about file content. A fresh session with a targeted summary that names the specific changed files gets the agent accurate context without unnecessary re-exploration.

**Why A is wrong:** `--resume` is for when context is still valid. After external file modifications, the agent's model of the codebase is incorrect.  
**Why B is wrong:** `fork_session` creates divergent branches from a shared baseline — it's for trying multiple approaches, not for recovering from stale context.  
**Why D is wrong:** Instructing the agent to re-explore *everything* is wasteful. The correct fix is to inform it of the *specific* changes.

</details>

---

## Question 5/15 — Domain 2: Tool Design

An agent has two tools: `get_customer_profile` and `get_customer_orders`. Both have minimal descriptions ("Retrieves customer information" and "Retrieves customer orders"). In production, the agent frequently calls `get_customer_profile` when it needs order history. What is the most effective first fix?

**A.** Merge the two tools into a single `get_customer_data` tool to eliminate ambiguity.  
**B.** Add a routing classifier in the system prompt that maps intent keywords to tool names.  
**C.** Expand the tool descriptions to include purpose, example queries, and explicit "use this vs. that" boundaries.  
**D.** Add few-shot examples in the system prompt showing the agent selecting the correct tool.  

<details>
<summary>Answer</summary>

**CORRECT: C**

**Why C is right:** Tool descriptions are the primary mechanism for tool selection. Minimal descriptions cause misrouting between similar tools. Expanding descriptions to include example queries and explicit disambiguation is the low-effort, high-leverage first fix.

**Why A is wrong:** Merging tools doesn't solve misrouting — it adds a different problem (one tool doing two things) and is over-engineered for a description problem.  
**Why B is wrong:** A routing classifier is a complex, over-engineered solution when the root cause is simply inadequate descriptions.  
**Why D is wrong:** Few-shot examples address inconsistency in judgment; the root cause here is missing description clarity, not inconsistent reasoning.

</details>

---

## Question 6/15 — Domain 2: Tool Design

A document search tool returns an empty array `[]` because no documents match the query. The agent logs a warning, retries the same query three times with exponential backoff, then escalates to human review. What is wrong with this behavior?

**A.** The agent should have used `tool_choice: "any"` to force the tool to return a result.  
**B.** An empty array is a valid result (the source was reached, no matches exist) — the agent should accept it and not retry.  
**C.** The retry count is too low — it should retry at least five times before escalating.  
**D.** The escalation path should be triggered after the first empty result, not after retries.  

<details>
<summary>Answer</summary>

**CORRECT: B**

**Why B is right:** An empty array means the tool reached the data source and found no matches — this is a valid, successful response. Retrying is wrong because repeating the same query will return the same empty result. Retries are for *transient failures* (tool couldn't reach the source). This is a valid empty result, not a failure.

**Why A is wrong:** `tool_choice: "any"` controls whether the model must call a tool — it has no effect on what the tool returns.  
**Why C is wrong:** More retries make the problem worse. The issue is incorrectly classifying an empty result as a failure, not an insufficient retry count.  
**Why D is wrong:** Escalating immediately on an empty result is also wrong for the same reason — an empty result is valid information, not an error condition.

</details>

---

## Question 7/15 — Domain 2: Tool Design

Your team wants to add a database tool to a project. A well-maintained community MCP server already exists for your database type. What should you do?

**A.** Build a custom MCP server to ensure it matches your team's exact workflow requirements.  
**B.** Use the existing community server, configuring it in `.mcp.json` with credentials via `${DB_TOKEN}` environment variable syntax.  
**C.** Use the existing community server, but store credentials directly in `.mcp.json` for simplicity.  
**D.** Configure the server in `~/.claude.json` so each developer can customize their own connection settings.  

<details>
<summary>Answer</summary>

**CORRECT: B**

**Why B is right:** Use existing community servers first — building custom is only for team-specific workflows. Project-level `.mcp.json` is version-controlled and shared with the team. The `${DB_TOKEN}` syntax references an environment variable, keeping credentials out of version control.

**Why A is wrong:** Building custom when a community server exists is over-engineered and wastes time.  
**Why C is wrong:** Storing credentials directly in `.mcp.json` commits secrets to version control — a security violation.  
**Why D is wrong:** `~/.claude.json` is user-level and not shared. If the team needs this tool, it belongs in project-level config.

</details>

---

## Question 8/15 — Domain 3: Claude Code Configuration

A new developer joins the team and reports that Claude is not following the project's coding standards — the standards that all other developers see enforced. The standards are documented in a CLAUDE.md file. What is the most likely root cause?

**A.** The developer needs to run `/memory` to load the project's coding standards into their session.  
**B.** The standards are in the developer's `~/.claude/CLAUDE.md` (user-level) instead of in the project-level CLAUDE.md.  
**C.** The standards are in the project-level CLAUDE.md but need to be duplicated into a custom skill for new developers.  
**D.** The developer is not using the same Claude model version as the rest of the team.  

<details>
<summary>Answer</summary>

**CORRECT: B**

**Why B is right:** User-level CLAUDE.md (`~/.claude/CLAUDE.md`) is personal and not version-controlled — it exists only on the author's machine. A new developer wouldn't have it. Project standards must live in project-level CLAUDE.md (`.claude/CLAUDE.md` or root `CLAUDE.md`) to be shared via git.

**Why A is wrong:** `/memory` is a debugging tool for inconsistent behavior across sessions, not a mechanism for loading project standards.  
**Why C is wrong:** Skills are for on-demand, task-specific behavior. Universal standards belong in CLAUDE.md, not skills — and duplicating them would cause maintenance problems.  
**Why D is wrong:** Model version doesn't determine whether CLAUDE.md instructions are loaded.

</details>

---

## Question 9/15 — Domain 3: Claude Code Configuration

A CI pipeline runs Claude Code to perform a pre-merge security review. After deploying, the pipeline jobs hang indefinitely and never complete. What is the most likely fix?

**A.** Add a `--timeout 300` flag to kill the job after 5 minutes.  
**B.** Switch to the Batch API so the review runs asynchronously.  
**C.** Add the `-p` (non-interactive) flag to the Claude Code command.  
**D.** Add `--non-interactive` flag to suppress all prompts.  

<details>
<summary>Answer</summary>

**CORRECT: C**

**Why C is right:** Without the `-p` flag, Claude Code runs in interactive mode and waits for user input that never comes in a CI environment — causing the job to hang indefinitely. The `-p` flag enables non-interactive mode, which is required for CI/CD integration.

**Why A is wrong:** A timeout would eventually kill the job but doesn't fix the root cause. The job would always "fail" via timeout rather than completing successfully.  
**Why B is wrong:** The Batch API is for latency-tolerant, asynchronous workloads. Pre-merge checks are blocking workflows — the developer is waiting for the result before merging.  
**Why D is wrong:** `--non-interactive` is not the correct flag. The correct flag for non-interactive CI mode is `-p`.

</details>

---

## Question 10/15 — Domain 3: Claude Code Configuration

You want a rule that enforces a specific import ordering convention, but only when editing TypeScript test files (`*.test.ts`, `**/*.spec.ts`). This rule should apply across the entire codebase, not just one directory. What is the best mechanism?

**A.** Add the rule to the root `CLAUDE.md` so it applies globally.  
**B.** Create a `.claude/rules/` file with YAML frontmatter specifying `paths: ["**/*.test.ts", "**/*.spec.ts"]`.  
**C.** Create a `CLAUDE.md` inside the `tests/` directory.  
**D.** Create a custom skill with `allowed-tools` restricted to test files.  

<details>
<summary>Answer</summary>

**CORRECT: B**

**Why B is right:** Path-specific rules in `.claude/rules/` use glob patterns that match files anywhere in the codebase and load only when editing matching files — this is exactly the use case: scoped to file type, not directory location, with token efficiency.

**Why A is wrong:** Adding to root CLAUDE.md would load the rule for every file, not just test files — wasting tokens and potentially causing conflicts.  
**Why C is wrong:** A directory-level CLAUDE.md applies only when working within that directory. If test files are spread across the codebase, this won't work for tests outside `tests/`.  
**Why D is wrong:** Skills are on-demand and task-specific. Coding standards are universal and should load automatically — skills are the wrong mechanism.

</details>

---

## Question 11/15 — Domain 4: Prompt Engineering

A document extraction pipeline uses `tool_use` with a strict JSON schema. Despite this, reviewers find that line-item subtotals frequently don't sum to the stated total. What is the most accurate characterization of this failure?

**A.** The JSON schema is malformed — add stricter type constraints to fix the arithmetic errors.  
**B.** `tool_use` only prevents syntax errors (malformed JSON); it does not prevent semantic errors like incorrect arithmetic.  
**C.** The model needs more few-shot examples showing correct totals.  
**D.** Switch to prompt-based JSON output — `tool_use` schemas cannot represent financial calculations.  

<details>
<summary>Answer</summary>

**CORRECT: B**

**Why B is right:** `tool_use` with a JSON schema guarantees syntactically valid, well-structured JSON. It does not validate semantic correctness — the model can produce well-formed JSON where line items don't add up to the stated total. Schema validation and arithmetic validation are separate concerns.

**Why A is wrong:** Type constraints can enforce that fields are numbers, but cannot enforce that numbers satisfy a mathematical relationship. This is a semantic error, not a schema error.  
**Why C is wrong:** Few-shot examples may help but don't address the root cause (semantic validation is not enforced). Also, the question asks for characterization, not a fix.  
**Why D is wrong:** Prompt-based JSON is strictly worse — it introduces syntax errors without solving the arithmetic issue. `tool_use` is the correct approach; the gap is post-extraction validation.

</details>

---

## Question 12/15 — Domain 4: Prompt Engineering

A classification pipeline is achieving 94% accuracy overall, but stakeholders flag that it is producing far too many false positives in the "regulatory_risk" category, causing analysts to distrust the entire system. What is the recommended first step?

**A.** Raise the confidence threshold across all categories to reduce false positives system-wide.  
**B.** Temporarily disable the `regulatory_risk` category and improve its prompt criteria while keeping other categories active.  
**C.** Add more few-shot examples for `regulatory_risk` to show the model what NOT to flag.  
**D.** Switch to a larger model to improve accuracy in this category.  

<details>
<summary>Answer</summary>

**CORRECT: B**

**Why B is right:** High false positives in one category destroy analyst trust in ALL categories — the whole system becomes suspect. Temporarily disabling the problematic category while iterating on its specific criteria protects the value of the other categories and lets you fix the root issue (vague criteria) without collateral damage.

**Why A is wrong:** Raising thresholds system-wide trades false positives for false negatives across all categories — it doesn't fix the criteria, just suppresses results.  
**Why C is wrong:** Few-shot examples can help, but they're a second step. The root cause is typically vague criteria ("be conservative"), not missing examples. Disabling first is the safer immediate action.  
**Why D is wrong:** A larger model won't fix vague or ambiguous criteria — it will just be more confidently wrong in the same ways.

</details>

---

## Question 13/15 — Domain 4: Prompt Engineering

You need to process 10,000 documents overnight to generate a weekly analytics report. Each document requires a single extraction pass with no follow-up tool calls. Which API approach is correct?

**A.** Use the synchronous API with a thread pool to parallelize requests.  
**B.** Use the Batch API — it offers 50% cost savings and is appropriate for latency-tolerant, overnight workloads.  
**C.** Use the Batch API — it supports multi-turn tool calling, which may be needed for complex documents.  
**D.** Use the synchronous API — batch jobs can take up to 24 hours and may miss the morning deadline.  

<details>
<summary>Answer</summary>

**CORRECT: B**

**Why B is right:** This is the textbook Batch API use case: latency-tolerant (overnight report), no latency SLA required, single-pass extraction (no multi-turn tool calling needed), and 50% cost savings on high volume.

**Why C is wrong:** The Batch API does NOT support multi-turn tool calling — this is an explicit limitation. The answer correctly identifies the right API but gives a false justification, making it a plausible trap.  
**Why A is wrong:** Synchronous API with a thread pool would work but costs 2x more and provides no advantage for a latency-tolerant overnight batch job.  
**Why D is wrong:** The 24-hour window is a maximum, not a guarantee. Overnight processing with a morning deadline is the canonical Batch API use case.

</details>

---

## Question 14/15 — Domain 5: Context Management

A customer support agent has been handling a long conversation. After many turns, it refers to an order as "a recent purchase" instead of "order #8891 for $247.83." A supervisor notices the agent is losing specific transactional details as the conversation grows. What is the root cause and fix?

**A.** The model's context window is too small — upgrade to a model with a larger context window.  
**B.** Progressive summarisation is compressing specific transactional facts into vague summaries. Fix: maintain a persistent "case facts" block with exact values that is included verbatim in every prompt and never summarised.  
**C.** The agent needs to query the order database again each turn to refresh its memory.  
**D.** Reduce the conversation length by enabling auto-compaction earlier.  

<details>
<summary>Answer</summary>

**CORRECT: B**

**Why B is right:** This is the progressive summarisation trap: as context is compressed, specific values ("$247.83", "order #8891") get abstracted into vague references ("a recent purchase"). The fix is a persistent "case facts" block — a structured section with exact transactional data that travels with every prompt and is explicitly excluded from summarisation.

**Why A is wrong:** A larger context window delays the problem but doesn't solve it. The root cause is how facts are managed across turns, not raw window size.  
**Why C is wrong:** Re-querying the database each turn is expensive and doesn't address the underlying context management issue. The facts were already retrieved correctly.  
**Why D is wrong:** Earlier auto-compaction would accelerate the loss of specific details — the opposite of what's needed.

</details>

---

## Question 15/15 — Domain 5: Context Management

A multi-agent research pipeline generates a report with claims that contradict each other — one section cites a 2023 study showing X, another cites a 2024 study showing not-X. What is the correct way to handle this?

**A.** Pick the more recent source (2024) as authoritative and remove the 2023 citation.  
**B.** Flag this as an error and escalate to human review without publishing the report.  
**C.** Annotate both findings with full attribution (source, date, excerpt) and note that the temporal difference may explain the divergence.  
**D.** Average the findings and present a hedged conclusion without citing either source.  

<details>
<summary>Answer</summary>

**CORRECT: C**

**Why C is right:** Two conflicting credible sources should both be annotated with full attribution. Temporal awareness is key — different publication dates may explain different findings (not a contradiction, but an evolution of evidence). The agent's job is to surface the provenance accurately, not arbitrate the truth.

**Why A is wrong:** Arbitrarily selecting the more recent source discards valid data and misrepresents the research landscape. The agent should not make editorial judgments about which source is correct.  
**Why B is wrong:** Conflicting sources are common in research — this is not an error condition requiring escalation. The agent can handle it by presenting both with attribution.  
**Why D is wrong:** Averaging findings without citation is fabrication — it produces a number not found in any source and hides the underlying disagreement from the reader.

</details>

---

## Score Tracking

| # | Domain | Your Answer | Correct |
|---|---|---|---|
| 1 | D1 — Agentic Loop | | B |
| 2 | D1 — Multi-agent | | C |
| 3 | D1 — Workflow enforcement | | D |
| 4 | D1 — Session management | | C |
| 5 | D2 — Tool descriptions | | C |
| 6 | D2 — Error handling | | B |
| 7 | D2 — MCP configuration | | B |
| 8 | D3 — CLAUDE.md hierarchy | | B |
| 9 | D3 — CI/CD integration | | C |
| 10 | D3 — Path-specific rules | | B |
| 11 | D4 — Structured output | | B |
| 12 | D4 — Explicit criteria | | B |
| 13 | D4 — Batch processing | | B |
| 14 | D5 — Context preservation | | B |
| 15 | D5 — Information provenance | | C |

**To pass: 11/15 correct (72%)**
