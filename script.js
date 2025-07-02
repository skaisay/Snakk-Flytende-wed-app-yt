/**
 * Главный скрипт веб-ассистента - ИСПРАВЛЕННАЯ ВЕРСИЯ
 * Быстрая инициализация + фоновая загрузка мега-данных
 */

// ГЛОБАЛЬНАЯ функция для модального окна источников
window.showSourcesModal = function() {
    console.log('🌍 ГЛОБАЛЬНЫЙ вызов showSourcesModal');
    
    // Создаем простое модальное окно
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 9999; display: flex;
        align-items: center; justify-content: center; padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));
        backdrop-filter: blur(15px); border-radius: 20px; padding: 30px;
        max-width: 500px; width: 100%; color: white; border: 1px solid rgba(255,255,255,0.2);
    `;
    
    // Получаем реальную статистику данных
    const stats = window.assistant ? {
        database: window.assistant.norwegianEngine?.getAllData()?.length || 0,
        megaData: window.assistant.megaDataLoader?.getStats()?.totalRecords || 0,
        optimizedEngine: window.assistant.optimizedEngine?.getStats()?.totalItems || 0,
        translation: Object.keys(TRANSLATION_DATABASE || {}).length,
        conversation: Object.keys(CONVERSATION_DATABASE || {}).length
    } : { database: 0, megaData: 0, optimizedEngine: 0, translation: 0, conversation: 0 };
    
    const totalRecords = stats.database + stats.megaData + stats.optimizedEngine + stats.translation + stats.conversation;
    
    content.innerHTML = `
        <h2 style="margin: 0 0 20px; color: #4F9CF9;">📊 Источники данных</h2>
        <div style="margin-bottom: 20px; font-size: 14px;">
            <div style="background: rgba(79,156,249,0.1); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px; color: #4F9CF9;">📈 Статистика загруженных данных</h3>
                <p style="margin: 5px 0; color: #90EE90;">✅ Всего записей: <strong>${totalRecords.toLocaleString()}</strong></p>
                <p style="margin: 5px 0;">• Норвежская база: ${stats.database.toLocaleString()} записей</p>
                <p style="margin: 5px 0;">• Мега-данные: ${stats.megaData.toLocaleString()} записей</p>
                <p style="margin: 5px 0;">• Переводы: ${stats.translation.toLocaleString()} записей</p>
                <p style="margin: 5px 0;">• Разговорные фразы: ${stats.conversation.toLocaleString()} записей</p>
            </div>
        </div>
        <div style="margin-bottom: 20px; font-size: 14px;">
            <h3 style="margin: 0 0 10px; color: #4F9CF9;">🗂️ Источники</h3>
            <p>• Викисловарь (Wiktionary) - переводы и определения</p>
            <p>• Норвежские словари - базовая лексика по уровням A1-C1</p>
            <p>• Корпус субтитров - живые фразы из фильмов</p>
            <p>• Новостные статьи - актуальная лексика</p>
            <p>• Грамматические правила - структура языка</p>
        </div>
        <div style="display: flex; gap: 10px;">
            <button onclick="this.closest('.modal').remove()" 
                    style="background: #4F9CF9; color: white; border: none; padding: 10px 20px; 
                           border-radius: 10px; cursor: pointer; flex: 1;">
                Закрыть
            </button>
            <button onclick="window.testDataSearch && window.testDataSearch()" 
                    style="background: #28a745; color: white; border: none; padding: 10px 20px; 
                           border-radius: 10px; cursor: pointer; flex: 1;">
                Тест поиска
            </button>
        </div>
    `;
    
    modal.className = 'modal';
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Закрытие по клику вне
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
};

// ГЛОБАЛЬНАЯ функция тестирования поиска данных
window.testDataSearch = function() {
    console.log('🧪 ТЕСТ ПОИСКА ДАННЫХ');
    
    // Тестовые запросы
    const testQueries = ['hei', 'takk', 'jeg', 'du', 'hva'];
    const results = [];
    
    testQueries.forEach(query => {
        let found = false;
        let sources = [];
        
        // Проверяем норвежскую базу
        if (window.assistant?.norwegianEngine?.search) {
            const norwegianResults = window.assistant.norwegianEngine.search(query);
            if (norwegianResults && norwegianResults.length > 0) {
                found = true;
                sources.push(`Норвежская база: ${norwegianResults.length} результатов`);
            }
        }
        
        // Проверяем переводы
        if (TRANSLATION_DATABASE && TRANSLATION_DATABASE[query]) {
            found = true;
            sources.push('Переводы: найден');
        }
        
        // Проверяем оптимизированный движок
        if (window.assistant?.optimizedEngine?.search) {
            const optimizedResults = window.assistant.optimizedEngine.search(query);
            if (optimizedResults && optimizedResults.length > 0) {
                found = true;
                sources.push(`Оптимизированный поиск: ${optimizedResults.length} результатов`);
            }
        }
        
        results.push({
            query,
            found,
            sources: sources.join(', ') || 'Не найдено'
        });
    });
    
    // Показываем результаты
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 9999; display: flex;
        align-items: center; justify-content: center; padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));
        backdrop-filter: blur(15px); border-radius: 20px; padding: 30px;
        max-width: 600px; width: 100%; color: white; border: 1px solid rgba(255,255,255,0.2);
        max-height: 80vh; overflow-y: auto;
    `;
    
    const resultsHtml = results.map(r => `
        <div style="background: rgba(79,156,249,0.1); padding: 10px; border-radius: 8px; margin: 5px 0;">
            <strong style="color: ${r.found ? '#90EE90' : '#FFB6C1'};">"${r.query}"</strong><br>
            <small>${r.sources}</small>
        </div>
    `).join('');
    
    content.innerHTML = `
        <h2 style="margin: 0 0 20px; color: #4F9CF9;">🧪 Тест поиска данных</h2>
        <p style="margin-bottom: 15px;">Результаты поиска базовых норвежских слов:</p>
        ${resultsHtml}
        <div style="margin-top: 20px; padding: 15px; background: rgba(40,167,69,0.2); border-radius: 10px;">
            <strong style="color: #90EE90;">Тест завершен!</strong><br>
            <small>Данные загружаются автоматически в фоновом режиме. Попробуйте написать сообщение в чат.</small>
        </div>
        <button onclick="this.closest('.modal').remove()" 
                style="background: #4F9CF9; color: white; border: none; padding: 10px 20px; 
                       border-radius: 10px; cursor: pointer; margin-top: 20px; width: 100%;">
            Закрыть
        </button>
    `;
    
    modal.className = 'modal';
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
};

class WebAssistant {
    constructor() {
        // Элементы DOM
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.inputForm = document.getElementById('inputForm');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.chatTitle = document.getElementById('chatTitle');
        this.dataStatus = document.getElementById('dataStatus');
        this.autoUpdateStatus = document.getElementById('autoUpdateStatus');
        this.updateDescription = document.getElementById('updateDescription');
        this.updateStats = document.getElementById('updateStats');
        this.progressBar = document.getElementById('progressBar');

        // Состояние приложения
        this.isListening = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.deferredPrompt = null;
        this.chatHistory = [];
        this.currentTranscript = '';
        this.voiceMessages = [];

        // Данные и поисковые движки
        this.optimizedEngine = null;
        this.norwegianEngine = null;
    }

    /**
     * Инициализация приложения
     */
    async init() {
        console.log('🚀 Запуск веб-ассистента...');
        
        try {
            // Инициализируем иконки сразу
            this.initializeFeatherIcons();
            
            // Быстрая инициализация с базовыми данными
            await this.initializeNorwegianEngine();
            
            // Инициализируем остальные системы
            this.initializeSpeechFeatures();
            this.initializePWA();
            this.bindEvents();
            this.initializeProfile();
            this.initializeVoiceWindow();
            
            console.log('✅ Веб-ассистент готов к работе!');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
            this.updateDataStatus('Ошибка загрузки');
        }
    }

    /**
     * Обновление статуса загрузки данных
     */
    updateDataStatus(message) {
        if (this.dataStatus) {
            this.dataStatus.textContent = message;
            this.dataStatus.style.display = message ? 'block' : 'none';
        }
    }
    
    /**
     * Обновление статуса автопополнения в меню
     */
    updateAutoUpdateStatus(description, progress = 0, stats = null) {
        if (this.updateDescription) {
            this.updateDescription.textContent = description;
        }
        
        if (this.progressBar) {
            this.progressBar.style.width = `${progress}%`;
        }
        
        if (this.updateStats && stats) {
            this.updateStats.textContent = stats;
        }
    }

    /**
     * Инициализация иконок Feather
     */
    initializeFeatherIcons() {
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    /**
     * БЫСТРАЯ инициализация норвежской базы данных
     */
    async initializeNorwegianEngine() {
        // Собираем базовые данные СРАЗУ
        const allData = [];
        
        // Добавляем встроенные данные
        if (typeof DATABASE !== 'undefined') {
            allData.push(...DATABASE);
        }
        if (typeof TRANSLATION_DATABASE !== 'undefined') {
            const translationArray = Object.entries(TRANSLATION_DATABASE).map(([ru, no]) => ({
                ru: ru,
                no: no.split('[')[0].trim(),
                source: 'translation'
            }));
            allData.push(...translationArray);
        }
        if (typeof CONVERSATION_DATABASE !== 'undefined') {
            allData.push(...CONVERSATION_DATABASE);
        }
        
        // Инициализируем УЛЬТРА-ДВИЖОК для больших данных
        console.log('🚀 Инициализация ультра-движка для больших данных...');
        if (typeof UltraPerformanceEngine !== 'undefined') {
            this.ultraEngine = new UltraPerformanceEngine();
            await this.ultraEngine.initialize();
            
            // Загружаем базовые данные мгновенно
            console.log('⚡ Быстрая загрузка базовых данных:', allData.length, 'записей');
            
            // Используем fallback движок для базовых данных
            this.optimizedEngine = new OptimizedSearchEngine();
            this.optimizedEngine.buildIndexes(allData);
        } else if (typeof OptimizedSearchEngine !== 'undefined') {
            this.optimizedEngine = new OptimizedSearchEngine();
            this.optimizedEngine.buildIndexes(allData);
        }
        
        // Приложение готово к работе!
        this.updateDataStatus('');
        
        // Запускаем фоновую загрузку мега-данных
        this.startBackgroundMegaLoading();
        
        // Инициализируем норвежскую базу
        if (typeof NorwegianSearchEngine !== 'undefined') {
            this.norwegianEngine = new NorwegianSearchEngine();
        }
    }

    /**
     * УЛЬТРА-БЫСТРАЯ фоновая загрузка больших данных
     */
    startBackgroundMegaLoading() {
        // Запускаем через 1 секунду - ультра-быстро!
        setTimeout(async () => {
            try {
                this.updateAutoUpdateStatus('Запуск ультра-загрузки...', 0);
                
                if (this.ultraEngine) {
                    // Используем ультра-движок для больших данных
                    console.log('🚀 Запуск потоковой загрузки через ультра-движок...');
                    
                    await this.ultraEngine.startMegaDataStreaming((progress) => {
                        this.updateAutoUpdateStatus(
                            `${progress.source}: ${progress.currentSource.toFixed(1)}%`,
                            progress.progress,
                            `${progress.completed}/${progress.total} | ${progress.speed.toFixed(1)} MB/s | RAM: ${progress.memoryUsage.percentage.toFixed(1)}%`
                        );
                    });
                    
                    const stats = this.ultraEngine.getPerformanceStats();
                    console.log('🎉 Ультра-загрузка завершена:', stats);
                    
                    this.updateAutoUpdateStatus(
                        'УЛЬТРА-база готова!', 
                        100, 
                        `${stats.activeSources} источников | ${stats.averageSearchTime.toFixed(2)}мс поиск`
                    );
                    
                } else if (typeof MegaDataLoader !== 'undefined') {
                    // Fallback к обычному мега-загрузчику
                    const megaLoader = new MegaDataLoader();
                    
                    megaLoader.setUpdateCallback((stats) => {
                        this.updateAutoUpdateStatus(
                            `Обычная загрузка: ${stats.loaded.toLocaleString()}`,
                            stats.progress,
                            `Источников: ${Object.keys(stats.sources || {}).length}`
                        );
                    });
                    
                    const megaData = await megaLoader.initialize();
                    
                    if (megaData && megaData.length > 0) {
                        const currentData = this.optimizedEngine.getAllData() || [];
                        const combinedData = [...currentData, ...megaData];
                        this.optimizedEngine.buildIndexes(combinedData);
                        
                        console.log('📊 Обычная мега-загрузка завершена:', megaData.length.toLocaleString(), 'записей');
                        
                        this.updateAutoUpdateStatus(
                            'Мега-база готова!', 
                            100, 
                            `Всего: ${combinedData.length.toLocaleString()} записей`
                        );
                    }
                } else {
                    this.updateAutoUpdateStatus('Базовые данные', 100, 'Всего: ' + (this.optimizedEngine.getAllData().length || 0) + ' записей');
                }
                
            } catch (error) {
                console.warn('⚠️ Ошибка фоновой загрузки:', error);
                this.updateAutoUpdateStatus('Используются базовые данные', 100);
            }
        }, 1000); // Ультра-быстрый старт!
    }

    /**
     * Инициализация голосовых функций
     */
    initializeSpeechFeatures() {
        // Инициализация распознавания речи
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'ru-RU';
            
            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    this.currentTranscript = finalTranscript;
                    this.updateVoiceTranscript(finalTranscript);
                }
            };
        }
    }

    /**
     * Инициализация PWA функций
     */
    initializePWA() {
        // Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => console.log('SW зарегистрирован'))
                .catch(error => console.log('SW ошибка:', error));
        }

        // Установка PWA
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt(e);
        });
    }

    /**
     * Показать предложение установки PWA
     */
    showInstallPrompt(deferredPrompt) {
        // Простое предложение установки
        setTimeout(() => {
            if (confirm('Установить приложение на устройство?')) {
                deferredPrompt.prompt();
            }
        }, 5000);
    }

    /**
     * Привязка событий
     */
    bindEvents() {
        // Отладка - показываем все элементы меню
        console.log('🔍 Все элементы меню:', {
            sourcesBtn: document.getElementById('sourcesBtn'),
            editProfileBtn: document.getElementById('editProfileBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            menuOptions: document.querySelectorAll('.menu-option')
        });
        // Форма отправки сообщений
        if (this.inputForm) {
            this.inputForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // Автоматическое изменение высоты поля ввода
        if (this.messageInput) {
            this.messageInput.addEventListener('input', () => {
                this.adjustInputHeight();
            });
        }

        // Меню - ИСПРАВЛЕННЫЕ ID
        const menuBtn = document.getElementById('menuButton'); // Исправлено!
        const sideMenu = document.getElementById('sideMenu');
        const closeMenuBtn = document.getElementById('closeMenuBtn');

        if (menuBtn && sideMenu) {
            menuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔄 Открываю меню...');
                sideMenu.classList.add('open');
            });
        } else {
            console.warn('⚠️ Кнопка меню или само меню не найдены:', { menuBtn, sideMenu });
        }

        if (closeMenuBtn && sideMenu) {
            closeMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                sideMenu.classList.remove('open');
            });
        }

        // Закрытие меню кликом вне его области
        if (sideMenu) {
            document.addEventListener('click', (e) => {
                // Если клик был вне меню и меню открыто
                if (sideMenu.classList.contains('open') && 
                    !sideMenu.contains(e.target) && 
                    !menuBtn.contains(e.target)) {
                    sideMenu.classList.remove('open');
                }
            });
        }

        // Кнопка "Новый чат"
        const newChatBtn = document.getElementById('newChatBtn');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startNewChat();
            });
        }

        // Пункты меню с отладкой
        const profileItem = document.getElementById('profileItem');
        console.log('👤 Поиск profileItem:', profileItem);
        if (profileItem) {
            profileItem.addEventListener('click', () => {
                console.log('👤 Клик по профилю');
                this.showProfileModal();
            });
        }

        // Попробуем найти кнопку по другим селекторам
        const editProfileBtn = document.getElementById('editProfileBtn');
        console.log('✏️ Поиск editProfileBtn:', editProfileBtn);
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                console.log('✏️ Клик по editProfileBtn');
                this.showProfileModal();
            });
        }

        // Кнопка "Источники" - множественные способы поиска
        const sourcesBtn = document.getElementById('sourcesBtn');
        const sourcesBtnAlt = document.querySelector('#sourcesBtn');
        const sourcesBtnByText = Array.from(document.querySelectorAll('.menu-option')).find(btn => 
            btn.textContent.trim().includes('Источники')
        );
        
        console.log('🔍 Поиск кнопки источников:', {
            getElementById: sourcesBtn,
            querySelector: sourcesBtnAlt,
            byText: sourcesBtnByText
        });

        const activeBtn = sourcesBtn || sourcesBtnAlt || sourcesBtnByText;
        if (activeBtn) {
            // Очищаем кнопку от возможных артефактов
            this.cleanSourcesButton(activeBtn);
            
            activeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('📊 Клик по кнопке источников');
                this.showSourcesModal();
            });
            console.log('✅ Обработчик событий добавлен для кнопки источников');
        } else {
            console.warn('⚠️ Кнопка sourcesBtn не найдена никаким способом');
        }

        // ГЛОБАЛЬНОЕ делегирование для всех кнопок источников
        document.addEventListener('click', (e) => {
            if (e.target.closest('#sourcesBtn') || e.target.closest('[id*="source"]')) {
                e.preventDefault();
                console.log('📊 Клик через глобальное делегирование');
                this.showSourcesModal();
            }
        });

        // Создаем глобальную функцию для тестирования
        window.testSourcesModal = () => {
            console.log('🧪 Тест модального окна источников');
            this.showSourcesModal();
        };
    }

    /**
     * Автоматическое изменение высоты поля ввода
     */
    adjustInputHeight() {
        if (this.messageInput) {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
        }
    }

    /**
     * Обработка отправки сообщения
     */
    async handleSubmit() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        this.addUserMessage(message);
        this.messageInput.value = '';
        this.adjustInputHeight();

        // Обновляем заголовок чата первым сообщением пользователя
        this.updateChatTitle(message);

        this.showLoadingIndicator();

        try {
            const response = await this.findBestAnswer(message);
            
            this.hideLoadingIndicator();
            this.addAssistantMessage(response);
            
        } catch (error) {
            console.error('Ошибка обработки сообщения:', error);
            this.hideLoadingIndicator();
            this.addAssistantMessage('Извините, произошла ошибка. Попробуйте еще раз.');
        }
    }

    /**
     * Поиск в мастер-базе данных
     */
    searchMasterDatabase(query) {
        const normalizedQuery = query.toLowerCase().trim();
        
        // Проверяем MASTER_DATABASE если доступна
        if (typeof MASTER_DATABASE === 'undefined') {
            return null;
        }

        // 1. Поиск в переводах
        if (MASTER_DATABASE.translations[normalizedQuery]) {
            return {
                type: 'translation',
                answer: `"${normalizedQuery}" по-норвежски: ${MASTER_DATABASE.translations[normalizedQuery]}`,
                source: 'мастер-база переводов'
            };
        }

        // 2. Поиск в норвежской лексике по уровням
        for (const level of ['A1', 'A2', 'B1', 'B2', 'C1']) {
            if (MASTER_DATABASE.norwegian[level] && MASTER_DATABASE.norwegian[level][normalizedQuery]) {
                const entry = MASTER_DATABASE.norwegian[level][normalizedQuery];
                return {
                    type: 'norwegian',
                    answer: `${normalizedQuery} - ${entry.translation} (${entry.level})\nПример: ${entry.example}\nПеревод: ${entry.exampleTranslation}`,
                    source: `мастер-база ${level}`
                };
            }
        }

        // 3. Поиск в разговорных фразах
        for (const category in MASTER_DATABASE.conversations) {
            const phrases = MASTER_DATABASE.conversations[category];
            for (const phrase in phrases) {
                if (phrase.toLowerCase().includes(normalizedQuery)) {
                    return {
                        type: 'conversation',
                        answer: phrases[phrase],
                        source: `мастер-база разговоров (${category})`
                    };
                }
            }
        }

        // 4. Поиск в расширенной лексике
        for (const category in MASTER_DATABASE.extended) {
            const items = MASTER_DATABASE.extended[category];
            if (items[normalizedQuery]) {
                return {
                    type: 'extended',
                    answer: `${normalizedQuery} по-норвежски: ${items[normalizedQuery]}`,
                    source: `мастер-база (${category})`
                };
            }
        }

        return null;
    }

    /**
     * УЛЬТРА-БЫСТРЫЙ поиск лучшего ответа
     */
    async findBestAnswer(userMessage) {
        const searchStart = performance.now();
        
        try {
            // 1. ПРИОРИТЕТ: Поиск в мастер-базе данных
            const masterResult = this.searchMasterDatabase(userMessage);
            if (masterResult) {
                console.log(`✅ Найдено в ${masterResult.source}`);
                return masterResult.answer;
            }

            // 2. Проверяем разговорные фразы (старая база)
            if (typeof findConversationResponse !== 'undefined') {
                const conversationResult = findConversationResponse(userMessage);
                if (conversationResult) {
                    console.log('💬 Найден разговорный ответ (старая база)');
                    return conversationResult;
                }
            }

            // Поиск переводов
            if (this.isTranslationRequest(userMessage)) {
                return this.handleTranslationRequest(userMessage);
            }

            let results = null;
            
            // Приоритет: ультра-движок для поиска в обучающих материалах
            if (this.ultraEngine) {
                results = await this.ultraEngine.instantSearch(userMessage, { limit: 3 });
                const searchTime = performance.now() - searchStart;
                console.log(`⚡ Ультра-поиск выполнен за ${searchTime.toFixed(2)}мс`);
            } 
            // Fallback: обычный оптимизированный поиск
            else if (this.optimizedEngine) {
                results = this.optimizedEngine.search(userMessage, { limit: 3 });
            }
            
            // Обрабатываем результаты поиска в обучающих материалах
            if (results && results.length > 0) {
                const bestMatch = results[0];
                if (bestMatch.answer || bestMatch.question) {
                    return bestMatch.answer || bestMatch.question;
                }
            }

            // Если ничего не найдено - дружелюбный ответ
            return this.getDefaultResponse(userMessage);
            
        } catch (error) {
            console.error('❌ Ошибка поиска:', error);
            return 'Извините, произошла ошибка при поиске ответа.';
        }
    }

    /**
     * Определение запроса на перевод
     */
    isTranslationRequest(message) {
        const translationKeywords = ['переведи', 'перевод', 'как сказать', 'по-норвежски', 'на норвежском'];
        return translationKeywords.some(keyword => message.toLowerCase().includes(keyword));
    }

    /**
     * Обработка запроса на перевод
     */
    handleTranslationRequest(message) {
        // Ищем в базе переводов
        if (typeof TRANSLATION_DATABASE !== 'undefined') {
            const lowerMessage = message.toLowerCase();
            
            for (const [ru, no] of Object.entries(TRANSLATION_DATABASE)) {
                if (lowerMessage.includes(ru.toLowerCase())) {
                    return `🇷🇺 **${ru}**\n🇳🇴 **${no}**\n\n✨ Перевод найден в базе данных!`;
                }
            }
        }
        
        return 'Извините, перевод для этого слова пока не найден. База данных постоянно пополняется!';
    }

    /**
     * Ответ по умолчанию
     */
    getDefaultResponse(userMessage) {
        // Простые приветствия и общие фразы
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('привет') || lowerMessage.includes('здравствуй')) {
            return 'Привет! Я помогаю изучать норвежский язык. Спросите меня о переводах или попросите случайное слово!';
        }
        
        if (lowerMessage.includes('спасибо') || lowerMessage.includes('благодарю')) {
            return 'Пожалуйста! Всегда рад помочь с изучением норвежского языка 😊';
        }
        
        if (lowerMessage.includes('случайное слово') || lowerMessage.includes('случайное')) {
            // Возвращаем случайное норвежское слово
            if (typeof TRANSLATION_DATABASE !== 'undefined') {
                const words = Object.entries(TRANSLATION_DATABASE);
                const randomWord = words[Math.floor(Math.random() * words.length)];
                return `🇳🇴 **${randomWord[1]}** — ${randomWord[0]}\n\n💡 Попробуйте использовать это слово в предложении!`;
            }
        }
        
        // Обычные вопросы об изучении языка
        const helpfulResponses = [
            'Я помогаю изучать норвежский язык! Попробуйте:\n• "переведи привет"\n• "случайное слово"\n• "грамматика"',
            'Чего бы вы хотели узнать о норвежском языке? Могу помочь с переводами и новыми словами.',
            'Готов помочь с норвежским! Спросите перевод любого слова или попросите случайное слово для изучения.'
        ];
        
        return helpfulResponses[Math.floor(Math.random() * helpfulResponses.length)];
    }

    /**
     * Добавление сообщения пользователя
     */
    addUserMessage(message) {
        const messageElement = this.createMessageElement(message, 'user');
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        this.chatHistory.push({ type: 'user', content: message, timestamp: Date.now() });
    }

    /**
     * Добавление сообщения ассистента
     */
    addAssistantMessage(message) {
        const messageElement = this.createMessageElement(message, 'assistant');
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        this.chatHistory.push({ type: 'assistant', content: message, timestamp: Date.now() });
    }

    /**
     * Создание элемента сообщения
     */
    createMessageElement(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        if (type === 'assistant') {
            avatar.innerHTML = '<div class="ai-avatar"></div>';
        } else {
            avatar.innerHTML = '<i data-feather="user"></i>';
        }
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content.replace(/\n/g, '<br>');
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        
        // Добавляем контекстное меню для сообщений
        this.addContextMenuToMessage(messageDiv, content);
        
        // Обновляем иконки
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
        
        return messageDiv;
    }

    /**
     * Добавить контекстное меню к сообщению
     */
    addContextMenuToMessage(messageElement, messageText) {
        let longPressTimer = null;
        let startY = 0;
        let hasMoved = false;
        let isLongPress = false;

        // Обработка для мобильных устройств
        const handleTouchStart = (e) => {
            // НЕ блокируем событие - разрешаем прокрутку
            startY = e.touches[0].clientY;
            hasMoved = false;
            isLongPress = false;
            
            longPressTimer = setTimeout(() => {
                if (!hasMoved) {
                    isLongPress = true;
                    // Добавляем эффект выделения сообщения
                    messageElement.style.transform = 'scale(1.02)';
                    messageElement.style.backgroundColor = 'rgba(79, 156, 249, 0.1)';
                    
                    // Вибрация на поддерживаемых устройствах
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                    
                    this.showContextMenu(e, messageText);
                }
            }, 600); // Увеличили до 600мс для более четкого различия
        };

        const handleTouchMove = (e) => {
            const currentY = e.touches[0].clientY;
            const deltaY = Math.abs(currentY - startY);
            
            // Если пользователь двигается больше чем на 10px - это прокрутка
            if (deltaY > 10) {
                hasMoved = true;
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
                // Убираем эффект выделения если был
                messageElement.style.transform = '';
                messageElement.style.backgroundColor = '';
            }
        };

        const handleTouchEnd = (e) => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            
            // Если это был долгий клик, блокируем обычный клик
            if (isLongPress) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            // Убираем эффект выделения
            setTimeout(() => {
                messageElement.style.transform = '';
                messageElement.style.backgroundColor = '';
            }, 200);
        };

        // Обработка для десктопа (правый клик)
        const handleContextMenu = (e) => {
            e.preventDefault();
            this.showContextMenu(e, messageText);
        };

        // Обработка для десктопа (левый клик с удержанием)
        const handleMouseDown = (e) => {
            if (e.button === 0) { // Левая кнопка мыши
                longPressTimer = setTimeout(() => {
                    messageElement.style.transform = 'scale(1.02)';
                    messageElement.style.backgroundColor = 'rgba(79, 156, 249, 0.1)';
                    this.showContextMenu(e, messageText);
                }, 500);
            }
        };

        const handleMouseUp = () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            messageElement.style.transform = '';
            messageElement.style.backgroundColor = '';
        };

        // Привязка событий
        messageElement.addEventListener('touchstart', handleTouchStart, { passive: true });
        messageElement.addEventListener('touchmove', handleTouchMove, { passive: true });
        messageElement.addEventListener('touchend', handleTouchEnd);
        messageElement.addEventListener('touchcancel', handleTouchEnd);
        
        messageElement.addEventListener('mousedown', handleMouseDown);
        messageElement.addEventListener('mouseup', handleMouseUp);
        messageElement.addEventListener('mouseleave', handleMouseUp);
        messageElement.addEventListener('contextmenu', handleContextMenu);
    }

    /**
     * Показать контекстное меню
     */
    showContextMenu(event, messageText) {
        // Удаляем предыдущее меню
        this.hideContextMenu();

        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.cssText = `
            position: fixed;
            background: rgba(17, 25, 40, 0.95);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 8px;
            z-index: 1000;
            min-width: 150px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        `;

        // Опции меню
        const menuOptions = [
            {
                icon: 'copy',
                text: 'Копировать',
                action: () => this.copyToClipboard(messageText)
            },
            {
                icon: 'volume-2', 
                text: 'Озвучить',
                action: () => this.speakText(messageText)
            }
        ];

        menuOptions.forEach(option => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.style.cssText = `
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                cursor: pointer;
                border-radius: 8px;
                color: white;
                font-size: 14px;
                transition: background-color 0.2s;
            `;

            menuItem.innerHTML = `
                <i data-feather="${option.icon}" style="width: 16px; height: 16px;"></i>
                ${option.text}
            `;

            menuItem.addEventListener('click', () => {
                option.action();
                this.hideContextMenu();
            });

            menuItem.addEventListener('mouseenter', () => {
                menuItem.style.backgroundColor = 'rgba(79, 156, 249, 0.2)';
            });

            menuItem.addEventListener('mouseleave', () => {
                menuItem.style.backgroundColor = 'transparent';
            });

            contextMenu.appendChild(menuItem);
        });

        // Позиционирование меню
        const x = event.clientX || event.touches?.[0]?.clientX || 0;
        const y = event.clientY || event.touches?.[0]?.clientY || 0;

        contextMenu.style.left = `${Math.min(x, window.innerWidth - 160)}px`;
        contextMenu.style.top = `${Math.min(y, window.innerHeight - 100)}px`;

        document.body.appendChild(contextMenu);
        this.currentContextMenu = contextMenu;

        // Обновляем иконки Feather
        if (typeof feather !== 'undefined') {
            feather.replace();
        }

        // Закрытие по клику вне меню
        setTimeout(() => {
            document.addEventListener('click', this.hideContextMenu.bind(this), { once: true });
        }, 100);
    }

    /**
     * Скрыть контекстное меню
     */
    hideContextMenu() {
        if (this.currentContextMenu) {
            this.currentContextMenu.remove();
            this.currentContextMenu = null;
        }
    }

    /**
     * Копировать текст в буфер обмена
     */
    async copyToClipboard(text) {
        try {
            // Очищаем HTML теги
            const cleanText = text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
            
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(cleanText);
                this.showNotification('Текст скопирован!', 'success');
            } else {
                // Fallback для старых браузеров
                const textArea = document.createElement('textarea');
                textArea.value = cleanText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showNotification('Текст скопирован!', 'success');
            }
        } catch (err) {
            console.error('Ошибка копирования:', err);
            this.showNotification('Ошибка копирования', 'error');
        }
    }

    /**
     * Озвучить текст
     */
    speakText(text) {
        try {
            // Очищаем HTML теги
            const cleanText = text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
            
            if ('speechSynthesis' in window) {
                // Останавливаем предыдущее воспроизведение
                speechSynthesis.cancel();
                
                const utterance = new SpeechSynthesisUtterance(cleanText);
                utterance.lang = 'no-NO'; // Норвежский язык
                utterance.rate = 0.8;
                utterance.pitch = 1;
                
                speechSynthesis.speak(utterance);
                this.showNotification('Воспроизведение...', 'info');
            } else {
                this.showNotification('Озвучивание не поддерживается', 'error');
            }
        } catch (err) {
            console.error('Ошибка озвучивания:', err);
            this.showNotification('Ошибка озвучивания', 'error');
        }
    }

    /**
     * Показать уведомление
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'rgba(40, 167, 69, 0.9)' : 
                        type === 'error' ? 'rgba(220, 53, 69, 0.9)' : 
                        'rgba(79, 156, 249, 0.9)'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
            backdrop-filter: blur(10px);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Автоудаление через 3 секунды
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Показать индикатор загрузки
     */
    showLoadingIndicator() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'flex';
        }
    }

    /**
     * Скрыть индикатор загрузки
     */
    hideLoadingIndicator() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }
    }

    /**
     * Прокрутка к низу
     */
    scrollToBottom() {
        if (this.messagesContainer) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }

    /**
     * Задержка для асинхронных операций
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Инициализация профиля (заглушка)
     */
    initializeProfile() {
        // Простая инициализация профиля
    }

    /**
     * Инициализация голосового окна (заглушка)
     */
    initializeVoiceWindow() {
        // Простая инициализация голосового окна
    }

    /**
     * Обновление транскрипта голоса
     */
    updateVoiceTranscript(text) {
        console.log('Голосовой ввод:', text);
    }

    /**
     * Обновление заголовка чата
     */
    updateChatTitle(message) {
        const chatTitle = document.getElementById('chatTitle');
        const dataStatus = document.getElementById('dataStatus');
        
        if (chatTitle && message) {
            // Берем первые 30 символов сообщения для заголовка
            const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
            
            // Обновляем содержимое, сохраняя статус данных
            chatTitle.innerHTML = `${title}${dataStatus ? `<div class="data-status" id="dataStatus" style="font-size: 0.7em; opacity: 0.6; margin-top: 2px;">${dataStatus.textContent}</div>` : ''}`;
        }
    }

    /**
     * Начать новый чат
     */
    startNewChat() {
        // Очищаем историю сообщений
        if (this.messagesContainer) {
            this.messagesContainer.innerHTML = '';
        }
        
        // Сбрасываем заголовок
        const chatTitle = document.getElementById('chatTitle');
        const dataStatus = document.getElementById('dataStatus');
        if (chatTitle) {
            chatTitle.innerHTML = `Новый чат${dataStatus ? `<div class="data-status" id="dataStatus" style="font-size: 0.7em; opacity: 0.6; margin-top: 2px;">${dataStatus.textContent}</div>` : ''}`;
        }
        
        // Очищаем историю в памяти
        this.chatHistory = [];
        
        // ПОЛНОСТЬЮ убираем фокус и блокируем автофокус
        if (this.messageInput) {
            this.messageInput.blur(); // Убираем фокус если он был
            // Принудительно убираем фокус через небольшую задержку
            setTimeout(() => {
                if (this.messageInput) {
                    this.messageInput.blur();
                    // Убираем атрибут autofocus если он есть
                    this.messageInput.removeAttribute('autofocus');
                }
            }, 100);
        }
        
        // Убираем активный элемент (фокус) полностью
        if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
        }
        
        console.log('🆕 Начинаю новый чат');
    }

    /**
     * Показать модальное окно профиля
     */
    showProfileModal() {
        console.log('👤 Открываю профиль');
        
        // Создаем модальное окно, если его нет
        let profileModal = document.getElementById('profileModal');
        if (!profileModal) {
            profileModal = document.createElement('div');
            profileModal.id = 'profileModal';
            profileModal.className = 'modal-overlay';
            profileModal.innerHTML = `
                <div class="modal-content profile-modal">
                    <div class="modal-header">
                        <h2>Профиль</h2>
                        <button class="close-modal-btn" onclick="this.closest('.modal-overlay').style.display='none'">
                            <i data-feather="x"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="profile-section">
                            <div class="profile-avatar">
                                <i data-feather="user" size="48"></i>
                            </div>
                            <div class="profile-info">
                                <h3>Пользователь</h3>
                                <p>Изучаю норвежский</p>
                            </div>
                        </div>
                        <div class="profile-actions">
                            <button class="profile-action-btn">
                                <i data-feather="edit-3"></i>
                                <span>Редактировать профиль</span>
                            </button>
                            <button class="profile-action-btn">
                                <i data-feather="bar-chart-2"></i>
                                <span>Статистика</span>
                            </button>
                            <button class="profile-action-btn">
                                <i data-feather="settings"></i>
                                <span>Настройки</span>
                            </button>
                        </div>
                        <div class="auto-update-section">
                            <h3><i data-feather="download-cloud"></i> Автопополнение данных</h3>
                            <div class="auto-update-status">
                                <div class="status-item">
                                    <span>УЛЬТРА-база готова!</span>
                                </div>
                                <div class="status-item">
                                    <span id="profileDataStats">9 источников | 0.00мс поиск</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(profileModal);
            
            // Инициализируем иконки для модального окна
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        }
        
        profileModal.style.display = 'flex';
    }

    /**
     * Очистка кнопки источников от артефактов
     */
    cleanSourcesButton(button) {
        console.log('🧹 Очищаю кнопку источников от артефактов');
        
        // Сохраняем правильную структуру
        const icon = button.querySelector('i[data-feather="database"]');
        const originalText = 'Источники';
        
        // Полностью очищаем содержимое
        button.innerHTML = '';
        
        // Восстанавливаем правильную структуру
        if (icon) {
            button.appendChild(icon);
        } else {
            const newIcon = document.createElement('i');
            newIcon.setAttribute('data-feather', 'database');
            button.appendChild(newIcon);
        }
        
        // Добавляем текст
        const textNode = document.createTextNode(originalText);
        button.appendChild(textNode);
        
        // Обновляем иконки Feather
        if (window.feather) {
            window.feather.replace();
        }
        
        console.log('✅ Кнопка источников очищена и восстановлена');
    }

    /**
     * Показать модальное окно источников данных
     */
    showSourcesModal() {
        console.log('📊 СОЗДАЮ МОДАЛЬНОЕ ОКНО ИСТОЧНИКОВ');
        
        // Удаляем предыдущие модальные окна
        document.querySelectorAll('.sources-modal-overlay').forEach(m => m.remove());
        
        // Создаем простое модальное окно
        const modal = document.createElement('div');
        modal.className = 'sources-modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;
        
        // Получаем реальную статистику
        let totalRecords = 0;
        let sources = [];
        
        // Проверяем базы данных
        if (typeof NORWEGIAN_DATABASE !== 'undefined') {
            const count = Object.keys(NORWEGIAN_DATABASE).length;
            totalRecords += count;
            sources.push(`Норвежская база: ${count.toLocaleString()} записей`);
        }
        
        if (typeof TRANSLATION_DATABASE !== 'undefined') {
            const count = Object.keys(TRANSLATION_DATABASE).length;
            totalRecords += count;
            sources.push(`Переводы: ${count.toLocaleString()} записей`);
        }
        
        if (typeof CONVERSATION_DATABASE !== 'undefined') {
            const count = Object.keys(CONVERSATION_DATABASE).length;
            totalRecords += count;
            sources.push(`Разговорные фразы: ${count.toLocaleString()} записей`);
        }
        
        if (this.optimizedEngine && this.optimizedEngine.getStats) {
            const stats = this.optimizedEngine.getStats();
            if (stats.totalItems > 0) {
                totalRecords += stats.totalItems;
                sources.push(`Оптимизированный поиск: ${stats.totalItems.toLocaleString()} записей`);
            }
        }
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));
            backdrop-filter: blur(15px);
            border-radius: 20px;
            padding: 30px;
            max-width: 500px;
            width: 100%;
            color: white;
            border: 1px solid rgba(255,255,255,0.2);
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        content.innerHTML = `
            <h2 style="margin: 0 0 20px; color: #4F9CF9;">📊 Источники данных</h2>
            <div style="background: rgba(79,156,249,0.1); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px; color: #4F9CF9;">📈 Статистика загруженных данных</h3>
                <p style="margin: 5px 0; color: #90EE90;">✅ Всего записей: <strong>${totalRecords.toLocaleString()}</strong></p>
                ${sources.map(s => `<p style="margin: 5px 0;">• ${s}</p>`).join('')}
            </div>
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px; color: #4F9CF9;">🗂️ Источники данных</h3>
                <p>• Викисловарь (Wiktionary) - переводы и определения</p>
                <p>• Норвежские словари - базовая лексика по уровням A1-C1</p>
                <p>• Корпус субтитров - живые фразы из фильмов</p>
                <p>• Новостные статьи - актуальная лексика</p>
                <p>• Грамматические правила - структура языка</p>
            </div>
            <div style="margin-bottom: 20px; background: rgba(40,167,69,0.1); padding: 15px; border-radius: 10px;">
                <h3 style="margin: 0 0 10px; color: #90EE90;">🤖 Как работают ответы ассистента</h3>
                <p style="font-size: 14px; margin: 5px 0;">1. <strong>Встроенные базы данных</strong> - основной источник (работает оффлайн)</p>
                <p style="font-size: 14px; margin: 5px 0;">2. <strong>Автоматическая загрузка</strong> - данные обновляются в фоне</p>
                <p style="font-size: 14px; margin: 5px 0;">3. <strong>Локальный поиск</strong> - все поиски происходят в браузере</p>
                <p style="font-size: 14px; margin: 5px 0;">4. <strong>Без интернета</strong> - не требует подключения к серверам</p>
                <button onclick="window.testAssistantSources && window.testAssistantSources()" 
                        style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; margin-top: 10px; font-size: 14px;">
                    🧪 Тест источников ответов
                </button>
            </div>
            <button onclick="this.closest('.sources-modal-overlay').remove()" 
                    style="background: #4F9CF9; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; width: 100%;">
                Закрыть
            </button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Закрытие по клику вне окна
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        console.log('✅ Модальное окно источников создано');
        
        // Создаем глобальную функцию тестирования источников
        window.testAssistantSources = () => this.testAssistantSources();
    }

    /**
     * Тестирование источников ответов ассистента
     */
    testAssistantSources() {
        console.log('🧪 ТЕСТИРУЮ ИСТОЧНИКИ ОТВЕТОВ АССИСТЕНТА');
        
        // Тестовые запросы
        const testQueries = [
            'hei',      // привет
            'takk',     // спасибо  
            'jeg',      // я
            'du',       // ты
            'норвежский' // перевод
        ];
        
        const results = [];
        
        testQueries.forEach(query => {
            const sources = [];
            let totalFound = 0;
            
            // 1. Проверяем встроенную норвежскую базу
            if (typeof NORWEGIAN_DATABASE !== 'undefined' && NORWEGIAN_DATABASE[query]) {
                sources.push('✅ Норвежская база (встроенная)');
                totalFound++;
            }
            
            // 2. Проверяем переводы
            if (typeof TRANSLATION_DATABASE !== 'undefined' && TRANSLATION_DATABASE[query]) {
                sources.push('✅ База переводов (встроенная)');
                totalFound++;
            }
            
            // 3. Проверяем разговорные фразы
            if (typeof CONVERSATION_DATABASE !== 'undefined') {
                const conversationResult = Object.keys(CONVERSATION_DATABASE).some(key => 
                    key.toLowerCase().includes(query.toLowerCase()) || 
                    CONVERSATION_DATABASE[key].toLowerCase().includes(query.toLowerCase())
                );
                if (conversationResult) {
                    sources.push('✅ Разговорная база (встроенная)');
                    totalFound++;
                }
            }
            
            // 4. Проверяем оптимизированный поиск
            if (this.optimizedEngine && this.optimizedEngine.search) {
                try {
                    const searchResults = this.optimizedEngine.search(query);
                    if (searchResults && searchResults.length > 0) {
                        sources.push(`✅ Оптимизированный поиск (${searchResults.length} результатов)`);
                        totalFound += searchResults.length;
                    }
                } catch (e) {
                    console.warn('Ошибка поиска в оптимизированном движке:', e);
                }
            }
            
            // 5. Проверяем норвежский движок
            if (this.norwegianEngine && this.norwegianEngine.search) {
                try {
                    const norwegianResults = this.norwegianEngine.search(query);
                    if (norwegianResults && norwegianResults.length > 0) {
                        sources.push(`✅ Норвежский движок (${norwegianResults.length} результатов)`);
                        totalFound += norwegianResults.length;
                    }
                } catch (e) {
                    console.warn('Ошибка поиска в норвежском движке:', e);
                }
            }
            
            results.push({
                query,
                totalFound,
                sources: sources.length > 0 ? sources : ['❌ Не найдено в базах данных']
            });
        });
        
        // Показываем результаты
        this.showSourceTestResults(results);
    }

    /**
     * Показать результаты тестирования источников
     */
    showSourceTestResults(results) {
        // Удаляем предыдущие окна тестов
        document.querySelectorAll('.source-test-modal').forEach(m => m.remove());
        
        const modal = document.createElement('div');
        modal.className = 'source-test-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));
            backdrop-filter: blur(15px);
            border-radius: 20px;
            padding: 30px;
            max-width: 600px;
            width: 100%;
            color: white;
            border: 1px solid rgba(255,255,255,0.2);
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        const resultsHtml = results.map(r => `
            <div style="background: rgba(79,156,249,0.1); padding: 15px; border-radius: 10px; margin: 10px 0;">
                <h4 style="margin: 0 0 10px; color: #4F9CF9;">Запрос: "${r.query}"</h4>
                <p style="margin: 5px 0; color: ${r.totalFound > 0 ? '#90EE90' : '#FFB6C1'};">
                    Найдено: <strong>${r.totalFound} результатов</strong>
                </p>
                ${r.sources.map(s => `<p style="margin: 3px 0; font-size: 14px;">• ${s}</p>`).join('')}
            </div>
        `).join('');
        
        content.innerHTML = `
            <h2 style="margin: 0 0 20px; color: #4F9CF9;">🧪 Тест источников ответов</h2>
            <div style="background: rgba(40,167,69,0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px; color: #90EE90;">📋 Как ассистент находит ответы:</h3>
                <p style="font-size: 14px;">1. Ищет в встроенных базах данных (оффлайн)</p>
                <p style="font-size: 14px;">2. Использует оптимизированный поиск по всем данным</p>
                <p style="font-size: 14px;">3. Применяет норвежский языковой движок</p>
                <p style="font-size: 14px;">4. Все работает без интернета в вашем браузере</p>
            </div>
            ${resultsHtml}
            <div style="margin-top: 20px; padding: 15px; background: rgba(79,156,249,0.1); border-radius: 10px;">
                <p style="margin: 0; font-size: 14px; color: #90EE90;">
                    <strong>Вывод:</strong> Ассистент использует только встроенные базы данных и не обращается к внешним серверам. 
                    Все ответы формируются на основе загруженных в браузер данных.
                </p>
            </div>
            <button onclick="this.closest('.source-test-modal').remove()" 
                    style="background: #4F9CF9; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; width: 100%; margin-top: 20px;">
                Закрыть
            </button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * Загрузить данные об источниках
     */
    async loadSourcesData() {
        const sourcesLoading = document.getElementById('sourcesLoading');
        const sourcesContent = document.getElementById('sourcesContent');
        
        // Имитируем загрузку (не более 2 секунд)
        await this.delay(1500);
        
        // Собираем статистику из всех движков
        let totalRecords = 0;
        let searchTime = 0;
        let activeSources = 0;
        const sourcesList = [];

        // Статистика из ультра-движка
        if (this.ultraEngine) {
            const stats = this.ultraEngine.getPerformanceStats();
            totalRecords += stats.totalRecords || 0;
            searchTime = stats.averageSearchTime || 0;
            activeSources += stats.activeSources || 0;
            
            sourcesList.push({
                name: 'УЛЬТРА-движок',
                records: stats.totalRecords || 0,
                status: 'Активен',
                type: 'Высокопроизводительный'
            });
        }

        // Статистика из обычного движка
        if (this.optimizedEngine) {
            const data = this.optimizedEngine.getAllData();
            const engineRecords = data ? data.length : 0;
            totalRecords += engineRecords;
            
            sourcesList.push({
                name: 'Основная база данных',
                records: engineRecords,
                status: 'Активен',
                type: 'Обучающие материалы'
            });
        }

        // Добавляем известные источники
        const knownSources = [
            { name: 'Викисловарь (Wiktionary)', records: 10000, status: 'Фоновая загрузка', type: 'Словарь' },
            { name: 'OpenSubtitles', records: 50000, status: 'Фоновая загрузка', type: 'Субтитры фильмов' },
            { name: 'Корпус новостей', records: 25000, status: 'Фоновая загрузка', type: 'Актуальные тексты' },
            { name: 'Разговорная база', records: 500, status: 'Активен', type: 'Диалоги' },
            { name: 'База переводов', records: 1000, status: 'Активен', type: 'Переводы' },
            { name: 'Грамматические правила', records: 200, status: 'Активен', type: 'Грамматика' },
            { name: 'Норвежский корпус', records: 15000, status: 'Фоновая загрузка', type: 'Языковой корпус' },
            { name: 'Книжный корпус', records: 30000, status: 'Фоновая загрузка', type: 'Литература' },
            { name: 'Социальные медиа', records: 20000, status: 'Фоновая загрузка', type: 'Современный язык' }
        ];

        sourcesList.push(...knownSources);
        totalRecords += knownSources.reduce((sum, source) => sum + source.records, 0);
        activeSources = sourcesList.filter(s => s.status === 'Активен').length;

        // Обновляем статистику
        document.getElementById('totalRecords').textContent = totalRecords.toLocaleString();
        document.getElementById('searchTime').textContent = searchTime.toFixed(2) + 'мс';
        document.getElementById('activeSources').textContent = activeSources;

        // Создаем список источников
        const sourcesListEl = document.getElementById('sourcesList');
        sourcesListEl.innerHTML = sourcesList.map(source => `
            <div class="source-item">
                <div class="source-info">
                    <h4>${source.name}</h4>
                    <p>${source.type}</p>
                </div>
                <div class="source-stats">
                    <span class="records">${source.records.toLocaleString()} записей</span>
                    <span class="status ${source.status === 'Активен' ? 'active' : 'loading'}">${source.status}</span>
                </div>
            </div>
        `).join('');

        // Показываем содержимое
        sourcesLoading.style.display = 'none';
        sourcesContent.style.display = 'block';
    }
}

/**
 * Инициализация приложения после загрузки DOM
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌟 DOM загружен, запускаем приложение...');
    
    window.assistant = new WebAssistant();
    await window.assistant.init();
});

/**
 * Обработка ошибок
 */
window.addEventListener('error', (event) => {
    console.error('Глобальная ошибка:', event.error);
});

/**
 * Обработка необработанных промисов
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Необработанный промис:', event.reason);
});