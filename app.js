const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const doteenv = require('dotenv');

const app = express();
doteenv.config();

// промежуточная аутентификация
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// установка ejs как движка для визуализации
app.set('view engine', 'ejs');

// присоеденение к базе данных mongodb через mongoose
mongoose.connect(process.env.dbURI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
mongoose.set('useCreateIndex', true)
mongoose.connection.on("error", (err) => console.log(err))
mongoose.connection.on("open", () => console.log("database connected"))

// запуск сервера на порте 3000
const port = 3000
app.listen(port, () => {
    console.log(`Server has been started on port: ${port}`)
})


// routes
app.get('*', checkUser);
app.get('/', (req, res) => res.render('home'));
app.get('/recipes', requireAuth, (req, res) => res.render('recipes'));
app.use(authRoutes);
