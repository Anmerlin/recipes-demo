# Recipes Demo

Учебный демо-проект курса веб-программирования. Проект развивается поэтапно вместе с лекциями и практическими работами.

## Источники

Основной макет — Recipes в Figma:
https://www.figma.com/design/v12mxS9VWlE3znKPd6qP8V/Recipes-_-Cooking-Website-Homepage--Copy---Copy-?node-id=0-1&p=f&t=QCswLcSvGbImYLL1-0

Для практики №4 дополнительно используется приложенный исходный проект `ProjectExampleJSFull.zip` как reference для уже существующего Recipes. Из него взяты исходные растровые изображения `section1.png` и `section2.png` без конвертации в WebP или другие форматы.

Существующие SVG-иконки интерфейса и локальные web-fonts из принятой практики №3 не конвертируются и не переписываются. JavaScript, popup, preloader, slider и сложные keyframe-animation из старого проекта не переносятся: они не относятся к обязательному результату практики №4.

## Текущий этап

Практическая работа №4 — CSS Grid, responsive layout и transition.

Реализовано:

- семантическая HTML-структура предыдущих практик сохранена;
- `css/style.css` остаётся единой точкой входа;
- категории переведены на реальный CSS Grid;
- карточная сетка использует `auto-fit + minmax()` и меняет число колонок по доступному пространству;
- hero и блок рецепта используют Grid и переходят в двухколоночное состояние только там, где композиции достаточно места;
- breakpoint `56rem` связан со сменой layout state, а не с названием устройства;
- Flexbox сохранён в одномерных задачах: header/navigation, кнопки, meta, search form и footer;
- размеры контейнера, заголовков и изображений остаются fluid;
- добавлены `min-width: 0` и `overflow-wrap` там, где длинный контент может влиять на sizing;
- `overflow-x: hidden` для маскировки проблем не используется;
- добавлены transition для конкретных properties;
- заметный `:focus-visible` сохранён;
- для пространственного motion предусмотрен `prefers-reduced-motion`;
- контентные изображения используются только как PNG и не конвертируются.

## Структура CSS

HTML подключает один файл: `css/style.css`.

`style.css` импортирует файлы в следующем порядке:

1. `fonts.css` — web-fonts;
2. `normalize.css` — нормализация;
3. `base.css` — tokens, box model, базовые элементы и fluid container;
4. `typography.css` — кнопки и общая типографика;
5. `section.css` — заголовки и описания секций;
6. `logo.css` — логотипы;
7. `header.css` — header и navigation;
8. `promo.css` — hero;
9. `card.css` — Grid карточек категорий;
10. `recipe.css` — рецепт дня;
11. `search.css` — поисковая секция;
12. `form.css` — форма поиска;
13. `footer.css` — footer;
14. `responsive.css` — content-driven breakpoint и reduced-motion override.

Обязательного отдельного responsive-файла в курсе нет; здесь он сохранён как небольшой завершающий модуль, потому что переключение состояния затрагивает несколько компонентов.

## Ассеты

Растровые контентные изображения:

- `section1.png` — hero, 602×800;
- `section2.png` — рецепт дня, 543×543.

Оба файла взяты из приложенного исходного проекта в PNG без дополнительной конвертации.

Существующие SVG-иконки категорий, login, heart, timer и smile остаются из принятой практики №3 как интерфейсные иконки; в рамках практики №4 они не преобразуются в другие форматы.

## Шрифты

В `assets/fonts` остаются локальные файлы:

- Montserrat Regular — 400;
- Montserrat Medium — 500;
- Montserrat SemiBold — 600;
- Montserrat Bold — 700;
- Mulish Regular — 400.

## Технологии

На текущем этапе:

- HTML5;
- CSS3;
- CSS custom properties;
- БЭМ;
- Flexbox;
- CSS Grid;
- responsive design;
- media queries;
- CSS transitions;
- `prefers-reduced-motion`;
- локальные web-fonts;
- Git/GitHub;
- Pull Requests;
- GitHub Pages.

JavaScript пока не добавляется.

## Запуск

Проект не использует сборщик.

1. Клонировать репозиторий.
2. Открыть `index.html` в браузере.
3. Для проверки открыть Chrome DevTools.

Для практики №4 полезно проверить:

- плавный resize от узкой до широкой ширины;
- Grid overlay для `.categories__list`;
- Styles/Computed для Grid и media query;
- длинный заголовок/описание;
- Tab-navigation и `:focus-visible`;
- отсутствие необъяснимого horizontal overflow;
- `prefers-reduced-motion: reduce`.

Контрольные ширины 390 / 768 / 1280 можно использовать для проверки, но они не являются значениями обязательных breakpoints.

## Опубликованная версия

https://anmerlin.github.io/recipes-demo/

GitHub Pages обновляется только после merge в `main`. Pull Request практики №4 до проверки не merge.

## Работа с ветками

Основная ветка — `main`.

Практика №4 выполняется в `lab/04-responsive` и направляется Pull Request в `main`. Исправления review выполняются в той же ветке.

## Использование AI

AI используется как вспомогательный инструмент для сопоставления критериев практики №4 с текущим demo-проектом, выбора Grid/Flexbox, проверки responsive strategy и поиска рисков overflow.

В этой итерации предложения AI ограничены темами лекции №4: Grid, intrinsic/fluid sizing, media queries, transition и reduced motion. JavaScript и другие следующие темы намеренно не добавлялись. Результат проверяется по фактическому CSS и поведению layout, а не принимается автоматически.
