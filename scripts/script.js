'use strict';

/*
  Скрипт подключён с defer: он выполняется после разбора HTML,
  поэтому все элементы страницы уже есть в DOM.
  Каждый блок сначала проверяет, что нужные элементы найдены (не null),
  и только потом назначает обработчики.
*/

/*
  Общая функция для эффектов прокрутки: ставит класс элементу,
  когда страница прокручена дальше порога, и снимает его обратно.
  Порог передаётся функцией, чтобы при каждом событии брать актуальный размер
  (высота header и окна меняется при resize).
*/
const toggleClassOnScroll = (element, className, getThreshold) => {
  const update = () => {
    element.classList.toggle(className, window.scrollY > getThreshold());
  };

  window.addEventListener('scroll', update, { passive: true });
  // Синхронизируем состояние сразу: страница может открыться уже прокрученной.
  update();
};

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

/* 2. Фильтрация популярных тегов по тексту в поле поиска */

const searchInput = document.querySelector('#recipe-query');
const tags = document.querySelectorAll('[data-tag]');
const tagsStatus = document.querySelector('[data-tags-status]');

if (searchInput && tags.length > 0 && tagsStatus) {
  const filterTags = () => {
    // trim() убирает случайные пробелы, toLowerCase() делает сравнение без учёта регистра.
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    tags.forEach((tag) => {
      const isMatch = tag.textContent.toLowerCase().includes(query);
      tag.classList.toggle('recipe-search__tag--hidden', !isMatch);

      if (isMatch) {
        visibleCount += 1;
      }
    });

    // Пустой ввод совпадает со всеми тегами, поэтому сообщение появляется только при нуле совпадений.
    tagsStatus.textContent = visibleCount === 0 ? 'Теги не найдены' : '';
  };

  searchInput.addEventListener('input', filterTags);
  filterTags();
}

/* 3. Header: фон после прокрутки на высоту header, скрытие при прокрутке вниз */

const header = document.querySelector('.site-header');

if (header) {
  // Высота header нужна CSS для отступа контента на узких экранах (переменная --header-height).
  const updateHeaderHeight = () => {
    document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
  };

  // ResizeObserver срабатывает при любом изменении размера header:
  // смена ширины окна, перенос пунктов меню, догрузка web-шрифтов.
  // Первый вызов происходит сразу после начала наблюдения.
  new ResizeObserver(updateHeaderHeight).observe(header);

  toggleClassOnScroll(header, 'site-header--scroll', () => header.offsetHeight);

  // Направление прокрутки определяем сравнением с прошлым значением scrollY.
  // Вниз (и header уже не в начале страницы) — прячем, вверх — показываем.
  let lastScrollY = window.scrollY;

  const updateHeaderVisibility = () => {
    const currentScrollY = window.scrollY;
    const isScrollingDown = currentScrollY > lastScrollY;

    header.classList.toggle('site-header--hidden', isScrollingDown && currentScrollY > header.offsetHeight);
    lastScrollY = currentScrollY;
  };

  window.addEventListener('scroll', updateHeaderVisibility, { passive: true });
}

/* 4. Кнопка «Наверх»: появляется после прокрутки на высоту окна */

const scrollUpButton = document.querySelector('[data-scroll-up]');
const headerLogo = document.querySelector('.site-header__logo');

if (scrollUpButton) {
  toggleClassOnScroll(scrollUpButton, 'scroll-up--show', () => document.documentElement.clientHeight);

  scrollUpButton.addEventListener('click', () => {
    // Без behavior: 'smooth' действует CSS scroll-behavior,
    // который уже отключает плавность при prefers-reduced-motion.
    window.scrollTo({ top: 0 });

    // Наверху кнопка скрывается, поэтому фокус переносим на первый элемент страницы,
    // иначе пользователь клавиатуры теряет позицию.
    if (headerLogo) {
      headerLogo.focus({ preventScroll: true });
    }
  });
}

/* 5. Прелоадер: скрывается, когда страница полностью загружена */

const preloader = document.querySelector('[data-preloader]');

if (preloader) {
  const hidePreloader = () => {
    // Если загрузка шла дольше 5 секунд, прелоадер уже скрыла CSS-страховка:
    // header давно виден, поэтому без выезда просто убираем элемент.
    if (getComputedStyle(preloader).visibility === 'hidden') {
      preloader.remove();
      return;
    }

    preloader.classList.add('preloader--hidden');

    // После fade-out элемент больше не нужен в DOM.
    // При prefers-reduced-motion transition отключён и transitionend не наступит — удаляем сразу.
    if (parseFloat(getComputedStyle(preloader).transitionDuration) > 0) {
      preloader.addEventListener('transitionend', () => preloader.remove(), { once: true });
    } else {
      preloader.remove();
    }

    // Header выезжает одновременно с исчезновением прелоадера.
    if (header) {
      header.classList.add('site-header--enter');
    }
  };

  // load наступает после загрузки изображений, шрифтов и стилей,
  // поэтому прелоадер держится ровно столько, сколько грузится страница, без искусственной задержки.
  if (document.readyState === 'complete') {
    hidePreloader();
  } else {
    window.addEventListener('load', hidePreloader, { once: true });
  }
}

/* 6. Категории: данные из JSON-файла через fetch */

// Адрес данных. На занятии по backend здесь будет адрес серверного API,
// а код загрузки и отрисовки останется прежним.
const CATEGORIES_URL = 'data/categories.json';

/*
  Загрузка категорий. Функция асинхронная: await ждёт ответ сервера,
  не блокируя страницу. Результат — массив объектов категорий.
*/
const fetchCategories = async () => {
  const response = await fetch(CATEGORIES_URL);

  // fetch отклоняет промис только при сетевой ошибке.
  // Ответы 404 или 500 приходят как обычный response, поэтому статус проверяем сами.
  if (!response.ok) {
    throw new Error(`Сервер ответил ${response.status} ${response.statusText}`);
  }

  return response.json();
};

const categoriesList = document.querySelector('[data-categories-list]');
const categoriesStatus = document.querySelector('[data-categories-status]');
const categoriesRetry = document.querySelector('[data-categories-retry]');
const categoryTemplate = document.querySelector('#category-card-template');

if (categoriesList && categoriesStatus && categoriesRetry && categoryTemplate) {
  // Одна карточка: копия шаблона, данные вставляются как текст, а не как HTML.
  const createCategoryCard = (category) => {
    const card = categoryTemplate.content.firstElementChild.cloneNode(true);

    card.querySelector('.category-card__icon').src = category.icon;
    card.querySelector('.category-card__title').textContent = category.title;
    card.querySelector('.category-card__text').textContent = category.text;

    return card;
  };

  const loadCategories = async () => {
    // Состояние «загрузка»: сообщение видно, кнопка повтора скрыта.
    categoriesList.setAttribute('aria-busy', 'true');
    categoriesStatus.textContent = 'Загружаем категории…';
    categoriesRetry.hidden = true;

    try {
      const categories = await fetchCategories();

      // replaceChildren() заменяет содержимое списка целиком: повторная загрузка не дублирует карточки.
      categoriesList.replaceChildren(...categories.map(createCategoryCard));
      categoriesStatus.textContent = categories.length === 0 ? 'Категорий пока нет' : '';
    } catch (error) {
      // Пользователь видит понятное сообщение и может повторить запрос, подробности — в Console.
      console.error('Не удалось загрузить категории:', error);
      categoriesStatus.textContent = 'Не удалось загрузить категории. Проверьте соединение и попробуйте еще раз.';
      categoriesRetry.hidden = false;
    } finally {
      // finally выполняется и после успеха, и после ошибки.
      categoriesList.removeAttribute('aria-busy');
    }
  };

  categoriesRetry.addEventListener('click', async () => {
    await loadCategories();

    // После успешного повтора кнопка скрывается вместе с фокусом.
    // Переносим фокус на заголовок раздела, чтобы пользователь клавиатуры не потерял позицию.
    if (categoriesRetry.hidden) {
      const categoriesTitle = document.querySelector('#categories-title');

      if (categoriesTitle) {
        categoriesTitle.setAttribute('tabindex', '-1');
        categoriesTitle.focus();
      }
    }
  });

  loadCategories();
}
