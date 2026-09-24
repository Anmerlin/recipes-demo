# Recipes Demo

Учебный демо-проект курса веб-программирования. Проект развивается поэтапно вместе с лекциями и практическими работами.

## Источники

Основной макет — Recipes в Figma:
https://www.figma.com/design/v12mxS9VWlE3znKPd6qP8V/Recipes-_-Cooking-Website-Homepage--Copy---Copy-?node-id=0-1&p=f&t=QCswLcSvGbImYLL1-0

Для практики №3 дополнительно использован корректный архив старого demo-проекта Project.zip. Из него перенесены визуальные ассеты, локальные web-fonts и принцип разделения CSS по смысловым зонам.

Grid, media queries, animation, popup и JavaScript из старого проекта намеренно не переносятся: это темы следующих занятий.

## Текущий этап

Практическая работа №3 — CSS-система, БЭМ и Flexbox.

Реализовано:

- семантический HTML практики №2 сохранён;
- css/style.css — единая точка входа;
- CSS разбит на тематические модули;
- подключён normalize.css;
- используется глобальный border-box;
- visual tokens вынесены в CSS custom properties;
- классы компонентов оформлены по БЭМ Two Dashes;
- Flexbox используется для header, hero, категорий, рецепта, поиска и footer;
- карточки сохраняют естественную высоту и длинный тестовый заголовок;
- добавлены hover и focus-visible;
- перенесены изображения и SVG-иконки Recipes;
- локально подключены Montserrat 400/500/600/700 и Mulish 400;
- добавлены login icon, метрики избранного/времени, автор на фотографии и badge «Рецепт дня».

## Структура CSS

HTML подключает один файл: css/style.css.

style.css импортирует файлы в следующем порядке:

1. fonts.css — web-fonts;
2. normalize.css — нормализация;
3. base.css — tokens, box model, базовые элементы и container;
4. typography.css — общие кнопки и типографические элементы;
5. section.css — общие заголовки/описания секций;
6. logo.css — логотипы;
7. header.css — header и navigation;
8. promo.css — hero;
9. card.css — карточки категорий;
10. recipe.css — рецепт дня;
11. search.css — поисковая секция;
12. form.css — форма поиска;
13. footer.css — footer.

Так сохраняется единая точка подключения, но CSS сквозного проекта не превращается в один монолитный файл.

## Ассеты

Из Project.zip используются:

- section1.webp — hero;
- section2.webp — рецепт дня;
- menu.svg, cook.svg, chef.svg, fire.svg — категории;
- login.svg — вход;
- heart.svg — избранное;
- timer.svg — время приготовления;
- smile.svg — badge рецепта дня.

close.svg не переносится, потому что относится к popup. Остальные неиспользуемые декоративные ассеты также не добавляются без необходимости.

## Шрифты

В assets/fonts находятся локальные файлы:

- Montserrat Regular — 400;
- Montserrat Medium — 500;
- Montserrat SemiBold — 600;
- Montserrat Bold — 700;
- Mulish Regular — 400.

Для учебного репозитория допускаются оптимизированные subset-версии соответствующих начертаний при сохранении нужных кириллических и латинских глифов.

## Технологии

На текущем этапе:

- HTML5;
- CSS3;
- CSS custom properties;
- БЭМ;
- Flexbox;
- локальные web-fonts;
- Git/GitHub;
- Pull Requests;
- GitHub Pages.

## Запуск

Проект не использует сборщик.

1. Клонировать репозиторий.
2. Открыть index.html в браузере.
3. Для проверки CSS использовать Chrome DevTools: Elements, Styles, Computed и Flexbox overlay.

## Опубликованная версия

https://anmerlin.github.io/recipes-demo/

GitHub Pages автоматически обновляется после merge в main.

## Работа с ветками

Основная ветка — main. Практика №3 выполняется в lab/03-css и объединяется с main только после review.

## Использование AI

AI используется как вспомогательный инструмент для анализа критериев практики, сопоставления Figma и старого Recipes, обсуждения BEM naming, диагностики box model/Flexbox и review изменений. Решения должны оставаться объяснимыми через HTML/CSS и DevTools.
