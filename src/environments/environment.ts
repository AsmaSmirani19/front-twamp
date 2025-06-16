// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.



export const environment = {
  production: false,
  ApiUrl: 'http://localhost:5000/api/agents',
  GroupsApiUrl: 'http://localhost:5000/api/agent-group',
  AgentLinkApiUrl : 'http://localhost:5000/api/agent_link',
  testProfileApiUrl: 'http://localhost:5000/api/test-profile',
  thresholdApiUrl: 'http://localhost:5000/api/threshold',
  
  quickTestApiUrl: 'http://localhost:5000/api/quick-test',
  testsApiUrl: 'http://localhost:5000/api/tests',
  testResultsApiUrl: 'http://localhost:5000/api/test-results',
  
  webSocketUrl: 'ws://localhost:8082/ws',


  //healthCheckApiUrl: 'http://localhost:5000/api/health-check'



  qosResultsApiUrl: 'http://localhost:5000/api/qos-results',
  plannedTestApiUrl: 'http://localhost:5000/api/planned-test',
  testResultsByIdApiUrl: 'http://localhost:5000/api/test-results_id',
  realTargetIdApiUrl: 'http://localhost:5000/api/tests/real-target',


};

