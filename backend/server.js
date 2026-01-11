const express = require("express");
const { Client } = require("@elastic/elasticsearch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Khởi tạo kết nối tới Elasticsearch (Docker)
const client = new Client({
  node: "http://localhost:9200",
});

// API Route tìm kiếm sách
app.post("/api/search", async (req, res) => {
  const { query } = req.body; // Lấy từ khóa từ Frontend

  if (!query) {
    return res.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm" });
  }

  try {
    const result = await client.search({
      index: "book_index",
      body: {
        from: 0,
        size: 20,
        query: {
          bool: {
            should: [
              // 1. Trường hợp khớp HOÀN HẢO (Bắt buộc đủ từ, ưu tiên cao nhất)
              {
                multi_match: {
                  query: query,
                  fields: ["title^5", "author^3"],
                  type: "phrase", // Tìm đúng thứ tự cụm từ
                  boost: 10,
                },
              },
              // 2. Trường hợp khớp phần lớn (Linh hoạt cho câu dài)
              {
                multi_match: {
                  query: query,
                  fields: ["title^3", "author^2", "description"],
                  type: "best_fields",
                  operator: "and",
                  minimum_should_match: "70%", // Ít nhất 70% số từ phải khớp
                  fuzziness: "0", // Hỗ trợ gõ sai chính tả
                },
              },
              // 3. Trường hợp tìm kiếm rộng (Cho phép kết quả gần đúng)
              {
                multi_match: {
                  query: query,
                  fields: ["title", "author", "description"],
                  operator: "or",
                },
              },
            ],
          },
        },
        
        highlight: {
          pre_tags: ["<b class='highlight'>"],
          post_tags: ["</b>"],
          fields: {
            title: {},
            author: {},
            description: {}
          }
        }
      },
    });

    // Trả về danh sách kết quả (hits)
    const books = result.hits.hits.map((hit) => ({
      id: hit._id,
      score: hit._score,
      ...hit._source,
      highlight: hit.highlight || null,
    }));

    res.json(books);
  } catch (error) {
    console.error("Lỗi Elasticsearch:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi tìm kiếm" });
  }
});

const PORT = 5000;
app.get("/api/suggest", async (req, res) => {
  const { q } = req.query; // Lấy 'nhà' từ suggest?q=nhà

  if (!q) return res.json([]);

  try {
    const result = await client.search({
      index: "book_index",
      body: {
        size: 5,
        query: {
          // match_phrase_prefix giúp gợi ý cụm từ bắt đầu bằng chữ 'nhà'
          match_phrase_prefix: {
            title: {
              query: q,
            },
          },
        },
        _source: ["title"],
      },
    });

    const suggestions = result.hits.hits.map((hit) => hit._source.title);
    res.json(suggestions);
  } catch (error) {
    console.error("Lỗi ES:", error);
    res.json([]);
  }
});
app.get("/hmm", async (req, res) => {
  res.send("Server đã sẵn sàng và đang chạy trên 0.0.0.0!");
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server đang chạy tại cổng ${PORT}`);
});
