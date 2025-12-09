const express = require('express');
const router = express.Router();
const recipesController = require('../controllers/recipes.controller');
const validateRecipe = require('../middleware/validateRecipe');

// Маршруты для рецептов
router.get('/', recipesController.getAllRecipes); // Получить все рецепты
router.get('/search', recipesController.searchRecipes); // Поиск рецептов
router.get('/:id', recipesController.getRecipeById); // Получить рецепт по ID
router.post('/', validateRecipe, recipesController.createRecipe); // Создать рецепт
router.put('/:id', validateRecipe, recipesController.updateRecipe); // Обновить рецепт
router.delete('/:id', recipesController.deleteRecipe); // Удалить рецепт

module.exports = router;