import random from "lodash/random";

export default function generateRandomEmail() {
  const letters = ["a", "b", "c", "x", "t", "i", "o", "l", "m", "j"];
  const providers = ["gmail", "yahoo", "hotmail", "aol"];

  let email: string = "";

  for (let i = 0; i < letters.length - 1; i++) {
    const randomNumber = random(0, letters.length - 1, false);
    const letter = letters[randomNumber] ?? "";
    email = email.concat(letter);
  }

  for (let i = 0; i < 5; i++) {
    const randomNumber = random(0, 9, false);

    email = email.concat(String(randomNumber));
  }

  for (let i = 0; i < 1; i++) {
    const randomNumber = random(i, providers.length - 1, false);
    email = email.concat("@", providers[randomNumber], ".com");
  }

  return email;
}
