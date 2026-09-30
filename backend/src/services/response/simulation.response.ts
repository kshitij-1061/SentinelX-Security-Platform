import { ExecuteResponseActionInput } from "../../schemas/incident.schema";

export interface ResponseActionResult {
  success: boolean;
  action: string;
  target: string;
  mode: "SAFE_SIMULATION";
  auditDetails: string;
  timestamp: Date;
}

export interface IResponseProvider {
  name: string;
  executeAction(input: ExecuteResponseActionInput, analyst: string): Promise<ResponseActionResult>;
}

export class SimulationResponseProvider implements IResponseProvider {
  name = "SafeSimulationResponseProvider";

  async executeAction(input: ExecuteResponseActionInput, analyst: string): Promise<ResponseActionResult> {
    // Explicit confirmation guard check
    if (!input.confirmed) {
      throw new Error("Response action rejected: Explicit analyst confirmation is mandatory.");
    }

    let auditDetails = "";

    switch (input.action) {
      case "BLOCK_TEST_IP":
        auditDetails = `[SAFE_SIMULATION] Simulated firewall block rule created for target IP '${input.target}'. No network interfaces modified.`;
        break;
      case "DISABLE_TEST_ACCOUNT":
        auditDetails = `[SAFE_SIMULATION] Simulated Active Directory account lock executed for user '${input.target}'. No production directory altered.`;
        break;
      case "ISOLATE_TEST_ENDPOINT":
        auditDetails = `[SAFE_SIMULATION] Simulated host isolation flag set for endpoint '${input.target}'. System connectivity preserved.`;
        break;
      case "ADD_TEST_BLOCKLIST":
        auditDetails = `[SAFE_SIMULATION] Threat indicator '${input.target}' appended to simulated SOC blocklist database.`;
        break;
      case "CLOSE_INCIDENT":
        auditDetails = `[SAFE_SIMULATION] Incident state transitioned to RESOLVED following response verification.`;
        break;
    }

    return {
      success: true,
      action: input.action,
      target: input.target,
      mode: "SAFE_SIMULATION",
      auditDetails,
      timestamp: new Date()
    };
  }
}
