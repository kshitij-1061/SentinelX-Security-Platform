import { AssetDiscoveryProvider, DiscoveryConfig, DiscoveredAsset } from "./discovery.interface";
import { AppError } from "../../middleware/error.middleware";

export class MockDiscoveryProvider implements AssetDiscoveryProvider {
  async discover(config: DiscoveryConfig): Promise<DiscoveredAsset[]> {
    const subnet = config.targetSubnet || "192.168.1.0/24";

    // Strict Security Guard: Prevent public IP subnet scanning
    if (
      subnet.startsWith("8.8.") ||
      subnet.startsWith("1.1.") ||
      (!subnet.startsWith("192.168.") &&
        !subnet.startsWith("10.") &&
        !subnet.startsWith("172.16.") &&
        !subnet.startsWith("127.0.0.1"))
    ) {
      throw new AppError("Unrestricted public IP scanning is prohibited for safety. Configured subnet must be a private lab range.", 400, "FORBIDDEN_SCAN_TARGET");
    }

    // Realistic Simulated Enterprise Lab Assets
    return [
      {
        hostname: "WEB-SERVER-01",
        ipAddress: "192.168.1.20",
        macAddress: "00:50:56:A1:B2:C3",
        assetType: "SERVER",
        operatingSystem: "Ubuntu Linux",
        operatingSystemVersion: "22.04 LTS",
        environment: "PRODUCTION",
        criticality: "HIGH",
        owner: "DevOps Team",
        department: "Infrastructure",
        location: "Lab Datacenter - Rack A1",
        status: "ACTIVE",
        services: [
          { protocol: "TCP", port: 22, serviceName: "SSH", serviceVersion: "OpenSSH 8.9p1", status: "OPEN" },
          { protocol: "TCP", port: 80, serviceName: "HTTP", serviceVersion: "Apache httpd 2.4.52", status: "OPEN" },
          { protocol: "TCP", port: 443, serviceName: "HTTPS", serviceVersion: "Apache httpd 2.4.52", status: "OPEN" }
        ],
        software: [
          { name: "Apache HTTP Server", version: "2.4.52", vendor: "Apache Software Foundation" },
          { name: "OpenSSH", version: "8.9p1", vendor: "OpenBSD" },
          { name: "Python", version: "3.10.12", vendor: "Python Software Foundation" }
        ]
      },
      {
        hostname: "DB-CLUSTER-PRIMARY",
        ipAddress: "192.168.1.50",
        macAddress: "00:50:56:D4:E5:F6",
        assetType: "DATABASE",
        operatingSystem: "Debian GNU/Linux",
        operatingSystemVersion: "12 (Bookworm)",
        environment: "PRODUCTION",
        criticality: "CRITICAL",
        owner: "Database Admins",
        department: "Core Operations",
        location: "Lab Datacenter - Rack B2",
        status: "ACTIVE",
        services: [
          { protocol: "TCP", port: 22, serviceName: "SSH", serviceVersion: "OpenSSH 9.2p1", status: "OPEN" },
          { protocol: "TCP", port: 5432, serviceName: "PostgreSQL Database Engine", serviceVersion: "PostgreSQL 16.2", status: "OPEN" }
        ],
        software: [
          { name: "PostgreSQL Server", version: "16.2", vendor: "PostgreSQL Global Development Group" },
          { name: "OpenSSH", version: "9.2p1", vendor: "OpenBSD" }
        ]
      },
      {
        hostname: "CORP-DC-01",
        ipAddress: "192.168.1.10",
        macAddress: "00:50:56:11:22:33",
        assetType: "SERVER",
        operatingSystem: "Windows Server",
        operatingSystemVersion: "2022 Standard",
        environment: "PRODUCTION",
        criticality: "CRITICAL",
        owner: "Active Directory Admin",
        department: "IT Services",
        location: "Lab Datacenter - Rack A2",
        status: "ACTIVE",
        services: [
          { protocol: "TCP", port: 53, serviceName: "DNS", serviceVersion: "Windows DNS", status: "OPEN" },
          { protocol: "TCP", port: 88, serviceName: "Kerberos", serviceVersion: "Microsoft Kerberos", status: "OPEN" },
          { protocol: "TCP", port: 389, serviceName: "LDAP", serviceVersion: "Active Directory Domain Services", status: "OPEN" },
          { protocol: "TCP", port: 445, serviceName: "SMB", serviceVersion: "Microsoft SMB v3", status: "OPEN" }
        ],
        software: [
          { name: "Active Directory Domain Services", version: "10.0.20348", vendor: "Microsoft Corporation" },
          { name: "DNS Server", version: "10.0.20348", vendor: "Microsoft Corporation" }
        ]
      },
      {
        hostname: "DMZ-FW-GATEWAY",
        ipAddress: "192.168.1.1",
        macAddress: "00:50:56:77:88:99",
        assetType: "NETWORK_DEVICE",
        operatingSystem: "pfSense",
        operatingSystemVersion: "2.7.2",
        environment: "DMZ",
        criticality: "CRITICAL",
        owner: "Network Security Team",
        department: "Cybersecurity Operations",
        location: "Perimeter Network Closet",
        status: "ACTIVE",
        services: [
          { protocol: "TCP", port: 22, serviceName: "SSH", serviceVersion: "OpenSSH 9.3p1", status: "OPEN" },
          { protocol: "TCP", port: 443, serviceName: "HTTPS Management", serviceVersion: "pfSense WebConfigurator", status: "OPEN" }
        ],
        software: [
          { name: "pfSense CE", version: "2.7.2", vendor: "Netgate" },
          { name: "Suricata NIDS", version: "6.0.13", vendor: "Open Information Security Foundation" }
        ]
      },
      {
        hostname: "HONEYPOT-SSH-DECOY",
        ipAddress: "192.168.1.99",
        macAddress: "00:50:56:FA:FB:FC",
        assetType: "HONEY_POT",
        operatingSystem: "Alpine Linux",
        operatingSystemVersion: "3.19",
        environment: "DMZ",
        criticality: "LOW",
        owner: "SOC Automation",
        department: "Cybersecurity Operations",
        location: "Virtual Decoy Net",
        status: "ACTIVE",
        services: [
          { protocol: "TCP", port: 2222, serviceName: "Fake SSH Banner Trap", serviceVersion: "Cowrie Honeypot 2.4", status: "OPEN" }
        ],
        software: [
          { name: "Cowrie SSH Honeypot", version: "2.4.0", vendor: "Open Source Deception Project" }
        ]
      }
    ];
  }
}
