'use strict';

/*
  Скрипт подключён с defer: он выполняется после разбора HTML,
  поэтому все элементы страницы уже есть в DOM.
  Каждый блок сначала проверяет, что нужные элементы найдены (не null),
  и только потом назначает обработчики.
*/

/* 1. Избранное: кнопка-переключатель и счётчик */

const favoriteButton = document.querySelector('[data-favorite-toggle]');
const favoriteCount = document.querySelector('[data-favorite-count]');

if (favoriteButton && favoriteCount) {
  // Начальное состояние читаем из разметки, чтобы данные и DOM не расходились.
  let isFavorite = favoriteButton.getAttribute('aria-pressed') === 'true';
  let count = Number(favoriteCount.textContent);

  // Одна функция переносит состояние в DOM: класс, ARIA-атрибут и текст счётчика.
  const renderFavorite = () => {
    favoriteButton.classList.toggle('recipe-meta__favorite--active', isFavorite);
    favoriteButton.setAttribute('aria-pressed', String(isFavorite));
    favoriteCount.textContent = count;
  };

  favoriteButton.addEventListener('click', () => {
    isFavorite = !isFavorite;
    count += isFavorite ? 1 : -1;
    renderFavorite();
  });

  renderFavorite();
}
