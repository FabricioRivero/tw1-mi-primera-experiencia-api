import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'allowed-roles';
export type AppRole = 'ADMIN' | 'CANDIDATO' | 'ORGANIZACION';

export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
