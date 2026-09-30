import { argon2id } from "hash-wasm";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserRepository } from "../repositories/user.repository";
import { AuditService } from "./audit.service";
import { RegisterInput, LoginInput } from "../schemas/auth.schema";
import { AppError } from "../middleware/error.middleware";

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await argon2id({
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

async function verifyPassword(storedHash: string, password: string): Promise<boolean> {
  try {
    const parts = storedHash.split("$");
    if (parts.length !== 4) return false;
    const salt = parts[2].replace("salt=", "");
    const originalHash = parts[3].replace("hash=", "");
    const candidateHash = await argon2id({
      password,
      salt,
      parallelism: 1,
      memorySize: 65536,
      iterations: 3,
      hashLength: 32,
      outputFormat: "hex"
    });
    return candidateHash === originalHash;
  } catch (err) {
    return false;
  }
}

export class AuthService {
  private userRepo: UserRepository;
  private auditService: AuditService;

  constructor() {
    this.userRepo = new UserRepository();
    this.auditService = new AuditService();
  }

  async register(input: RegisterInput, ipAddress?: string, userAgent?: string) {
    const existingUser = await this.userRepo.findByEmail(input.email);
    if (existingUser) {
      await this.auditService.logEvent({
        action: "USER_REGISTER_FAILED",
        status: "FAILURE",
        ipAddress,
        userAgent,
        metadata: { email: input.email, reason: "Email already registered" }
      });
      throw new AppError("User with this email already exists.", 400, "BAD_REQUEST");
    }

    const roleName = input.roleName || "SECURITY_ANALYST";
    const role = await this.userRepo.findRoleByName(roleName);
    if (!role) {
      throw new AppError(`Role '${roleName}' does not exist.`, 400, "BAD_REQUEST");
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

  async login(input: LoginInput, ipAddress?: string, userAgent?: string) {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      await this.auditService.logEvent({
        action: "FAILED_LOGIN",
        status: "FAILURE",
        ipAddress,
        userAgent,
        metadata: { email: input.email, reason: "User not found" }
      });
      throw new AppError("Invalid email or password.", 401, "UNAUTHORIZED");
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
      throw new AppError("Invalid email or password.", 401, "UNAUTHORIZED");
    }

    if (!user.isActive) {
      throw new AppError("User account is disabled.", 400, "ACCOUNT_DISABLED");
    }

    const permissions = user.role.permissions.map((rp) => rp.permission.name);
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role.name,
        permissions
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

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

  async logout(userId: string, ipAddress?: string, userAgent?: string) {
    await this.auditService.logEvent({
      action: "USER_LOGOUT",
      status: "SUCCESS",
      userId,
      ipAddress,
      userAgent
    });
  }

  async getUserProfile(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError("User not found.", 404, "NOT_FOUND");
    }
    return this.formatUserResponse(user);
  }

  private formatUserResponse(user: any) {
    return {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      is_active: user.isActive,
      role: {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description,
        permissions: user.role.permissions.map((rp: any) => ({
          id: rp.permission.id,
          name: rp.permission.name,
          description: rp.permission.description
        }))
      },
      created_at: user.createdAt
    };
  }
}
