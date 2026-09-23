# Recipes Demo

Учебный демо-проект курса веб-программирования. Проект развивается поэтапно вместе с лекциями и практическими работами: от базовой HTML-структуры до полноценного интерфейса сервиса рецептов.

## Макет

В качестве основы используется макет **Recipes** в Figma:

https://www.figma.com/design/v12mxS9VWlE3znKPd6qP8V/Recipes-_-Cooking-Website-Homepage--Copy---Copy-?node-id=0-1&p=f&t=QCswLcSvGbImYLL1-0

Макет используется как источник структуры, контента и визуальных ориентиров. Реализация развивается только в пределах тем, уже пройденных на курсе.

## Текущий этап

Практическая работа №3 — **CSS-система, БЭМ и Flexbox**.

На текущем этапе:

- семантическая HTML-структура из практики №2 сохранена;
- CSS разделён по ответственности: шрифты, базовая система, компоненты и layout;
- `css/style.css` сохранён как базовый stylesheet практики;
- добавлен глобальный `border-box`;
- ключевые цвета, отступы и радиусы вынесены в CSS custom properties;
- добавлены component classes по БЭМ в стиле `block__element--modifier`;
- Flexbox используется для навигации, hero, групп кнопок, карточек, featured-рецепта, формы поиска и footer;
- карточки не имеют фиксированной высоты и выдерживают длинный контент;
- для ссылок, кнопок и поля поиска добавлены hover/focus-visible состояния;
- добавлен второй локальный food-themed hero asset как временная замена изображения Figma;
- подготовлено локальное подключение Montserrat через `@font-face`; файл шрифта копируется из старого архива в `assets/fonts/`;
- Grid, media queries, JavaScript и сложные анимации намеренно не используются — это темы следующих этапов.

## Структура проекта

```text
recipes-demo/
├── assets/
│   ├── fonts/
│   │   └── README.md
│   └── images/
│       ├── hero-recipe.svg
│       └── pumpkin-soup.svg
├── css/
│   ├── fonts.css
│   ├── style.css
│   ├── components.css
│   └── layout.css
├── docs/
│   ├── project-brief.md
│   ├── request-analysis.md
│   └── semantic-map.md
├── index.html
└── README.md
```

## Как устроен CSS

Файлы подключаются в HTML явно, в порядке каскада:

1. `fonts.css` — только `@font-face` и подключение локальных шрифтов;
2. `style.css` — visual tokens, box-sizing, базовые элементы, container и общая типографика;
3. `components.css` — визуальные стили BEM-компонентов и interactive states;
4. `layout.css` — Flexbox, размеры секций и взаимное расположение компонентов.

Такое разделение сохраняет внешний CSS из требований практики, но не превращает один файл в монолит по мере роста сквозного проекта.

## Шрифты

Макет Recipes использует Montserrat. В `css/fonts.css` подготовлен `@font-face` для локального `assets/fonts/Montserrat-Regular.woff2` с `local()` fallback.

Файл `Montserrat-Regular.woff2` берётся из старого учебного архива (`Example_buttons.zip`, `Example_img_background.zip` или `Example_modal_form.zip`) и помещается в `assets/fonts/`. В старых материалах есть только Regular; веса `600` и `700` пока синтезируются браузером. Когда появятся соответствующие файлы SemiBold/Bold, их можно добавить отдельными `@font-face` без изменения component CSS.

## Изображения

`pumpkin-soup.svg` используется для карточки рецепта. Для hero добавлен локальный `hero-recipe.svg`. Это временный food-themed asset: когда экспорт исходного изображения Figma снова станет доступен, его можно заменить одним файлом без изменения HTML/BEM/CSS-структуры.

## Технологии

На текущем этапе используются:

- HTML5;
- CSS3;
- CSS custom properties;
- БЭМ (Two Dashes naming style);
- Flexbox;
- Git и GitHub;
- GitHub Pull Requests;
- GitHub Pages.

Следующие темы — CSS Grid, полноценная адаптивность и далее JavaScript — будут добавляться только после соответствующих лекций.

## Запуск локально

Проект не использует сборщик и внешние зависимости.

1. Клонировать репозиторий.
2. Для локального Montserrat скопировать `Montserrat-Regular.woff2` из архива старого курса в `assets/fonts/`.
3. Открыть файл `index.html` в браузере.

Если локального font-файла пока нет, `fonts.css` сначала попробует установленный в системе Montserrat, затем сработает fallback из `font-family` страницы.

Для проверки CSS рекомендуется использовать Chrome DevTools: `Elements`, `Styles`, `Computed` и Flexbox overlay.

## Опубликованная версия

Актуальная версия ветки `main` публикуется через GitHub Pages:

https://anmerlin.github.io/recipes-demo/

После merge изменений в `main` GitHub Pages автоматически пересобирает опубликованную страницу.

## Работа с ветками

Основная ветка проекта — `main`. Каждая практическая работа выполняется в отдельной ветке и после проверки объединяется с `main` через Pull Request.

Для практики №3 используется ветка `lab/03-css`.

В репозитории не должно появляться решение темы раньше соответствующей лекции.

## Использование AI

AI используется как вспомогательный инструмент для анализа критериев практики, сопоставления Figma с CSS-системой, обсуждения BEM naming, диагностики box model/Flexbox и review изменений. Итоговые решения должны оставаться объяснимыми через HTML/CSS и DevTools; AI не используется для добавления тем следующих занятий.
