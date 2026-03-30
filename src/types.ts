export interface Module {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'combat' | 'render' | 'movement' | 'misc';
  available: boolean;
  unavailableReason?: string;
}

export interface Announcement {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  active: boolean;
  createdAt: number;
}

export interface ClientVersion {
  id: string;
  name: string;
  type: 'legit' | 'hvh';
  version: string;
  downloadUrl: string;
  available: boolean;
  unavailableReason?: string;
  isNew?: boolean;
}

export interface Poll {
  id: string;
  question: string;
  yesVotes: number;
  maxVotes: number;
  active: boolean;
  createdAt: number;
  endedAt?: number;
}

export interface SiteConfig {
  modules: Module[];
  announcements: Announcement[];
  clients: ClientVersion[];
  polls: Poll[];
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export interface UserVotes {
  [pollId: string]: boolean;
}
