"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SigmaRuleAdapter = void 0;
class SigmaRuleAdapter {
    name = "SigmaRuleAdapter";
    evaluateRule(ruleDef, event) {
        try {
            const def = typeof ruleDef === "string" ? JSON.parse(ruleDef) : ruleDef;
            if (!def)
                return false;
            // Direct field condition evaluation
            if (def.field && def.value) {
                const val = event[def.field] || (event.normalizedFields && event.normalizedFields[def.field]);
                if (!val)
                    return false;
                const strVal = String(val).toLowerCase();
                const strTarget = String(def.value).toLowerCase();
                if (def.operator === "equals")
                    return strVal === strTarget;
                if (def.operator === "contains")
                    return strVal.includes(strTarget);
                if (def.operator === "startswith")
                    return strVal.startsWith(strTarget);
                return strVal.includes(strTarget);
            }
            // Selection object evaluation
            if (def.detection && def.detection.selection) {
                const selection = def.detection.selection;
                for (const [key, expectedValue] of Object.entries(selection)) {
                    const val = event[key] || (event.normalizedFields && event.normalizedFields[key]);
                    if (!val)
                        return false;
                    if (String(val).toLowerCase() !== String(expectedValue).toLowerCase()) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        catch (err) {
            return false;
        }
    }
}
exports.SigmaRuleAdapter = SigmaRuleAdapter;
