#!/usr/bin/env python3
"""
Скрипт для загрузки норвежских данных из Wikipedia и других открытых источников
Создает JSON файлы для GitHub Pages без необходимости в серверах
"""

import requests
import json
import time
from urllib.parse import quote
import trafilatura
import re
from datetime import datetime

class WikipediaScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Norwegian-Learning-App/1.0 (Educational purpose)'
        })
        
        # Источники данных
        self.sources = {
            'wikipedia_no': 'https://no.wikipedia.org/w/api.php',
            'wiktionary_no': 'https://no.wiktionary.org/w/api.php',
            'conceptnet': 'https://api.conceptnet.io/query',
            'freqwords': 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/no/no_50k.txt'
        }
        
        self.data = []
        self.processed_words = set()
        
    def scrape_wikipedia_categories(self):
        """Загружает слова из категорий Wikipedia"""
        print("🔍 Загружаю категории из норвежской Wikipedia...")
        
        categories = [
            'Norske_ord',
            'Norsk_språk', 
            'Norsk_grammatikk',
            'Norske_verb',
            'Norske_substantiv',
            'Norske_adjektiv',
            'Dagligdagse_uttrykk',
            'Norske_idiomer'
        ]
        
        for category in categories:
            try:
                print(f"  📂 Обрабатываю категорию: {category}")
                
                params = {
                    'action': 'query',
                    'format': 'json',
                    'list': 'categorymembers',
                    'cmtitle': f'Category:{category}',
                    'cmlimit': '500'
                }
                
                response = self.session.get(self.sources['wikipedia_no'], params=params)
                data = response.json()
                
                if 'query' in data and 'categorymembers' in data['query']:
                    members = data['query']['categorymembers']
                    print(f"    📄 Найдено {len(members)} страниц")
                    
                    for member in members[:100]:  # Ограничиваем для начала
                        self.process_wikipedia_page(member['title'])
                        time.sleep(0.1)  # Вежливость к API
                        
            except Exception as e:
                print(f"❌ Ошибка обработки категории {category}: {e}")
                
    def process_wikipedia_page(self, title):
        """Обрабатывает отдельную страницу Wikipedia"""
        if title in self.processed_words:
            return
            
        try:
            params = {
                'action': 'query',
                'format': 'json',
                'titles': title,
                'prop': 'extracts',
                'exintro': True,
                'explaintext': True,
                'exsectionformat': 'plain'
            }
            
            response = self.session.get(self.sources['wikipedia_no'], params=params)
            data = response.json()
            
            if 'query' in data and 'pages' in data['query']:
                pages = data['query']['pages']
                for page_id, page_data in pages.items():
                    if page_id != '-1' and 'extract' in page_data:
                        extract = page_data['extract']
                        
                        # Извлекаем определения и переводы
                        translations = self.extract_translations(extract, title)
                        for translation in translations:
                            if translation not in self.data:
                                self.data.append(translation)
                                
            self.processed_words.add(title)
            
        except Exception as e:
            print(f"❌ Ошибка обработки страницы {title}: {e}")
    
    def scrape_wiktionary(self):
        """Загружает данные из Викисловаря"""
        print("📚 Загружаю данные из норвежского Викисловаря...")
        
        # Запрашиваем случайные страницы норвежских слов
        for _ in range(10):  # 10 запросов по 500 страниц = 5000 слов
            try:
                params = {
                    'action': 'query',
                    'format': 'json',
                    'list': 'random',
                    'rnnamespace': '0',
                    'rnlimit': '500'
                }
                
                response = self.session.get(self.sources['wiktionary_no'], params=params)
                data = response.json()
                
                if 'query' in data and 'random' in data['query']:
                    pages = data['query']['random']
                    print(f"  📄 Обрабатываю {len(pages)} случайных страниц...")
                    
                    for page in pages:
                        self.process_wiktionary_page(page['title'])
                        time.sleep(0.05)
                        
            except Exception as e:
                print(f"❌ Ошибка загрузки Викисловаря: {e}")
                
    def process_wiktionary_page(self, title):
        """Обрабатывает страницу Викисловаря"""
        if title in self.processed_words:
            return
            
        try:
            params = {
                'action': 'query',
                'format': 'json',
                'titles': title,
                'prop': 'wikitext'
            }
            
            response = self.session.get(self.sources['wiktionary_no'], params=params)
            data = response.json()
            
            if 'query' in data and 'pages' in data['query']:
                pages = data['query']['pages']
                for page_id, page_data in pages.items():
                    if page_id != '-1' and 'revisions' in page_data:
                        wikitext = page_data['revisions'][0]['*']
                        
                        # Извлекаем переводы из вики-разметки
                        translations = self.parse_wiktionary_text(wikitext, title)
                        for translation in translations:
                            if translation not in self.data:
                                self.data.append(translation)
                                
            self.processed_words.add(title)
            
        except Exception as e:
            print(f"❌ Ошибка обработки Викисловаря для {title}: {e}")
    
    def scrape_frequency_words(self):
        """Загружает список частотных слов"""
        print("📊 Загружаю частотные норвежские слова...")
        
        try:
            response = self.session.get(self.sources['freqwords'])
            text = response.text
            
            lines = text.strip().split('\n')
            print(f"  📄 Найдено {len(lines)} частотных слов")
            
            for i, line in enumerate(lines[:10000]):  # Берем топ 10k слов
                parts = line.split()
                if len(parts) >= 2:
                    word = parts[0].lower()
                    frequency = int(parts[1]) if parts[1].isdigit() else i + 1
                    
                    if word not in self.processed_words:
                        # Пытаемся найти перевод через ConceptNet
                        translation = self.get_conceptnet_translation(word)
                        
                        if translation:
                            self.data.append({
                                'no': word,
                                'ru': translation,
                                'frequency': frequency,
                                'source': 'frequency_list',
                                'category': 'common'
                            })
                            
                        self.processed_words.add(word)
                        
                        if i % 100 == 0:
                            print(f"    ⏳ Обработано {i} слов...")
                            time.sleep(0.1)
                            
        except Exception as e:
            print(f"❌ Ошибка загрузки частотных слов: {e}")
    
    def get_conceptnet_translation(self, word):
        """Получает перевод через ConceptNet API"""
        try:
            url = f"{self.sources['conceptnet']}/c/no/{quote(word)}"
            response = self.session.get(url, timeout=5)
            data = response.json()
            
            if 'edges' in data:
                for edge in data['edges'][:5]:  # Проверяем первые 5 связей
                    if edge['rel']['label'] == 'Synonym' or edge['rel']['label'] == 'TranslationOf':
                        if edge['end']['language'] == 'ru':
                            return edge['end']['label']
                        elif edge['start']['language'] == 'ru':
                            return edge['start']['label']
                            
        except Exception:
            pass
        return None
    
    def scrape_news_sites(self):
        """Загружает современные выражения из новостных сайтов"""
        print("📰 Загружаю современные выражения из новостей...")
        
        news_sites = [
            'https://www.nrk.no',
            'https://www.aftenposten.no',
            'https://www.dagbladet.no'
        ]
        
        for site in news_sites:
            try:
                print(f"  🌐 Обрабатываю {site}...")
                
                # Загружаем главную страницу
                response = self.session.get(site, timeout=10)
                text = trafilatura.extract(response.text)
                
                if text:
                    # Извлекаем современные выражения
                    expressions = self.extract_modern_expressions(text)
                    for expr in expressions:
                        if expr not in self.data:
                            self.data.append(expr)
                            
                time.sleep(1)  # Вежливость к сайту
                
            except Exception as e:
                print(f"❌ Ошибка загрузки {site}: {e}")
    
    def extract_translations(self, text, original_word):
        """Извлекает переводы из текста"""
        translations = []
        
        # Паттерны для поиска переводов
        patterns = [
            r'русский[:\s]+([^.]+)',
            r'по-русски[:\s]+([^.]+)',
            r'означает[:\s]+([^.]+)',
            r'переводится как[:\s]+([^.]+)'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                clean_translation = match.strip().strip('"\'')
                if clean_translation and len(clean_translation) < 100:
                    translations.append({
                        'no': original_word.lower(),
                        'ru': clean_translation,
                        'source': 'wikipedia',
                        'category': self.detect_category(text)
                    })
                    
        return translations
    
    def parse_wiktionary_text(self, wikitext, word):
        """Парсит вики-текст Викисловаря"""
        translations = []
        
        # Ищем секции с переводами
        russian_section = re.search(r'===?\s*русский\s*===?(.*?)(?===|\Z)', wikitext, re.IGNORECASE | re.DOTALL)
        if russian_section:
            section_text = russian_section.group(1)
            
            # Извлекаем переводы
            translation_patterns = [
                r'\[\[([^|\]]+)(?:\|[^\]]+)?\]\]',
                r"'''([^']+)'''",
                r'"([^"]+)"'
            ]
            
            for pattern in translation_patterns:
                matches = re.findall(pattern, section_text)
                for match in matches:
                    if match and len(match) < 50:
                        translations.append({
                            'no': word.lower(),
                            'ru': match.strip(),
                            'source': 'wiktionary',
                            'category': self.detect_category_from_wikitext(wikitext)
                        })
                        
        return translations
    
    def extract_modern_expressions(self, text):
        """Извлекает современные выражения из текста"""
        expressions = []
        
        # Ищем современные выражения и термины
        sentences = text.split('.')
        for sentence in sentences[:50]:  # Первые 50 предложений
            if len(sentence) > 20 and len(sentence) < 100:
                # Простая эвристика для современных выражений
                if any(keyword in sentence.lower() for keyword in ['ny', 'moderne', 'digital', 'teknologi']):
                    expressions.append({
                        'no': sentence.strip(),
                        'ru': 'современное выражение (требует перевода)',
                        'source': 'news',
                        'category': 'modern'
                    })
                    
        return expressions[:20]  # Максимум 20 выражений с каждого сайта
    
    def detect_category(self, text):
        """Определяет категорию слова по контексту"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['глагол', 'verb']):
            return 'verb'
        elif any(word in text_lower for word in ['существительное', 'noun', 'substantiv']):
            return 'noun'
        elif any(word in text_lower for word in ['прилагательное', 'adjective', 'adjektiv']):
            return 'adjective'
        elif any(word in text_lower for word in ['наречие', 'adverb']):
            return 'adverb'
        else:
            return 'other'
    
    def detect_category_from_wikitext(self, wikitext):
        """Определяет категорию из вики-разметки"""
        if '{{verb' in wikitext.lower():
            return 'verb'
        elif '{{noun' in wikitext.lower() or '{{substantiv' in wikitext.lower():
            return 'noun'
        elif '{{adj' in wikitext.lower():
            return 'adjective'
        elif '{{adv' in wikitext.lower():
            return 'adverb'
        else:
            return 'other'
    
    def save_data(self, filename='norwegian_mega_data.json'):
        """Сохраняет собранные данные в JSON"""
        # Удаляем дубликаты
        unique_data = []
        seen = set()
        
        for item in self.data:
            key = f"{item['no']}-{item['ru']}"
            if key not in seen:
                seen.add(key)
                unique_data.append(item)
        
        # Добавляем метаданные
        output = {
            'metadata': {
                'created_at': datetime.now().isoformat(),
                'total_records': len(unique_data),
                'sources': list(self.sources.keys()),
                'version': '1.0'
            },
            'data': unique_data
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Данные сохранены в {filename}")
        print(f"📊 Всего уникальных записей: {len(unique_data):,}")
        
        return unique_data
    
    def run_full_scraping(self):
        """Запускает полную загрузку из всех источников"""
        print("🚀 Начинаю полную загрузку норвежских данных...")
        print(f"🕐 Время начала: {datetime.now().strftime('%H:%M:%S')}")
        
        # Загружаем из всех источников
        self.scrape_frequency_words()
        self.scrape_wiktionary()
        self.scrape_wikipedia_categories()
        self.scrape_news_sites()
        
        # Сохраняем результаты
        data = self.save_data()
        
        print("🎉 Загрузка завершена!")
        print(f"📈 Статистика по источникам:")
        
        sources_stats = {}
        for item in data:
            source = item.get('source', 'unknown')
            sources_stats[source] = sources_stats.get(source, 0) + 1
            
        for source, count in sources_stats.items():
            print(f"  {source}: {count:,} записей")
        
        return data

if __name__ == "__main__":
    scraper = WikipediaScraper()
    scraper.run_full_scraping()