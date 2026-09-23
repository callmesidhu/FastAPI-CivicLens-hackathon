export interface Accessibility {
  wheelchairAccessible: boolean;
}

export interface Facility {
  id: string;
  name: string;
  type: 'toilet' | 'drinking_water';
  latitude: number;
  longitude: number;
  address: string;
  accessibility: Accessibility;
  availability: string;
  condition: 'clean' | 'usable' | 'broken' | 'locked' | 'no_water';
  lastUpdated: string;
  distanceMeters?: number;
  confidenceScore?: number;
  confidenceLevel?: string;
  isUserReported?: boolean;
  imageUrl?: string;
  verifiedByMunicipal?: boolean;
  status?: 'active' | 'pending' | 'rejected';
  submittedBy?: string;
  verifications?: string[];
}

export interface FacilityListResponse {
  data: Facility[];
}
