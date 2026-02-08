import { validatePasswordOrThrow } from "./password";

export type SignupInput = {
  email: string;
  password: string;
  accountType: "PERSONAL" | "COMPANY";
};

export type NormalizedSignupInput = {
  email: string;
  emailNorm: string;
  password: string;
  accountType: "PERSONAL" | "COMPANY";
};

export function normalizeEmail(email: string): { email: string; emailNorm: string } {
  const trimmed = email.trim();
  const emailNorm = trimmed.toLowerCase();
  return { email: trimmed, emailNorm };
}

export function validateAndNormalizeSignupInput(input: SignupInput): NormalizedSignupInput {
  const { email, emailNorm } = normalizeEmail(input.email);

  if (!emailNorm.includes("@")) {
    throw new Error("Invalid email.");
  }

  validatePasswordOrThrow(input.password);

  return {
    email,
    emailNorm,
    password: input.password,
    accountType: input.accountType,
  };
}
