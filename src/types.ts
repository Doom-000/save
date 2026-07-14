export interface WorkbookQuestion {
  q: string;
  placeholder: string;
}

export interface MerchItem {
  id: string;
  name: string;
  price: string;
  image: string;
  sizes: string[];
}

export interface ContentCard {
  id: string;
  title: string;
  description: string;
  type: string;
  channelId: string;
  readTime: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  author: string;
  tags: string[];
  rating?: number;
  views?: string;
  badge?: string;
  fullContent?: string;
  podcastUrl?: string;
  videoDuration?: string;
  workbookQuestions?: WorkbookQuestion[];
  merchItems?: MerchItem[];
  extraMeta?: Record<string, string>;
}

export interface Channel {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string; // Name of Lucide icon
  themeColor: string; // Tailwind class
  accentColor: string; // Hex or tailwind class
  borderColor: string;
  domain: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  fullDetail: string;
  category: string;
  images: string[]; // Base64 or online URLs
  tags: string[];
  likes: number;
  likedBy: string[]; // Emails of users who liked
  comments: ProjectComment[];
  dateString: string;
}

export interface ProjectComment {
  id: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  text: string;
  dateString: string;
}

export interface ContactInfo {
  line: string;
  instagram: string;
  facebook: string;
  discord: string;
  email: string;
  phone: string;
  github: string;
  bio: string;
  statusText: string;
}

export interface StickyNote {
  id: string;
  authorName: string;
  authorEmail?: string;
  isAdmin?: boolean;
  text: string;
  color: "yellow" | "pink" | "blue" | "green" | "purple";
  dateString: string;
  rotation: number; // For that lovely, human, messy paper-stick alignment
}

export interface UserProfile {
  uid?: string;
  name: string;
  email: string;
  avatar: string;
  role?: "admin" | "user";
  savedIds: string[];
  completedIds: string[];
  notes: Record<string, string>; // cardId -> personal workbook answers
  merchCart: Record<string, { size: string; qty: number; price: string; name: string }>;
  contactInfo?: ContactInfo;
}
