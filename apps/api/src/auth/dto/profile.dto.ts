import { Tokens } from "./tokens.dto";

export interface Profile {
  name: string;
  lastname: string;
  email: string;
}

export interface SessionDTO extends Profile {
  tokens: Tokens;
}

export type PublicSession = Omit<SessionDTO, 'refreshToken'>;
