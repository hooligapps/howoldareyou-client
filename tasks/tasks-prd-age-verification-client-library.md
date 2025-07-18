## Relevant Files

-   `lib/age-verifier/python/age_verifier/client.py` - Основной файл с функциями Python-модуля для взаимодействия с API верификации.
-   `lib/age-verifier/python/tests/test_client.py` - Модульные тесты для `client.py` с использованием моков.
-   `lib/age-verifier/python/requirements.txt` - Зависимости для Python-модуля (например, `requests`).
-   `lib/age-verifier/js/src/index.js` - Исходный код клиентской JS-библиотеки (`AgeVerifier`).
-   `lib/age-verifier/js/tests/index.test.js` - Модульные тесты для JS-библиотеки (например, с помощью Jest).
-   `lib/age-verifier/js/package.json` - Зависимости и скрипты сборки для JS-части.
-   `lib/age-verifier/js/rollup.config.js` - Конфигурация сборщика (например, Rollup) для создания ESM и UMD бандлов.
-   `lib/age-verifier/README.md` - Документация по установке и использованию библиотеки.

### Notes

-   Модульные тесты должны находиться рядом с кодом, который они тестируют, в соответствующих подпапках `tests/`.
-   Для запуска тестов можно использовать команды `pytest` для Python и `npm test` (после настройки Jest) для JavaScript.

## Tasks

-   [x] 1.0 Настройка проекта и конфигурация сборки
    -   [x] 1.1 Создать структуру папок: `lib/age-verifier/js` и `lib/age-verifier/python`.
    -   [x] 1.2 В папке `js` инициализировать `package.json` (`npm init -y`).
    -   [x] 1.3 Установить и настроить сборщик (например, Rollup) для создания ESM и UMD бандлов JS-библиотеки.
    -   [x] 1.4 Создать файл `requirements.txt` в папке `python` с зависимостью `requests`.
-   [x] 2.0 Реализация серверного модуля на Python
    -   [x] 2.1 Создать основной файл `lib/age-verifier/python/age_verifier/client.py`.
    -   [x] 2.2 Реализовать внутреннюю функцию для генерации подписи HMAC-SHA256.
    -   [x] 2.3 Реализовать функцию `need_verification`.
    -   [x] 2.4 Реализовать функцию `start_check_age_verification`.
    -   [x] 2.5 Реализовать функцию `check_age_verification_result`.
    -   [x] 2.6 Реализовать функцию `update_verification_result`.
    -   [x] 2.7 Написать модульные тесты для каждой функции, имитируя (мокируя) ответы API.
-   [x] 3.0 Реализация клиентской библиотеки на JavaScript
    -   [x] 3.1 В файле `lib/age-verifier/js/src/index.js` создать класс `AgeVerifier`.
    -   [x] 3.2 Реализовать конструктор класса, принимающий конфигурационный объект.
    -   [x] 3.3 Реализовать метод `checkVerificationNeeded`, включая AJAX-запрос и логику вызова колбэков (`onSuccess`, `onFail`, `onCheckNeededComplete`).
    -   [x] 3.4 Реализовать метод `startVerification(hostElement)`, который создает новое окно с полученным URL.
    -   [x] 3.5 Реализовать обработчик событий `postMessage` с проверкой `origin`.
    -   [x] 3.6 В обработчике `postMessage` реализовать логику вызова эндпоинта `checkResult` и соответствующих колбэков.
    -   [x] 3.7 ~~Реализовать логику очистки: удаление `iframe` и снятие обработчика событий.~~
    -   [x] 3.8 Написать модульные тесты для `AgeVerifier`, имитируя (мокируя) AJAX-запросы.
-   [x] 4.0 Интеграция: Создание эндпоинтов на сервере Игры
    -   [x] 4.1 Импортировать Python-модуль `age_verifier.client` в код сервера Игры.
    -   [x] 4.2 Создать эндпоинт `/api/age-verification/check-needed`, вызывающий функцию `need_verification`.
    -   [x] 4.3 Создать эндпоинт `/api/age-verification/start`, вызывающий `start_check_age_verification`.
    -   [x] 4.4 Создать эндпоинт `/api/age-verification/check-result`, вызывающий `check_age_verification_result`.
-   [x] 5.0 Финальное тестирование и документирование
    -   [x] 5.1 Создать тестовую HTML-страницу для проверки полного цикла работы библиотеки.
    -   [x] 5.2 Написать `README.md` с инструкциями по установке, настройке и примерами использования JS- и Python-частей.
    -   [x] 5.3 Проверить корректность работы собранных ESM и UMD бандлов.
