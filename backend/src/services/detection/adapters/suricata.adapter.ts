import { IEventAdapter, NormalizedEventData } from "./adapter.interface";

export class SuricataAdapter implements IEventAdapter {
  name = "SuricataAdapter";

  parseAndNormalize(payload: any): NormalizedEventData {
    const eve = typeof payload === "string" ? JSON.parse(payload) : payload;

    const alertSev = eve.alert?.severity;
    let severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "MEDIUM";
    if (alertSev === 1) severity = "CRITICAL";
    else if (alertSev === 2) severity = "HIGH";
    else if (alertSev === 3) severity = "MEDIUM";
    else if (alertSev === 4) severity = "LOW";

    return {
      source: "SURICATA",
      eventType: eve.event_type ? eve.event_type.toUpperCase() : "ALERT",
      timestamp: eve.timestamp ? new Date(eve.timestamp) : new Date(),
      sourceIP: eve.src_ip,
      destinationIP: eve.dest_ip,
      sourcePort: eve.src_port,
      destinationPort: eve.dest_port,
      protocol: eve.proto || "TCP",
      username: eve.app_proto || undefined,
      hostname: eve.hostname || eve.host,
      process: eve.alert?.signature || undefined,
      command: eve.alert?.category || undefined,
      severity,
      rawEvent: typeof payload === "string" ? payload : JSON.stringify(payload),
      normalizedFields: {
        signature: eve.alert?.signature,
        category: eve.alert?.category,
        signatureId: eve.alert?.signature_id,
        action: eve.alert?.action || "allowed"
      }
    };
  }
}
