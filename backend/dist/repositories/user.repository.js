"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const database_1 = require("../config/database");
class UserRepository {
    async findById(id) {
        return database_1.prisma.user.findUnique({
            where: { id },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true
                            }
                        }
                    }
                }
            }
        });
    }
    async findByEmail(email) {
        return database_1.prisma.user.findUnique({
            where: { email },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true
                            }
                        }
                    }
                }
            }
        });
    }
    async findRoleByName(roleName) {
        return database_1.prisma.role.findUnique({
            where: { name: roleName }
        });
    }
    async createUser(data) {
        return database_1.prisma.user.create({
            data: {
                email: data.email,
                password: data.passwordHash,
                fullName: data.fullName,
                roleId: data.roleId
            },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true
                            }
                        }
                    }
                }
            }
        });
    }
    async listAll(skip = 0, take = 100) {
        return database_1.prisma.user.findMany({
            skip,
            take,
            select: {
                id: true,
                email: true,
                fullName: true,
                isActive: true,
                createdAt: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        permissions: {
                            select: {
                                permission: {
                                    select: { id: true, name: true, description: true }
                                }
                            }
                        }
                    }
                }
            }
        });
    }
}
exports.UserRepository = UserRepository;
