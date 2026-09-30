"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const hash_wasm_1 = require("hash-wasm");
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const user_repository_1 = require("../repositories/user.repository");
const audit_service_1 = require("./audit.service");
const error_middleware_1 = require("../middleware/error.middleware");
async function hashPassword(password) {
    const salt = crypto_1.default.randomBytes(16).toString("hex");
    const hash = await (0, hash_wasm_1.argon2id)({
        password,
        salt,
        parallelism: 1,
        memorySize: 65536,
        iterations: 3,
        hashLength: 32,
        outputFormat: "hex"
    });
    return `$argon2id$salt=${salt}$hash=${hash}`;
}
async function verifyPassword(storedHash, password) {
    try {
        const parts = storedHash.split("$");
        if (parts.length !== 4)
            return false;
        const salt = parts[2].replace("salt=", "");
        const originalHash = parts[3].replace("hash=", "");
        const candidateHash = await (0, hash_wasm_1.argon2id)({
            password,
            salt,
            parallelism: 1,
            memorySize: 65536,
            iterations: 3,
            hashLength: 32,
            outputFormat: "hex"
        });
        return candidateHash === originalHash;
    }
    catch (err) {
        return false;
    }
}
class AuthService {
    userRepo;
    auditService;
    constructor() {
        this.userRepo = new user_repository_1.UserRepository();
        this.auditService = new audit_service_1.AuditService();
    }
    async register(input, ipAddress, userAgent) {
        const existingUser = await this.userRepo.findByEmail(input.email);
        if (existingUser) {
            await this.auditService.logEvent({
                action: "USER_REGISTER_FAILED",
                status: "FAILURE",
                ipAddress,
                userAgent,
                metadata: { email: input.email, reason: "Email already registered" }
            });
            throw new error_middleware_1.AppError("User with this email already exists.", 400, "BAD_REQUEST");
        }
        const roleName = input.roleName || "SECURITY_ANALYST";
        const role = await this.userRepo.findRoleByName(roleName);
        if (!role) {
            throw new error_middleware_1.AppError(`Role '${roleName}' does not exist.`, 400, "BAD_REQUEST");
        }
        const passwordHash = await hashPassword(input.password);
        const user = await this.userRepo.createUser({
            email: input.email,
            passwordHash,
            fullName: input.fullName,
            roleId: role.id
        });
        await this.auditService.logEvent({
            action: "USER_REGISTER",
            status: "SUCCESS",
            userId: user.id,
            ipAddress,
            userAgent,
            metadata: { email: user.email, role: role.name }
        });
        return this.formatUserResponse(user);
    }
    async login(input, ipAddress, userAgent) {
        const user = await this.userRepo.findByEmail(input.email);
        if (!user) {
            await this.auditService.logEvent({
                action: "FAILED_LOGIN",
                status: "FAILURE",
                ipAddress,
                userAgent,
                metadata: { email: input.email, reason: "User not found" }
            });
            throw new error_middleware_1.AppError("Invalid email or password.", 401, "UNAUTHORIZED");
        }
        const isPasswordValid = await verifyPassword(user.password, input.password);
        if (!isPasswordValid) {
            await this.auditService.logEvent({
                action: "FAILED_LOGIN",
                status: "FAILURE",
                userId: user.id,
                ipAddress,
                userAgent,
                metadata: { email: input.email, reason: "Invalid password" }
            });
            throw new error_middleware_1.AppError("Invalid email or password.", 401, "UNAUTHORIZED");
        }
        if (!user.isActive) {
            throw new error_middleware_1.AppError("User account is disabled.", 400, "ACCOUNT_DISABLED");
        }
        const permissions = user.role.permissions.map((rp) => rp.permission.name);
        const token = jsonwebtoken_1.default.sign({
            sub: user.id,
            email: user.email,
            role: user.role.name,
            permissions
        }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
        await this.auditService.logEvent({
            action: "USER_LOGIN",
            status: "SUCCESS",
            userId: user.id,
            ipAddress,
            userAgent,
            metadata: { email: user.email }
        });
        return {
            access_token: token,
            token_type: "bearer",
            user: this.formatUserResponse(user)
        };
    }
    async logout(userId, ipAddress, userAgent) {
        await this.auditService.logEvent({
            action: "USER_LOGOUT",
            status: "SUCCESS",
            userId,
            ipAddress,
            userAgent
        });
    }
    async getUserProfile(userId) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new error_middleware_1.AppError("User not found.", 404, "NOT_FOUND");
        }
        return this.formatUserResponse(user);
    }
    formatUserResponse(user) {
        return {
            id: user.id,
            email: user.email,
            full_name: user.fullName,
            is_active: user.isActive,
            role: {
                id: user.role.id,
                name: user.role.name,
                description: user.role.description,
                permissions: user.role.permissions.map((rp) => ({
                    id: rp.permission.id,
                    name: rp.permission.name,
                    description: rp.permission.description
                }))
            },
            created_at: user.createdAt
        };
    }
}
exports.AuthService = AuthService;
