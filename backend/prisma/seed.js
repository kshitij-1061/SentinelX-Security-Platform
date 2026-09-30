"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const INITIAL_PERMISSIONS = [
    { name: "USER_READ", description: "Read user details and list accounts" },
    { name: "USER_CREATE", description: "Create new user accounts" },
    { name: "USER_UPDATE", description: "Update existing user accounts" },
    { name: "USER_DELETE", description: "Delete user accounts" },
    { name: "AUDIT_READ", description: "Read security audit logs" },
    { name: "SYSTEM_READ", description: "Read system telemetry and status" },
    { name: "SYSTEM_ADMIN", description: "Full administrative control" },
];
const INITIAL_ROLES = [
    {
        name: "ADMIN",
        description: "System Administrator with full security control",
        permissions: ["USER_READ", "USER_CREATE", "USER_UPDATE", "USER_DELETE", "AUDIT_READ", "SYSTEM_READ", "SYSTEM_ADMIN"]
    },
    {
        name: "SECURITY_ANALYST",
        description: "SOC Security Analyst role for investigation and response",
        permissions: ["USER_READ", "AUDIT_READ", "SYSTEM_READ"]
    },
    {
        name: "VIEWER",
        description: "Read-only viewer for SOC dashboards",
        permissions: ["SYSTEM_READ"]
    }
];
async function seedDatabase() {
    // 1. Create permissions
    const permissionMap = new Map();
    for (const perm of INITIAL_PERMISSIONS) {
        const created = await prisma.permission.upsert({
            where: { name: perm.name },
            update: { description: perm.description },
            create: perm
        });
        permissionMap.set(created.name, created.id);
    }
    // 2. Create roles and bind permissions
    for (const roleDef of INITIAL_ROLES) {
        const role = await prisma.role.upsert({
            where: { name: roleDef.name },
            update: { description: roleDef.description },
            create: {
                name: roleDef.name,
                description: roleDef.description
            }
        });
        for (const permName of roleDef.permissions) {
            const permId = permissionMap.get(permName);
            if (permId) {
                await prisma.rolePermission.upsert({
                    where: {
                        roleId_permissionId: {
                            roleId: role.id,
                            permissionId: permId
                        }
                    },
                    update: {},
                    create: {
                        roleId: role.id,
                        permissionId: permId
                    }
                });
            }
        }
    }
    console.log("Database successfully seeded with default Roles and Permissions.");
}
if (require.main === module) {
    seedDatabase()
        .catch((e) => {
        console.error(e);
        process.exit(1);
    })
        .finally(async () => {
        await prisma.$disconnect();
    });
}
