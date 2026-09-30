import { prisma } from "../config/database";
import { User, Role } from "@prisma/client";

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
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

  async findByEmail(email: string) {
    return prisma.user.findUnique({
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

  async findRoleByName(roleName: string): Promise<Role | null> {
    return prisma.role.findUnique({
      where: { name: roleName }
    });
  }

  async createUser(data: { email: string; passwordHash: string; fullName: string; roleId: string }) {
    return prisma.user.create({
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
    return prisma.user.findMany({
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
