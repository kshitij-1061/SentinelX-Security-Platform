"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const database_1 = require("../config/database");
const INITIAL_PERMISSIONS = [
    { name: "USER_READ", description: "Read user details and list accounts" },
    { name: "USER_CREATE", description: "Create new user accounts" },
    { name: "USER_UPDATE", description: "Update existing user accounts" },
    { name: "USER_DELETE", description: "Delete user accounts" },
    { name: "AUDIT_READ", description: "Read security audit logs" },
    { name: "SYSTEM_READ", description: "Read system telemetry and status" },
    { name: "SYSTEM_ADMIN", description: "Full administrative control" },
    { name: "ASSET_READ", description: "Read enterprise asset inventory and services" },
    { name: "ASSET_CREATE", description: "Create new enterprise asset records" },
    { name: "ASSET_UPDATE", description: "Update enterprise asset details" },
    { name: "ASSET_DELETE", description: "Delete enterprise assets from inventory" },
    { name: "ASSET_DISCOVER", description: "Run asset discovery probes and bulk asset imports" },
    { name: "VULNERABILITY_READ", description: "Read vulnerability database and exposure links" },
    { name: "VULNERABILITY_CREATE", description: "Create new vulnerability records and import CVEs" },
    { name: "VULNERABILITY_UPDATE", description: "Update vulnerability metadata and asset links" },
    { name: "VULNERABILITY_DELETE", description: "Delete vulnerability records" },
    { name: "REMEDIATION_READ", description: "Read remediation tasks and tracking status" },
    { name: "REMEDIATION_CREATE", description: "Create remediation tasks for vulnerabilities" },
    { name: "REMEDIATION_UPDATE", description: "Update remediation task state and assignment" },
    { name: "EVENT_READ", description: "Read normalized security events and telemetry feeds" },
    { name: "EVENT_CREATE", description: "Ingest security events via adapters" },
    { name: "ALERT_READ", description: "Read SOC security alerts" },
    { name: "ALERT_UPDATE", description: "Update alert status and triage decisions" },
    { name: "DETECTION_RULE_READ", description: "Read detection rules and Sigma definitions" },
    { name: "DETECTION_RULE_CREATE", description: "Create detection rules" },
    { name: "DETECTION_RULE_UPDATE", description: "Update detection rules" },
    { name: "HONEYPOT_READ", description: "Read lab honeypots and session logs" },
    { name: "HONEYPOT_CREATE", description: "Deploy lab simulation honeypots" },
    { name: "HONEYPOT_UPDATE", description: "Update honeypot configurations" },
    { name: "HONEYPOT_DELETE", description: "Decommission lab honeypots" },
    { name: "HONEYPOT_EVENT_READ", description: "Read honeypot interaction events" },
    { name: "CORRELATION_READ", description: "Read correlated alert groups" },
    { name: "CORRELATION_CREATE", description: "Create or trigger correlation rules" },
    { name: "THREAT_INTEL_READ", description: "Read threat indicators and IOC lookups" },
    { name: "THREAT_INTEL_CREATE", description: "Add new IOC threat indicators" },
    { name: "THREAT_INTEL_UPDATE", description: "Update threat indicators" },
    { name: "TECHNIQUE_READ", description: "Read MITRE ATT&CK techniques matrix" },
    { name: "ATTACK_PATH_READ", description: "Read potential attack path topology" },
    { name: "ATTACK_PATH_CREATE", description: "Create attack path definitions" },
    { name: "ATTACK_PATH_ANALYZE", description: "Run graph analyzer for potential attack paths" },
    { name: "RISK_READ", description: "Read explainable risk assessments" },
    { name: "INCIDENT_READ", description: "Read security incidents and timelines" },
    { name: "INCIDENT_CREATE", description: "Create security incidents from alerts" },
    { name: "INCIDENT_UPDATE", description: "Update incident status and findings" },
    { name: "INCIDENT_ASSIGN", description: "Assign incident to SOC analyst" },
    { name: "RESPONSE_SIMULATE", description: "Execute safe simulation response actions" }
];
const INITIAL_ROLES = [
    {
        name: "ADMIN",
        description: "System Administrator with full security control",
        permissions: INITIAL_PERMISSIONS.map(p => p.name)
    },
    {
        name: "SECURITY_ANALYST",
        description: "SOC Security Analyst role for investigation and response",
        permissions: [
            "USER_READ", "AUDIT_READ", "SYSTEM_READ",
            "ASSET_READ", "ASSET_CREATE", "ASSET_UPDATE", "ASSET_DISCOVER",
            "VULNERABILITY_READ", "VULNERABILITY_CREATE", "VULNERABILITY_UPDATE",
            "REMEDIATION_READ", "REMEDIATION_CREATE", "REMEDIATION_UPDATE",
            "EVENT_READ", "EVENT_CREATE", "ALERT_READ", "ALERT_UPDATE",
            "DETECTION_RULE_READ", "DETECTION_RULE_CREATE", "DETECTION_RULE_UPDATE",
            "HONEYPOT_READ", "HONEYPOT_CREATE", "HONEYPOT_UPDATE", "HONEYPOT_EVENT_READ",
            "CORRELATION_READ", "CORRELATION_CREATE", "THREAT_INTEL_READ", "THREAT_INTEL_CREATE", "THREAT_INTEL_UPDATE",
            "TECHNIQUE_READ", "ATTACK_PATH_READ", "ATTACK_PATH_CREATE", "ATTACK_PATH_ANALYZE", "RISK_READ",
            "INCIDENT_READ", "INCIDENT_CREATE", "INCIDENT_UPDATE", "INCIDENT_ASSIGN", "RESPONSE_SIMULATE"
        ]
    },
    {
        name: "VIEWER",
        description: "Read-only viewer for SOC dashboards",
        permissions: [
            "SYSTEM_READ", "ASSET_READ", "VULNERABILITY_READ", "REMEDIATION_READ",
            "EVENT_READ", "ALERT_READ", "DETECTION_RULE_READ", "HONEYPOT_READ",
            "HONEYPOT_EVENT_READ", "CORRELATION_READ", "THREAT_INTEL_READ", "TECHNIQUE_READ",
            "ATTACK_PATH_READ", "RISK_READ", "INCIDENT_READ"
        ]
    }
];
async function seedDatabase() {
    const permissionMap = new Map();
    for (const perm of INITIAL_PERMISSIONS) {
        const created = await database_1.prisma.permission.upsert({
            where: { name: perm.name },
            update: { description: perm.description },
            create: perm
        });
        permissionMap.set(created.name, created.id);
    }
    for (const roleDef of INITIAL_ROLES) {
        const role = await database_1.prisma.role.upsert({
            where: { name: roleDef.name },
            update: { description: roleDef.description },
            create: {
                name: roleDef.name,
                description: roleDef.description
            }
        });
        for (const permName of roleDef.permissions) {
            const permId = permissionMap.get(permName);
            if (permId) {
                await database_1.prisma.rolePermission.upsert({
                    where: {
                        roleId_permissionId: {
                            roleId: role.id,
                            permissionId: permId
                        }
                    },
                    update: {},
                    create: {
                        roleId: role.id,
                        permissionId: permId
                    }
                });
            }
        }
    }
    // Seed default MITRE ATT&CK Techniques
    const mitreTechniques = [
        { techniqueId: "T1110.001", name: "Password Guessing", tactic: "Credential Access", subTechnique: true, description: "Adversaries may iterate through common passwords to compromise accounts." },
        { techniqueId: "T1059.001", name: "PowerShell Command Execution", tactic: "Execution", subTechnique: true, description: "Adversaries may use PowerShell commands and base64 encoded scripts." },
        { techniqueId: "T1071.001", name: "Web Protocols C2", tactic: "Command and Control", subTechnique: true, description: "Adversaries may communicate using standard HTTP/HTTPS protocols." },
        { techniqueId: "T1083", name: "File and Directory Discovery", tactic: "Discovery", subTechnique: false, description: "Adversaries may enumerate local files and directories." },
        { techniqueId: "T1190", name: "Exploit Public-Facing Application", tactic: "Initial Access", subTechnique: false, description: "Adversaries may attempt to exploit software vulnerabilities in web-facing systems." }
    ];
    for (const t of mitreTechniques) {
        await database_1.prisma.mitreTechnique.upsert({
            where: { techniqueId: t.techniqueId },
            update: t,
            create: t
        });
    }
    // Seed default Detection Rules
    const detectionRules = [
        {
            id: "rule-ssh-bruteforce",
            name: "SSH Brute Force Authentication Attempt",
            description: "Detects multiple failed SSH authentication attempts within a short timeframe.",
            severity: "HIGH",
            source: "SURICATA",
            ruleDefinition: JSON.stringify({ field: "eventType", operator: "equals", value: "AUTHENTICATION", keyword: "Failed password" }),
            enabled: true,
            mitreTechnique: "T1110.001"
        },
        {
            id: "rule-powershell-enc",
            name: "Suspicious PowerShell Encoded Command Execution",
            description: "Detects execution of PowerShell commands using encoded command arguments.",
            severity: "CRITICAL",
            source: "SIGMA",
            ruleDefinition: JSON.stringify({ field: "command", operator: "contains", value: "-enc" }),
            enabled: true,
            mitreTechnique: "T1059.001"
        },
        {
            id: "rule-honeypot-probe",
            name: "Deception Honeypot Interaction Alert",
            description: "Alert triggered whenever an unauthorized entity interacts with a lab deception honeypot.",
            severity: "CRITICAL",
            source: "CUSTOM",
            ruleDefinition: JSON.stringify({ field: "source", operator: "equals", value: "HONEYPOT" }),
            enabled: true,
            mitreTechnique: "T1083"
        }
    ];
    for (const rule of detectionRules) {
        await database_1.prisma.detectionRule.upsert({
            where: { id: rule.id },
            update: rule,
            create: rule
        });
    }
    // Seed Lab Honeypots
    const labHoneypots = [
        {
            id: "hp-ssh-01",
            name: "Lab-SSH-Trap-01",
            type: "SSH",
            hostname: "ssh-decoy.lab.internal",
            ip: "192.168.1.250",
            port: 2222,
            status: "ACTIVE",
            description: "Simulated SSH honeypot trapping unauthorized remote login attempts."
        },
        {
            id: "hp-web-01",
            name: "Lab-HTTP-Decoy-01",
            type: "HTTP",
            hostname: "admin-portal.lab.internal",
            ip: "192.168.1.251",
            port: 8080,
            status: "ACTIVE",
            description: "Simulated admin portal honeypot capturing suspicious web probes."
        }
    ];
    for (const hp of labHoneypots) {
        await database_1.prisma.honeypot.upsert({
            where: { id: hp.id },
            update: hp,
            create: hp
        });
    }
    // Seed Threat Indicators
    const threatIndicators = [
        {
            value: "198.51.100.45",
            type: "IP",
            source: "MISP",
            confidence: 0.95,
            tags: JSON.stringify(["malicious", "bruteforce", "c2"]),
            description: "Known malicious IP associated with automated SSH brute-force campaigns."
        },
        {
            value: "badactor-c2.evil-domain.com",
            type: "DOMAIN",
            source: "INTERNAL",
            confidence: 0.90,
            tags: JSON.stringify(["c2", "phishing"]),
            description: "Command and Control domain observed in lab malware analysis."
        }
    ];
    for (const ti of threatIndicators) {
        await database_1.prisma.threatIndicator.upsert({
            where: { value: ti.value },
            update: ti,
            create: ti
        });
    }
    console.log("Database successfully seeded with default Roles, Permissions, Detections, Honeypots, Threat Intel, and MITRE Techniques.");
}
if (require.main === module) {
    seedDatabase()
        .catch((e) => {
        console.error(e);
        process.exit(1);
    })
        .finally(async () => {
        await database_1.prisma.$disconnect();
    });
}
