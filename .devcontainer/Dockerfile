# PHP 8.3 с инструментами разработки (образ команды Dev Containers).
FROM mcr.microsoft.com/devcontainers/php:4-8.3-bookworm

# Консольный клиент MariaDB (команды mariadb и mariadb-dump) и драйвер PDO для MySQL/MariaDB.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y --no-install-recommends mariadb-client \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo_mysql
