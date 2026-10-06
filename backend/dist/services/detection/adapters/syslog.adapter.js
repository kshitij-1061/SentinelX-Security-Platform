"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyslogAdapter = void 0;
class SyslogAdapter {
    name = "SyslogAdapter";
    parseAndNormalize(payload) {
        const logText = typeof payload === "string" ? payload : payload.message || JSON.stringify(payload);
        let sourceIP;
        let username;
        let severity = "LOW";
        // Extract IP via regex
        const ipMatch = logText.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
        if (ipMatch)
            sourceIP = ipMatch[0];
        // Check failed auth
        if (logText.toLowerCase().includes("failed password") || logText.toLowerCase().includes("authentication failure")) {
            severity = "HIGH";
            const userMatch = logText.match(/for\s+(invalid user\s+)?(\w+)/i);
            if (userMatch)
                username = userMatch[2];
        }
        return {
            source: "SYSLOG",
            eventType: "AUTHENTICATION",
            timestamp: new Date(),
            sourceIP,
            destinationIP: payload.destinationIP || undefined,
            protocol: "TCP",
            username,
            hostname: payload.hostname || "localhost",
            process: "sshd",
            command: logText,
            severity,
            rawEvent: logText,
            normalizedFields: { logMessage: logText }
        };
    }
}
exports.SyslogAdapter = SyslogAdapter;
