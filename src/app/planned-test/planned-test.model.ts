export interface Test {
  test_name: string;
  test_duration: string;
  number_of_agents: number;
  creation_date: string;
  inProgress?: boolean;
  isPaused?: boolean; // uniquement si utilisé en UI

  test_type: "quick test" | "planned test"; 
  source_id?: number;
  target_id?: number;
  profile_id?: number;
  threshold_id?: number;
  failed?: boolean;
  completed?: boolean;
  error?: boolean;
}

