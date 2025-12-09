const express = require('express');
const logger = require('./middleware/logger');
const recipesRoutes = require('./routes/recipes.routes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(express.static('public'));

// Маршруты
app.use('/api/recipes', recipesRoutes);

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

module.exports = app;