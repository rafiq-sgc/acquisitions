import logger from "#config/logger.js";
import authService from "#services/auth.service.js";
import { cookies } from "#utils/cookies.js";
import { formatValidationError } from "#utils/format.js";
import { jwttoken } from "#utils/jwt.js";
import { signinSchema, signupSchema } from "#validations/auth.validation.js";


export const signin = async (req, res, next) => {
    try {
        const validationResult = signinSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(validationResult.error)
            });
        }
        const { email, password } = validationResult.data;
        const result = await authService.signin({ email, password });
        const token = result.token;
        cookies.set(res, 'token', token);
        logger.info(`User signed in successfully: ${email}`);
        res.status(200).json({
            message: 'User signed in successfully',
            user: result.user,
            token
        });
    } catch (error) {
        logger.error('Signin error:', error);
        return res.status(401).json({ message: error.message || 'Signin failed' });
    }
};

export const logout = async (req, res, next) => {
    try {
        cookies.clear(res, 'token');
        await authService.logout();
        logger.info('User logged out successfully');
        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        logger.error('Logout error:', error);
        next(error);
    }
};

export const signup = async (req, res, next) => {
    try {
        const validationResult = signupSchema.safeParse(req.body);
        if (!validationResult.success) {
             return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(validationResult.error)
             })
        }

        const { name, email, password, role } = validationResult.data;

        const user = await authService.createUser({ name, email, password, role });

        const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });
        cookies.set(res, 'token', token);
        // Proceed with signup logic (e.g., save user to database)
        logger.info(`User signed up successfully: ${email}`);

        res.status(201).json({
            message: 'User signed up successfully',
            user: { 
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        logger.error('Signup error:', error);

        if(error.message === 'User with this email already exists') {
            return res.status(409).json({ message: error.message });
        }

        next(error);
    }
};