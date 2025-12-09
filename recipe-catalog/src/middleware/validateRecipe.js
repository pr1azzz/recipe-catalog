const validateRecipe = (req, res, next) => {
  const { title, ingredients, cookingTime } = req.body;
  
  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: 'Название рецепта обязательно' });
  }
  
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: 'Ингредиенты должны быть массивом' });
  }
  
  if (!cookingTime || cookingTime <= 0) {
    return res.status(400).json({ error: 'Время приготовления должно быть положительным числом' });
  }
  
  next();
};

module.exports = validateRecipe;