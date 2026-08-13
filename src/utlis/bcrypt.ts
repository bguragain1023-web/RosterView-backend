import bcrypt from 'bcrypt'

const saltRound : number = 10;

export const hashedPassword = (plainPassword:string): Promise<string> =>{
    return bcrypt.hash(plainPassword, saltRound)
}

export const comparePassword = ( plainpassword: string, hashPassword: string ): Promise<Boolean>=> {
    return bcrypt.compare(plainpassword, hashPassword)

}