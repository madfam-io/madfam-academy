export type PersonaType = 'learner' | 'instructor' | 'admin' | 'super_admin';

export interface User {
  id: string;
  email: string;
  name: string;
  persona: PersonaType;
  avatar?: string;
  bio?: string;
  permissions?: string[];
}

export interface PersonaConfig {
  navigation: NavigationItem[];
  dashboardLayout: DashboardWidget[];
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export interface NavigationItem {
  label: string;
  path: string;
  icon?: string;
  badge?: string | number;
  children?: NavigationItem[];
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  order: number;
}