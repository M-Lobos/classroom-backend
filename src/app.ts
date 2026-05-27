import express from 'express';
import subjectRouter from './routes/subjects.routes'
import cors from 'cors'

const app = express();
const PORT = process.env.PORT;

//cors middleware (mandar a una carpeta de middlewares)
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}))

//middleware for json forms and multiformat
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/subjects', subjectRouter)

app.get('/', (req, res) => {
    res.send('Welcome, API running')
})

//mandar a services
app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});

