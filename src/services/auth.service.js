import { db } from "#config/database.js";
import logger from "#config/logger.js";
import { users } from "#models/user.model.js";
import { eq } from "drizzle-orm";
import { email } from "zod";
import bcrypt from 'bcrypt';

export const hashedPassword = async (password) => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        logger.error('Error hashing password:', error);
        throw new Error('Password hashing failed');
    }
}


import { jwttoken } from "#utils/jwt.js";

class AuthService {
    createUser = async ({ name, email, password, role }) => {
        try {
            const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
            if (existingUser.length > 0) {
                throw new Error('User with this email already exists');
            }
            const hashed = await hashedPassword(password);
            const [newUser] = await db
                .insert(users)
                .values({ name, email, password: hashed, role })
                .returning({ id: users.id, name: users.name, email: users.email, role: users.role });
            logger.info(`User created with email: ${email}`);
            return newUser;
        } catch (error) {
            logger.error('Error creating user:', error);
            throw error;
        }
    };

    signin = async ({ email, password }) => {
        try {
            const userArr = await db.select().from(users).where(eq(users.email, email)).limit(1);
            if (userArr.length === 0) {
                throw new Error('Invalid email or password');
            }
            const user = userArr[0];
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                throw new Error('Invalid email or password');
            }
            // Generate JWT
            const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });
            logger.info(`User signed in: ${email}`);
            return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
        } catch (error) {
            logger.error('Signin error:', error);
            throw error;
        }
    };

    logout = async () => {
        // For JWT, logout is handled client-side by clearing the token
        // Optionally, you can implement token blacklisting here
        return true;
    };
}

export default new AuthService();