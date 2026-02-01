
export interface KBItem {
  id: string;
  question: string;
  answer: string;
  tags: string[];
}

export interface ChatLog {
  id: string;
  timestamp: number;
  userQuery: string; // Full transcript or main query
  botResponse: string; // Summary
  clientName?: string; // Extracted client name
  duration: number;
}

export interface Feedback {
  id: string;
  timestamp: number;
  chatId: string;
  rating: number; // 1-5
  comment?: string;
}

export interface ToolCallArgs {
  query: string;
}

export enum AppMode {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN'
}

export interface LandingFeature {
  title: string;
  desc: string;
  icon: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price?: string;
}

export interface LandingConfig {
  // Home Page
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  featuresTitle: string;
  featuresSubtitle: string;
  features: LandingFeature[];

  // Footer / General Contact
  aboutCompanyText: string;
  contactEmail: string;
  contactPhone: string;
  footerText: string;

  // Products Page
  productsTitle: string;
  productsSubtitle: string;
  whatsappNumber: string; // WhatsApp Number for Demo Requests
  products: Product[];

  // About Page
  aboutPageTitle: string;
  aboutPageContent: string;
  aboutPageImage: string;

  // Contact Page
  contactPageTitle: string;
  contactAddress: string;
  contactMapUrl: string;
}

export interface KnowledgeSnippet {
  id: string;
  content: string;
  imageUrl?: string; // Base64
  timestamp: number;
}

export interface Customer {
  id: string;
  name: string;
  contractNumber: string;
  isActive: boolean;
  createdAt: number;
  lastLogin?: number;
}

export interface AppSettings {
  sessionTimeoutMinutes: number;
}
