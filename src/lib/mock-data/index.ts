import type { KnowledgeDocument, UserRole } from "@/types";

export interface PoultryFact {
  id: string;
  badge: string;
  factNumber: string;
  title: string;
  description: string;
  footerLabel: string;
  footerValue: string;
  image?: string;
}

export const MOCK_FACTS: PoultryFact[] = [];

export const MOCK_DOCUMENTS: KnowledgeDocument[] = [];

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialtyBadge: string;
  description: string;
  achievement: string;
  image: string;
}

export const MOCK_TEAM: TeamMember[] = [
  {
    id: "team-1",
    name: "drh. Ratna Wardani, M.Sc.",
    role: "Kepala Riset Klinis & Biosekuriti Kandang",
    specialtyBadge: "KESEHATAN UNGGAS",
    description:
      "Pengalaman lebih dari 16 tahun dalam mitigasi penyakit avian, formulasi vaksinasi layer, dan standardisasi kebersihan mikrobiologis flock.",
    achievement: "18 Publikasi Jurnal",
    image: "/images/team/ratna.jpg",
  },
  {
    id: "team-2",
    name: "Ir. Hendro Suwandi, Ph.D.",
    role: "Spesialis Formulasi Nutrisi & Substitusi Pakan",
    specialtyBadge: "NUTRISI PAKAN",
    description:
      "Pakar riset rasio asam amino esensial dan pemanfaatan fermentasi bungkil kelapa sawit lokal untuk menurunkan rasio konversi pakan (FCR).",
    achievement: "22 Formularium Teruji",
    image: "/images/team/hendro.jpg",
  },
  {
    id: "team-3",
    name: "Dr. Maya Kusumo, S.P., M.T.",
    role: "Lead Agronom & Arsitektur IoT Kandang",
    specialtyBadge: "SISTEM AGRIBISNIS",
    description:
      "Merancang sensor mikroklimat cerdas hemat energi untuk kandang semi-terbuka dan closed-house ramah lingkungan di iklim tropis lembap.",
    achievement: "14 Paten Kandang Cerdas",
    image: "/images/team/maya.jpg",
  },
];

export const MOCK_ADMIN_STATS = {
  activeVisitors: 0,
  activeVisitorsMoM: "0% MoM",
  pdfDownloads: 0,
  pdfDownloadsLabel: "0 literatur ilmiah",
  totalDocuments: 0,
  monthlyTrends: [],
};

export interface MockUserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "Aktif" | "Nonaktif";
  joinedAt: string;
  phone: string;
}

export const MOCK_USERS: MockUserRecord[] = [
  {
    id: "u-1",
    name: "Administrator Demo",
    email: "admin@demo.local",
    role: "ADMIN",
    status: "Aktif",
    joinedAt: "12 Jan 2024",
    phone: "081234567890",
  },
  {
    id: "u-2",
    name: "Budi Santoso (Peternak Layer)",
    email: "user@demo.local",
    role: "USER",
    status: "Aktif",
    joinedAt: "05 Feb 2024",
    phone: "081398765432",
  },
];
