export interface NormalizedEventData {
  source: "SURICATA" | "ZEEK" | "SYSLOG" | "HONEYPOT" | "GENERIC_JSON";
  eventType: string;
  timestamp: Date;
  sourceIP?: string;
  destinationIP?: string;
  sourcePort?: number;
  destinationPort?: number;
  protocol?: string;
  username?: string;
  hostname?: string;
  process?: string;
  command?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  rawEvent: string;
  normalizedFields: Record<string, any>;
}

export interface IEventAdapter {
  name: string;
  parseAndNormalize(payload: any): NormalizedEventData;
}
