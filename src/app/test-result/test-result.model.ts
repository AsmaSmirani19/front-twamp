export interface TestResult {
  test_id?: number;
  status?: 'in_progress' | 'completed' | 'failed' | 'error' | 'unknown';  // Typage plus précis, optionnel

  testName: string;
  testType: string;
  creationDate: string;
  testDuration: string;
  sourceAgent: string;
  targetAgent: string;

  minValue?: number;
  maxValue?: number;
  avgValue?: number;
  successRate?: number;
  thresholdName?: string;
  thresholdValue?: number;
}
