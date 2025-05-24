export interface HealthUpdate {
  ip: string;
  status: 'OK' | 'FAIL';
}

export interface HealthCheckResult {
  timestamp: Date;
  status: 'OK' | 'FAIL'| 'UNKNOWN';
}
export interface Agent {
  id?: number;
  name: string;
  address: string;
  port?: number;  
  testHealth: boolean;
  healthChecks: [] 
}