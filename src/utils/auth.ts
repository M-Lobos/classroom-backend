import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../services/db/index"; // your drizzle instance
import * as schema from "../services/db/schemas/auth"

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET!,
    trustedOrigins: [process.env.FRONTEND_URL!],
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema: schema
    }),
    emailAndPassword: {
        enabled: true,

    },
    //CUSTOM FIELDS ADDED TO THE USER OBJECT
    user: {
        additionalFields: {
            role: {
                type: 'string',
                required: true,
                defaultValue: 'student',
                input: true,                //allows the role to be setted during registration
            },
            imageCldPubId: {
                type: 'string',
                required: false,            //Not necesary to put a image
                input: true,                //allows the role to be setted during registration
            }
        }
    }
});