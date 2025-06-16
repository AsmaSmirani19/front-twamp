export interface TestResult {
  test_id?: number;
  status?: 'in_progress' | 'completed' | 'failed' | 'error' | 'unknown';

  testName: string;
  testType: string;
  creationDate: string;
  testDuration: string;
  sourceAgent: string;

  targetAgent: string;
  target_id: number[];   

  minValue?: number;
  maxValue?: number;
  avgValue?: number;
  successRate?: number;

  thresholdName?: string;
  thresholdValue?: number;
  selectedMetric: string;
  thresholdType?: 'min' | 'max' | 'avg';
  thresholdOperator?: '<' | '>' | '=';

  attemptResults?: AttemptResult[];
}

export interface AttemptResult {
  test_id: number;
  target_id: number;
  latency_ms: number;
  jitter_ms: number;
  throughput_kbps: number;
}


export interface QoSMetrics {
  test_id: number;
  target_id: number;
  packet_loss_percent: number;
  avg_latency_ms: number;
  avg_jitter_ms: number;
  avg_throughput_kbps: number;
}

