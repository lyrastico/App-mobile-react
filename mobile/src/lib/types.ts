export type Photo = {
  id: string;
  uri: string;
  dateISO: string;
  latitude: number;
  longitude: number;
};

export type UserProfile = {
  name: string;
  email?: string;
  bio?: string;
};
