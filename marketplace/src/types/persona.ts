export type PersonaType = 'learner' | 'instructor' | 'admin' | 'super_admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  persona: PersonaType;
  preferences: UserPreferences;
  profile: PersonaProfile;
  permissions: Permission[];
  status: 'active' | 'suspended' | 'deleted';
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'connections';
    showProgress: boolean;
    showCertificates: boolean;
  };
}

export interface PersonaProfile {
  learner?: LearnerProfile;
  instructor?: InstructorProfile;
  admin?: AdminProfile;
}

export interface LearnerProfile {
  interests: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  learningGoals: string[];
  preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  timeAvailability: {
    hoursPerWeek: number;
    preferredDays: string[];
    preferredTimes: string[];
  };
  certificationGoals: string[];
  industry: string;
  jobTitle: string;
  experience: string;
  education: {
    level: string;
    field: string;
    institution?: string;
  };
  enrolledCourses: string[];
  completedCourses: string[];
  wishlist: string[];
  achievements: Achievement[];
}

export interface InstructorProfile {
  bio: string;
  title: string;
  company?: string;
  website?: string;
  expertise: string[];
  experience: {
    years: number;
    description: string;
  };
  education: EducationRecord[];
  certifications: CertificationRecord[];
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    youtube?: string;
  };
  teachingStyle: string;
  languages: string[];
  timeZone: string;
  availability: {
    hoursPerWeek: number;
    preferredDays: string[];
  };
  pricing: {
    hourlyRate?: number;
    coursePricing: 'fixed' | 'tiered' | 'subscription';
  };
  stats: InstructorStats;
  verification: {
    identity: boolean;
    expertise: boolean;
    background: boolean;
  };
  paymentInfo: {
    taxId?: string;
    bankAccount?: string;
    paypalEmail?: string;
  };
}

export interface AdminProfile {
  department: string;
  role: string;
  permissions: AdminPermission[];
  managedTenants: string[];
  specializations: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: 'course_completion' | 'skill_mastery' | 'engagement' | 'certification';
}

export interface EducationRecord {
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  description?: string;
}

export interface CertificationRecord {
  name: string;
  issuer: string;
  issuedAt: string;
  expiresAt?: string;
  credentialId?: string;
  verificationUrl?: string;
}

export interface InstructorStats {
  coursesCreated: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  completionRate: number;
  responseTime: number; // in hours
  lastActive: string;
}

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  conditions?: Record<string, any>;
}

export interface AdminPermission extends Permission {
  scope: 'global' | 'tenant' | 'course' | 'user';
  tenantIds?: string[];
}

export interface PersonaNavigation {
  learner: NavigationItem[];
  instructor: NavigationItem[];
  admin: NavigationItem[];
  super_admin: NavigationItem[];
}

export interface NavigationItem {
  label: string;
  href: string;
  icon: string;
  description?: string;
  badge?: string;
  children?: NavigationItem[];
  permissions?: Permission[];
}

export interface PersonaFeatures {
  learner: {
    dashboard: boolean;
    courseSearch: boolean;
    wishlist: boolean;
    progress: boolean;
    certificates: boolean;
    community: boolean;
    messaging: boolean;
  };
  instructor: {
    dashboard: boolean;
    courseCreation: boolean;
    analytics: boolean;
    studentManagement: boolean;
    revenue: boolean;
    calendar: boolean;
    messaging: boolean;
  };
  admin: {
    dashboard: boolean;
    userManagement: boolean;
    courseModeration: boolean;
    analytics: boolean;
    contentManagement: boolean;
    systemSettings: boolean;
    reporting: boolean;
  };
  super_admin: {
    dashboard: boolean;
    tenantManagement: boolean;
    globalAnalytics: boolean;
    systemConfiguration: boolean;
    userManagement: boolean;
    billing: boolean;
    security: boolean;
  };
}

export interface PersonaTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  sidebar: string;
  navigation: string;
}

export interface PersonaConfig {
  type: PersonaType;
  label: string;
  description: string;
  features: PersonaFeatures[PersonaType];
  navigation: NavigationItem[];
  theme: PersonaTheme;
  defaultRoute: string;
  permissions: Permission[];
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
  refreshToken: string;
  persona: PersonaConfig;
}