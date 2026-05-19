export type LoginPayload = {
  username: string;
  password: string;
};

export type SignupPayload = {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phone?: string;
};
