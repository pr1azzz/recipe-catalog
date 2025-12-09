const fs = require('fs').promises;
const path = require('path');

const recipesPath = path.join(__dirname, '../data/recipes.json');

class RecipesController {
  // Получить все рецепты
  async getAllRecipes(req, res) {
    try {
      const data = await fs.readFile(recipesPath, 'utf8');
      const recipes = JSON.parse(data);
      
      // Фильтрация по категории (если указана)
      const { category } = req.query;
      if (category) {
        const filtered = recipes.filter(recipe => 
          recipe.category.toLowerCase() === category.toLowerCase()
        );
        return res.json(filtered);
      }
      
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка чтения рецептов' });
    }
  }

  // Получить рецепт по ID
  async getRecipeById(req, res) {
    try {
      const data = await fs.readFile(recipesPath, 'utf8');
      const recipes = JSON.parse(data);
      const recipe = recipes.find(r => r.id === parseInt(req.params.id));
      
      if (!recipe) {
        return res.status(404).json({ error: 'Рецепт не найден' });
      }
      
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка чтения рецепта' });
    }
  }

  // Создать новый рецепт
  async createRecipe(req, res) {
    try {
      const data = await fs.readFile(recipesPath, 'utf8');
      const recipes = JSON.parse(data);
      
      const newRecipe = {
        id: recipes.length > 0 ? Math.max(...recipes.map(r => r.id)) + 1 : 1,
        title: req.body.title,
        ingredients: req.body.ingredients,
        instructions: req.body.instructions || '',
        cookingTime: req.body.cookingTime,
        difficulty: req.body.difficulty || 'средняя',
        category: req.body.category || 'другое'
      };
      
      recipes.push(newRecipe);
      await fs.writeFile(recipesPath, JSON.stringify(recipes, null, 2));
      
      res.status(201).json(newRecipe);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка создания рецепта' });
    }
  }

  // Обновить рецепт
  async updateRecipe(req, res) {
    try {
      const data = await fs.readFile(recipesPath, 'utf8');
      let recipes = JSON.parse(data);
      const recipeIndex = recipes.findIndex(r => r.id === parseInt(req.params.id));
      
      if (recipeIndex === -1) {
        return res.status(404).json({ error: 'Рецепт не найден' });
      }
      
      const updatedRecipe = {
        ...recipes[recipeIndex],
        ...req.body,
        id: recipes[recipeIndex].id // Сохраняем оригинальный ID
      };
      
      recipes[recipeIndex] = updatedRecipe;
      await fs.writeFile(recipesPath, JSON.stringify(recipes, null, 2));
      
      res.json(updatedRecipe);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка обновления рецепта' });
    }
  }

  // Удалить рецепт
  async deleteRecipe(req, res) {
    try {
      const data = await fs.readFile(recipesPath, 'utf8');
      let recipes = JSON.parse(data);
      const recipeIndex = recipes.findIndex(r => r.id === parseInt(req.params.id));
      
      if (recipeIndex === -1) {
        return res.status(404).json({ error: 'Рецепт не найден' });
      }
      
      const deletedRecipe = recipes.splice(recipeIndex, 1);
      await fs.writeFile(recipesPath, JSON.stringify(recipes, null, 2));
      
      res.json({ message: 'Рецепт удален', recipe: deletedRecipe[0] });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка удаления рецепта' });
    }
  }

  // Поиск рецептов по названию
  async searchRecipes(req, res) {
    try {
      const data = await fs.readFile(recipesPath, 'utf8');
      const recipes = JSON.parse(data);
      const { q } = req.query;
      
      if (!q) {
        return res.json(recipes);
      }
      
      const searchTerm = q.toLowerCase();
      const filtered = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm))
      );
      
      res.json(filtered);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка поиска рецептов' });
    }
  }
}

module.exports = new RecipesController();