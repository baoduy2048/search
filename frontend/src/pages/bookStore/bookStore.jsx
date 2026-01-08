import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Filter from '../../components/Filter.component';
import BookItems from '../../components/BookItems.component';
import BookModal from '../../components/BookModal.component';
import './bookStore.css';

const BookStore = () => {
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({});
    const [selectedBook, setSelectedBook] = useState(null);

    // Fetch initial books or handle search
    const fetchBooks = async (searchTerm = '') => {
        setLoading(true);
        try {
            // Sử dụng API search hiện tại
            const payload = {
                query: searchTerm,
                ...filters // Gửi kèm filters nếu backend hỗ trợ, hoặc dùng để filter client-side
            };

            // Nếu không có search term, có thể gọi một API 'getAll' hoặc search '*' nếu ES hỗ trợ
            // Ở đây ta giả định search với query rỗng hoặc '*' sẽ trả về tất cả/random sách
            const endpoint = 'http://localhost:5000/api/search';
            const termToSearch = searchTerm || 'sách'; // Mặc định tìm 'sách' nếu rỗng để có dữ liệu demo

            const response = await axios.post(endpoint, { query: termToSearch });

            let resultBooks = response.data;

            // CLIENT-SIDE FILTERING (Tạm thời, vì backend chưa có logic filter)
            if (filters.maxPrice) {
                resultBooks = resultBooks.filter(b => (b.price || 0) <= filters.maxPrice);
            }
            if (filters.minPages) {
                resultBooks = resultBooks.filter(b => (b.number_of_pages || 0) >= filters.minPages);
            }
            if (filters.publisher) {
                // So sánh tương đối hoặc chính xác tùy dữ liệu
                resultBooks = resultBooks.filter(b => b.publisher && b.publisher.includes(filters.publisher));
            }

            setBooks(resultBooks);
        } catch (error) {
            console.error("Error fetching books:", error);
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchBooks(query);
    }, []); // Run once on mount

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchBooks(query);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(prev => {
            const updated = { ...prev, ...newFilters };
            // Có thể tự động fetch lại khi filter đổi
            // Nhưng cần cẩn thận với infinite loop nếu fetchBooks phụ thuộc filters
            // Ở đây ta sẽ gọi fetchBooks thủ công hoặc qua useEffect dependency
            return updated;
        });
    };

    // Trigger re-fetch/re-filter when filters change
    useEffect(() => {
        if (books.length > 0 || query) {
            fetchBooks(query);
        }
    }, [filters]);


    return (
        <div className="bookstore-page">
            <header className="bookstore-header">
                <h1>📚 Book Search Engine</h1>
                <div className="search-bar-container">
                    <form onSubmit={handleSearchSubmit}>
                        <input
                            type="text"
                            placeholder="Nhập tên sách, tác giả, nội dung..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button type="submit">Tìm kiếm</button>
                    </form>
                </div>
            </header>

            <div className="bookstore-body">
                <aside className="bookstore-sidebar">
                    <Filter onFilterChange={handleFilterChange} />
                </aside>

                <main className="bookstore-content">
                    {loading ? (
                        <div className="loading-spinner">Đang tải dữ liệu...</div>
                    ) : (
                        <BookItems
                            books={books}
                            onSelectBook={setSelectedBook}
                        />
                    )}
                </main>
            </div>

            {/* Modal */}
            <BookModal
                book={selectedBook}
                onClose={() => setSelectedBook(null)}
            />
        </div>
    );
};

export default BookStore;
