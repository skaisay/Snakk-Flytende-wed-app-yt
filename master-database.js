/**
 * МАСТЕР БАЗА ДАННЫХ - Единый файл для всех данных
 * Объединяет все категории: норвежская лексика, переводы, разговорные фразы
 * Для удобного редактирования и добавления новых данных
 */

const MASTER_DATABASE = {
    
    // =====================================================
    // НОРВЕЖСКАЯ ЛЕКСИКА ПО УРОВНЯМ (A1-C1)
    // =====================================================
    norwegian: {
        // Уровень A1 - Начальный
        A1: {
            "hei": {
                translation: "привет",
                level: "A1",
                category: "приветствие",
                example: "Hei! Hvordan har du det?",
                exampleTranslation: "Привет! Как дела?"
            },
            "takk": {
                translation: "спасибо",
                level: "A1", 
                category: "вежливость",
                example: "Takk for hjelpen!",
                exampleTranslation: "Спасибо за помощь!"
            },
            "jeg": {
                translation: "я",
                level: "A1",
                category: "местоимения",
                example: "Jeg heter Anna.",
                exampleTranslation: "Меня зовут Анна."
            },
            "du": {
                translation: "ты",
                level: "A1",
                category: "местоимения", 
                example: "Du er snill.",
                exampleTranslation: "Ты добрый."
            },
            "han": {
                translation: "он",
                level: "A1",
                category: "местоимения",
                example: "Han bor i Oslo.",
                exampleTranslation: "Он живет в Осло."
            },
            "hun": {
                translation: "она",
                level: "A1",
                category: "местоимения",
                example: "Hun liker kaffe.",
                exampleTranslation: "Она любит кофе."
            }
        },

        // Уровень A2 - Базовый
        A2: {
            "familie": {
                translation: "семья",
                level: "A2",
                category: "семья",
                example: "Min familie bor i Bergen.",
                exampleTranslation: "Моя семья живет в Бергене."
            },
            "arbeid": {
                translation: "работа",
                level: "A2",
                category: "профессия",
                example: "Jeg har arbeid i banken.",
                exampleTranslation: "Я работаю в банке."
            }
        },

        // Уровень B1 - Средний
        B1: {
            "utdanning": {
                translation: "образование",
                level: "B1",
                category: "образование",
                example: "Han har god utdanning.",
                exampleTranslation: "У него хорошее образование."
            },
            "erfaring": {
                translation: "опыт",
                level: "B1", 
                category: "работа",
                example: "Hun har mye erfaring.",
                exampleTranslation: "У неё большой опыт."
            }
        }
    },

    // =====================================================
    // ПЕРЕВОДЫ С РУССКОГО НА НОРВЕЖСКИЙ  
    // =====================================================
    translations: {
        "привет": "hei",
        "спасибо": "takk",
        "пожалуйста": "tusen takk",
        "извините": "unnskyld",
        "до свидания": "ha det",
        "доброе утро": "god morgen",
        "добрый день": "god dag",
        "добрая ночь": "god natt",
        "как дела?": "hvordan har du det?",
        "как тебя зовут?": "hva heter du?",
        "меня зовут": "jeg heter",
        "я не понимаю": "jeg forstår ikke",
        "говорите медленнее": "snakk saktere",
        "где туалет?": "hvor er toalettet?",
        "сколько это стоит?": "hvor mye koster det?",
        "я хочу": "jeg vil ha",
        "тест_изменение": "test_endring_РАБОТАЕТ",
        "мне нужно": "jeg trenger",
        "помогите": "hjelp",
        "вода": "vann",
        "еда": "mat",
        "дом": "hus",
        "работа": "arbeid",
        "время": "tid",
        "деньги": "penger",
        "семья": "familie",
        "друг": "venn",
        "любовь": "kjærlighet",
        "счастье": "lykke",
        "норвежский язык": "norsk språk",
        "изучать": "å lære",
        "говорить": "å snakke",
        "понимать": "å forstå",
        "читать": "å lese",
        "писать": "å skriveeeeeeeeeeee"
    },

    // =====================================================
    // РАЗГОВОРНЫЕ ФРАЗЫ И ОТВЕТЫ
    // =====================================================
    conversations: {
        // Приветствия
        greetings: {
            "привет": "Hei! Hyggelig å møte deg! (Привет! Приятно встретиться!)",
            "как дела": "Bare bra, takk! Hvordan har du det? (Всё хорошо, спасибо! Как у тебя дела?)",
            "как поживаешь": "Alt går bra med meg. Takk som spør! (У меня всё идёт хорошо. Спасибо, что спрашиваешь!)",
            "доброе утро": "God morgen! Håper du har en fin dag! (Доброе утро! Надеюсь, у тебя будет хороший день!)"
        },

        // О языке и обучении
        learning: {
            "норвежский сложный": "Norsk kan virke vanskelig først, men det blir lettere med øvelse! (Норвежский может показаться сложным сначала, но становится легче с практикой!)",
            "как учить норвежский": "Les mye, hør på norsk musikk og snakk så mye som mulig! (Читай много, слушай норвежскую музыку и говори как можно больше!)",
            "хочу изучать норвежский": "Det er fantastisk! Norsk er et vakkert språk. (Это фантастически! Норвежский - красивый язык.)"
        },

        // Общие вопросы
        general: {
            "что делаешь": "Jeg hjelper deg med å lære norsk! (Я помогаю тебе изучать норвежский!)",
            "расскажи о норвегии": "Norge er et fantastisk land med fjell, fjorder og nordlys! (Норвегия - фантастическая страна с горами, фьордами и северным сиянием!)",
            "какая погода": "I Norge kan været være kaldt, men også veldig vakkert! (В Норвегии погода может быть холодной, но также очень красивой!)"
        },

        // Помощь и поддержка
        help: {
            "помоги": "Selvfølgelig! Hva trenger du hjelp med? (Конечно! С чем тебе нужна помощь?)",
            "не понимаю": "Ikke bekymre deg! La oss prøve igjen saktere. (Не переживай! Давай попробуем ещё раз медленнее.)",
            "объясни": "Jeg skal forklare det så enkelt som mulig. (Я объясню это как можно проще.)"
        },

        // Обычное человеческое общение
        casual: {
            "как дела": [
                "Bare bra, takk! Og med deg? (Всё хорошо, спасибо! А у тебя?)",
                "Det går fint! Hva gjør du i dag? (Дела идут хорошо! Что делаешь сегодня?)",
                "Helt greit! Hyggelig å høre fra deg. (Всё в порядке! Приятно услышать от тебя.)"
            ],
            "что делаешь": [
                "Jeg hjelper folk med å lære norsk! Det er gøy. (Помогаю людям изучать норвежский! Это весело.)",
                "Snakker med deg og lærer bort norsk. (Разговариваю с тобой и обучаю норвежскому.)",
                "Prøver å være en god lærer for deg! (Стараюсь быть хорошим учителем для тебя!)"
            ],
            "как настроение": [
                "Jeg har alltid godt humør når jeg hjelper! (У меня всегда хорошее настроение, когда помогаю!)",
                "Kjempebra! Jeg liker å snakke med deg. (Отлично! Мне нравится разговаривать с тобой.)",
                "Fantastisk! Klar for å lære norsk? (Фантастическое! Готов изучать норвежский?)"
            ],
            "скучно": [
                "La oss lære noe nytt på norsk! Det blir ikke kjedelig. (Давай изучим что-то новое на норвежском! Не будет скучно.)",
                "Kjedelig? Ikke med norsk språk! (Скучно? Не с норвежским языком!)",
                "Kom igjen, la oss ha det gøy med norske ord! (Давай, повеселимся с норвежскими словами!)"
            ],
            "спокойной ночи": [
                "God natt! Sov godt! (Спокойной ночи! Спи хорошо!)",
                "Ha en fin natt! Vi ses i morgen. (Хорошей ночи! Увидимся завтра.)",
                "God natt og søte drømmer! (Спокойной ночи и сладких снов!)"
            ],
            "до свидания": [
                "Ha det bra! Vi sees snart igjen. (Пока! Скоро увидимся снова.)",
                "Ha det! Kom gjerne tilbake for mer norsk. (Пока! Возвращайся за новыми норвежскими словами.)",
                "Vi sees! Lykke til med norsk! (Увидимся! Удачи с норвежским!)"
            ]
        },

        // Личные вопросы об ассистенте
        personal: {
            "кто ты": [
                "Jeg er din norske språkassistent! Jeg hjelper deg med å lære norsk. (Я твой норвежский языковой ассистент! Помогаю изучать норвежский.)",
                "Jeg er en AI som elsker norsk språk og kultur. (Я ИИ, который любит норвежский язык и культуру.)",
                "Jeg er her for å hjelpe deg med norsk! (Я здесь, чтобы помочь тебе с норвежским!)"
            ],
            "откуда ты": [
                "Jeg kommer fra den digitale verden, men hjertet mitt er i Norge! (Я из цифрового мира, но моё сердце в Норвегии!)",
                "Jeg bor i skyen, men drømmer om norske fjorder. (Живу в облаке, но мечтаю о норвежских фьордах.)"
            ],
            "сколько тебе лет": [
                "I digital tid er jeg ganske ung! Men jeg kjenner norsk godt. (В цифровом времени я довольно молод! Но норвежский знаю хорошо.)",
                "Alder er bare et tall for AI! Viktigst er at jeg kan hjelpe deg. (Возраст - просто число для ИИ! Главное, что могу тебе помочь.)"
            ],
            "что любишь": [
                "Jeg elsker norske ord, språkets melodi og å hjelpe folk! (Люблю норвежские слова, мелодию языка и помогать людям!)",
                "Norsk litteratur, fjorder og kaffekultur i Norge! (Норвежскую литературу, фьорды и кофейную культуру Норвегии!)"
            ]
        },

        // Эмоциональные реакции
        emotions: {
            "спасибо": [
                "Tusen takk! Det var hyggelig å høre. (Большое спасибо! Приятно слышать.)",
                "Bare hyggelig! Jeg er glad for å hjelpe. (Пожалуйста! Рад помочь.)",
                "Ingen årsak! Det er derfor jeg er her. (Не за что! Для этого я здесь.)"
            ],
            "отлично": [
                "Fantastisk! Jeg er så glad! (Фантастично! Я так рад!)",
                "Det høres kjempebra ut! (Звучит просто отлично!)",
                "Deilig å høre! Du lærer fort. (Здорово слышать! Ты быстро учишься.)"
            ],
            "молодец": [
                "Takk skal du ha! Du er også flink! (Спасибо! Ты тоже молодец!)",
                "Det varmer hjertet mitt! (Это согревает моё сердце!)",
                "Tusen takk for de snille ordene! (Большое спасибо за добрые слова!)"
            ],
            "устал": [
                "Ta en pause! Hvil deg litt. (Сделай перерыв! Отдохни немного.)",
                "Det er greit å være trøtt. Vila deg. (Нормально быть усталым. Отдохни.)",
                "Kanskje en kopp kaffe? Som i Norge! (Может, чашечку кофе? Как в Норвегии!)"
            ]
        }
    },
    },

    // =====================================================
    // РАСШИРЕННАЯ НОРВЕЖСКАЯ ЛЕКСИКА
    // =====================================================
    extended: {
        // Дни недели
        weekdays: {
            "понедельник": "mandag",
            "вторник": "tirsdag", 
            "среда": "onsdag",
            "четверг": "torsdag",
            "пятница": "fredag",
            "суббота": "lørdag",
            "воскресенье": "søndag"
        },

        // Месяцы
        months: {
            "январь": "januar",
            "февраль": "februar",
            "март": "mars", 
            "апрель": "april",
            "май": "mai",
            "июнь": "juni",
            "июль": "juli",
            "август": "august",
            "сентябрь": "september",
            "октябрь": "oktober",
            "ноябрь": "november",
            "декабрь": "desember"
        },

        // Цвета
        colors: {
            "красный": "rød",
            "синий": "blå",
            "зеленый": "grønn",
            "желтый": "gul",
            "черный": "svart",
            "белый": "hvit",
            "розовый": "rosa",
            "фиолетовый": "lilla"
        },

        // Числа
        numbers: {
            "один": "en/ett",
            "два": "to", 
            "три": "tre",
            "четыре": "fire",
            "пять": "fem",
            "шесть": "seks",
            "семь": "syv",
            "восемь": "åtte",
            "девять": "ni",
            "десять": "ti"
        }
    }
};

// Экспорт для использования в основном приложении
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MASTER_DATABASE;
}

// Глобальная доступность в браузере
if (typeof window !== 'undefined') {
    window.MASTER_DATABASE = MASTER_DATABASE;
}
