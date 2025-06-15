export interface Album {
  id: string;
  name: string;
  year: number;
  artistId: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  artist?: {
    id: string;
    name: string;
    grammy: boolean;
    version: number;
    createdAt: Date;
    updatedAt: Date;
  };
} 
