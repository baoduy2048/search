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
  const { query, publisher } = req.body; // Lấy từ khóa và publisher từ Frontend

  try {
    const esQuery = {
      bool: {
        must: [],
        filter: []
      }
    };

    // 1. Full-text search (Must)
    if (query) {
      esQuery.bool.must.push({
        match: {
          description: {
            query: query,
            minimum_should_match: "30%"
          }
        }
      });
    } else {
      esQuery.bool.must.push({ match_all: {} });
    }

    // 2. Filter by Publisher (Filter -> Exact Match)
    if (publisher) {
      esQuery.bool.filter.push({
        term: {
          publisher: publisher // Fields in ES 'keyword' type require exact match
        }
      });
    }

    const result = await client.search({
      index: 'book_index',
      body: {
        size: 1000,
        query: esQuery,
        highlight: {
          pre_tags: ["<b class='highlight'>"],
          post_tags: ["</b>"],
          fields: {
            description: {}
          }
        }
      }
    });

    // Trả về danh sách kết quả (hits)
    const books = result.hits.hits.map(hit => ({
      id: hit._id,
      score: hit._score,
      ...hit._source,
      highlight: hit.highlight ? hit.highlight.description : null
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
            title: {
              query: q
            }
          }
        },
        _source: ["title"]
      }
    });

    const suggestions = result.hits.hits.map(hit => hit._source.title);
    res.json(suggestions);
  } catch (error) {
    console.error("Lỗi ES:", error);
    res.json([]);
  }
});
app.get('/api/publishers/top', async (req, res) => {
  try {
    const result = await client.search({
      index: 'book_index',
      body: {
        size: 0, // Chỉ lấy aggregation, không lấy documents
        aggs: {
          top_publishers: {
            terms: {
              field: "publisher", // Trường keyword
              size: 5 // Top 5
            }
          }
        }
      }
    });

    // Trả về mảng các bucket
    // Cấu trúc: [{ key: "NXB Trẻ", doc_count: 100 }, ...]
    const publishers = result.aggregations.top_publishers.buckets;
    res.json(publishers);
  } catch (error) {
    console.error("Lỗi aggregation:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi lấy thống kê" });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
