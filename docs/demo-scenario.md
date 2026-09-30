# SOC End-to-End Demonstration Scenario

This walkthrough demonstrates all 17 integration steps tested and verified by the automated end-to-end test suite (`backend/tests/e2e-workflow.test.ts`).

---

## Demonstration Workflow Steps

### Step 1 & 2: Platform Initialization & Health Check
- Query `GET /api/v1/health` and `GET /api/v1/dashboard/summary`.
- Verify database connection status, schema version, and initial metric counts.

### Step 3: Create Enterprise Target Asset
- Analyst registers target database server `db-cluster-01` (`10.0.0.100`, Criticality: `CRITICAL`).

### Step 4: Vulnerability Registration & Exposure Linking
- Register CVE-2023-38606 (CVSS 9.8) and link to `db-cluster-01` with `EXTERNAL_FACING` exposure.
- Calculate deterministic risk score factor breakdown.

### Step 5 & 6: Ingest Telemetry Event & Trigger Alert
- Ingest raw Syslog event containing failed SSH brute-force attempt from `198.51.100.45`.
- `DetectionEngine` evaluates Sigma rule `rule-ssh-bruteforce` and generates a High-severity Alert.

### Step 7 & 8: Alert Queue & Correlation Grouping
- Query `GET /api/v1/alerts`.
- Trigger `POST /api/v1/correlations/run`. Alerts from `198.51.100.45` group into an explainable correlation group with confidence score.

### Step 9 & 10: Threat Intelligence & MITRE ATT&CK Mapping
- Lookup `198.51.100.45` via `GET /api/v1/threat-intelligence/enrich`.
- Verify threat actor attribution ("Known malicious IP associated with automated SSH brute-force campaigns").
- Verify MITRE T1110.001 (Password Guessing) mapping.

### Step 11: Graph Reachability Topology Analysis
- Execute `POST /api/v1/attack-paths/analyze`.
- `GraphAnalyzer` constructs directed reachability graph: `Public Internet` -> `Web Portal` -> `db-cluster-01`.
- Compute explainable risk index breakdown (Criticality, Vulnerability, Exposure, Alert Evidence factors).

### Step 12, 13, 14: Incident Creation, Evidence Attachment & Analyst Notes
- Analyst opens Incident Case "Unauthorized SSH Access Investigation".
- Query `GET /api/v1/incidents/:id/timeline` to reconstruct chronological attack sequence.
- Attach log extract evidence and add analyst investigation notes.

### Step 15, 16, 17: Controlled Safe Response Simulation & Incident Resolution
- Dispatch `POST /api/v1/incidents/:id/actions` with `ISOLATE_TEST_ENDPOINT` and `confirmed: true`.
- Verify `simulationResult.mode === "SAFE_SIMULATION"` and audit trail entry.
- Update incident status to `RESOLVED`.
