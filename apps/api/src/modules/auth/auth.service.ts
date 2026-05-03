import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwt.sign(payload),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async registerEgresado(data: {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    dni: string;
    carrera?: string;
    anioEgreso?: number;
  }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('El email ya está registrado');

    const existingDni = await this.prisma.egresado.findUnique({ where: { dni: data.dni } });
    if (existingDni) throw new ConflictException('El DNI ya está registrado');

    const hash = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hash,
        role: UserRole.EGRESADO,
        egresado: {
          create: {
            nombre: data.nombre,
            apellido: data.apellido,
            dni: data.dni,
            carrera: data.carrera,
            anioEgreso: data.anioEgreso,
            formacionAcademica: [],
            experienciaLaboral: [],
          },
        },
      },
    });

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwt.sign(payload),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async registerEmpresa(data: {
    email: string;
    password: string;
    nombreComercial: string;
    razonSocial: string;
    ruc: string;
    sector?: string;
  }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('El email ya está registrado');

    const existingRuc = await this.prisma.empresa.findUnique({ where: { ruc: data.ruc } });
    if (existingRuc) throw new ConflictException('El RUC ya está registrado');

    const hash = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hash,
        role: UserRole.EMPRESA,
        empresa: {
          create: {
            nombreComercial: data.nombreComercial,
            razonSocial: data.razonSocial,
            ruc: data.ruc,
            sector: data.sector,
          },
        },
      },
    });

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwt.sign(payload),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        egresado: true,
        empresa: true,
        administrador: true,
      },
    });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
