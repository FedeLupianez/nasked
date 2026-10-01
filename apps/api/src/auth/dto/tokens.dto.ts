
export interface Payload {
  sub: number;
  email: string;
}

export interface Tokens {
  refresh: string;
  access: string;
}
