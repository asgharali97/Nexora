import { prisma } from '@/src/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { userSchema } from '@/src/lib/validations/user.schema';

export async function POST(req: Request) {
  const result = userSchema.safeParse(await req.json());

  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }

  const { email, name, password } = result.data;
  const existing = await prisma.user.findUnique({
    where: { email }
  });

  if (existing) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
  }
  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashed,
      image: process.env.DEFAULT_USER_IMAGE
    }
  });

  if (!user) {
    return NextResponse.json({ error: 'got error while creating user' }, { status: 500 });
  }
  return NextResponse.json({
    user
  });
}
