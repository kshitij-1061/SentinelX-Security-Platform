"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZeekAdapter = void 0;
class ZeekAdapter {
    name = "ZeekAdapter";
    parseAndNormalize(payload) {
        const data = typeof payload === "string" ? JSON.parse(payload) : payload;
        const eventType = data._path ? data._path.toUpperCase() : "CONN";
        return {
            source: "ZEEK",
            eventType,
            timestamp: data.ts ? new Date(typeof data.ts === "number" ? data.ts * 1000 : data.ts) : new Date(),
            sourceIP: data["id.orig_h"] || data.sourceIP,
            destinationIP: data["id.resp_h"] || data.destinationIP,
            sourcePort: data["id.orig_p"] || data.sourcePort,
            destinationPort: data["id.resp_p"] || data.destinationPort,
            protocol: data.proto || "TCP",
            username: data.user || data.username,
            hostname: data.host || data.query,
            process: data.service || undefined,
            command: data.method ? `${data.method} ${data.uri || ""}` : undefined,
            severity: "LOW",
            rawEvent: typeof payload === "string" ? payload : JSON.stringify(payload),
            normalizedFields: {
                uid: data.uid,
                history: data.history,
                origBytes: data.orig_bytes,
                respBytes: data.resp_bytes,
                query: data.query
            }
        };
    }
}
exports.ZeekAdapter = ZeekAdapter;
