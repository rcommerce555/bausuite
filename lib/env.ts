const read = (key: string, fallback = '') => process.env[key] ?? fallback;

export const env = {
  NEXT_PUBLIC_APP_URL: read('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  NEXT_PUBLIC_SUPABASE_URL: read('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: read('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: read('SUPABASE_SERVICE_ROLE_KEY'),
  OPENAI_API_KEY: read('OPENAI_API_KEY'),
  STRIPE_SECRET_KEY: read('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET: read('STRIPE_WEBHOOK_SECRET'),
  STRIPE_PRICE_CORE: read('STRIPE_PRICE_CORE'),
  STRIPE_PRICE_DOCS: read('STRIPE_PRICE_DOCS'),
  STRIPE_PRICE_SITE: read('STRIPE_PRICE_SITE'),
  STRIPE_PRICE_CLAIMS: read('STRIPE_PRICE_CLAIMS'),
  STRIPE_PRICE_ADMIN: read('STRIPE_PRICE_ADMIN'),
  DEFAULT_TENANT_SLUG: read('DEFAULT_TENANT_SLUG', 'demo-nordbau'),
};

export function assertEnv(keys: Array<keyof typeof env>) {
  const missing = keys.filter((key) => !env[key]);
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}
