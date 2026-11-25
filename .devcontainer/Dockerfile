# PHP 8.4 с инструментами разработки (образ команды Dev Containers).
FROM mcr.microsoft.com/devcontainers/php:4-8.4-bookworm

# Консольный клиент (команды mariadb и mariadb-dump; в Debian это клиент MariaDB, он работает и с MySQL 8.4)
# и драйвер PDO для MySQL.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y --no-install-recommends mariadb-client \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo_mysql
