'''
Crawl dữ liệu sách từ trang web fahasa bằng Beautyfulsoup
'''
from bs4 import BeautifulSoup
from tqdm import tqdm
from curl_cffi import requests
import time
import re
import json

url = 'https://www.fahasa.com/sach-trong-nuoc.html'

# Giả lập trình duyệt Chrome phiên bản 120
response = requests.get(url, impersonate='chrome120')
soup = BeautifulSoup(response.content, 'html.parser')
category_list = soup.find('ol', id='children-categories').find_all('li')
for category in tqdm(category_list):
    category_url = category.a['href']
    category_request = requests.get(category_url + '?order=num_orders&limit=48&p=1', impersonate='chrome120')
    category_element = BeautifulSoup(category_request.content, 'html.parser')
    book_elements = category_element.find('ul', id='products_grid').find_all('li')
    for book in tqdm(book_elements):
        try: 
            book_url = book.find('a', class_='product-image')['href']
            

            if "seriesbook-index-series" in book_url:
                continue
            
            book_title = book.find('a', class_='product-image')['title']
            book_request = requests.get(book_url, impersonate='chrome120')
            time.sleep(1)
            book_element = BeautifulSoup(book_request.content, 'html.parser')
            detail_elements = book_element.find('div', class_='product_view_tab_content_additional').find_all('tr')
            detail = {}
            for d in detail_elements:
                detail[d.find('th').text.strip()] = d.find('td').text.strip()
            s = book_element.find('span', class_='price').text if book_element.find('span', class_='price') else ""
            description = book_element.find('div', id='product_tabs_description_contents')
            book_image_url = book_element.find('div', class_='product-view-image-product').find('img', id='image')['data-src'] 
            book_info = {
                "product_url": book_url,
                "image_url": book_image_url,
                "title": book_title,
                "author": detail.get("Tác giả", ""),
                "publisher": detail.get("NXB", ""),
                "publish_year": detail.get("Năm XB", ''),
                "price": re.sub(r'[^\d]', '', s),
                "description": description.text if description else "",
                "page_count": detail.get("Số trang", ""),
                "dimensions": detail.get("Kích Thước Bao Bì",""),
                "weight": detail.get("Trọng lượng (gr)", "")
            }
            with open ('book-info.json', 'a', encoding="utf-8") as x:
                json.dump(book_info, x, ensure_ascii=False, indent=10)
        except Exception as e:
            print(f"[Error] {book_url}\n{e}")

