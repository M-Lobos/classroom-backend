import express from 'express';


const app = express();
const PORT = 8000;

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Welcome, API running')
})

app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});
