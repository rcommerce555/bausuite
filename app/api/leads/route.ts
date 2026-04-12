import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createLead } from '@/lib/db';

const bodySchema = z.object({
  source: z.string().default('website'),
  name: z.string().min(2),
  company: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  pain: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const body = bodySchema.parse(await request.json());
  const lead = await createLead(body);
  return NextResponse.json({ ok: true, lead });
}
