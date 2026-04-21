export type UserKind = 'partner' | 'admin';

export interface JwtUser {
  sub: string;
  kind: UserKind;
  phone?: string;
  email?: string;
}

