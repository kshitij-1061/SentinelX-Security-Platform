"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockVulnerabilityScanner = void 0;
class MockVulnerabilityScanner {
    name = "Lab-Mock-Vulnerability-Scanner";
    async scanAsset(asset) {
        const matches = [];
        const softwareList = asset.software || [];
        const os = (asset.operatingSystem || "").toLowerCase();
        // Check installed software against mock vulnerability database
        for (const sw of softwareList) {
            const nameLower = sw.name.toLowerCase();
            if (nameLower.includes("openssh") || nameLower.includes("ssh")) {
                matches.push({
                    cve: "CVE-2023-38408",
                    title: "OpenSSH PKCS#11 Provider Remote Code Execution",
                    description: "A flaw in OpenSSH ssh-agent allows remote code execution via PKCS#11 providers.",
                    severity: "HIGH",
                    cvssScore: 8.1,
                    affectedSoftware: "OpenSSH",
                    affectedVersion: "< 9.3p2",
                    detectedVersion: sw.version || "8.9p1",
                    remediation: "Upgrade OpenSSH to version 9.3p2 or higher."
                });
            }
            if (nameLower.includes("log4j")) {
                matches.push({
                    cve: "CVE-2021-44228",
                    title: "Apache Log4j2 Remote Code Execution (Log4Shell)",
                    description: "JNDI features used in configuration, log messages, and parameters do not protect against attacker controlled LDAP.",
                    severity: "CRITICAL",
                    cvssScore: 10.0,
                    affectedSoftware: "Apache Log4j",
                    affectedVersion: "2.0-beta9 to 2.14.1",
                    detectedVersion: sw.version || "2.14.0",
                    remediation: "Upgrade Log4j to 2.17.1 or disable JNDI lookup."
                });
            }
            if (nameLower.includes("nginx")) {
                matches.push({
                    cve: "CVE-2021-23017",
                    title: "Nginx Resolver Off-by-One Heap Memory Corruption",
                    description: "A 1-byte memory overwrite flaw was found in the way Nginx DNS resolver handles responses.",
                    severity: "HIGH",
                    cvssScore: 7.7,
                    affectedSoftware: "Nginx",
                    affectedVersion: "0.6.18 - 1.20.0",
                    detectedVersion: sw.version || "1.18.0",
                    remediation: "Upgrade Nginx to version 1.20.1 or 1.21.0."
                });
            }
        }
        // OS level fallback match if software list is empty
        if (matches.length === 0 && (os.includes("ubuntu") || os.includes("linux"))) {
            matches.push({
                cve: "CVE-2024-3094",
                title: "XZ Utils Backdoor in liblzma",
                description: "Malicious code injected in XZ Utils versions 5.6.0 and 5.6.1 allowing SSH authentication bypass.",
                severity: "CRITICAL",
                cvssScore: 10.0,
                affectedSoftware: "XZ Utils",
                affectedVersion: "5.6.0 - 5.6.1",
                detectedVersion: "5.6.0",
                remediation: "Downgrade XZ Utils to 5.4.x or patch system packages immediately."
            });
        }
        return {
            assetId: asset.id,
            scannedAt: new Date(),
            matches
        };
    }
}
exports.MockVulnerabilityScanner = MockVulnerabilityScanner;
