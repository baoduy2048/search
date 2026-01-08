const express = require('express');
const { Client } = require('@elastic/elasticsearch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Khởi tạo kết nối tới Elasticsearch (Docker)
const client = new Client({
  node: 'http://localhost:9200', 
});

// API Route tìm kiếm sách
app.post('/api/search', async (req, res) => {
  const { query } = req.body; // Lấy từ khóa từ Frontend

  if (!query) {
    return res.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm" });
  }

  try {
    // Thực hiện truy vấn giống hệt như bạn đã test trong REST Client
    const result = await client.search({
      index: 'book_index', // Tên index bạn đã tạo
      body: {
        query: {
          match: {
            abstract: {
              query: query,
              minimum_should_match: "30%" // Linh hoạt cho câu dài
            }
          }
        },
        highlight: {
          pre_tags: ["<b class='highlight'>"], // Gán class để CSS ở Frontend
          post_tags: ["</b>"],
          fields: {
            abstract: {}
          }
        }
      }
    });

    // Trả về danh sách kết quả (hits)
    const books = result.hits.hits.map(hit => ({
      id: hit._id,
      score: hit._score,
      ...hit._source,
      highlight: hit.highlight ? hit.highlight.abstract : null
    }));

    res.json(books);
  } catch (error) {
    console.error("Lỗi Elasticsearch:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi tìm kiếm" });
  }
});

const PORT = 5000;
app.get('/api/suggest', async (req, res) => {
  const { q } = req.query; // Lấy 'nhà' từ suggest?q=nhà
  
  if (!q) return res.json([]);

  try {
    const result = await client.search({
      index: 'book_index',
      body: {
        size: 5,
        query: {
          // match_phrase_prefix giúp gợi ý cụm từ bắt đầu bằng chữ 'nhà'
          match_phrase_prefix: {
            name: {
              query: q
            }
          }
        },
        _source: ["name"]
      }
    });

    const suggestions = result.hits.hits.map(hit => hit._source.name);
    res.json(suggestions);
  } catch (error) {
    console.error("Lỗi ES:", error);
    res.json([]);
  }
});
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
