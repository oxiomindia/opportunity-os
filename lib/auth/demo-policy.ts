export interface DemoEnvironment {
  NODE_ENV?: string;
  ENABLE_DEMO_LOGIN?: string;
}

export function canUseDemoLogin(environment: DemoEnvironment) {
  if (environment.NODE_ENV === 'production') return false;
  return environment.NODE_ENV === 'development' || environment.ENABLE_DEMO_LOGIN === 'true';
}
