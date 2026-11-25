-- Recipes: схема базы данных.
-- Подходит для MySQL 5.7+ и MariaDB 10.3+ (OpenServer 5: phpMyAdmin → Импорт).
--
-- Скрипт ПЕРЕСОЗДАЕТ таблицы: все добавленные рецепты удалятся.
-- Порядок импорта: сначала schema.sql, затем seed.sql.

-- Кодировка соединения на время импорта. Без этой строки клиент может прочитать файл
-- как latin1, и кириллица сохранится «кракозябрами» (ÐŸÑ€Ð¾...).
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS recipes_demo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE recipes_demo;

-- Сначала удаляем таблицу, которая ссылается на другую (recipes → categories).
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS categories;

-- Категории: справочник. Раньше эти данные лежали в data/categories.json.
CREATE TABLE categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(30) NOT NULL,          -- короткий код для URL и <select>: simple, kids...
  title VARCHAR(80) NOT NULL,
  description VARCHAR(255) NOT NULL,
  icon VARCHAR(255) NOT NULL,         -- путь к иконке относительно страницы
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Рецепты: каждый относится ровно к одной категории (связь «многие к одному»).
CREATE TABLE recipes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id INT UNSIGNED NOT NULL,
  title VARCHAR(80) NOT NULL,
  cooking_time SMALLINT UNSIGNED NOT NULL,             -- минуты
  difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
  ingredients TEXT NOT NULL,                           -- по одному ингредиенту на строку
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_recipes_category (category_id),
  -- Внешний ключ: нельзя сохранить рецепт с несуществующей категорией
  -- и нельзя удалить категорию, в которой есть рецепты.
  CONSTRAINT fk_recipes_category
    FOREIGN KEY (category_id) REFERENCES categories (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  -- CHECK соблюдают MySQL 8.0.16+ и MariaDB 10.2+; MySQL 5.7 его разбирает, но не проверяет.
  -- Поэтому то же правило есть и в PHP: база — последняя линия защиты, а не единственная.
  CONSTRAINT chk_recipes_time CHECK (cooking_time BETWEEN 5 AND 600)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
