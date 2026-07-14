import AgentAPI from 'apminsight';
AgentAPI.config();

import express from 'express';
import subjectRouter from './routes/subjects.routes.js'
import userRoutes from './routes/user.routes.js'
import clasesRoutes from './routes/clases.routes.js'
import departmentRoutes from './routes/departments.routes.js'
import enrollmentsRoutes from './routes/enrollments.routes.js'
import cors from 'cors'
import securityMiddleware from './middlewares/security.js';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './utils/auth.js';


const app = express();
const PORT = process.env.PORT;

//cors middleware (mandar a una carpeta de middlewares)
if (!process.env.FRONTEND_URL) {
    throw new Error('FRONTEND_URL is NOT set in the .env file');
}

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}))

app.all('/api/auth/*splat', toNodeHandler(auth));

//middleware for json forms and multiformat
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(securityMiddleware);

app.use('/api/subjects', subjectRouter);
app.use('/api/users', userRoutes);
app.use('/api/classes', clasesRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/enrollments', enrollmentsRoutes);

app.get('/api/', (req, res) => {
    res.send('Api running, welcome!!! 😻')
})

//mandar a services
app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});



