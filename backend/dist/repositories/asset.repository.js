"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetRepository = void 0;
const database_1 = require("../config/database");
class AssetRepository {
    async findById(id) {
        return database_1.prisma.asset.findUnique({
            where: { id },
            include: {
                services: true,
                software: true
            }
        });
    }
    async findByIp(ipAddress) {
        return database_1.prisma.asset.findFirst({
            where: { ipAddress },
            include: {
                services: true,
                software: true
            }
        });
    }
    async findByHostname(hostname) {
        return database_1.prisma.asset.findFirst({
            where: { hostname },
            include: {
                services: true,
                software: true
            }
        });
    }
    async create(data) {
        const { services, software, ...assetData } = data;
        return database_1.prisma.asset.create({
            data: {
                ...assetData,
                services: services && services.length > 0 ? {
                    create: services.map((s) => ({
                        protocol: s.protocol,
                        port: s.port,
                        serviceName: s.serviceName,
                        serviceVersion: s.serviceVersion,
                        status: s.status
                    }))
                } : undefined,
                software: software && software.length > 0 ? {
                    create: software.map((sw) => ({
                        name: sw.name,
                        version: sw.version,
                        vendor: sw.vendor,
                        installedAt: sw.installedAt ? new Date(sw.installedAt) : undefined
                    }))
                } : undefined
            },
            include: {
                services: true,
                software: true
            }
        });
    }
    async update(id, data) {
        const { services, software, ...assetData } = data;
        // Handle nested updates or scalar updates
        return database_1.prisma.asset.update({
            where: { id },
            data: {
                ...assetData,
                lastSeen: new Date()
            },
            include: {
                services: true,
                software: true
            }
        });
    }
    async delete(id) {
        return database_1.prisma.asset.delete({
            where: { id }
        });
    }
    async listWithFilters(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.search) {
            where.OR = [
                { hostname: { contains: query.search } },
                { ipAddress: { contains: query.search } },
                { operatingSystem: { contains: query.search } },
                { owner: { contains: query.search } },
                { department: { contains: query.search } }
            ];
        }
        if (query.assetType)
            where.assetType = query.assetType;
        if (query.status)
            where.status = query.status;
        if (query.criticality)
            where.criticality = query.criticality;
        if (query.environment)
            where.environment = query.environment;
        if (query.operatingSystem)
            where.operatingSystem = { contains: query.operatingSystem };
        if (query.ipAddress)
            where.ipAddress = query.ipAddress;
        if (query.hostname)
            where.hostname = { contains: query.hostname };
        const orderByField = query.sortBy || "createdAt";
        const sortDirection = query.sortOrder || "desc";
        const [items, total] = await Promise.all([
            database_1.prisma.asset.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [orderByField]: sortDirection },
                include: {
                    services: true,
                    software: true
                }
            }),
            database_1.prisma.asset.count({ where })
        ]);
        return {
            items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async addServices(assetId, services) {
        await database_1.prisma.assetService.createMany({
            data: services.map((s) => ({
                assetId,
                protocol: s.protocol,
                port: s.port,
                serviceName: s.serviceName,
                serviceVersion: s.serviceVersion,
                status: s.status || "OPEN"
            }))
        });
    }
    async addSoftware(assetId, softwareList) {
        await database_1.prisma.assetSoftware.createMany({
            data: softwareList.map((sw) => ({
                assetId,
                name: sw.name,
                version: sw.version,
                vendor: sw.vendor
            }))
        });
    }
    async getMetrics() {
        const [total, active, critical, honeypots, typeCounts, criticalityCounts] = await Promise.all([
            database_1.prisma.asset.count(),
            database_1.prisma.asset.count({ where: { status: "ACTIVE" } }),
            database_1.prisma.asset.count({ where: { criticality: "CRITICAL" } }),
            database_1.prisma.asset.count({ where: { assetType: "HONEY_POT" } }),
            database_1.prisma.asset.groupBy({ by: ["assetType"], _count: { id: true } }),
            database_1.prisma.asset.groupBy({ by: ["criticality"], _count: { id: true } })
        ]);
        return {
            total,
            active,
            critical,
            honeypots,
            typeDistribution: Object.fromEntries(typeCounts.map((t) => [t.assetType, t._count.id])),
            criticalityDistribution: Object.fromEntries(criticalityCounts.map((c) => [c.criticality, c._count.id]))
        };
    }
}
exports.AssetRepository = AssetRepository;
