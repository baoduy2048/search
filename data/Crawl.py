'''
Crawl dữ liệu sách từ trang web fahasa bằng Beautyfulsoup
'''
from bs4 import BeautifulSoup
from tqdm import tqdm
from curl_cffi import requests
import time
import re
import json

# Danh sách các quyển sách trong nước sắp xếp từ mới nhất đến cũ nhất
url = 'https://www.fahasa.com/sach-trong-nuoc.html?order=created_at&limit=48&'
id = 0
newest_book_last_crawled = ''
with open('newest_book_last_crawled.txt', 'w', encoding="utf-8") as y:
    newest_book_last_crawled = y.readline()

# duyệt từng trang để lấy url sách 
for i in tqdm(range(50)):
    # Giả lập trình duyệt Chrome phiên bản 120
    response = requests.get(url + f'p={i}', impersonate='chrome120')
    soup = BeautifulSoup(response.content, 'html.parser')
    book_elements = soup.find('ul', id='products_grid').find_all('li')
    # Duyệt từng quyển sách một
    for book in tqdm(book_elements):
        try: 
            book_url = book.find('a', class_='product-image')['href']
            # Không crawl nếu là một bộ sách
            if "series" in book_url:
                continue
            # Nếu duyệt đến quyển sách mới nhất trong lần crawl trước thì sẽ dừng, không crawl nữa
            if newest_book_last_crawled == book_url:
                break
            
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
            # Lưu lại quyển sách mới nhất trong lần crawl này 
            if id == 0:
                with open ('newest_book_last_crawled.txt', 'w', encoding="utf-8") as y:
                    y.write(book_url)
            
            with open ('book-info.jsonl', 'a', encoding="utf-8") as x:
                id += 1
                x.write(f'{{"index": {{"_id": "{id}"}} }}' + '\n')
                json_record = json.dumps(book_info, ensure_ascii=False)
                x.write(json_record + "\n")
        except Exception as e:
            print(f"[Error] {book_url}\n{e}")

