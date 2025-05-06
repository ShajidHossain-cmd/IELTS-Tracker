import { User, Session } from "@prisma/client";


export  generateSessionToken();{
    const token = Crypto.randomUUID()
    return token
}