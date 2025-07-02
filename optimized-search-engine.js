/**
 * Сверхоптимизированный поисковый движок для больших баз данных
 * Поддерживает миллионы записей с мгновенным поиском
 */

class OptimizedSearchEngine {
    constructor() {
        // Индексы для быстрого поиска
        this.keywordIndex = new Map(); // Map<keyword, Set<itemId>>
        this.categoryIndex = new Map(); // Map<category, Set<itemId>>
        this.levelIndex = new Map(); // Map<level, Set<itemId>>
        this.itemsById = new Map(); // Map<id, item>
        
        // Кеш для поиска
        this.searchCache = new Map(); // Map<query, results>
        this.maxCacheSize = 1000;
        
        // Нормализация текста
        this.stopWords = new Set(['и', 'в', 'на', 'с', 'по', 'для', 'что', 'как', 'где', 'когда', 'почему', 'кто']);
        
        // Статистика
        this.searchStats = {
            totalSearches: 0,
            cacheHits: 0,
            avgSearchTime: 0
        };
        
        console.log('🚀 OptimizedSearchEngine инициализирован');
    }

    /**
     * Построение всех индексов из массива данных
     */
    buildIndexes(data) {
        const startTime = performance.now();
        
        console.log(`📊 Начинаю индексацию ${data.length} записей...`);
        
        // Очищаем существующие индексы
        this.clearIndexes();
        
        data.forEach(item => this.indexItem(item));
        
        const endTime = performance.now();
        console.log(`✅ Индексация завершена за ${(endTime - startTime).toFixed(2)}ms`);
        console.log(`📈 Проиндексировано: ${this.itemsById.size} записей, ${this.keywordIndex.size} ключевых слов`);
    }

    /**
     * Индексация отдельного элемента
     */
    indexItem(item) {
        if (!item.id) return;
        
        // Сохраняем элемент
        this.itemsById.set(item.id, item);
        
        // Индексируем по ключевым словам
        if (item.keywords) {
            item.keywords.forEach(keyword => {
                const normalizedKeyword = this.normalizeText(keyword);
                if (!this.keywordIndex.has(normalizedKeyword)) {
                    this.keywordIndex.set(normalizedKeyword, new Set());
                }
                this.keywordIndex.get(normalizedKeyword).add(item.id);
            });
        }
        
        // Индексируем текст вопроса и ответа
        if (item.question) {
            const words = this.extractWords(item.question);
            words.forEach(word => {
                if (!this.keywordIndex.has(word)) {
                    this.keywordIndex.set(word, new Set());
                }
                this.keywordIndex.get(word).add(item.id);
            });
        }
        
        if (item.answer) {
            const words = this.extractWords(item.answer);
            words.forEach(word => {
                if (!this.keywordIndex.has(word)) {
                    this.keywordIndex.set(word, new Set());
                }
                this.keywordIndex.get(word).add(item.id);
            });
        }
        
        // Индексируем категорию
        if (item.category) {
            if (!this.categoryIndex.has(item.category)) {
                this.categoryIndex.set(item.category, new Set());
            }
            this.categoryIndex.get(item.category).add(item.id);
        }
        
        // Индексируем уровень
        if (item.level) {
            if (!this.levelIndex.has(item.level)) {
                this.levelIndex.set(item.level, new Set());
            }
            this.levelIndex.get(item.level).add(item.id);
        }
    }

    /**
     * Быстрый поиск с кешированием
     */
    search(query, options = {}) {
        const startTime = performance.now();
        this.searchStats.totalSearches++;
        
        const normalizedQuery = this.normalizeText(query);
        const cacheKey = this.getCacheKey(normalizedQuery, options);
        
        // Проверяем кеш
        if (this.searchCache.has(cacheKey)) {
            this.searchStats.cacheHits++;
            const result = this.searchCache.get(cacheKey);
            console.log(`⚡ Результат из кеша: ${result.length} записей`);
            return result;
        }
        
        // Выполняем поиск
        const results = this.performSearch(normalizedQuery, options);
        
        // Сохраняем в кеш
        this.updateCache(cacheKey, results);
        
        const endTime = performance.now();
        const searchTime = endTime - startTime;
        this.updateSearchStats(searchTime);
        
        console.log(`🔍 Поиск "${query}": найдено ${results.length} результатов за ${searchTime.toFixed(2)}ms`);
        
        return results;
    }

    /**
     * Выполнение поиска по индексам
     */
    performSearch(normalizedQuery, options) {
        const words = this.extractWords(normalizedQuery);
        if (words.length === 0) return [];
        
        // Получаем множества ID для каждого слова
        const wordSets = words.map(word => {
            return this.keywordIndex.get(word) || new Set();
        });
        
        // Находим пересечение всех множеств (AND логика)
        let resultIds = wordSets[0];
        for (let i = 1; i < wordSets.length; i++) {
            resultIds = this.intersectSets(resultIds, wordSets[i]);
        }
        
        // Если точного совпадения нет, используем OR логику
        if (resultIds.size === 0) {
            resultIds = this.unionSets(wordSets);
        }
        
        // Фильтруем по категории и уровню
        if (options.category) {
            const categoryIds = this.categoryIndex.get(options.category) || new Set();
            resultIds = this.intersectSets(resultIds, categoryIds);
        }
        
        if (options.level) {
            const levelIds = this.levelIndex.get(options.level) || new Set();
            resultIds = this.intersectSets(resultIds, levelIds);
        }
        
        // Получаем объекты и сортируем по релевантности
        const results = Array.from(resultIds)
            .map(id => this.itemsById.get(id))
            .filter(Boolean)
            .map(item => ({
                ...item,
                relevance: this.calculateRelevance(item, normalizedQuery, words)
            }))
            .sort((a, b) => b.relevance - a.relevance);
        
        // Ограничиваем количество результатов
        const limit = options.limit || 10;
        return results.slice(0, limit);
    }

    /**
     * Вычисление релевантности
     */
    calculateRelevance(item, query, queryWords) {
        let score = 0;
        
        // Точное совпадение в ключевых словах
        if (item.keywords) {
            item.keywords.forEach(keyword => {
                if (this.normalizeText(keyword) === query) {
                    score += 100;
                } else if (this.normalizeText(keyword).includes(query)) {
                    score += 50;
                }
            });
        }
        
        // Совпадения слов в вопросе
        if (item.question) {
            const questionWords = this.extractWords(item.question);
            queryWords.forEach(word => {
                if (questionWords.includes(word)) {
                    score += 10;
                }
            });
        }
        
        // Совпадения слов в ответе
        if (item.answer) {
            const answerWords = this.extractWords(item.answer);
            queryWords.forEach(word => {
                if (answerWords.includes(word)) {
                    score += 5;
                }
            });
        }
        
        // Бонус за категорию
        if (item.category && queryWords.includes(item.category.toLowerCase())) {
            score += 20;
        }
        
        return score;
    }

    /**
     * Нормализация текста
     */
    normalizeText(text) {
        if (!text) return '';
        
        return text
            .toLowerCase()
            .replace(/[^\wа-яё\s]/gi, ' ') // Удаляем знаки препинания
            .replace(/\s+/g, ' ') // Заменяем множественные пробелы на одинарные
            .trim();
    }

    /**
     * Извлечение слов из текста
     */
    extractWords(text) {
        const normalized = this.normalizeText(text);
        return normalized
            .split(' ')
            .filter(word => word.length > 1 && !this.stopWords.has(word))
            .slice(0, 10); // Ограничиваем количество слов
    }

    /**
     * Пересечение множеств (AND логика)
     */
    intersectSets(set1, set2) {
        const result = new Set();
        const smaller = set1.size <= set2.size ? set1 : set2;
        const larger = set1.size > set2.size ? set1 : set2;
        
        for (const item of smaller) {
            if (larger.has(item)) {
                result.add(item);
            }
        }
        
        return result;
    }

    /**
     * Объединение множеств (OR логика)
     */
    unionSets(sets) {
        const result = new Set();
        sets.forEach(set => {
            set.forEach(item => result.add(item));
        });
        return result;
    }

    /**
     * Создание ключа кеша
     */
    getCacheKey(query, options) {
        return `${query}|${options.category || ''}|${options.level || ''}|${options.limit || 10}`;
    }

    /**
     * Обновление кеша
     */
    updateCache(key, results) {
        // Если кеш переполнен, удаляем старые записи
        if (this.searchCache.size >= this.maxCacheSize) {
            const firstKey = this.searchCache.keys().next().value;
            this.searchCache.delete(firstKey);
        }
        
        this.searchCache.set(key, results);
    }

    /**
     * Обновление статистики поиска
     */
    updateSearchStats(searchTime) {
        const { totalSearches, avgSearchTime } = this.searchStats;
        this.searchStats.avgSearchTime = ((avgSearchTime * (totalSearches - 1)) + searchTime) / totalSearches;
    }

    /**
     * Очистка всех индексов
     */
    clearIndexes() {
        this.keywordIndex.clear();
        this.categoryIndex.clear();
        this.levelIndex.clear();
        this.itemsById.clear();
        this.searchCache.clear();
    }

    /**
     * Получение всех данных
     */
    getAllData() {
        return this.data || [];
    }
    
    /**
     * Получение статистики
     */
    getStats() {
        return {
            ...this.searchStats,
            cacheHitRate: (this.searchStats.cacheHits / this.searchStats.totalSearches * 100).toFixed(2) + '%',
            totalItems: this.itemsById.size,
            totalKeywords: this.keywordIndex.size,
            cacheSize: this.searchCache.size
        };
    }

    /**
     * Предварительная загрузка популярных запросов
     */
    preloadPopularQueries(queries) {
        console.log('🔥 Предзагрузка популярных запросов...');
        queries.forEach(query => {
            this.search(query);
        });
        console.log(`✅ Предзагружено ${queries.length} запросов`);
    }

    /**
     * Автокомплит для поиска
     */
    getSuggestions(partialQuery, limit = 5) {
        const normalized = this.normalizeText(partialQuery);
        const suggestions = [];
        
        for (const keyword of this.keywordIndex.keys()) {
            if (keyword.startsWith(normalized) && keyword !== normalized) {
                suggestions.push(keyword);
                if (suggestions.length >= limit) break;
            }
        }
        
        return suggestions;
    }
}

/**
 * Экспорт для использования в основном скрипте
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OptimizedSearchEngine;
} else if (typeof window !== 'undefined') {
    window.OptimizedSearchEngine = OptimizedSearchEngine;
}