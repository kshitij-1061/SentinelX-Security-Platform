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
    { name: "REMEDIATION_UPDATE", description: "Update remediation task state and assignment" }
];
const INITIAL_ROLES = [
    {
        name: "ADMIN",
        description: "System Administrator with full security control",
        permissions: [
            "USER_READ", "USER_CREATE", "USER_UPDATE", "USER_DELETE",
            "AUDIT_READ", "SYSTEM_READ", "SYSTEM_ADMIN",
            "ASSET_READ", "ASSET_CREATE", "ASSET_UPDATE", "ASSET_DELETE", "ASSET_DISCOVER",
            "VULNERABILITY_READ", "VULNERABILITY_CREATE", "VULNERABILITY_UPDATE", "VULNERABILITY_DELETE",
            "REMEDIATION_READ", "REMEDIATION_CREATE", "REMEDIATION_UPDATE"
        ]
    },
    {
        name: "SECURITY_ANALYST",
        description: "SOC Security Analyst role for investigation and response",
        permissions: [
            "USER_READ", "AUDIT_READ", "SYSTEM_READ",
            "ASSET_READ", "ASSET_CREATE", "ASSET_UPDATE", "ASSET_DISCOVER",
            "VULNERABILITY_READ", "VULNERABILITY_CREATE", "VULNERABILITY_UPDATE",
            "REMEDIATION_READ", "REMEDIATION_CREATE", "REMEDIATION_UPDATE"
        ]
    },
    {
        name: "VIEWER",
        description: "Read-only viewer for SOC dashboards",
        permissions: ["SYSTEM_READ", "ASSET_READ", "VULNERABILITY_READ", "REMEDIATION_READ"]
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
    // Seed default sample vulnerabilities
    const sampleVulnerabilities = [
        {
            vulnerabilityIdentifier: "CVE-2021-44228",
            cve: "CVE-2021-44228",
            title: "Apache Log4j2 Remote Code Execution (Log4Shell)",
            description: "Apache Log4j2 versions 2.0-beta9 through 2.15.0 JNDI features used in configuration, log messages, and parameters do not protect against attacker controlled LDAP and other JNDI related endpoints.",
            severity: "CRITICAL",
            cvssScore: 10.0,
            affectedSoftware: "Apache Log4j",
            affectedVersion: "2.0-beta9 to 2.14.1",
            source: "NVD",
            exploitability: "HIGH",
            remediation: "Upgrade Apache Log4j to version 2.17.1 or higher, or set log4j2.formatMsgNoLookups=true.",
            status: "OPEN"
        },
        {
            vulnerabilityIdentifier: "CVE-2023-38408",
            cve: "CVE-2023-38408",
            title: "OpenSSH PKCS#11 Provider Remote Code Execution",
            description: "A security vulnerability in OpenSSH ssh-agent allows remote code execution via loaded PKCS#11 provider shared libraries.",
            severity: "HIGH",
            cvssScore: 8.1,
            affectedSoftware: "OpenSSH",
            affectedVersion: "< 9.3p2",
            source: "NVD",
            exploitability: "FUNCTIONAL",
            remediation: "Upgrade OpenSSH to version 9.3p2 or higher.",
            status: "OPEN"
        },
        {
            vulnerabilityIdentifier: "CVE-2024-3094",
            cve: "CVE-2024-3094",
            title: "XZ Utils Malicious Backdoor in liblzma",
            description: "Malicious code was injected into XZ Utils versions 5.6.0 and 5.6.1, compromising sshd authentication when linked against liblzma.",
            severity: "CRITICAL",
            cvssScore: 10.0,
            affectedSoftware: "XZ Utils",
            affectedVersion: "5.6.0 - 5.6.1",
            source: "NVD",
            exploitability: "HIGH",
            remediation: "Downgrade XZ Utils to version 5.4.x immediately or rebuild liblzma from uncompromised upstream sources.",
            status: "OPEN"
        }
    ];
    for (const v of sampleVulnerabilities) {
        await database_1.prisma.vulnerability.upsert({
            where: { vulnerabilityIdentifier: v.vulnerabilityIdentifier },
            update: v,
            create: v
        });
    }
    console.log("Database successfully seeded with default Roles, Permissions, and Vulnerabilities.");
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
