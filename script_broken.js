/**
 * Главный скрипт веб-ассистента
 * Обрабатывает пользовательский ввод, поиск по базе данных и управление интерфейсом
 */

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
        // Убираем sendButton так как теперь отправка происходит через Enter
        this.inputWrapper = document.querySelector('.input-wrapper');
        this.contextMenu = document.getElementById('customContextMenu');
        
        // Состояние приложения
        this.isProcessing = false;
        this.messageHistory = [];
        this.userProfile = {
            name: localStorage.getItem('userName') || 'Пользователь',
            avatar: localStorage.getItem('userAvatar') || 'anime1'
        };
        this.firstMessage = true;
        
        // Состояние для контекстного меню
        this.selectedText = '';
        this.selectedElement = null;
        this.longPressTimer = null;
        this.longPressStarted = false;
        this.startX = 0;
        this.startY = 0;
        
        // Инициализация норвежской базы данных
        this.norwegianEngine = null;
        this.optimizedEngine = null;
        this.autoLoader = null;
        
        // Голосовые функции
        this.speechRecognition = null;
        this.speechSynthesis = null;
        this.isListening = false;
        
        // Инициализация
        this.init();
    }

    /**
     * Инициализация приложения
     */
    async init() {
        this.bindEvents();
        this.initializeFeatherIcons();
        await this.initializeNorwegianEngine(); // Теперь асинхронная
        this.initializePWA();
        this.initializeSpeechFeatures();
        this.initializeProfile();
        this.initializeVoiceWindow();
        
        // Фокус на поле ввода
        this.messageInput.focus();
        
        console.log('🎉 Веб-ассистент с автопополнением данных инициализирован');
        
        // Скрываем статус через 5 секунд
        setTimeout(() => {
            this.updateDataStatus('');
        }, 5000);
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
     * Инициализация норвежской базы данных
     */
    async initializeNorwegianEngine() {
        // Объединяем все источники данных
        let allData = [];
        
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
        
        // Инициализируем поисковый движок с текущими данными СРАЗУ
        console.log('🚀 Инициализация поискового движка с', allData.length, 'записями');
        this.optimizedEngine = new OptimizedSearchEngine();
        this.optimizedEngine.buildIndexes(allData);
        
        // Убираем индикатор загрузки - приложение готово к работе
        this.updateDataStatus('');
        
        // ФОНОВАЯ загрузка дополнительных данных (не блокирует интерфейс)
        this.loadAdditionalDataInBackground();
        
        // Инициализируем норвежскую базу данных
        if (typeof NorwegianSearchEngine !== 'undefined') {
            this.norwegianEngine = new NorwegianSearchEngine();
            console.log('🇳🇴 Норвежская база данных инициализирована');
        }
    }
    
    /**
     * Фоновая загрузка дополнительных данных
     */
    async loadAdditionalDataInBackground() {
        // Запускаем фоновую загрузку через 3 секунды после запуска приложения
        setTimeout(async () => {
            this.updateAutoUpdateStatus('Загружаю дополнительные данные...', 0);
            
            if (typeof MegaDataLoader !== 'undefined') {
                try {
                    const megaLoader = new MegaDataLoader();
                    
                    // Устанавливаем callback для обновления UI
                    megaLoader.setUpdateCallback((stats) => {
                        this.updateAutoUpdateStatus(
                            `Фон: ${stats.loaded.toLocaleString()}`,
                            stats.progress,
                            `Источников: ${Object.keys(stats.sources || {}).length}`
                        );
                    });
                    
                    const megaData = await megaLoader.initialize();
                    
                    if (megaData && megaData.length > 0) {
                        // Добавляем новые данные к существующему движку
                        const currentData = this.optimizedEngine.getAllData() || [];
                        const combinedData = [...currentData, ...megaData];
                        
                        // Пересобираем индексы с новыми данными
                        this.optimizedEngine.buildIndexes(combinedData);
                        
                        console.log('🔗 Фоновая загрузка завершена:', megaData.length.toLocaleString(), 'записей добавлено');
                        
                        this.updateAutoUpdateStatus(
                            'Данные обновлены!', 
                            100, 
                            `Всего: ${combinedData.length.toLocaleString()} записей`
                        );
                    }
                } catch (error) {
                    console.warn('⚠️ Ошибка фоновой загрузки:', error);
                    this.updateAutoUpdateStatus('Используются базовые данные', 100);
                }
            }
        }, 3000);
    }
            // Показываем статистику через 3 секунды
            setTimeout(() => {
                const stats = this.optimizedEngine.getStats();
                console.log('📊 Статистика поиска:', stats);
                
                if (this.autoLoader) {
                    const autoStats = this.autoLoader.getStats();
                    console.log('🌐 Автозагрузка статистика:', autoStats);
                    
                    // Подсчитываем общее количество записей
                    const totalRecords = Object.values(autoStats).reduce((sum, count) => sum + count, 0);
                    this.updateAutoUpdateStatus(
                        'Данные актуальны', 
                        100, 
                        `Всего записей: ${totalRecords + (stats.totalRecords || 0)}`
                    );
                }
            }, 3000);
        }
        
        // Сохраняем совместимость
        if (typeof NorwegianSearchEngine !== 'undefined') {
            this.norwegianEngine = new NorwegianSearchEngine();
        }
    }

    /**
     * Инициализация голосовых функций
     */
    initializeSpeechFeatures() {
        this.voiceButton = document.getElementById('voiceButton');
        console.log('Кнопка микрофона найдена:', this.voiceButton);
        
        // Проверяем поддержку Speech Recognition API
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.speechRecognition = new SpeechRecognition();
            
            this.speechRecognition.continuous = false;
            this.speechRecognition.interimResults = false;
            this.speechRecognition.lang = 'ru-RU';
            
            this.speechRecognition.onstart = () => {
                this.isListening = true;
                this.voiceButton?.classList.add('recording');
                console.log('Начало распознавания речи');
            };
            
            this.speechRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.updateVoiceTranscript(transcript);
                this.updateVoiceStatus('Текст распознан! Нажмите "Отправить" или говорите еще');
                this.showVoiceButton('send');
                console.log('Распознанный текст:', transcript);
            };
            
            this.speechRecognition.onend = () => {
                this.isListening = false;
                this.voiceButton?.classList.remove('recording');
                if (this.currentTranscript) {
                    this.updateVoiceStatus('Готово! Нажмите "Отправить" чтобы отправить сообщение');
                    this.showVoiceButton('send');
                } else {
                    this.updateVoiceStatus('Ничего не распознано. Попробуйте еще раз');
                    this.showVoiceButton('start');
                }
                console.log('Завершение распознавания речи');
            };
            
            this.speechRecognition.onerror = (event) => {
                this.isListening = false;
                this.voiceButton?.classList.remove('recording');
                console.error('Ошибка распознавания речи:', event.error);
            };
        } else {
            console.warn('Speech Recognition API не поддерживается');
            console.log('User Agent:', navigator.userAgent);
            console.log('Protocol:', window.location.protocol);
            console.log('Is HTTPS:', window.location.protocol === 'https:');
            if (this.voiceButton) {
                this.voiceButton.style.display = 'none';
            }
        }
        
        // Проверяем поддержку Speech Synthesis API
        if ('speechSynthesis' in window) {
            this.speechSynthesis = window.speechSynthesis;
            console.log('Speech Synthesis API доступен');
        } else {
            console.warn('Speech Synthesis API не поддерживается');
        }
        
        // Привязываем события для кнопки микрофона
        if (this.voiceButton) {
            this.voiceButton.addEventListener('click', () => this.openVoiceModal());
        }
        
        // Инициализация голосового модального окна
        this.initializeVoiceModal();
    }

    /**
     * Переключение распознавания речи
     */
    toggleVoiceRecognition() {
        if (!this.speechRecognition) {
            alert('Распознавание речи не поддерживается в вашем браузере');
            return;
        }
        
        if (this.isListening) {
            this.speechRecognition.stop();
        } else {
            try {
                this.speechRecognition.start();
            } catch (error) {
                console.error('Ошибка запуска распознавания речи:', error);
            }
        }
    }

    /**
     * Озвучивание текста
     */
    speakText(text) {
        return new Promise((resolve, reject) => {
            if (!this.speechSynthesis) {
                console.warn('Speech Synthesis недоступен');
                resolve();
                return;
            }

            // Останавливаем предыдущую речь
            this.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ru-RU';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 0.8;

            // Находим русский голос если доступен
            const voices = this.speechSynthesis.getVoices();
            const russianVoice = voices.find(voice => 
                voice.lang.includes('ru') || voice.lang.includes('RU')
            );
            
            if (russianVoice) {
                utterance.voice = russianVoice;
            }

            utterance.onstart = () => {
                console.log('Начало озвучивания');
            };

            utterance.onend = () => {
                console.log('Завершение озвучивания');
                resolve();
            };

            utterance.onerror = (event) => {
                console.error('Ошибка озвучивания:', event.error);
                reject(event.error);
            };

            this.speechSynthesis.speak(utterance);
        });
    }

    /**
     * Инициализация голосового модального окна
     */
    initializeVoiceModal() {
        this.voiceModalOverlay = document.getElementById('voiceModalOverlay');
        this.voiceModal = document.getElementById('voiceModal');
        this.closeVoiceModal = document.getElementById('closeVoiceModal');
        this.voiceStatus = document.getElementById('voiceStatus');
        this.voiceTranscript = document.getElementById('voiceTranscript');
        this.startVoiceBtn = document.getElementById('startVoiceBtn');
        this.stopVoiceBtn = document.getElementById('stopVoiceBtn');
        this.sendVoiceBtn = document.getElementById('sendVoiceBtn');
        
        this.currentTranscript = '';
        
        // События для закрытия модального окна
        this.closeVoiceModal?.addEventListener('click', () => this.closeVoiceModalWindow());
        this.voiceModalOverlay?.addEventListener('click', (e) => {
            if (e.target === this.voiceModalOverlay) {
                this.closeVoiceModalWindow();
            }
        });
        
        // События для голосовых кнопок
        this.startVoiceBtn?.addEventListener('click', () => this.startVoiceRecording());
        this.stopVoiceBtn?.addEventListener('click', () => this.stopVoiceRecording());
        this.sendVoiceBtn?.addEventListener('click', () => this.sendVoiceMessage());
    }

    /**
     * Открытие голосового модального окна
     */
    openVoiceModal() {
        if (!this.voiceModalOverlay) return;
        
        this.voiceModalOverlay.classList.add('active');
        this.updateVoiceStatus('Нажмите кнопку ниже и говорите');
        this.clearVoiceTranscript();
        this.resetVoiceButtons();
        
        // Инициализируем иконки Feather
        setTimeout(() => {
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        }, 100);
    }

    /**
     * Закрытие голосового модального окна
     */
    closeVoiceModalWindow() {
        if (!this.voiceModalOverlay) return;
        
        // Останавливаем запись если активна
        if (this.isListening) {
            this.speechRecognition?.stop();
        }
        
        this.voiceModalOverlay.classList.remove('active');
        this.resetVoiceButtons();
    }

    /**
     * Начать голосовую запись
     */
    startVoiceRecording() {
        if (!this.speechRecognition) {
            this.updateVoiceStatus('Распознавание речи не поддерживается в вашем браузере');
            return;
        }
        
        try {
            this.speechRecognition.start();
            this.updateVoiceStatus('Слушаю... говорите сейчас');
            this.showVoiceButton('stop');
        } catch (error) {
            this.updateVoiceStatus('Ошибка запуска записи: ' + error.message);
            console.error('Ошибка запуска записи:', error);
        }
    }

    /**
     * Остановить голосовую запись
     */
    stopVoiceRecording() {
        if (this.speechRecognition && this.isListening) {
            this.speechRecognition.stop();
        }
    }

    /**
     * Отправить голосовое сообщение
     */
    sendVoiceMessage() {
        if (this.currentTranscript.trim()) {
            this.messageInput.value = this.currentTranscript;
            this.closeVoiceModalWindow();
            this.handleSubmit();
        }
    }

    /**
     * Обновить статус голосового окна
     */
    updateVoiceStatus(message) {
        if (this.voiceStatus) {
            this.voiceStatus.textContent = message;
        }
    }

    /**
     * Очистить транскрипт
     */
    clearVoiceTranscript() {
        this.currentTranscript = '';
        if (this.voiceTranscript) {
            this.voiceTranscript.textContent = 'Здесь появится распознанный текст...';
        }
    }

    /**
     * Обновить транскрипт
     */
    updateVoiceTranscript(text) {
        this.currentTranscript = text;
        if (this.voiceTranscript) {
            this.voiceTranscript.textContent = text || 'Здесь появится распознанный текст...';
        }
    }

    /**
     * Показать нужную кнопку
     */
    showVoiceButton(type) {
        // Скрываем все кнопки
        this.startVoiceBtn.style.display = 'none';
        this.stopVoiceBtn.style.display = 'none';
        this.sendVoiceBtn.style.display = 'none';
        
        // Показываем нужную
        switch(type) {
            case 'start':
                this.startVoiceBtn.style.display = 'flex';
                break;
            case 'stop':
                this.stopVoiceBtn.style.display = 'flex';
                break;
            case 'send':
                this.sendVoiceBtn.style.display = 'flex';
                break;
        }
    }

    /**
     * Сброс кнопок голосового окна
     */
    resetVoiceButtons() {
        this.showVoiceButton('start');
    }

    /**
     * Инициализация PWA функций
     */
    initializePWA() {
        // Регистрация Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                        console.log('Service Worker зарегистрирован:', registration.scope);
                        
                        // Проверка обновлений
                        registration.addEventListener('updatefound', () => {
                            console.log('Найдено обновление Service Worker');
                        });
                    })
                    .catch((error) => {
                        console.log('Ошибка регистрации Service Worker:', error);
                    });
            });
        }

        // Обработка установки PWA
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            console.log('PWA готово к установке');
            this.showInstallPrompt(deferredPrompt);
        });

        // Отслеживание установки
        window.addEventListener('appinstalled', () => {
            console.log('PWA установлено');
            deferredPrompt = null;
        });
    }

    /**
     * Показать предложение установки PWA
     */
    showInstallPrompt(deferredPrompt) {
        // Можно добавить кнопку установки в интерфейс
        // Пока просто логируем возможность установки
        console.log('Приложение можно установить как PWA');
    }

    /**
     * Привязка событий
     */
    bindEvents() {
        // Отправка сообщения
        this.inputForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });



        // Автоматическое изменение размера поля ввода
        this.messageInput.addEventListener('input', () => {
            this.adjustInputHeight();
        });

        // Обработка нажатий клавиш
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSubmit();
            }
        });

        // Предотвращение отправки пустых сообщений
        this.messageInput.addEventListener('paste', () => {
            // Обработка вставки текста
        });

        // Эффекты при вводе текста
        this.messageInput.addEventListener('input', () => {
            this.handleInputEffects();
        });

        this.messageInput.addEventListener('focus', () => {
            this.inputWrapper.classList.add('typing');
        });

        this.messageInput.addEventListener('blur', () => {
            if (this.messageInput.value.trim() === '') {
                this.inputWrapper.classList.remove('typing');
            }
        });

        // Обработчики для кастомного контекстного меню
        this.bindContextMenuEvents();
        
        // Обработчики для стабилизации шапки убраны - используем CSS-only подход

        // Обработка кнопок в новом интерфейсе
        const newChatBtn = document.getElementById('newChatBtn');
        
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => {
                this.startNewChat();
            });
        }
    }



    /**
     * Привязка обработчиков для стабилизации шапки при появлении клавиатуры
     * ОТКЛЮЧЕНО - используем CSS-only подход
     */
    // bindKeyboardHandlers() {
    //     // Метод отключен, используем только CSS решение
    // }

    /**
     * Привязка событий для контекстного меню
     */
    bindContextMenuEvents() {
        // Делегированное событие для всех сообщений
        this.messagesContainer.addEventListener('mousedown', (e) => {
            const messageContent = e.target.closest('.message-content');
            if (messageContent) {
                this.startLongPress(e, messageContent);
            }
        });

        this.messagesContainer.addEventListener('touchstart', (e) => {
            const messageContent = e.target.closest('.message-content');
            if (messageContent) {
                this.startLongPress(e, messageContent);
            }
        });

        // Отмена долгого нажатия
        document.addEventListener('mouseup', () => this.cancelLongPress());
        document.addEventListener('touchend', () => this.cancelLongPress());
        
        // Отмена только при значительном движении
        document.addEventListener('mousemove', (e) => {
            if (this.longPressTimer && this.startX !== 0) {
                const deltaX = Math.abs(e.clientX - this.startX);
                const deltaY = Math.abs(e.clientY - this.startY);
                if (deltaX > 10 || deltaY > 10) {
                    this.cancelLongPress();
                }
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (this.longPressTimer && this.startX !== 0) {
                const touch = e.touches[0] || e.changedTouches[0];
                const deltaX = Math.abs(touch.clientX - this.startX);
                const deltaY = Math.abs(touch.clientY - this.startY);
                if (deltaX > 10 || deltaY > 10) {
                    this.cancelLongPress();
                }
            }
        });

        // Скрытие контекстного меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!this.contextMenu.contains(e.target)) {
                this.hideContextMenu();
            }
        });

        // Предотвращение стандартного контекстного меню
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.message-content')) {
                e.preventDefault();
            }
        });
    }

    /**
     * Начало долгого нажатия
     */
    startLongPress(e, element) {
        this.cancelLongPress();
        this.selectedElement = element;
        this.selectedText = element.textContent;
        
        // Сохраняем начальные координаты
        this.startX = e.clientX || (e.touches && e.touches[0].clientX);
        this.startY = e.clientY || (e.touches && e.touches[0].clientY);
        
        this.longPressTimer = setTimeout(() => {
            this.showContextMenu(e);
            this.longPressStarted = true;
        }, 500); // 500ms для долгого нажатия
    }

    /**
     * Отмена долгого нажатия
     */
    cancelLongPress() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        this.longPressStarted = false;
        this.startX = 0;
        this.startY = 0;
    }

    /**
     * Показать контекстное меню
     */
    showContextMenu(e) {
        const x = e.clientX || (e.touches && e.touches[0].clientX);
        const y = e.clientY || (e.touches && e.touches[0].clientY);
        
        this.contextMenu.style.left = x + 'px';
        this.contextMenu.style.top = y + 'px';
        
        // Проверка, не выходит ли меню за границы экрана
        setTimeout(() => {
            const rect = this.contextMenu.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                this.contextMenu.style.left = (x - rect.width) + 'px';
            }
            if (rect.bottom > window.innerHeight) {
                this.contextMenu.style.top = (y - rect.height) + 'px';
            }
        }, 0);
        
        this.contextMenu.classList.add('show');
    }

    /**
     * Скрыть контекстное меню
     */
    hideContextMenu() {
        this.contextMenu.classList.remove('show');
    }

    /**
     * Копировать выделенный текст
     */
    copySelectedText() {
        if (this.selectedText) {
            navigator.clipboard.writeText(this.selectedText).then(() => {
                console.log('Текст скопирован:', this.selectedText);
                this.hideContextMenu();
            }).catch(err => {
                console.error('Ошибка копирования:', err);
                // Fallback для старых браузеров
                const textArea = document.createElement('textarea');
                textArea.value = this.selectedText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.hideContextMenu();
            });
        }
    }

    /**
     * Автоматическое изменение высоты поля ввода
     */
    adjustInputHeight() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 150) + 'px';
    }

    /**
     * Обработка эффектов при вводе
     */
    handleInputEffects() {
        if (this.messageInput.value.trim() !== '') {
            this.inputWrapper.classList.add('typing');
        } else {
            this.inputWrapper.classList.remove('typing');
        }
    }

    // Метод updateSendButtonState удален - больше не нужен

    /**
     * Обработка отправки сообщения
     */
    async handleSubmit() {
        const message = this.messageInput.value.trim();
        
        if (!message || this.isProcessing) {
            return;
        }

        this.isProcessing = true;

        // Добавляем сообщение пользователя
        this.addUserMessage(message);
        
        // Очищаем поле ввода
        this.messageInput.value = '';
        this.adjustInputHeight();

        // Показываем индикатор загрузки
        this.showLoadingIndicator();

        try {
            // Симулируем задержку для более реалистичного опыта
            await this.delay(800 + Math.random() * 1200);
            
            // Ищем ответ
            const response = this.findBestAnswer(message);
            
            // Скрываем индикатор загрузки
            this.hideLoadingIndicator();
            
            // Добавляем ответ ассистента
            this.addAssistantMessage(response);

        } catch (error) {
            console.error('Ошибка при обработке сообщения:', error);
            this.hideLoadingIndicator();
            this.addAssistantMessage('Извините, произошла ошибка при обработке вашего запроса. Попробуйте еще раз.');
        } finally {
            this.isProcessing = false;
            this.messageInput.focus();
        }
    }

    /**
     * Поиск лучшего ответа в базе данных
     */
    findBestAnswer(userMessage) {
        const normalizedMessage = this.normalizeText(userMessage);
        
        // Определяем тип запроса
        const isTranslationRequest = this.isTranslationRequest(normalizedMessage);
        const isGrammarRequest = this.isGrammarRequest(normalizedMessage);
        const isRandomWordRequest = this.isRandomWordRequest(normalizedMessage);
        
        // Проверяем запрос на перевод в первую очередь
        if (isTranslationRequest) {
            return this.handleTranslationRequest(userMessage);
        }
        
        if (isRandomWordRequest) {
            return this.getRandomWordResponse();
        }
        
        if (isGrammarRequest) {
            return this.getGrammarResponse(normalizedMessage);
        }
        
        // Сверхбыстрый поиск через оптимизированный движок
        if (this.optimizedEngine) {
            const results = this.optimizedEngine.search(userMessage, { limit: 3 });
            if (results.length > 0) {
                return results[0].answer;
            }
        }
        
        // Фолбэк: поиск в основной базе данных
        if (typeof DATABASE !== 'undefined') {
            for (const item of DATABASE) {
                if (item.keywords) {
                    const match = item.keywords.some(keyword => 
                        normalizedMessage.includes(keyword.toLowerCase())
                    );
                    if (match) {
                        return item.answer;
                    }
                }
            }
        }
        
        // Фолбэк: поиск в норвежской базе данных
        if (this.norwegianEngine) {
            const results = this.norwegianEngine.search(userMessage);
            if (results.length > 0) {
                return this.formatTranslationResponse(results[0], false);
            }
        }
        
        // Если ничего не найдено, предлагаем помощь
        return this.getHelpResponse(userMessage);
    }

    /**
     * Определение типа запроса
     */
    isTranslationRequest(message) {
        const translationKeywords = ['перевод', 'переведи', 'как сказать', 'что означает', 'как будет', 'translate'];
        return translationKeywords.some(keyword => message.includes(keyword));
    }

    isGrammarRequest(message) {
        const grammarKeywords = ['грамматика', 'правило', 'как образуется', 'множественное число', 'артикль'];
        return grammarKeywords.some(keyword => message.includes(keyword));
    }

    isRandomWordRequest(message) {
        const randomKeywords = ['случайное слово', 'дай слово', 'новое слово', 'изучить слово'];
        return randomKeywords.some(keyword => message.includes(keyword));
    }

    /**
     * Обработка запроса на перевод
     */
    handleTranslationRequest(message) {
        // Удаляем служебные слова
        let textToTranslate = message.toLowerCase()
            .replace(/переведи\s*/g, '')
            .replace(/перевод\s*/g, '')
            .replace(/как сказать\s*/g, '')
            .replace(/по-норвежски\s*/g, '')
            .replace(/translate\s*/g, '')
            .replace(/oversett\s*/g, '')
            .replace(/[\"\']/g, '')
            .trim();

        // Ищем перевод в базе данных
        if (typeof findTranslation !== 'undefined') {
            const translation = findTranslation(textToTranslate);
            
            if (translation) {
                return `**Перевод:**

🇷🇺 "${textToTranslate}" 
🇳🇴 ${translation}

*Совет: Попробуйте повторить вслух для лучшего запоминания!*`;
            }
        }

        // Если перевод не найден, предлагаем альтернативы
        const suggestions = this.getTranslationSuggestions(textToTranslate);
        if (suggestions.length > 0) {
            return `**Точный перевод не найден**

Возможно, вы искали:
${suggestions.map(s => `• ${s.russian} = ${s.norwegian}`).join('\n')}

Попробуйте переформулировать запрос или спросите что-то другое!`;
        }

        return `**Перевод не найден**

К сожалению, я не нашел перевод для "${textToTranslate}".

**Попробуйте:**
• Использовать более простые слова
• Спросить "как сказать [слово]"
• Посмотреть другие темы: приветствие, семья, еда, время

**Пример:** "Переведи привет" или "Как сказать спасибо"`;
    }

    /**
     * Получение похожих переводов
     */
    getTranslationSuggestions(text) {
        const suggestions = [];
        
        if (typeof TRANSLATION_DATABASE !== 'undefined') {
            // Ищем частичные совпадения
            for (const [key, value] of Object.entries(TRANSLATION_DATABASE)) {
                if (key.includes(text) || text.includes(key)) {
                    suggestions.push({
                        russian: key,
                        norwegian: value
                    });
                    
                    if (suggestions.length >= 3) break;
                }
            }
        }
        
        return suggestions;
    }

    /**
     * Форматирование ответа с переводом
     */
    formatTranslationResponse(item, isTranslation) {
        let response = `🇳🇴 **${item.norwegian}** [${item.pronunciation}]\n`;
        response += `🇷🇺 **${item.russian}**\n\n`;
        
        if (item.examples && item.examples.length > 0) {
            response += `📝 **Пример:**\n`;
            response += `• ${item.examples[0].no}\n`;
            response += `• ${item.examples[0].ru}\n\n`;
        }
        
        response += `📚 Категория: ${NORWEGIAN_DATABASE.categories[item.category] || item.category}\n`;
        response += `📊 Уровень: ${NORWEGIAN_DATABASE.levels[item.level] || item.level}`;
        
        return response;
    }

    /**
     * Получение случайного слова
     */
    getRandomWordResponse() {
        const randomWord = this.norwegianEngine.getRandomWord();
        return this.formatTranslationResponse(randomWord, false);
    }

    /**
     * Ответ с грамматическими правилами
     */
    getGrammarResponse(message) {
        const grammarRules = this.norwegianEngine.getGrammarRules();
        if (grammarRules.length > 0) {
            const rule = grammarRules[0];
            let response = `📖 **Грамматика: ${rule.topic}**\n\n`;
            response += `🇳🇴 **Правило:** ${rule.norwegian_rule}\n\n`;
            response += `🇷🇺 **Объяснение:** ${rule.russian_explanation}\n\n`;
            response += `📝 **Примеры:**\n`;
            rule.examples.forEach(example => {
                response += `• ${example.no} — ${example.ru}\n`;
            });
            return response;
        }
        return "Извините, грамматические правила пока не найдены.";
    }

    /**
     * Помощь пользователю
     */
    getHelpResponse(userMessage) {
        return `Я помогаю изучать норвежский язык! 🇳🇴

Вы можете:
• Спросить перевод: "как сказать привет?"
• Попросить случайное слово: "дай новое слово"
• Узнать грамматику: "расскажи про артикли"
• Просто написать слово на русском или норвежском

Попробуйте написать что-то другое, и я постараюсь помочь!`;
    }

    /**
     * Нормализация текста для поиска
     */
    normalizeText(text) {
        return text.toLowerCase()
            .replace(/[^\w\sа-яё]/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Получение ответа по умолчанию
     */
    getDefaultResponse(userMessage) {
        const defaultResponses = [
            'Извините, я не могу найти точный ответ на ваш вопрос. Попробуйте переформулировать запрос или задать вопрос о программировании, веб-разработке или технологиях.',
            'Я специализируюсь на вопросах о программировании, веб-технологиях и IT-сфере. Можете задать вопрос по этим темам?',
            'К сожалению, я не нашел подходящего ответа в своей базе знаний. Попробуйте спросить о JavaScript, HTML, CSS, React или других технологиях.',
            'Мне не удалось найти релевантную информацию по вашему запросу. Я лучше всего отвечаю на вопросы о веб-разработке, программировании и IT-технологиях.'
        ];

        // Проверяем на приветствие
        const greetings = ['привет', 'здравствуй', 'добро пожаловать', 'hello', 'hi'];
        const normalizedMessage = this.normalizeText(userMessage);
        
        if (greetings.some(greeting => normalizedMessage.includes(greeting))) {
            return 'Привет! Я ваш веб-ассистент. Я готов помочь вам с вопросами о программировании, веб-разработке, технологиях и IT-сфере. О чем хотели бы узнать?';
        }

        // Проверяем на благодарность
        const thanks = ['спасибо', 'благодарю', 'thanks', 'thank you'];
        if (thanks.some(thank => normalizedMessage.includes(thank))) {
            return 'Пожалуйста! Рад был помочь. Если у вас есть еще вопросы, не стесняйтесь спрашивать!';
        }

        // Возвращаем случайный ответ по умолчанию
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    /**
     * Добавление сообщения пользователя
     */
    addUserMessage(message) {
        const messageElement = this.createMessageElement(message, 'user');
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        // Обновляем название чата при первом сообщении
        if (this.firstMessage) {
            this.updateChatTitle(message);
            this.firstMessage = false;
        }
        
        // Сохраняем в историю
        this.messageHistory.push({ type: 'user', content: message, timestamp: Date.now() });
    }

    /**
     * Добавление сообщения ассистента
     */
    addAssistantMessage(message) {
        const messageElement = this.createMessageElement(message, 'assistant');
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        // Сохраняем в историю
        this.messageHistory.push({ type: 'assistant', content: message, timestamp: Date.now() });
        
        // Автоматическое озвучивание ответа ассистента
        setTimeout(() => {
            // Очищаем текст от markdown и эмодзи для лучшего произношения
            const cleanText = this.cleanTextForSpeech(message);
            this.speakText(cleanText);
        }, 500);
    }

    /**
     * Очистка текста для озвучивания
     */
    cleanTextForSpeech(text) {
        return text
            // Убираем markdown
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/`(.*?)`/g, '$1')
            .replace(/#{1,6}\s/g, '')
            // Убираем эмодзи
            .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
            // Убираем специальные символы
            .replace(/[•–—]/g, '')
            // Убираем лишние пробелы
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Создание элемента сообщения
     */
    createMessageElement(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        if (type === 'assistant') {
            // Создаем стильный блок для ответов ассистента
            const noteBlock = document.createElement('div');
            noteBlock.className = 'assistant-note-block message-content';
            
            const noteContent = document.createElement('p');
            noteContent.className = 'assistant-note-content';
            
            const noteLabel = document.createElement('span');
            noteLabel.className = 'assistant-note-label';
            noteLabel.textContent = 'Ответ:';
            
            noteContent.appendChild(noteLabel);
            noteContent.appendChild(document.createTextNode(' ' + content));
            noteBlock.appendChild(noteContent);
            
            messageDiv.appendChild(noteBlock);
        } else {
            // Обычное сообщение пользователя
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'message-avatar';
            
            const avatarIcon = document.createElement('i');
            avatarIcon.setAttribute('data-feather', 'user');
            avatarDiv.appendChild(avatarIcon);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            
            const contentP = document.createElement('p');
            contentP.textContent = content;
            contentDiv.appendChild(contentP);

            messageDiv.appendChild(avatarDiv);
            messageDiv.appendChild(contentDiv);
        }

        // Инициализируем иконки после добавления элемента
        setTimeout(() => {
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        }, 0);

        return messageDiv;
    }

    /**
     * Показать индикатор загрузки
     */
    showLoadingIndicator() {
        // Добавляем индикатор загрузки в область сообщений
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message loading-message';
        loadingDiv.id = 'currentLoading';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'loading-message-avatar';
        
        const loader = document.createElement('span');
        loader.className = 'loader';
        avatarDiv.appendChild(loader);
        
        loadingDiv.appendChild(avatarDiv);
        
        this.messagesContainer.appendChild(loadingDiv);
        this.scrollToBottom();
    }

    /**
     * Скрыть индикатор загрузки
     */
    hideLoadingIndicator() {
        const currentLoading = document.getElementById('currentLoading');
        if (currentLoading) {
            currentLoading.remove();
        }
    }

    /**
     * Прокрутка к низу
     */
    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    /**
     * Задержка для асинхронных операций
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Обновление названия чата
     */
    updateChatTitle(message) {
        // Берем первые несколько слов из сообщения
        const words = message.trim().split(' ').slice(0, 3);
        const title = words.join(' ');
        
        if (this.chatTitle) {
            this.chatTitle.textContent = title.length > 30 ? title.substring(0, 30) + '...' : title;
        }
    }

    /**
     * Начать новый чат
     */
    startNewChat() {
        // Очищаем контейнер сообщений
        this.messagesContainer.innerHTML = '';
        
        // Сбрасываем состояние
        this.messageHistory = [];
        this.firstMessage = true;
        
        // Возвращаем заголовок
        if (this.chatTitle) {
            this.chatTitle.textContent = 'Новый чат';
        }
        
        // Фокус на поле ввода
        this.messageInput.focus();
        
        console.log('Новый чат начат');
    }

    /**
     * Получение статистики использования
     */
    getUsageStats() {
        return {
            totalMessages: this.messageHistory.length,
            userMessages: this.messageHistory.filter(m => m.type === 'user').length,
            assistantMessages: this.messageHistory.filter(m => m.type === 'assistant').length,
            sessionStart: this.messageHistory.length > 0 ? this.messageHistory[0].timestamp : Date.now()
        };
    }

    /**
     * Инициализация профиля пользователя
     */
    initializeProfile() {
        this.updateProfileDisplay();
        this.bindProfileEvents();
    }

    /**
     * Обновление отображения профиля
     */
    updateProfileDisplay() {
        const userNameDisplay = document.getElementById('userNameDisplay');
        const userAvatarPreview = document.getElementById('userAvatarPreview');
        
        if (userNameDisplay) {
            userNameDisplay.textContent = this.userProfile.name;
        }
        
        if (userAvatarPreview) {
            this.setAvatarImage(userAvatarPreview, this.userProfile.avatar);
        }
    }

    /**
     * Привязка событий профиля
     */
    bindProfileEvents() {
        // Кнопка меню
        const menuButton = document.getElementById('menuButton');
        const sideMenu = document.getElementById('sideMenu');
        const closeMenuBtn = document.getElementById('closeMenuBtn');

        // Модальное окно профиля
        const editProfileBtn = document.getElementById('editProfileBtn');
        const profileModal = document.getElementById('profileModal');
        const modalOverlay = document.getElementById('modalOverlay');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const saveBtn = document.getElementById('saveBtn');

        // Открытие бокового меню
        if (menuButton) {
            menuButton.addEventListener('click', () => {
                console.log('Меню кнопка нажата');
                if (sideMenu) {
                    sideMenu.classList.add('open');
                    console.log('Меню открыто');
                } else {
                    console.log('Элемент sideMenu не найден');
                }
            });
        } else {
            console.log('Кнопка menuButton не найдена');
        }

        // Закрытие бокового меню
        closeMenuBtn?.addEventListener('click', () => {
            sideMenu?.classList.remove('open');
        });

        // Открытие модального окна профиля
        editProfileBtn?.addEventListener('click', () => {
            this.openProfileModal();
        });

        // Закрытие модального окна
        [closeModalBtn, cancelBtn].forEach(element => {
            element?.addEventListener('click', () => {
                this.closeProfileModal();
            });
        });

        // Закрытие по клику на overlay
        modalOverlay?.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.closeProfileModal();
            }
        });

        // Закрытие бокового меню по клику вне его
        document.addEventListener('click', (e) => {
            if (sideMenu?.classList.contains('open') && 
                !sideMenu.contains(e.target) && 
                !menuButton?.contains(e.target)) {
                sideMenu.classList.remove('open');
            }
        });

        // Сохранение профиля
        saveBtn?.addEventListener('click', () => {
            this.saveProfile();
        });

        // Выбор аватара
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
    }

    /**
     * Открытие модального окна профиля
     */
    openProfileModal() {
        const profileModal = document.getElementById('profileModal');
        const modalOverlay = document.getElementById('modalOverlay');
        const userNameInput = document.getElementById('userName');
        const sideMenu = document.getElementById('sideMenu');

        // Закрываем боковое меню
        sideMenu?.classList.remove('open');

        // Заполняем форму текущими данными
        if (userNameInput) {
            userNameInput.value = this.userProfile.name;
        }

        // Выбираем текущий аватар
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.avatar === this.userProfile.avatar) {
                option.classList.add('selected');
            }
        });

        // Показываем модальное окно
        modalOverlay?.classList.add('open');
        profileModal?.classList.add('open');
        
        // Фокус на поле имени
        setTimeout(() => userNameInput?.focus(), 100);
    }

    /**
     * Закрытие модального окна профиля
     */
    closeProfileModal() {
        const profileModal = document.getElementById('profileModal');
        const modalOverlay = document.getElementById('modalOverlay');

        profileModal?.classList.remove('open');
        modalOverlay?.classList.remove('open');
    }

    /**
     * Сохранение профиля
     */
    saveProfile() {
        const userNameInput = document.getElementById('userName');
        const selectedAvatar = document.querySelector('.avatar-option.selected');

        if (userNameInput && selectedAvatar) {
            const newName = userNameInput.value.trim() || 'Пользователь';
            const newAvatar = selectedAvatar.dataset.avatar;

            // Обновляем профиль
            this.userProfile.name = newName;
            this.userProfile.avatar = newAvatar;

            // Сохраняем в localStorage
            localStorage.setItem('userName', newName);
            localStorage.setItem('userAvatar', newAvatar);

            // Обновляем отображение
            this.updateProfileDisplay();

            // Закрываем модальное окно
            this.closeProfileModal();

            console.log('Профиль сохранен:', this.userProfile);
        }
    }

    /**
     * Установка изображения аватара
     */
    setAvatarImage(element, avatarType) {
        const avatarImages = {
            character1: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g1' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23667eea'/><stop offset='100%' stop-color='%23764ba2'/></linearGradient></defs><circle cx='50' cy='50' r='45' fill='url(%23g1)'/><circle cx='50' cy='35' r='12' fill='%23ffcc5c'/><circle cx='42' cy='32' r='2' fill='%23333'/><circle cx='58' cy='32' r='2' fill='%23333'/><path d='M40 42 Q50 48 60 42' stroke='%23333' stroke-width='2' fill='none'/><circle cx='50' cy='50' r='2' fill='%23ffcc5c'/><rect x='35' y='65' width='30' height='20' rx='5' fill='%23ff6b6b'/></svg>",
            character2: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g2' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23ff9a9e'/><stop offset='100%' stop-color='%23fecfef'/></linearGradient></defs><circle cx='50' cy='50' r='45' fill='url(%23g2)'/><ellipse cx='50' cy='35' rx='15' ry='12' fill='%23ffcc5c'/><circle cx='43' cy='32' r='2' fill='%23333'/><circle cx='57' cy='32' r='2' fill='%23333'/><path d='M43 40 Q50 44 57 40' stroke='%23333' stroke-width='2' fill='none'/><path d='M25 25 Q35 15 45 25' stroke='%23a0522d' stroke-width='3' fill='none'/><path d='M55 25 Q65 15 75 25' stroke='%23a0522d' stroke-width='3' fill='none'/><rect x='35' y='65' width='30' height='18' rx='5' fill='%234ecdc4'/></svg>",
            cat: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g3' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23a8e6cf'/><stop offset='100%' stop-color='%2388d8a3'/></linearGradient></defs><circle cx='50' cy='50' r='45' fill='url(%23g3)'/><ellipse cx='50' cy='45' rx='18' ry='15' fill='%23ff8a80'/><polygon points='35,30 40,15 45,30' fill='%23ff8a80'/><polygon points='55,30 60,15 65,30' fill='%23ff8a80'/><circle cx='43' cy='40' r='2' fill='%23333'/><circle cx='57' cy='40' r='2' fill='%23333'/><ellipse cx='50' cy='48' rx='2' ry='1' fill='%23333'/><path d='M48 50 L50 52 L52 50' stroke='%23333' stroke-width='2' fill='none'/><path d='M40 52 Q50 55 60 52' stroke='%23333' stroke-width='1' fill='none'/></svg>",
            robot: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g4' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%2351e5ff'/><stop offset='100%' stop-color='%237c4dff'/></linearGradient></defs><circle cx='50' cy='50' r='45' fill='url(%23g4)'/><rect x='35' y='30' width='30' height='25' rx='3' fill='%23e8eaf6'/><circle cx='42' cy='40' r='3' fill='%234fc3f7'/><circle cx='58' cy='40' r='3' fill='%234fc3f7'/><rect x='47' y='48' width='6' height='4' rx='1' fill='%23333'/><circle cx='50' cy='25' r='3' fill='%23ff5722'/><rect x='20' y='45' width='8' height='3' rx='1' fill='%23ff9800'/><rect x='72' y='45' width='8' height='3' rx='1' fill='%23ff9800'/><rect x='40' y='65' width='20' height='8' rx='2' fill='%23424242'/></svg>",
            galaxy: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><radialGradient id='g5' cx='50%' cy='50%' r='50%'><stop offset='0%' stop-color='%23667eea'/><stop offset='50%' stop-color='%234a00e0'/><stop offset='100%' stop-color='%23000'/></radialGradient></defs><circle cx='50' cy='50' r='45' fill='url(%23g5)'/><circle cx='30' cy='25' r='1' fill='%23fff'/><circle cx='70' cy='30' r='1.5' fill='%23fff'/><circle cx='25' cy='50' r='1' fill='%23fff'/><circle cx='75' cy='65' r='1' fill='%23fff'/><circle cx='60' cy='75' r='1.5' fill='%23fff'/><circle cx='40' cy='70' r='1' fill='%23fff'/><ellipse cx='50' cy='50' rx='20' ry='8' fill='none' stroke='%23ff6b9d' stroke-width='2' opacity='0.8'/><circle cx='50' cy='50' r='6' fill='%23ffd700'/></svg>",
            gem: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g6' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23ff9a9e'/><stop offset='30%' stop-color='%23fecfef'/><stop offset='60%' stop-color='%23fecfef'/><stop offset='100%' stop-color='%23ff9a9e'/></linearGradient></defs><circle cx='50' cy='50' r='45' fill='%23000'/><polygon points='50,20 30,40 35,65 50,75 65,65 70,40' fill='url(%23g6)'/><polygon points='50,20 40,35 50,45 60,35' fill='%23fff' opacity='0.7'/><polygon points='30,40 40,50 50,45 35,40' fill='%23fff' opacity='0.3'/><polygon points='70,40 60,50 50,45 65,40' fill='%23fff' opacity='0.3'/></svg>"
        };

        const img = element.querySelector('img');
        if (img && avatarImages[avatarType]) {
            img.src = avatarImages[avatarType];
        }
    }

    /**
     * Инициализация голосового окна и свайп-жестов
     */
    initializeVoiceWindow() {
        this.voiceWindow = document.getElementById('voiceWindow');
        this.voiceMicButton = document.getElementById('voiceMicButton');
        this.voiceCloseButton = document.getElementById('voiceCloseButton');
        this.voiceStatus = document.getElementById('voiceStatus');
        
        // Инициализация свайп-жестов
        this.initializeSwipeGestures();
        
        // Привязка событий голосового окна
        this.bindVoiceWindowEvents();
        
        // Переменные для отслеживания голосового чата
        this.isVoiceRecording = false;
        this.isListening = false;
        this.lastUserMessage = '';
        this.lastAssistantMessage = '';
        
        console.log('Голосовое окно инициализировано');
    }

    /**
     * Инициализация свайп-жестов
     */
    initializeSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let startTime = 0;
        let isMainAreaTouch = false;

        // Touch Start
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
            
            // Проверяем, начался ли свайп с основной области приложения
            isMainAreaTouch = !e.target.closest('.voice-window') && 
                            !e.target.closest('.modal') && 
                            !e.target.closest('.side-menu');
        }, { passive: true });

        // Touch Move
        document.addEventListener('touchmove', (e) => {
            if (!isMainAreaTouch) return;
            
            const currentX = e.touches[0].clientX;
            const deltaX = currentX - startX;
            
            // Показываем превью при свайпе влево
            if (deltaX < -50 && !this.voiceWindow.classList.contains('open')) {
                const progress = Math.min(Math.abs(deltaX) / window.innerWidth, 1);
                this.voiceWindow.style.right = `${-100 + (progress * 100)}%`;
                this.voiceWindow.style.opacity = progress;
            }
        }, { passive: true });

        // Touch End
        document.addEventListener('touchend', (e) => {
            if (!isMainAreaTouch) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = Date.now() - startTime;
            
            // Сброс стилей превью
            this.voiceWindow.style.right = '';
            this.voiceWindow.style.opacity = '';
            
            // Определяем свайп влево для открытия голосового окна
            if (Math.abs(deltaX) > Math.abs(deltaY) && // Горизонтальный свайп
                deltaX < -100 && // Свайп влево на достаточное расстояние
                deltaTime < 500 && // Быстрый свайп
                !this.voiceWindow.classList.contains('open')) {
                this.openVoiceWindow();
            }
            
            isMainAreaTouch = false;
        }, { passive: true });
    }

    /**
     * Привязка событий голосового окна
     */
    bindVoiceWindowEvents() {
        // Кнопка микрофона - ВСЕГДА открывает текстовый ввод для тестирования
        this.voiceMicButton?.addEventListener('click', () => {
            this.openTextInputFallback();
        });

        // Кнопка закрытия
        this.voiceCloseButton?.addEventListener('click', () => {
            this.closeVoiceWindow();
        });
    }

    /**
     * Фолбэк для текстового ввода когда Speech Recognition недоступен
     */
    openTextInputFallback() {
        const userInput = prompt('🎤 Голосовой чат\n\nВведите ваш вопрос на норвежском или русском языке:');
        if (userInput && userInput.trim()) {
            console.log('Пользователь ввел текст:', userInput.trim());
            this.processVoiceInput(userInput.trim());
        } else {
            this.updateVoiceStatus('Нажмите микрофон для ввода сообщения');
        }
    }

    /**
     * Открытие голосового окна
     */
    async openVoiceWindow() {
        this.voiceWindow?.classList.add('open');
        
        // Обновляем иконки Feather после открытия
        setTimeout(() => {
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        }, 100);
        
        // Проверяем доступность Speech Recognition
        if (!this.speechRecognition) {
            this.updateVoiceStatus('Голосовое распознавание недоступно. Используйте кнопку микрофона для ввода текста.');
            console.log('Голосовое окно открыто без Speech Recognition API');
            return;
        }
        
        // Запрашиваем разрешение микрофона явно
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop()); // Останавливаем поток
            console.log('Разрешение микрофона получено');
            
            // Автоматически начинаем слушать после получения разрешения
            setTimeout(() => {
                this.startVoiceListening();
            }, 500);
            
        } catch (error) {
            console.error('Ошибка получения разрешения микрофона:', error);
            this.updateVoiceStatus('Нажмите "Разрешить" для доступа к микрофону или кнопку микрофона для ввода текста');
        }
        
        console.log('Голосовое окно открыто');
    }

    /**
     * Закрытие голосового окна
     */
    closeVoiceWindow() {
        this.voiceWindow?.classList.remove('open');
        
        // Останавливаем прослушивание
        if (this.isListening) {
            this.stopVoiceListening();
        }
        
        // Очищаем историю сообщений
        this.clearVoiceHistory();
        
        console.log('Голосовое окно закрыто');
    }

    /**
     * Переключение режима прослушивания
     */
    toggleVoiceListening() {
        if (this.isListening) {
            this.stopVoiceListening();
        } else {
            this.startVoiceListening();
        }
    }

    /**
     * Начать прослушивание голоса
     */
    startVoiceListening() {
        console.log('=== ДИАГНОСТИКА ГОЛОСОВОГО РАСПОЗНАВАНИЯ ===');
        console.log('speechRecognition объект:', this.speechRecognition);
        console.log('User Agent:', navigator.userAgent);
        console.log('Protocol:', window.location.protocol);
        console.log('Location:', window.location.href);
        
        if (!this.speechRecognition) {
            this.updateVoiceStatus('Speech Recognition не поддерживается в этом браузере');
            console.error('Speech Recognition недоступен');
            return;
        }

        this.isListening = true;
        this.voiceMicButton?.classList.add('recording');
        this.updateVoiceStatus('Слушаю...');
        
        // Настройки распознавания речи
        this.speechRecognition.continuous = false; // Одиночные фразы для лучшего распознавания
        this.speechRecognition.interimResults = true; // Промежуточные результаты
        this.speechRecognition.lang = 'ru-RU'; // Основной язык русский
        this.speechRecognition.maxAlternatives = 3;
        
        this.speechRecognition.onstart = () => {
            console.log('Speech recognition started');
            this.updateVoiceStatus('Слушаю... Говорите!');
        };
        
        this.speechRecognition.onresult = (event) => {
            console.log('Speech recognition result:', event);
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // Показываем промежуточные результаты
            if (interimTranscript) {
                this.updateVoiceStatus('Слышу: ' + interimTranscript);
            }
            
            console.log('Final transcript:', finalTranscript);
            console.log('Interim transcript:', interimTranscript);
            
            if (finalTranscript.trim()) {
                this.processVoiceInput(finalTranscript.trim());
            }
        };
        
        this.speechRecognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                this.updateVoiceStatus('Разрешите доступ к микрофону');
            } else if (event.error === 'no-speech') {
                this.updateVoiceStatus('Речь не обнаружена. Попробуйте еще раз.');
                // Автоматически перезапускаем
                setTimeout(() => {
                    if (this.isListening) {
                        this.speechRecognition.start();
                    }
                }, 1000);
            } else {
                this.updateVoiceStatus('Ошибка: ' + event.error);
            }
        };
        
        this.speechRecognition.onend = () => {
            console.log('Speech recognition ended');
            if (this.isListening && this.voiceWindow?.classList.contains('open')) {
                // Автоматически перезапускаем для непрерывного прослушивания
                setTimeout(() => {
                    if (this.isListening && this.voiceWindow?.classList.contains('open')) {
                        try {
                            this.updateVoiceStatus('Слушаю... Говорите!');
                            this.speechRecognition.start();
                        } catch (e) {
                            console.error('Failed to restart speech recognition:', e);
                            this.updateVoiceStatus('Нажмите микрофон для перезапуска');
                            this.isListening = false;
                            this.voiceMicButton?.classList.remove('recording');
                        }
                    }
                }, 300);
            }
        };
        
        try {
            this.speechRecognition.start();
            console.log('Голосовое прослушивание начато');
            console.log('Speech Recognition settings:', {
                continuous: this.speechRecognition.continuous,
                interimResults: this.speechRecognition.interimResults,
                lang: this.speechRecognition.lang,
                maxAlternatives: this.speechRecognition.maxAlternatives
            });
        } catch (e) {
            console.error('Failed to start speech recognition:', e);
            this.updateVoiceStatus('Ошибка запуска: ' + e.message);
            this.stopVoiceListening();
        }
    }

    /**
     * Остановить прослушивание голоса
     */
    stopVoiceListening() {
        if (this.speechRecognition && this.isListening) {
            this.speechRecognition.stop();
        }
        
        this.isListening = false;
        this.voiceMicButton?.classList.remove('recording');
        this.updateVoiceStatus('Нажмите на микрофон для начала');
        console.log('Голосовое прослушивание остановлено');
    }

    /**
     * Обработка голосового ввода
     */
    async processVoiceInput(transcript) {
        console.log('Processing voice input:', transcript);
        
        // Сохраняем последнее сообщение пользователя
        this.lastUserMessage = this.truncateMessage(transcript);
        this.updateVoiceStatusWithMessages('Обрабатываю...');
        
        // Временно останавливаем прослушивание для ответа
        this.stopVoiceListening();
        
        try {
            // Получаем ответ
            const response = this.findBestAnswer(transcript);
            console.log('Generated response:', response);
            
            // Сохраняем ответ ассистента
            this.lastAssistantMessage = this.truncateMessage(response);
            this.updateVoiceStatusWithMessages('Отвечаю...');
            
            // Озвучиваем ответ
            await this.speakText(this.cleanTextForSpeech(response));
            
            // Возвращаемся к прослушиванию через небольшую паузу
            setTimeout(() => {
                if (this.voiceWindow?.classList.contains('open')) {
                    this.updateVoiceStatusWithMessages('Слушаю... Говорите!');
                    this.startVoiceListening();
                }
            }, 1000);
            
        } catch (error) {
            console.error('Error processing voice input:', error);
            this.updateVoiceStatusWithMessages('Ошибка обработки');
            
            // Возвращаемся к прослушиванию даже при ошибке
            setTimeout(() => {
                if (this.voiceWindow?.classList.contains('open')) {
                    this.startVoiceListening();
                }
            }, 2000);
        }
    }

    /**
     * Обрезка сообщения до нужной длины
     */
    truncateMessage(text) {
        const maxWords = 6;
        const words = text.split(' ');
        
        if (words.length > maxWords) {
            return words.slice(0, maxWords).join(' ') + '...';
        }
        return text;
    }

    /**
     * Обновление статуса с сообщениями
     */
    updateVoiceStatusWithMessages(statusText) {
        if (!this.voiceStatus) return;
        
        // Если есть сообщения для показа
        if (this.lastUserMessage || this.lastAssistantMessage) {
            this.voiceStatus.className = 'voice-status has-messages';
            
            let messagesHtml = '<div class="voice-last-messages">';
            
            // Показываем последнее сообщение пользователя
            if (this.lastUserMessage) {
                messagesHtml += `<div class="voice-status-message user">${this.lastUserMessage}</div>`;
            }
            
            // Показываем последний ответ ассистента
            if (this.lastAssistantMessage) {
                messagesHtml += `<div class="voice-status-message assistant">${this.lastAssistantMessage}</div>`;
            }
            
            messagesHtml += '</div>';
            messagesHtml += `<div style="margin-top: 0.5rem; font-size: 0.9rem; opacity: 0.8;">${statusText}</div>`;
            
            this.voiceStatus.innerHTML = messagesHtml;
        } else {
            // Обычный статус
            this.voiceStatus.className = 'voice-status';
            this.voiceStatus.textContent = statusText;
        }
    }

    /**
     * Очистка истории сообщений при закрытии
     */
    clearVoiceHistory() {
        this.lastUserMessage = '';
        this.lastAssistantMessage = '';
        this.updateVoiceStatus('Начните говорить...');
    }

    /**
     * Обновление статуса голосового окна
     */
    updateVoiceStatus(message) {
        if (this.voiceStatus) {
            this.voiceStatus.className = 'voice-status';
            this.voiceStatus.textContent = message;
        }
    }


}

/**
 * Глобальная функция для копирования текста
 */
function copyText() {
    if (window.webAssistant) {
        window.webAssistant.copySelectedText();
    }
}

/**
 * Инициализация приложения после загрузки DOM
 */
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем доступность базы данных
    if (typeof DATABASE === 'undefined') {
        console.error('База данных не загружена');
        return;
    }
    
    // Создаем экземпляр ассистента
    window.webAssistant = new WebAssistant();
    
    console.log('Веб-ассистент готов к работе');
    console.log(`Загружено ${DATABASE.length} записей в базе данных`);
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
