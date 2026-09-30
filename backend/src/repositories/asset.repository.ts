import { prisma } from "../config/database";
import { CreateAssetInput, UpdateAssetInput, AssetQueryInput } from "../schemas/asset.schema";

export class AssetRepository {
  async findById(id: string) {
    return prisma.asset.findUnique({
      where: { id },
      include: {
        services: true,
        software: true
      }
    });
  }

  async findByIp(ipAddress: string) {
    return prisma.asset.findFirst({
      where: { ipAddress },
      include: {
        services: true,
        software: true
      }
    });
  }

  async findByHostname(hostname: string) {
    return prisma.asset.findFirst({
      where: { hostname },
      include: {
        services: true,
        software: true
      }
    });
  }

  async create(data: CreateAssetInput) {
    const { services, software, ...assetData } = data;

    return prisma.asset.create({
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

  async update(id: string, data: UpdateAssetInput) {
    const { services, software, ...assetData } = data;

    // Handle nested updates or scalar updates
    return prisma.asset.update({
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

  async delete(id: string) {
    return prisma.asset.delete({
      where: { id }
    });
  }

  async listWithFilters(query: AssetQueryInput) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { hostname: { contains: query.search } },
        { ipAddress: { contains: query.search } },
        { operatingSystem: { contains: query.search } },
        { owner: { contains: query.search } },
        { department: { contains: query.search } }
      ];
    }

    if (query.assetType) where.assetType = query.assetType;
    if (query.status) where.status = query.status;
    if (query.criticality) where.criticality = query.criticality;
    if (query.environment) where.environment = query.environment;
    if (query.operatingSystem) where.operatingSystem = { contains: query.operatingSystem };
    if (query.ipAddress) where.ipAddress = query.ipAddress;
    if (query.hostname) where.hostname = { contains: query.hostname };

    const orderByField = query.sortBy || "createdAt";
    const sortDirection = query.sortOrder || "desc";

    const [items, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderByField]: sortDirection },
        include: {
          services: true,
          software: true
        }
      }),
      prisma.asset.count({ where })
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

  async addServices(assetId: string, services: Array<{ protocol: string; port: number; serviceName: string; serviceVersion?: string; status?: string }>) {
    await prisma.assetService.createMany({
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

  async addSoftware(assetId: string, softwareList: Array<{ name: string; version: string; vendor?: string }>) {
    await prisma.assetSoftware.createMany({
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
      prisma.asset.count(),
      prisma.asset.count({ where: { status: "ACTIVE" } }),
      prisma.asset.count({ where: { criticality: "CRITICAL" } }),
      prisma.asset.count({ where: { assetType: "HONEY_POT" } }),
      prisma.asset.groupBy({ by: ["assetType"], _count: { id: true } }),
      prisma.asset.groupBy({ by: ["criticality"], _count: { id: true } })
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
