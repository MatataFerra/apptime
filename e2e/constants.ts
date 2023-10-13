import randomEmail from "../src/utils/helpers/generateRandomEmail";

const email = randomEmail();

export const ENTRY_URL =
  "http://localhost:3000/en/login?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2F%3FisMobile%3Dfalse";
export const ENTRY_URL_MOBILE =
  "http://localhost:3000/en/login?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2F%3FisMobile%3Dtrue";

export const USER_CREDENTIALS = {
  email: "usuario1@example.com",
  password: "Secreto1!",
  wrong_password: "secreto1",

  new_user: {
    email,
    password: "Secreto4!",
  },
};

export function createUser({ email }: { email: string }): { email: string; password: string } {
  return {
    email,
    password: "Secreto4!",
  };
}
