// Centralized env-driven configuration for integration readiness
// These are compile-time values injected by Vite (VITE_*)

export const API_URL = (import.meta.env.VITE_API_URL as string | undefined) || undefined;
export const ENABLE_REMOTE_DB = String(import.meta.env.VITE_ENABLE_REMOTE_DB || '').toLowerCase() === 'true';
export const ENABLE_INTAKE_ANALYSIS = String(import.meta.env.VITE_ENABLE_INTAKE_ANALYSIS || '').toLowerCase() === 'true';

// TODO: Add any additional flags (e.g., auth tokens) as needed for your backend

