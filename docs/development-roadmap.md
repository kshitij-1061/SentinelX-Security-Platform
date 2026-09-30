# Platform Development Roadmap (Phases 1 - 9)

- [x] **Phase 1: Architecture & Foundation (Completed)**
  - Modular monolith architecture, FastAPI, PostgreSQL, Next.js Dark SOC UI, JWT auth, RBAC, Audit logs, Alembic migrations, Pytest suite, Docker Compose setup.

- [ ] **Phase 2: Asset Discovery & Inventory Module**
  - Implement `assets` and `services` tables, simulated lab network probe engine, asset detail UI, exposure status.

- [ ] **Phase 3: Vulnerability & Exposure Management**
  - CVE lookups, CVSS v3.1 scoring engine, unpatched service bindings, remediation workflow.

- [ ] **Phase 4: Threat & Network Detection Engine**
  - Normalized telemetry ingestion, Sigma YAML rule evaluation, Zeek/Suricata log parsers.

- [ ] **Phase 5: Deception & Honeypot Integration**
  - Fake decoy listeners (SSH, HTTP trap, DB port), high-confidence telemetry dispatch.

- [ ] **Phase 6: Alert Correlation & Threat Intelligence**
  - Temporal alert correlation engine, MITRE ATT&CK TTP matrix, IP reputation enrichment.

- [ ] **Phase 7: Attack Path & Risk Analysis**
  - NetworkX directed graph engine, reachability pathfinding, explainable composite risk index calculation.

- [ ] **Phase 8: Incident Investigation & Controlled Response**
  - Interactive SOC timeline reconstructor, forensic evidence drawer, safe containment actions.

- [ ] **Phase 9: Security Command Center Dashboard**
  - D3/Cytoscape interactive attack path graph, real-time WebSocket alert feed, interview demonstration package.
