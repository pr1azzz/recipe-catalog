const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Доступные маршруты:`);
  console.log(`  GET  /api/recipes - все рецепты`);
  console.log(`  GET  /api/recipes?category=салаты - рецепты по категории`);
  console.log(`  GET  /api/recipes/search?q=картофель - поиск рецептов`);
  console.log(`  GET  /api/recipes/:id - рецепт по ID`);
  console.log(`  POST /api/recipes - создать рецепт`);
  console.log(`  PUT  /api/recipes/:id - обновить рецепт`);
  console.log(`  DELETE /api/recipes/:id - удалить рецепт`);
});