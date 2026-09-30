import { IEventAdapter, NormalizedEventData } from "./adapter.interface";

export class SyslogAdapter implements IEventAdapter {
  name = "SyslogAdapter";

  parseAndNormalize(payload: any): NormalizedEventData {
    const logText = typeof payload === "string" ? payload : payload.message || JSON.stringify(payload);

    let sourceIP: string | undefined;
    let username: string | undefined;
    let severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";

    // Extract IP via regex
    const ipMatch = logText.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
    if (ipMatch) sourceIP = ipMatch[0];

    // Check failed auth
    if (logText.toLowerCase().includes("failed password") || logText.toLowerCase().includes("authentication failure")) {
      severity = "HIGH";
      const userMatch = logText.match(/for\s+(invalid user\s+)?(\w+)/i);
      if (userMatch) username = userMatch[2];
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
