document.addEventListener('DOMContentLoaded', function() {
    const recipesList = document.getElementById('recipesList');
    const recipeDetails = document.getElementById('recipeDetails');
    const addRecipeForm = document.getElementById('addRecipeForm');
    const recipeForm = document.getElementById('recipeForm');
    const showAllBtn = document.getElementById('showAllBtn');
    const addRecipeBtn = document.getElementById('addRecipeBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const categoryFilter = document.getElementById('categoryFilter');
    
    let currentRecipes = [];
    let currentMode = 'view'; // 'view' или 'add'
    let editingRecipeId = null;
    
    // Инициализация
    loadRecipes();
    setupEventListeners();
    
    // Загрузка рецептов
    async function loadRecipes(category = '', search = '') {
        try {
            let url = '/api/recipes';
            if (category) {
                url += `?category=${category}`;
            } else if (search) {
                url += `/search?q=${search}`;
            }
            
            const response = await fetch(url);
            const recipes = await response.json();
            currentRecipes = recipes;
            displayRecipesList(recipes);
            
            if (recipes.length > 0 && currentMode === 'view') {
                loadRecipeDetails(recipes[0].id);
            }
        } catch (error) {
            console.error('Ошибка загрузки рецептов:', error);
            alert('Не удалось загрузить рецепты');
        }
    }
    
    // Отображение списка рецептов
    function displayRecipesList(recipes) {
        recipesList.innerHTML = '';
        
        if (recipes.length === 0) {
            recipesList.innerHTML = '<p class="no-recipes">Рецептов не найдено</p>';
            return;
        }
        
        recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            recipeCard.innerHTML = `
                <h3>${recipe.title}</h3>
                <p>${recipe.ingredients.slice(0, 3).join(', ')}${recipe.ingredients.length > 3 ? '...' : ''}</p>
                <div class="recipe-meta">
                    <span><i class="fas fa-clock"></i> ${recipe.cookingTime} мин</span>
                    <span>${recipe.difficulty}</span>
                    <span>${recipe.category}</span>
                </div>
            `;
            
            recipeCard.addEventListener('click', () => {
                loadRecipeDetails(recipe.id);
                document.querySelectorAll('.recipe-card').forEach(card => {
                    card.style.background = '#f8f9fa';
                });
                recipeCard.style.background = '#e9ecef';
            });
            
            recipesList.appendChild(recipeCard);
        });
    }
    
    // Загрузка деталей рецепта
    async function loadRecipeDetails(recipeId) {
        try {
            const response = await fetch(`/api/recipes/${recipeId}`);
            if (!response.ok) throw new Error('Рецепт не найден');
            
            const recipe = await response.json();
            displayRecipeDetails(recipe);
            currentMode = 'view';
            recipeDetails.style.display = 'block';
            addRecipeForm.style.display = 'none';
            showAllBtn.classList.add('active');
            addRecipeBtn.classList.remove('active');
        } catch (error) {
            console.error('Ошибка загрузки рецепта:', error);
        }
    }
    
    // Отображение деталей рецепта
    function displayRecipeDetails(recipe) {
        const difficultyIcons = {
            'легкая': 'fas fa-smile',
            'средняя': 'fas fa-meh',
            'сложная': 'fas fa-frown'
        };
        
        recipeDetails.innerHTML = `
            <div class="recipe-detail">
                <div class="recipe-header">
                    <div>
                        <h2>${recipe.title} <span class="recipe-category">${recipe.category}</span></h2>
                    </div>
                </div>
                
                <div class="recipe-info">
                    <div class="info-item">
                        <i class="fas fa-clock"></i>
                        <span>${recipe.cookingTime} минут</span>
                    </div>
                    <div class="info-item">
                        <i class="${difficultyIcons[recipe.difficulty] || 'fas fa-star'}"></i>
                        <span>${recipe.difficulty}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-list-ol"></i>
                        <span>${recipe.ingredients.length} ингредиентов</span>
                    </div>
                </div>
                
                <div class="section">
                    <h3><i class="fas fa-shopping-basket"></i> Ингредиенты</h3>
                    <ul class="ingredients-list">
                        ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="section">
                    <h3><i class="fas fa-list-ol"></i> Инструкция приготовления</h3>
                    <div class="instructions">
                        ${recipe.instructions || 'Инструкция не указана'}
                    </div>
                </div>
                
                <div class="actions">
                    <button class="edit-btn" onclick="editRecipe(${recipe.id})">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                    <button class="delete-btn" onclick="deleteRecipe(${recipe.id})">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            </div>
        `;
    }
    
    // Редактирование рецепта
    window.editRecipe = async function(recipeId) {
        try {
            const response = await fetch(`/api/recipes/${recipeId}`);
            const recipe = await response.json();
            
            editingRecipeId = recipeId;
            showAddRecipeForm();
            
            document.getElementById('title').value = recipe.title;
            document.getElementById('category').value = recipe.category;
            document.getElementById('cookingTime').value = recipe.cookingTime;
            document.getElementById('difficulty').value = recipe.difficulty;
            document.getElementById('instructions').value = recipe.instructions || '';
            
            const ingredientsContainer = document.getElementById('ingredientsContainer');
            ingredientsContainer.innerHTML = '';
            
            recipe.ingredients.forEach((ingredient, index) => {
                const ingredientDiv = document.createElement('div');
                ingredientDiv.className = 'ingredient-item';
                ingredientDiv.innerHTML = `
                    <input type="text" class="ingredient-input" value="${ingredient}" placeholder="Например: картофель 500г">
                    <button type="button" class="remove-ingredient" onclick="removeIngredient(this)">×</button>
                `;
                ingredientsContainer.appendChild(ingredientDiv);
            });
            
            if (recipe.ingredients.length === 0) {
                addIngredientField();
            }
        } catch (error) {
            console.error('Ошибка загрузки рецепта для редактирования:', error);
        }
    };
    
    // Удаление рецепта
    window.deleteRecipe = async function(recipeId) {
        if (!confirm('Вы уверены, что хотите удалить этот рецепт?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/recipes/${recipeId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert('Рецепт успешно удален');
                loadRecipes();
            } else {
                throw new Error('Ошибка удаления рецепта');
            }
        } catch (error) {
            console.error('Ошибка удаления рецепта:', error);
            alert('Не удалось удалить рецепт');
        }
    };
    
    // Показать форму добавления
    function showAddRecipeForm() {
        currentMode = 'add';
        recipeDetails.style.display = 'none';
        addRecipeForm.style.display = 'block';
        showAllBtn.classList.remove('active');
        addRecipeBtn.classList.add('active');
        
        if (!editingRecipeId) {
            recipeForm.reset();
            document.getElementById('ingredientsContainer').innerHTML = '';
            addIngredientField();
        }
    }
    
    // Настройка обработчиков событий
    function setupEventListeners() {
        showAllBtn.addEventListener('click', () => {
            currentMode = 'view';
            recipeDetails.style.display = 'block';
            addRecipeForm.style.display = 'none';
            showAllBtn.classList.add('active');
            addRecipeBtn.classList.remove('active');
            loadRecipes();
        });
        
        addRecipeBtn.addEventListener('click', () => {
            editingRecipeId = null;
            showAddRecipeForm();
        });
        
        cancelBtn.addEventListener('click', () => {
            editingRecipeId = null;
            currentMode = 'view';
            recipeDetails.style.display = 'block';
            addRecipeForm.style.display = 'none';
            showAllBtn.classList.add('active');
            addRecipeBtn.classList.remove('active');
            loadRecipes();
        });
        
        recipeForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const ingredients = Array.from(document.querySelectorAll('.ingredient-input'))
                .map(input => input.value.trim())
                .filter(value => value !== '');
            
            if (ingredients.length === 0) {
                alert('Добавьте хотя бы один ингредиент');
                return;
            }
            
            const recipeData = {
                title: document.getElementById('title').value,
                category: document.getElementById('category').value,
                cookingTime: parseInt(document.getElementById('cookingTime').value),
                difficulty: document.getElementById('difficulty').value,
                ingredients: ingredients,
                instructions: document.getElementById('instructions').value
            };
            
            try {
                const url = editingRecipeId ? `/api/recipes/${editingRecipeId}` : '/api/recipes';
                const method = editingRecipeId ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(recipeData)
                });
                
                if (response.ok) {
                    const message = editingRecipeId ? 'Рецепт успешно обновлен' : 'Рецепт успешно добавлен';
                    alert(message);
                    
                    editingRecipeId = null;
                    loadRecipes();
                    showAllBtn.click();
                } else {
                    const error = await response.json();
                    throw new Error(error.error || 'Ошибка сохранения');
                }
            } catch (error) {
                console.error('Ошибка сохранения рецепта:', error);
                alert(`Ошибка: ${error.message}`);
            }
        });
        
        searchBtn.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                loadRecipes('', searchTerm);
            }
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = searchInput.value.trim();
                if (searchTerm) {
                    loadRecipes('', searchTerm);
                }
            }
        });
        
        categoryFilter.addEventListener('change', () => {
            const category = categoryFilter.value;
            if (category) {
                loadRecipes(category);
            } else {
                loadRecipes();
            }
        });
    }
    
    // Функции для управления ингредиентами
    window.addIngredientField = function() {
        const container = document.getElementById('ingredientsContainer');
        const div = document.createElement('div');
        div.className = 'ingredient-item';
        div.innerHTML = `
            <input type="text" class="ingredient-input" placeholder="Например: картофель 500г">
            <button type="button" class="remove-ingredient" onclick="removeIngredient(this)">×</button>
        `;
        container.appendChild(div);
    };
    
    window.removeIngredient = function(button) {
        const container = document.getElementById('ingredientsContainer');
        if (container.children.length > 1) {
            button.parentElement.remove();
        }
    };
    
    // Проверка доступности API
    async function checkAPI() {
        try {
            const response = await fetch('/api/recipes');
            const port = window.location.port || '3000';
            document.getElementById('portInfo').textContent = port;
        } catch (error) {
            console.warn('API не доступно:', error);
        }
    }
    
    checkAPI();
});