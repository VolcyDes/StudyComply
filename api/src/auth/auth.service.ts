import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';

// The frontend may send "STUDENT" but the DB enum uses "USER" for students.
// Normalize at the boundary so we never write an invalid role.
function normalizeRole(raw?: string): Role {
  if (!raw) return Role.USER;
  const upper = raw.toUpperCase();
  if (upper === 'UNIVERSITY') return Role.UNIVERSITY;
  if (upper === 'ADMIN') return Role.ADMIN;
  return Role.USER; // STUDENT / USER / anything else → USER
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(email: string, password: string, rawRole?: string) {
    const role = normalizeRole(rawRole);
    const hashed = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: { email, password: hashed, role },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    const token = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { user: { id: user.id, email: user.email, role: user.role }, token };
  }
}
