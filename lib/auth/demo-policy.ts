export interface DemoEnvironment {
  NODE_ENV?: string;
  ENABLE_DEMO_LOGIN?: string;
}

export function canUseDemoLogin(environment: DemoEnvironment) {
  return environment.NODE_ENV === 'development' && environment.ENABLE_DEMO_LOGIN === 'true';
}

export function isDemoCredentials(environment: DemoEnvironment, username: string, password: string) {
  return canUseDemoLogin(environment) && username === 'admin' && password === 'admin';
}
