import bcrypt from 'bcrypt'

const saltRound : number = 10;

export const hashedPassword = (plainPassword:string): Promise<string> =>{
    return bcrypt.hash(plainPassword, saltRound)
}