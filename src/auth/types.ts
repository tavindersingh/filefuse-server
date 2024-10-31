export type JwtPayload = {
  sub: string;
  email?: string;
  isAnonymous?: boolean;
};
