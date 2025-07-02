# Открытые источники данных норвежского языка

## Основные источники словарей и переводов

### 1. Wiktionary (норвежский раздел)
- **URL**: https://no.wiktionary.org/
- **Формат**: JSON API доступен
- **Содержание**: 50,000+ норвежских слов с переводами, произношением, примерами
- **API**: https://no.wiktionary.org/w/api.php

### 2. OpenTran - Открытые переводы
- **URL**: https://opentran.net/
- **Содержание**: Миллионы переводческих пар русский-норвежский
- **Формат**: CSV, JSON

### 3. OPUS Collection - Параллельные корпуса
- **URL**: https://opus.nlpl.eu/
- **Содержание**: Огромные параллельные тексты русский-норвежский
- **Источники**: Субтитры фильмов, книги, новости

### 4. ConceptNet - Семантическая сеть
- **URL**: https://conceptnet.io/
- **API**: Бесплатный REST API
- **Содержание**: Связи между концептами на норвежском

### 5. Lexin - Официальный норвежский словарь
- **URL**: https://lexin.oslomet.no/
- **Содержание**: Официальные переводы с произношением
- **Особенность**: Государственный ресурс Норвегии

## Грамматические ресурсы

### 6. Bokmålsordboka & Nynorskordboka
- **URL**: https://ordbokene.no/
- **API**: Открытый API
- **Содержание**: Полные словари с грамматикой

### 7. Norwegian Dependency Treebank
- **URL**: https://universaldependencies.org/
- **Содержание**: Синтаксические деревья норвежских предложений

## Готовые датасеты

### 8. Hugging Face - Norwegian Language Models
- **URL**: https://huggingface.co/models?language=no
- **Содержание**: Готовые модели и датасеты
- **Форматы**: JSON, CSV, парquet

### 9. CommonCrawl Norwegian
- **URL**: https://commoncrawl.org/
- **Содержание**: Миллионы норвежских веб-страниц
- **Размер**: Терабайты текста

### 10. Project Gutenberg Norwegian
- **URL**: https://www.gutenberg.org/browse/languages/no
- **Содержание**: Классическая норвежская литература
- **Формат**: TXT, EPUB

## Рекомендации по интеграции

### Приоритет 1: Wiktionary API
```javascript
// Пример запроса к Wiktionary API
const response = await fetch('https://no.wiktionary.org/w/api.php?action=query&format=json&titles=hei&prop=extracts');
```

### Приоритет 2: OPUS параллельные корпуса
- Скачать готовые файлы TMX/JSON
- Содержат миллионы переводов

### Приоритет 3: ConceptNet API
```javascript
// Получение связанных концептов
const response = await fetch('https://api.conceptnet.io/c/no/hei');
```

## Объемы данных
- Wiktionary: ~50,000 статей
- OPUS: 10+ миллионов предложений
- CommonCrawl: безлимитно
- ConceptNet: 1+ миллион связей

## Лицензии
- Большинство: Creative Commons или Public Domain
- Коммерческое использование: разрешено
- Требование атрибуции: желательно