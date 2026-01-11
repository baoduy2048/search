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
  const { query, publisher, category, prioritizeAuthor } = req.body; // Lấy từ khóa, publisher, category và flag ưu tiên

  try {
    const mustClause = [];
    const filterClause = [];

    // 1. Xử lý logic tìm kiếm (Search)
    if (query) {
      if (prioritizeAuthor) {
        // Logic cho BookStore: Tìm kiếm thông minh với trọng số & 3 cấp độ
        mustClause.push({
          bool: {
            should: [
              // Cấp 1: Khớp chính xác cụm từ (Phrase) - Điểm cao nhất
              {
                multi_match: {
                  query: query,
                  fields: ["title^5", "author^3"],
                  type: "phrase",
                  boost: 10,
                },
              },
              // Cấp 2: Khớp phần lớn từ (AND operator) - Điểm trung bình
              {
                multi_match: {
                  query: query,
                  fields: ["title^3", "author^2", "description"],
                  type: "best_fields",
                  operator: "and",
                  minimum_should_match: "70%",
                  fuzziness: "0",
                },
              },
              // Cấp 3: Khớp lỏng lẻo (OR operator) - Điểm thấp (Vớt vát kết quả)
              {
                multi_match: {
                  query: query,
                  fields: ["title", "author", "description"],
                  operator: "or",
                },
              },
            ],
          },
        });
      } else {
        // Logic cho Home: CHỈ tìm Description để đảm bảo highlight đúng ý thầy giáo
        mustClause.push({
          match: {
            description: {
              query: query,
              minimum_should_match: "30%"
            }
          }
        });
      }
    } else {
      // Nếu không có query -> Lấy tất cả
      mustClause.push({ match_all: {} });
    }

    // 2. Xử lý bộ lọc (Filter)
    if (publisher) {
      filterClause.push({
        term: {
          publisher: publisher // Keyword exact match
        }
      });
    }
    if (category) {
      filterClause.push({
        term: {
          category: category // Keyword exact match
        }
      });
    }

    const esQuery = {
      bool: {
        must: mustClause,
        filter: filterClause
      }
    };

    const result = await client.search({
      index: "book_index",
      body: {
        from: 0,
        size: 50, // Tăng giới hạn lấy nhiều sách hơn cho trang chủ
        query: esQuery,
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

// API lấy danh sách thể loại
app.get('/api/categories', async (req, res) => {
  try {
    const result = await client.search({
      index: 'book_index',
      body: {
        size: 0,
        aggs: {
          all_categories: {
            terms: {
              field: "category",
              size: 50 // Lấy 50 thể loại phổ biến nhất
            }
          }
        }
      }
    });

    const categories = result.aggregations.all_categories.buckets;
    res.json(categories);
  } catch (error) {
    console.error("Lỗi lấy categories:", error);
    res.status(500).json({ error: "Lỗi hệ thống" });
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

app.get("/hmm", async (req, res) => {
  res.send("Server đã sẵn sàng và đang chạy trên 0.0.0.0!");
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server đang chạy tại cổng ${PORT}`);
});
