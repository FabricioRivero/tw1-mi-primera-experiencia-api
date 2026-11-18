import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PasswordService } from '../src/auth/password.service.js';

const connectionString = process.env.DATABASE_URL;
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;

if (!connectionString) {
  throw new Error('DATABASE_URL no está definida. Copia .env.example a .env.');
}
if (
  !adminEmail ||
  !adminPassword ||
  adminPassword.length < 12 ||
  adminPassword.length > 72
) {
  throw new Error(
    'Define ADMIN_EMAIL y ADMIN_PASSWORD (12–72 caracteres) en .env antes de ejecutar el seed.',
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main(): Promise<void> {
  const roles = [
    { nombre: 'ADMIN', descripcion: 'Administra las categorías del sistema.' },
    {
      nombre: 'CANDIDATO',
      descripcion: 'Consulta ofertas y gestiona sus postulaciones.',
    },
    {
      nombre: 'ORGANIZACION',
      descripcion: 'Publica ofertas y revisa sus postulaciones.',
    },
  ];
  for (const role of roles) {
    await prisma.rol.upsert({
      where: { nombre: role.nombre },
      update: { descripcion: role.descripcion },
      create: role,
    });
  }

  const readCategories = await prisma.permiso.upsert({
    where: { codigo: 'categorias:leer' },
    update: { descripcion: 'Consultar las áreas de pasantías.' },
    create: {
      codigo: 'categorias:leer',
      descripcion: 'Consultar las áreas de pasantías.',
    },
  });
  const manageCategories = await prisma.permiso.upsert({
    where: { codigo: 'categorias:administrar' },
    update: { descripcion: 'Crear, modificar y eliminar áreas de pasantías.' },
    create: {
      codigo: 'categorias:administrar',
      descripcion: 'Crear, modificar y eliminar áreas de pasantías.',
    },
  });

  const roleRecords = await prisma.rol.findMany({
    where: { nombre: { in: roles.map((role) => role.nombre) } },
  });
  for (const role of roleRecords) {
    await prisma.rolPermiso.upsert({
      where: {
        rolId_permisoId: {
          rolId: role.id,
          permisoId: readCategories.id,
        },
      },
      update: {},
      create: { rolId: role.id, permisoId: readCategories.id },
    });
  }
  const adminRole = roleRecords.find((role) => role.nombre === 'ADMIN');
  if (!adminRole) throw new Error('No se pudo crear el rol ADMIN.');
  await prisma.rolPermiso.upsert({
    where: {
      rolId_permisoId: {
        rolId: adminRole.id,
        permisoId: manageCategories.id,
      },
    },
    update: {},
    create: { rolId: adminRole.id, permisoId: manageCategories.id },
  });

  for (const nombre of ['Tecnología', 'Administración', 'Marketing']) {
    await prisma.categoria.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  const existingAdmin = await prisma.usuario.findUnique({
    where: { email: adminEmail },
    include: { rol: true },
  });
  if (existingAdmin && existingAdmin.rol.nombre !== 'ADMIN') {
    throw new Error(
      'ADMIN_EMAIL ya pertenece a una cuenta que no es administradora; usa otro correo.',
    );
  }
  if (!existingAdmin) {
    const passwords = new PasswordService();
    await prisma.usuario.create({
      data: {
        email: adminEmail,
        passwordHash: await passwords.hash(adminPassword),
        rol: { connect: { nombre: 'ADMIN' } },
      },
    });
  }

  console.log(
    'Roles, permisos, categorías y cuenta inicial ADMIN disponibles.',
  );
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
