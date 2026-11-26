export type Capability = { supported: boolean; reason?: string };
export type Capabilities = Record<
  | 'registerUser'
  | 'loginUser'
  | 'statistics'
  | 'stopTracking'
  | 'logout'
  | 'marketplace'
  | 'offerDetails'
  | 'badgeList'
  | 'poiDetails',
  Capability
>;
export interface Status {
  platform: 'ios' | 'android';
  environment: 'stage' | 'production';
  sdkVersion: string;
  motionTagVersion: string;
  state: 'unconfigured' | 'inactive' | 'idle' | 'ready' | 'error';
  activated: boolean;
  initialized: boolean;
  authenticated: boolean;
  tracking: 'unknown';
  providerOpen: boolean;
  errorCode?: string;
  registrationState?: 'notStarted' | 'uncertain' | 'existing';
}
export interface Statistics {
  coins: number;
  walkingDistance?: number;
  cyclingDistance?: number;
  co2Avoided?: number;
}
export interface ChangersNative {
  readonly safeStatistics?: boolean;
  readonly badgeLinks?: boolean;
  addListener(event: 'onProviderClosed', listener: () => void): { remove(): void };
  getStatus(): Promise<Status>;
  setEnabled(enabled: boolean): Promise<void>;
  activate(): Promise<Status>;
  getUserUUID(): Promise<string | null>;
  openProvider(): Promise<void>;
  openOffer(offerId: string): Promise<void>;
  closeProvider(): Promise<void>;
  registerUser(): Promise<string | null>;
  loginUser(uuid: string): Promise<string | null>;
  fetchStatistics(): Promise<Statistics>;
  stopTracking(): Promise<void>;
  logout(): Promise<void>;
  openTarget(target: string): Promise<void>;
}
