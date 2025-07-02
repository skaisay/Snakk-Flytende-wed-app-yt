# Руководство по интеграции открытых API норвежского языка

## Быстрый старт - рекомендуемая последовательность

### 1. Wiktionary API (НАЧАТЬ С ЭТОГО)
**Самый простой и надежный источник**

```javascript
// Добавить в script.js - функция для загрузки из Wiktionary
async loadWiktionaryData(word) {
    try {
        const response = await fetch(`https://no.wiktionary.org/w/api.php?` +
            `action=query&format=json&origin=*&` +
            `titles=${encodeURIComponent(word)}&prop=extracts&exintro=true`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Wiktionary API error:', error);
        return null;
    }
}
```

### 2. ConceptNet API (ВТОРОЙ ПРИОРИТЕТ)
**Семантические связи и синонимы**

```javascript
// Функция для получения связанных слов
async getRelatedWords(word) {
    try {
        const response = await fetch(`https://api.conceptnet.io/c/no/${word}?limit=20`);
        const data = await response.json();
        return data.edges || [];
    } catch (error) {
        console.error('ConceptNet API error:', error);
        return [];
    }
}
```

## Готовые датасеты для скачивания

### Приоритет 1: Готовые JSON файлы
1. **OpenSubtitles норвежские субтитры**
   - Скачать: https://opus.nlpl.eu/OpenSubtitles-v2018.php
   - Формат: TMX, можно конвертировать в JSON
   - Размер: 100MB+ переводов

2. **CC-100 Norwegian**
   - Ссылка: https://data.statmt.org/cc-100/
   - Содержание: 2GB чистого норвежского текста
   - Формат: TXT, легко парсить

### Приоритет 2: Словари
1. **Freelang Norwegian Dictionary**
   - Скачать: https://www.freelang.com/dictionary/norwegian.php
   - Формат: CSV готовый к использованию
   - 30,000+ слов с переводами

## Код для автоматической загрузки

### Создать файл: data-loader.js
```javascript
class DataLoader {
    constructor() {
        this.loadedData = new Map();
    }

    // Загрузка из готового JSON файла
    async loadFromURL(url, dataKey) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            this.loadedData.set(dataKey, data);
            return data;
        } catch (error) {
            console.error(`Failed to load ${dataKey}:`, error);
            return null;
        }
    }

    // Интеграция с существующей базой
    integrateWithDatabase(newData, targetDatabase) {
        newData.forEach((item, index) => {
            targetDatabase.push({
                id: `imported_${Date.now()}_${index}`,
                keywords: [item.norwegian, item.russian],
                question: item.norwegian,
                answer: `🇳🇴 **${item.norwegian}**\n🇷🇺 **${item.russian}`,
                category: item.category || 'imported',
                type: 'imported'
            });
        });
    }
}
```

## Рекомендуемые готовые файлы (JSON)

### 1. Основной словарь (10,000 слов)
```json
[
    {
        "norwegian": "hei",
        "russian": "привет",
        "pronunciation": "хай",
        "category": "greetings",
        "level": "A1",
        "examples": ["Hei, hvordan har du det?"]
    }
]
```

### 2. Грамматические конструкции
```json
[
    {
        "rule": "Definite articles",
        "norwegian_examples": ["huset", "bilen", "jenta"],
        "explanation": "Определенный артикль добавляется как суффикс",
        "level": "A1"
    }
]
```

## Автоматизация загрузки

### В script.js добавить:
```javascript
// При инициализации приложения
async initializeExternalData() {
    const loader = new DataLoader();
    
    // Загружаем готовые словари
    const vocabulary = await loader.loadFromURL('./data/norwegian-vocabulary.json', 'vocab');
    const grammar = await loader.loadFromURL('./data/norwegian-grammar.json', 'grammar');
    
    // Интегрируем с существующей базой
    if (vocabulary) {
        loader.integrateWithDatabase(vocabulary, DATABASE);
        console.log('Vocabulary loaded:', vocabulary.length, 'words');
    }
    
    if (grammar) {
        loader.integrateWithDatabase(grammar, DATABASE);
        console.log('Grammar loaded:', grammar.length, 'rules');
    }
}
```

## Хранение локально

### Service Worker кеширование
```javascript
// В sw.js добавить кеширование API ответов
const API_CACHE = 'api-cache-v1';

self.addEventListener('fetch', event => {
    if (event.request.url.includes('wiktionary.org') || 
        event.request.url.includes('conceptnet.io')) {
        event.respondWith(
            caches.match(event.request)
                .then(response => response || fetch(event.request))
        );
    }
});
```

## Обработка больших файлов

### Потоковая загрузка
```javascript
async loadLargeDataset(url, chunkSize = 1000) {
    const response = await fetch(url);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let processedCount = 0;
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Сохраняем неполную строку
        
        // Обрабатываем по частям
        for (let i = 0; i < lines.length; i += chunkSize) {
            const chunk = lines.slice(i, i + chunkSize);
            await this.processChunk(chunk);
            processedCount += chunk.length;
            
            // Показываем прогресс
            console.log(`Processed: ${processedCount} items`);
        }
    }
}
```

## Мониторинг качества данных

### Валидация импортированных данных
```javascript
validateImportedData(data) {
    const valid = data.filter(item => 
        item.norwegian && 
        item.russian && 
        item.norwegian.length > 0 && 
        item.russian.length > 0
    );
    
    console.log(`Validation: ${valid.length}/${data.length} items are valid`);
    return valid;
}
```

## Следующие шаги

1. **Немедленно**: Интегрировать Wiktionary API
2. **Эта неделя**: Скачать и интегрировать готовый словарь Freelang
3. **Следующая неделя**: Добавить ConceptNet для связанных слов
4. **Долгосрочно**: Интегрировать OPUS корпуса для контекстных примеров