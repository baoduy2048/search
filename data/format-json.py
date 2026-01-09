"""
Chuyển dữ liệu crawl từ Fahasa sang định dạng JSON Bulk cho Elasticsearch.
"""
with open('book-info.json', 'r', encoding='utf-8') as x, \
      open('data-format.json', 'w', encoding='utf-8') as y:
    
    y.write('{"index": {"_id": "1"} }')
    doc_id = 2

    for line in x:
        if '}{' in line:
            y.write(f'}}\n{{"index": {{"_id": "{doc_id}"}} }}\n{{')
            doc_id += 1
        else:
            y.write(line)

# --- Cuối file format-json.py ---
if __name__ == "__main__":
    print("-" * 30)
    print("GHI CHÚ CHO BẠN:")
    print("1. File này dùng để format JSON cho Elasticsearch.")
    print("2. Nếu sửa code, nhớ quy tắc {{ }} cho f-string.")
    print("3. File đầu ra sẽ nằm trong thư mục D:\Devs\Crawl.")
    print("-" * 30)
