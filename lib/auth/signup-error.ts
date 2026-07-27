interface SupabaseSignupError {
  code?: string;
  message: string;
  status?: number;
}

const signupErrorGuidance: Record<string, string> = {
  email_address_invalid: 'The authentication service rejected this email address.',
  email_exists: 'An account with this work email already exists. Sign in or reset your password.',
  over_email_send_rate_limit: 'Too many verification emails were requested. Wait a few minutes and try again.',
  over_request_rate_limit: 'Too many signup attempts were made. Wait a few minutes and try again.',
  signup_disabled: 'New account registration is disabled in the authentication service.',
  user_already_exists: 'An account with this work email already exists. Sign in or reset your password.',
  weak_password: 'The authentication service rejected this password as too weak.',
};

export function signupErrorMessage(error: SupabaseSignupError) {
  if (error.code && signupErrorGuidance[error.code]) return signupErrorGuidance[error.code];

  const reference = error.code ? ` (error: ${error.code})` : '';
  return `The authentication service could not create the account: ${error.message}${reference}`;
}

export function signupExceptionMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown server error';
}
