"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericJsonAdapter = void 0;
class GenericJsonAdapter {
    name = "GenericJsonAdapter";
    parseAndNormalize(payload) {
        const data = typeof payload === "string" ? JSON.parse(payload) : payload;
        return {
            source: "GENERIC_JSON",
            eventType: data.eventType || data.type || "GENERIC_LOG",
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
            sourceIP: data.sourceIP || data.src_ip || data.srcIp,
            destinationIP: data.destinationIP || data.dest_ip || data.destIp,
            sourcePort: data.sourcePort || data.src_port,
            destinationPort: data.destinationPort || data.dest_port,
            protocol: data.protocol || data.proto || "TCP",
            username: data.username || data.user,
            hostname: data.hostname || data.host,
            process: data.process || data.proc,
            command: data.command || data.cmd,
            severity: (data.severity || "LOW").toUpperCase(),
            rawEvent: typeof payload === "string" ? payload : JSON.stringify(payload),
            normalizedFields: data
        };
    }
}
exports.GenericJsonAdapter = GenericJsonAdapter;
