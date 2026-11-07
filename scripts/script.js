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

/* 7. Проверка форм: общие функции для всех форм страницы */

/*
  Браузер уже знает правила полей из HTML-атрибутов (required, type="email", minlength, pattern, min/max)
  и записывает результат проверки в field.validity. Формы помечены novalidate:
  стандартные всплывающие подсказки отключены, а текст ошибки мы показываем сами — рядом с полем.
  Клиентская проверка помогает пользователю, но не защищает данные: сервер обязан проверить всё заново.
*/
// Склонение слова после числа: 1 символ, 3 символа, 8 символов.
const pluralize = (count, [one, few, many]) => {
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return many;
  }

  if (last === 1) {
    return one;
  }

  return last >= 2 && last <= 4 ? few : many;
};

const SYMBOL_FORMS = ['символ', 'символа', 'символов'];

const getErrorMessage = (field) => {
  const { validity } = field;

  if (validity.valid) {
    return '';
  }

  if (validity.valueMissing) {
    return field.type === 'radio' ? 'Выберите один из вариантов' : 'Заполните это поле';
  }

  if (validity.typeMismatch && field.type === 'email') {
    return 'Введите email в формате name@example.com';
  }

  if (validity.tooShort) {
    return `Минимум ${field.minLength} ${pluralize(field.minLength, SYMBOL_FORMS)}, сейчас ${field.value.length}`;
  }

  if (validity.tooLong) {
    return `Максимум ${field.maxLength} ${pluralize(field.maxLength, SYMBOL_FORMS)}`;
  }

  if (validity.patternMismatch) {
    return field.dataset.patternMessage || 'Значение не подходит по формату';
  }

  if (validity.badInput) {
    return 'Введите число';
  }

  if (validity.rangeUnderflow) {
    return `Не меньше ${field.min}`;
  }

  if (validity.rangeOverflow) {
    return `Не больше ${field.max}`;
  }

  if (validity.stepMismatch) {
    return `Значение должно быть кратно ${field.step}`;
  }

  // customError: сообщение задано через setCustomValidity() для правил, которых нет в HTML.
  return field.validationMessage;
};

// Показывает или убирает ошибку одного поля: текст под полем и aria-invalid для скринридера.
const validateField = (field) => {
  const message = getErrorMessage(field);
  const error = field.closest('[data-field]')?.querySelector('[data-error]');

  if (error) {
    error.textContent = message;
  }

  // У группы радиокнопок состояние ставим на все кнопки группы.
  const targets = field.type === 'radio' ? field.form.elements[field.name] : [field];

  targets.forEach((target) => {
    if (message) {
      target.setAttribute('aria-invalid', 'true');
    } else {
      target.removeAttribute('aria-invalid');
    }
  });

  return message === '';
};

// Проверяет все поля формы и возвращает первое поле с ошибкой (или null).
const validateForm = (form) => {
  let firstInvalid = null;
  const checkedGroups = new Set();

  Array.from(form.elements).forEach((field) => {
    // willValidate = false у кнопок, fieldset и отключённых полей.
    if (!field.willValidate) {
      return;
    }

    // Группу радиокнопок проверяем один раз.
    if (field.type === 'radio') {
      if (checkedGroups.has(field.name)) {
        return;
      }

      checkedGroups.add(field.name);
    }

    if (!validateField(field) && !firstInvalid) {
      firstInvalid = field;
    }
  });

  return firstInvalid;
};

// Убирает все сообщения формы: ошибки полей, aria-invalid и статус.
const clearFormMessages = (form) => {
  form.querySelectorAll('[data-error]').forEach((error) => {
    error.textContent = '';
  });

  form.querySelectorAll('[aria-invalid]').forEach((field) => {
    field.removeAttribute('aria-invalid');
  });

  const status = form.querySelector('[data-form-status]');

  if (status) {
    status.textContent = '';
  }
};

/*
  Пока пользователь впервые заполняет поле, ошибки не показываем.
  Если ошибка уже показана, проверяем поле заново при каждом изменении — сообщение исчезнет, как только значение станет верным.
*/
const enableLiveValidation = (form) => {
  const revalidate = (event) => {
    const field = event.target;

    if (field.willValidate && field.getAttribute('aria-invalid') === 'true') {
      validateField(field);
    }
  };

  form.addEventListener('input', revalidate);
  form.addEventListener('change', revalidate);
};

/* 8. Окно входа и регистрации */

/*
  Запомненный логин хранится в localStorage: строка по ключу, только в этом браузере,
  видна в DevTools → Application → Local Storage. Это удобство, а не вход в аккаунт:
  пароли, токены и другие секреты в localStorage не кладём.
  Доступ к хранилищу может быть запрещён настройками браузера, поэтому обращения обёрнуты в try/catch.
*/
const SAVED_LOGIN_KEY = 'recipes:login';

const readSavedLogin = () => {
  try {
    return localStorage.getItem(SAVED_LOGIN_KEY);
  } catch {
    return null;
  }
};

// Возвращает true, если запись в хранилище удалась.
const saveLogin = (login) => {
  try {
    if (login) {
      localStorage.setItem(SAVED_LOGIN_KEY, login);
    } else {
      localStorage.removeItem(SAVED_LOGIN_KEY);
    }

    return true;
  } catch {
    // Хранилище недоступно: форма работает и без запоминания.
    return false;
  }
};

const authDialog = document.querySelector('[data-auth-dialog]');
const authOpenButtons = document.querySelectorAll('[data-auth-open]');

if (authDialog && authOpenButtons.length > 0) {
  const panels = authDialog.querySelectorAll('[data-auth-panel]');
  const loginForm = authDialog.querySelector('[data-login-form]');
  const registerForm = authDialog.querySelector('[data-register-form]');
  const closeButton = authDialog.querySelector('[data-auth-close]');

  // Показывает одну панель (вход или регистрация) и связывает заголовок окна с её заголовком.
  const showAuthPanel = (name) => {
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.authPanel !== name;

      if (!panel.hidden) {
        authDialog.setAttribute('aria-labelledby', panel.getAttribute('aria-labelledby'));

        // Фокус — на первое незаполненное поле видимой формы (логин может быть подставлен из хранилища).
        const inputs = Array.from(panel.querySelectorAll('input:not([type="checkbox"])'));
        const firstEmpty = inputs.find((input) => input.value === '') || inputs[0];
        firstEmpty?.focus();
      }
    });
  };

  // Если логин сохранён, подставляем его и оставляем отмеченным флажок «Запомнить».
  const fillSavedLogin = () => {
    const savedLogin = readSavedLogin();

    if (loginForm && savedLogin) {
      loginForm.elements.login.value = savedLogin;
      loginForm.elements.remember.checked = true;
    }
  };

  authOpenButtons.forEach((button) => {
    button.addEventListener('click', () => {
      fillSavedLogin();
      authDialog.showModal();
      showAuthPanel(button.dataset.authOpen);
    });
  });

  authDialog.querySelectorAll('[data-auth-switch]').forEach((button) => {
    button.addEventListener('click', () => showAuthPanel(button.dataset.authSwitch));
  });

  if (closeButton) {
    closeButton.addEventListener('click', () => authDialog.close());
  }

  // Клик по затемнённой подложке: target — сам <dialog>, а не его содержимое.
  authDialog.addEventListener('click', (event) => {
    if (event.target === authDialog) {
      authDialog.close();
    }
  });

  // При закрытии (кнопка, подложка, Esc) формы возвращаются в исходное состояние.
  authDialog.addEventListener('close', () => {
    [loginForm, registerForm].forEach((form) => {
      if (form) {
        form.reset();
        clearFormMessages(form);
      }
    });
  });

  if (loginForm) {
    enableLiveValidation(loginForm);

    loginForm.addEventListener('submit', (event) => {
      // Без сервера отправка перезагрузила бы страницу, поэтому отменяем её.
      event.preventDefault();

      const status = loginForm.querySelector('[data-form-status]');
      const firstInvalid = validateForm(loginForm);

      if (firstInvalid) {
        status.textContent = '';
        firstInvalid.focus();
        return;
      }

      // Флажок отмечен — запоминаем логин, снят — удаляем ранее сохранённый.
      const { login, remember, password } = loginForm.elements;
      const isSaved = saveLogin(remember.checked ? login.value.trim() : null);
      const loginNote = remember.checked && isSaved ? ' Логин запомнен в этом браузере.' : '';

      // Пароль не храним и не показываем: после проверки формы поле очищается.
      password.value = '';
      status.textContent = `Форма заполнена верно.${loginNote} Логин и пароль проверит сервер — его подключим на следующем занятии.`;
    });
  }

  if (registerForm) {
    const password = registerForm.elements.password;
    const passwordRepeat = registerForm.elements.passwordRepeat;

    // Совпадение паролей нельзя описать атрибутом, поэтому задаём ошибку через setCustomValidity().
    const checkPasswordsMatch = () => {
      const isMismatch = passwordRepeat.value !== '' && passwordRepeat.value !== password.value;
      passwordRepeat.setCustomValidity(isMismatch ? 'Пароли не совпадают' : '');
    };

    // Имя из одних пробелов required не ловит: пробел — тоже символ.
    const checkNameNotBlank = () => {
      const name = registerForm.elements.name;
      const isBlank = name.value !== '' && name.value.trim() === '';
      name.setCustomValidity(isBlank ? 'Имя не может состоять из пробелов' : '');
    };

    registerForm.addEventListener('input', (event) => {
      if (event.target === password || event.target === passwordRepeat) {
        checkPasswordsMatch();

        // Пароль изменили после ошибки «не совпадают» — пересчитываем сообщение у повтора.
        if (passwordRepeat.getAttribute('aria-invalid') === 'true') {
          validateField(passwordRepeat);
        }
      }

      if (event.target === registerForm.elements.name) {
        checkNameNotBlank();
      }
    });

    enableLiveValidation(registerForm);

    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();

      checkPasswordsMatch();
      checkNameNotBlank();

      const status = registerForm.querySelector('[data-form-status]');
      const firstInvalid = validateForm(registerForm);

      if (firstInvalid) {
        status.textContent = '';
        firstInvalid.focus();
        return;
      }

      password.value = '';
      passwordRepeat.value = '';
      status.textContent = 'Форма заполнена верно. Создавать аккаунт будет сервер — его подключим на следующем занятии.';
    });
  }
}
