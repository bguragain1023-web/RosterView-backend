export const generatePassword = (): string => {
  const str =
    "qwertyuiopasdfghjklzxcvbnm1234567890!#&QWERTYUIOPLKJHGFDSAZXCVBNM";
  let randomPassword: string = "";

  for (let i = 0; i <= 10; i++) {
    const randomIndex: number = Math.floor(Math.random() * str.length);
    randomPassword += str[randomIndex];
  }
  return randomPassword;
};
