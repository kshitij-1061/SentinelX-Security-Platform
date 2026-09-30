export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Enterprise Cyber Defense & Attack Path Intelligence Platform API",
    version: "1.0.0",
    description: "Production-grade Express + TypeScript REST API for SOC Cyber Defense Platform"
  },
  servers: [
    {
      url: "/api/v1",
      description: "API Version 1 Endpoint"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  paths: {
    "/health": {
      get: {
        summary: "System Health Check",
        responses: {
          "200": { description: "System status online" }
        }
      }
    },
    "/auth/register": {
      post: {
        summary: "Register new security user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", example: "analyst@enterprise.lan" },
                  password: { type: "string", example: "SecurePassword123!" },
                  fullName: { type: "string", example: "SOC Analyst One" },
                  roleName: { type: "string", example: "SECURITY_ANALYST" }
                },
                required: ["email", "password", "fullName"]
              }
            }
          }
        },
        responses: {
          "201": { description: "User registered successfully" }
        }
      }
    },
    "/auth/login": {
      post: {
        summary: "Authenticate analyst credentials and issue JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", example: "analyst@enterprise.lan" },
                  password: { type: "string", example: "SecurePassword123!" }
                },
                required: ["email", "password"]
              }
            }
          }
        },
        responses: {
          "200": { description: "JWT Access Token returned" }
        }
      }
    },
    "/assets": {
      get: {
        summary: "List enterprise assets with filtering and pagination",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Asset inventory array returned" }
        }
      },
      post: {
        summary: "Create a new enterprise asset record",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Asset created" }
        }
      }
    },
    "/vulnerabilities": {
      get: {
        summary: "List vulnerabilities with search, filters, and CVSS ordering",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Vulnerability list returned" }
        }
      },
      post: {
        summary: "Create a new vulnerability record",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Vulnerability created" }
        }
      }
    },
    "/vulnerabilities/summary": {
      get: {
        summary: "Get vulnerability metrics summary",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Vulnerability count breakdown by status and severity" }
        }
      }
    },
    "/vulnerabilities/import": {
      post: {
        summary: "Import vulnerabilities from JSON or CSV",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Import statistics report" }
        }
      }
    },
    "/remediations": {
      get: {
        summary: "List remediation tasks",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Remediation tasks array" }
        }
      },
      post: {
        summary: "Create a remediation task",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Remediation task created" }
        }
      }
    }
  }
};
