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
        "писать": "å skrive"
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
        }
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