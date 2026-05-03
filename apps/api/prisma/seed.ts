import { PrismaClient, UserRole, TipoHabilidad, NivelHabilidad, Modalidad, TipoContrato, EstadoOferta, EstadoPostulacion } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ─── Habilidades ─────────────────────────────────────────────────────────────
  const habilidades = await Promise.all([
    prisma.habilidad.upsert({ where: { nombre: 'JavaScript' }, update: {}, create: { nombre: 'JavaScript', tipo: TipoHabilidad.TECNICA, categoria: 'Programación' } }),
    prisma.habilidad.upsert({ where: { nombre: 'TypeScript' }, update: {}, create: { nombre: 'TypeScript', tipo: TipoHabilidad.TECNICA, categoria: 'Programación' } }),
    prisma.habilidad.upsert({ where: { nombre: 'React' }, update: {}, create: { nombre: 'React', tipo: TipoHabilidad.TECNICA, categoria: 'Frontend' } }),
    prisma.habilidad.upsert({ where: { nombre: 'Node.js' }, update: {}, create: { nombre: 'Node.js', tipo: TipoHabilidad.TECNICA, categoria: 'Backend' } }),
    prisma.habilidad.upsert({ where: { nombre: 'PostgreSQL' }, update: {}, create: { nombre: 'PostgreSQL', tipo: TipoHabilidad.TECNICA, categoria: 'Base de Datos' } }),
    prisma.habilidad.upsert({ where: { nombre: 'Python' }, update: {}, create: { nombre: 'Python', tipo: TipoHabilidad.TECNICA, categoria: 'Programación' } }),
    prisma.habilidad.upsert({ where: { nombre: 'Docker' }, update: {}, create: { nombre: 'Docker', tipo: TipoHabilidad.TECNICA, categoria: 'DevOps' } }),
    prisma.habilidad.upsert({ where: { nombre: 'Git' }, update: {}, create: { nombre: 'Git', tipo: TipoHabilidad.TECNICA, categoria: 'Herramientas' } }),
    prisma.habilidad.upsert({ where: { nombre: 'Trabajo en equipo' }, update: {}, create: { nombre: 'Trabajo en equipo', tipo: TipoHabilidad.BLANDA, categoria: 'Soft Skills' } }),
    prisma.habilidad.upsert({ where: { nombre: 'Comunicación efectiva' }, update: {}, create: { nombre: 'Comunicación efectiva', tipo: TipoHabilidad.BLANDA, categoria: 'Soft Skills' } }),
    prisma.habilidad.upsert({ where: { nombre: 'Liderazgo' }, update: {}, create: { nombre: 'Liderazgo', tipo: TipoHabilidad.BLANDA, categoria: 'Soft Skills' } }),
    prisma.habilidad.upsert({ where: { nombre: 'Java' }, update: {}, create: { nombre: 'Java', tipo: TipoHabilidad.TECNICA, categoria: 'Programación' } }),
    prisma.habilidad.upsert({ where: { nombre: 'AWS' }, update: {}, create: { nombre: 'AWS', tipo: TipoHabilidad.TECNICA, categoria: 'Cloud' } }),
    prisma.habilidad.upsert({ where: { nombre: 'Machine Learning' }, update: {}, create: { nombre: 'Machine Learning', tipo: TipoHabilidad.TECNICA, categoria: 'IA' } }),
    prisma.habilidad.upsert({ where: { nombre: 'Scrum' }, update: {}, create: { nombre: 'Scrum', tipo: TipoHabilidad.TECNICA, categoria: 'Metodologías' } }),
  ]);

  const [js, ts, react, nodejs, postgres, python, docker, git, teamwork, communication, leadership, java, aws, ml, scrum] = habilidades;

  // ─── Admin ────────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin123*', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@demo.edu.pe' },
    update: {},
    create: {
      email: 'admin@demo.edu.pe',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      administrador: {
        create: {
          nombreCompleto: 'Administrador del Sistema',
          area: 'Coordinación de Egresados',
        },
      },
    },
  });
  console.log('✅ Admin creado');

  // ─── Empresas ─────────────────────────────────────────────────────────────────
  const empresaPassword = await bcrypt.hash('Empresa123*', 10);

  const empresa1User = await prisma.user.upsert({
    where: { email: 'empresa@demo.pe' },
    update: {},
    create: {
      email: 'empresa@demo.pe',
      passwordHash: empresaPassword,
      role: UserRole.EMPRESA,
      empresa: {
        create: {
          nombreComercial: 'TechPeru SAC',
          razonSocial: 'Technology Peru Sociedad Anónima Cerrada',
          ruc: '20601234567',
          sector: 'Tecnología',
          sitioWeb: 'https://techperu.pe',
          descripcion: 'Empresa líder en desarrollo de software y consultoría tecnológica en el Perú.',
          logoUrl: 'https://placehold.co/200x80/1a1a2e/ffffff?text=TechPeru',
        },
      },
    },
  });

  const empresa2User = await prisma.user.upsert({
    where: { email: 'softlab@demo.pe' },
    update: {},
    create: {
      email: 'softlab@demo.pe',
      passwordHash: empresaPassword,
      role: UserRole.EMPRESA,
      empresa: {
        create: {
          nombreComercial: 'SoftLab Perú',
          razonSocial: 'Software Laboratory del Peru SAC',
          ruc: '20609876543',
          sector: 'Software',
          sitioWeb: 'https://softlab.pe',
          descripcion: 'Startup de innovación tecnológica con foco en IA y automatización.',
          logoUrl: 'https://placehold.co/200x80/0f3460/ffffff?text=SoftLab',
        },
      },
    },
  });

  const empresa3User = await prisma.user.upsert({
    where: { email: 'datainsight@demo.pe' },
    update: {},
    create: {
      email: 'datainsight@demo.pe',
      passwordHash: empresaPassword,
      role: UserRole.EMPRESA,
      empresa: {
        create: {
          nombreComercial: 'DataInsight Analytics',
          razonSocial: 'Data Insight Analytics Peru SA',
          ruc: '20611223344',
          sector: 'Analítica de Datos',
          sitioWeb: 'https://datainsight.pe',
          descripcion: 'Consultoría especializada en business intelligence y ciencia de datos.',
          logoUrl: 'https://placehold.co/200x80/16213e/ffffff?text=DataInsight',
        },
      },
    },
  });

  console.log('✅ Empresas creadas');

  const empresa1 = await prisma.empresa.findUnique({ where: { id: empresa1User.id } });
  const empresa2 = await prisma.empresa.findUnique({ where: { id: empresa2User.id } });
  const empresa3 = await prisma.empresa.findUnique({ where: { id: empresa3User.id } });

  // ─── Egresados ────────────────────────────────────────────────────────────────
  const egresadoPassword = await bcrypt.hash('Egresado123*', 10);

  const egresadosData = [
    {
      email: 'egresado@demo.pe',
      nombre: 'Carlos',
      apellido: 'Quispe Torres',
      dni: '12345678',
      carrera: 'Ingeniería de Sistemas',
      anioEgreso: 2022,
      telefono: '987654321',
      direccion: 'Av. Universitaria 1234, Lima',
      habilidades: [
        { id: js.id, nivel: NivelHabilidad.AVANZADO },
        { id: ts.id, nivel: NivelHabilidad.INTERMEDIO },
        { id: react.id, nivel: NivelHabilidad.AVANZADO },
        { id: nodejs.id, nivel: NivelHabilidad.INTERMEDIO },
        { id: teamwork.id, nivel: NivelHabilidad.AVANZADO },
      ],
    },
    {
      email: 'maria.flores@demo.pe',
      nombre: 'María',
      apellido: 'Flores Huanca',
      dni: '87654321',
      carrera: 'Ingeniería de Sistemas',
      anioEgreso: 2021,
      telefono: '912345678',
      direccion: 'Jr. Las Flores 456, Miraflores',
      habilidades: [
        { id: python.id, nivel: NivelHabilidad.AVANZADO },
        { id: ml.id, nivel: NivelHabilidad.INTERMEDIO },
        { id: postgres.id, nivel: NivelHabilidad.INTERMEDIO },
        { id: git.id, nivel: NivelHabilidad.AVANZADO },
        { id: communication.id, nivel: NivelHabilidad.AVANZADO },
      ],
    },
    {
      email: 'juan.mamani@demo.pe',
      nombre: 'Juan',
      apellido: 'Mamani Condori',
      dni: '45678901',
      carrera: 'Administración de Empresas',
      anioEgreso: 2023,
      telefono: '956789012',
      direccion: 'Av. Arequipa 789, San Isidro',
      habilidades: [
        { id: scrum.id, nivel: NivelHabilidad.AVANZADO },
        { id: leadership.id, nivel: NivelHabilidad.INTERMEDIO },
        { id: communication.id, nivel: NivelHabilidad.AVANZADO },
        { id: teamwork.id, nivel: NivelHabilidad.AVANZADO },
      ],
    },
    {
      email: 'lucia.vargas@demo.pe',
      nombre: 'Lucía',
      apellido: 'Vargas Paredes',
      dni: '32165498',
      carrera: 'Ingeniería de Software',
      anioEgreso: 2022,
      telefono: '934567890',
      direccion: 'Calle Los Álamos 321, Surco',
      habilidades: [
        { id: java.id, nivel: NivelHabilidad.AVANZADO },
        { id: docker.id, nivel: NivelHabilidad.INTERMEDIO },
        { id: aws.id, nivel: NivelHabilidad.BASICO },
        { id: postgres.id, nivel: NivelHabilidad.AVANZADO },
        { id: git.id, nivel: NivelHabilidad.AVANZADO },
      ],
    },
    {
      email: 'pedro.huaman@demo.pe',
      nombre: 'Pedro',
      apellido: 'Huaman Gutierrez',
      dni: '65498732',
      carrera: 'Ingeniería de Sistemas',
      anioEgreso: 2020,
      telefono: '978901234',
      direccion: 'Av. Brasil 654, Pueblo Libre',
      habilidades: [
        { id: python.id, nivel: NivelHabilidad.EXPERTO },
        { id: ml.id, nivel: NivelHabilidad.AVANZADO },
        { id: aws.id, nivel: NivelHabilidad.INTERMEDIO },
        { id: docker.id, nivel: NivelHabilidad.INTERMEDIO },
      ],
    },
    {
      email: 'ana.rios@demo.pe',
      nombre: 'Ana',
      apellido: 'Ríos Castillo',
      dni: '78901234',
      carrera: 'Contabilidad',
      anioEgreso: 2021,
      telefono: '945678901',
      direccion: 'Jr. Carabaya 987, Cercado de Lima',
      habilidades: [
        { id: communication.id, nivel: NivelHabilidad.EXPERTO },
        { id: leadership.id, nivel: NivelHabilidad.AVANZADO },
        { id: teamwork.id, nivel: NivelHabilidad.AVANZADO },
      ],
    },
    {
      email: 'roberto.silva@demo.pe',
      nombre: 'Roberto',
      apellido: 'Silva Mendoza',
      dni: '56789012',
      carrera: 'Ingeniería de Software',
      anioEgreso: 2023,
      telefono: '967890123',
      direccion: 'Av. La Marina 1122, San Miguel',
      habilidades: [
        { id: react.id, nivel: NivelHabilidad.AVANZADO },
        { id: ts.id, nivel: NivelHabilidad.AVANZADO },
        { id: nodejs.id, nivel: NivelHabilidad.AVANZADO },
        { id: docker.id, nivel: NivelHabilidad.INTERMEDIO },
        { id: teamwork.id, nivel: NivelHabilidad.INTERMEDIO },
      ],
    },
    {
      email: 'sofia.luna@demo.pe',
      nombre: 'Sofía',
      apellido: 'Luna Pérez',
      dni: '90123456',
      carrera: 'Administración de Empresas',
      anioEgreso: 2020,
      telefono: '989012345',
      direccion: 'Calle Roma 456, Miraflores',
      habilidades: [
        { id: scrum.id, nivel: NivelHabilidad.EXPERTO },
        { id: leadership.id, nivel: NivelHabilidad.EXPERTO },
        { id: communication.id, nivel: NivelHabilidad.EXPERTO },
      ],
    },
  ];

  const egresadosCreados = [];
  for (const data of egresadosData) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        passwordHash: egresadoPassword,
        role: UserRole.EGRESADO,
        egresado: {
          create: {
            nombre: data.nombre,
            apellido: data.apellido,
            dni: data.dni,
            carrera: data.carrera,
            anioEgreso: data.anioEgreso,
            telefono: data.telefono,
            direccion: data.direccion,
            formacionAcademica: [
              {
                institucion: 'Universidad Nacional Mayor de San Marcos',
                titulo: `Bachiller en ${data.carrera}`,
                anioInicio: data.anioEgreso - 5,
                anioFin: data.anioEgreso,
              },
            ],
            experienciaLaboral: [
              {
                empresa: 'Empresa Anterior SAC',
                cargo: 'Practicante',
                descripcion: 'Desarrollo de proyectos internos',
                anioInicio: data.anioEgreso,
                anioFin: data.anioEgreso + 1,
              },
            ],
          },
        },
      },
    });

    for (const hab of data.habilidades) {
      await prisma.egresadoHabilidad.upsert({
        where: { egresadoId_habilidadId: { egresadoId: user.id, habilidadId: hab.id } },
        update: {},
        create: { egresadoId: user.id, habilidadId: hab.id, nivel: hab.nivel },
      });
    }
    egresadosCreados.push(user);
  }
  console.log('✅ Egresados creados');

  // ─── Ofertas Laborales ────────────────────────────────────────────────────────
  const ofertasData = [
    {
      empresaId: empresa1!.id,
      titulo: 'Desarrollador Full Stack Senior',
      descripcion: 'Buscamos un desarrollador Full Stack con experiencia en React y Node.js para liderar proyectos de transformación digital.',
      ubicacion: 'Lima, Perú',
      modalidad: Modalidad.HIBRIDO,
      tipoContrato: TipoContrato.TIEMPO_COMPLETO,
      salarioMin: 5000,
      salarioMax: 8000,
      estado: EstadoOferta.ACTIVA,
      habilidades: [
        { id: react.id, requerido: true },
        { id: nodejs.id, requerido: true },
        { id: ts.id, requerido: true },
        { id: postgres.id, requerido: false },
        { id: docker.id, requerido: false },
      ],
    },
    {
      empresaId: empresa1!.id,
      titulo: 'Desarrollador Frontend React',
      descripcion: 'Únete a nuestro equipo de frontend para construir interfaces modernas y accesibles para nuestros clientes empresariales.',
      ubicacion: 'Lima, Perú',
      modalidad: Modalidad.REMOTO,
      tipoContrato: TipoContrato.TIEMPO_COMPLETO,
      salarioMin: 3500,
      salarioMax: 5500,
      estado: EstadoOferta.ACTIVA,
      habilidades: [
        { id: react.id, requerido: true },
        { id: js.id, requerido: true },
        { id: ts.id, requerido: false },
        { id: git.id, requerido: true },
      ],
    },
    {
      empresaId: empresa2!.id,
      titulo: 'Científico de Datos Junior',
      descripcion: 'Posición ideal para egresados apasionados por la inteligencia artificial y el análisis de datos masivos.',
      ubicacion: 'Lima, Perú',
      modalidad: Modalidad.PRESENCIAL,
      tipoContrato: TipoContrato.TIEMPO_COMPLETO,
      salarioMin: 3000,
      salarioMax: 5000,
      estado: EstadoOferta.ACTIVA,
      habilidades: [
        { id: python.id, requerido: true },
        { id: ml.id, requerido: true },
        { id: postgres.id, requerido: false },
        { id: communication.id, requerido: true },
      ],
    },
    {
      empresaId: empresa2!.id,
      titulo: 'DevOps Engineer',
      descripcion: 'Gestiona y automatiza nuestra infraestructura en la nube. Trabaja con Docker, Kubernetes y AWS.',
      ubicacion: 'Remoto',
      modalidad: Modalidad.REMOTO,
      tipoContrato: TipoContrato.TIEMPO_COMPLETO,
      salarioMin: 6000,
      salarioMax: 9000,
      estado: EstadoOferta.ACTIVA,
      habilidades: [
        { id: docker.id, requerido: true },
        { id: aws.id, requerido: true },
        { id: python.id, requerido: false },
        { id: git.id, requerido: true },
      ],
    },
    {
      empresaId: empresa3!.id,
      titulo: 'Analista de Business Intelligence',
      descripcion: 'Diseña y mantén dashboards estratégicos para la toma de decisiones ejecutivas.',
      ubicacion: 'Lima, Perú',
      modalidad: Modalidad.HIBRIDO,
      tipoContrato: TipoContrato.TIEMPO_COMPLETO,
      salarioMin: 4000,
      salarioMax: 6000,
      estado: EstadoOferta.ACTIVA,
      habilidades: [
        { id: postgres.id, requerido: true },
        { id: python.id, requerido: false },
        { id: communication.id, requerido: true },
        { id: scrum.id, requerido: false },
      ],
    },
    {
      empresaId: empresa3!.id,
      titulo: 'Practicante de Desarrollo Backend Java',
      descripcion: 'Oportunidad de prácticas para egresados recientes con conocimientos en Java y bases de datos.',
      ubicacion: 'Lima, Perú',
      modalidad: Modalidad.PRESENCIAL,
      tipoContrato: TipoContrato.PRACTICAS,
      salarioMin: 1500,
      salarioMax: 2000,
      estado: EstadoOferta.ACTIVA,
      habilidades: [
        { id: java.id, requerido: true },
        { id: postgres.id, requerido: false },
        { id: teamwork.id, requerido: true },
      ],
    },
    {
      empresaId: empresa1!.id,
      titulo: 'Gestor de Proyectos TI',
      descripcion: 'Lidera proyectos de transformación digital aplicando metodologías ágiles.',
      ubicacion: 'Lima, Perú',
      modalidad: Modalidad.HIBRIDO,
      tipoContrato: TipoContrato.TIEMPO_COMPLETO,
      salarioMin: 5500,
      salarioMax: 7500,
      estado: EstadoOferta.CERRADA,
      habilidades: [
        { id: scrum.id, requerido: true },
        { id: leadership.id, requerido: true },
        { id: communication.id, requerido: true },
      ],
    },
  ];

  const ofertasCreadas = [];
  for (const data of ofertasData) {
    const { habilidades: habs, ...ofertaData } = data;
    const oferta = await prisma.ofertaLaboral.create({
      data: {
        ...ofertaData,
        salarioMin: ofertaData.salarioMin,
        salarioMax: ofertaData.salarioMax,
        habilidades: {
          create: habs.map((h) => ({ habilidadId: h.id, requerido: h.requerido })),
        },
      },
    });
    ofertasCreadas.push(oferta);
  }
  console.log('✅ Ofertas laborales creadas');

  // ─── Postulaciones con historial ─────────────────────────────────────────────
  const postulacionesData = [
    { ofertaIdx: 0, egresadoIdx: 0, estado: EstadoPostulacion.ENTREVISTA },
    { ofertaIdx: 0, egresadoIdx: 6, estado: EstadoPostulacion.EN_REVISION },
    { ofertaIdx: 1, egresadoIdx: 0, estado: EstadoPostulacion.POSTULADO },
    { ofertaIdx: 1, egresadoIdx: 6, estado: EstadoPostulacion.CONTRATADO },
    { ofertaIdx: 2, egresadoIdx: 1, estado: EstadoPostulacion.ENTREVISTA },
    { ofertaIdx: 2, egresadoIdx: 4, estado: EstadoPostulacion.CONTRATADO },
    { ofertaIdx: 3, egresadoIdx: 4, estado: EstadoPostulacion.POSTULADO },
    { ofertaIdx: 3, egresadoIdx: 3, estado: EstadoPostulacion.RECHAZADO },
    { ofertaIdx: 4, egresadoIdx: 2, estado: EstadoPostulacion.EN_REVISION },
    { ofertaIdx: 4, egresadoIdx: 7, estado: EstadoPostulacion.CONTRATADO },
    { ofertaIdx: 5, egresadoIdx: 3, estado: EstadoPostulacion.POSTULADO },
    { ofertaIdx: 5, egresadoIdx: 0, estado: EstadoPostulacion.EN_REVISION },
  ];

  for (const data of postulacionesData) {
    const postulacion = await prisma.postulacion.create({
      data: {
        ofertaId: ofertasCreadas[data.ofertaIdx].id,
        egresadoId: egresadosCreados[data.egresadoIdx].id,
        estado: data.estado,
        historial: {
          create: [
            { estadoAnterior: null, estadoNuevo: 'POSTULADO', usuarioCambioId: egresadosCreados[data.egresadoIdx].id },
            ...(data.estado !== EstadoPostulacion.POSTULADO
              ? [{ estadoAnterior: 'POSTULADO', estadoNuevo: data.estado, usuarioCambioId: adminUser.id }]
              : []),
          ],
        },
      },
    });
  }
  console.log('✅ Postulaciones creadas');

  // ─── Notificaciones ───────────────────────────────────────────────────────────
  await prisma.notificacion.createMany({
    data: [
      { usuarioId: egresadosCreados[0].id, tipo: 'POSTULACION_ACTUALIZADA', titulo: 'Tu postulación fue actualizada', contenido: 'Tu postulación para Desarrollador Full Stack Senior pasó a ENTREVISTA.' },
      { usuarioId: egresadosCreados[1].id, tipo: 'NUEVA_OFERTA', titulo: 'Nueva oferta disponible', contenido: 'Hay una nueva oferta que coincide con tu perfil: Científico de Datos Junior.' },
      { usuarioId: egresadosCreados[6].id, tipo: 'POSTULACION_ACTUALIZADA', titulo: '¡Felicitaciones! Fuiste contratado', contenido: 'Tu postulación para Desarrollador Frontend React fue aceptada. ¡Bienvenido a TechPeru!' },
      { usuarioId: empresa1User.id, tipo: 'NUEVA_POSTULACION', titulo: 'Nueva postulación recibida', contenido: 'Carlos Quispe Torres se postuló a Desarrollador Full Stack Senior.' },
    ],
  });
  console.log('✅ Notificaciones creadas');

  console.log('\n🎉 Seed completado exitosamente!\n');
  console.log('📋 Credenciales de prueba:');
  console.log('─────────────────────────────────────');
  console.log('👤 Administrador:');
  console.log('   Email:    admin@demo.edu.pe');
  console.log('   Password: Admin123*');
  console.log('─────────────────────────────────────');
  console.log('🏢 Empresa:');
  console.log('   Email:    empresa@demo.pe');
  console.log('   Password: Empresa123*');
  console.log('─────────────────────────────────────');
  console.log('🎓 Egresado:');
  console.log('   Email:    egresado@demo.pe');
  console.log('   Password: Egresado123*');
  console.log('─────────────────────────────────────\n');
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
