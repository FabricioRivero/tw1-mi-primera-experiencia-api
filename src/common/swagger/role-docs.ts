export const PUBLIC_ACCESS = [
  '**Acceso por rol:**',
  '- Administrador: con acceso; no requiere iniciar sesión.',
  '- Candidato: con acceso; no requiere iniciar sesión.',
  '- Organización: con acceso; no requiere iniciar sesión.',
].join('\n');

export const ADMIN_ACCESS = [
  '**Acceso por rol:**',
  '- Administrador: con acceso con sesión activa.',
  '- Candidato: sin acceso.',
  '- Organización: sin acceso.',
].join('\n');

export const CANDIDATE_ACCESS = [
  '**Acceso por rol:**',
  '- Administrador: sin acceso.',
  '- Candidato: con acceso con sesión activa de candidato.',
  '- Organización: sin acceso.',
].join('\n');

export const ORGANIZATION_ACCESS = [
  '**Acceso por rol:**',
  '- Administrador: sin acceso.',
  '- Candidato: sin acceso.',
  '- Organización: con acceso con sesión activa.',
].join('\n');

export const CANDIDATE_ORGANIZATION_ACCESS = [
  '**Acceso por rol:**',
  '- Administrador: sin acceso.',
  '- Candidato: con acceso si es dueño de la postulación.',
  '- Organización: con acceso si es dueña de la oferta.',
].join('\n');

export const AUTHENTICATED_ACCESS = [
  '**Acceso por rol:**',
  '- Administrador: con acceso con sesión activa.',
  '- Candidato: con acceso con sesión activa.',
  '- Organización: con acceso con sesión activa.',
].join('\n');
