import express from 'express';
import { config } from 'dotenv';
import session from 'express-session';
import logger from 'morgan';
import connectDB from './db.js';
import authRouter from './routes/auth.routes.js';

config();

const app = express();
const port = process.env.PORT;


app.use(logger('dev'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', './views');

app.use("/auth", authRouter);

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/home", (req, res) => {
    res.render("home", { user: req.session.user });
});

app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    await connectDB();
});