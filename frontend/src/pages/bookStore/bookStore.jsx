import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Filter from '../../components/Filter.component';
import BookItems from '../../components/BookItems.component';
import BookModal from '../../components/BookModal.component';
import Pagination from '../../components/Pagination.component';
import './bookStore.css';

const BookStore = () => {
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({});
    const [selectedBook, setSelectedBook] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    // Fetch initial books or handle search
    const fetchBooks = async (searchTerm = '') => {
        setLoading(true);
        try {
            const endpoint = 'http://localhost:5000/api/search';

            const payload = {
                query: searchTerm,
                publisher: filters.publisher,
                category: filters.category,
                prioritizeAuthor: true
            };

            const response = await axios.post(endpoint, payload);

            let resultBooks = response.data;

            // CLIENT-SIDE FILTERING
            if (filters.maxPrice !== undefined) {
                resultBooks = resultBooks.filter(b => (b.price || 0) <= filters.maxPrice);
            }
            if (filters.minPrice !== undefined) {
                resultBooks = resultBooks.filter(b => (b.price || 0) >= filters.minPrice);
            }
            if (filters.minPages) {
                resultBooks = resultBooks.filter(b => {
                    const pages = parseInt(b.page_count);
                    return !isNaN(pages) && pages >= parseInt(filters.minPages);
                });
            }
            // Removed client-side publisher filter as it is now handled by backend

            setBooks(resultBooks);
            setCurrentPage(1); // Reset to page 1 for new results
        } catch (error) {
            console.error("Error fetching books:", error);
            setBooks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks(query);
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchBooks(query);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    useEffect(() => {
        if (books.length > 0 || query) {
            fetchBooks(query);
        }
    }, [filters]);

    // Calculate current items for pagination
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentBooks = books.slice(indexOfFirstItem, indexOfLastItem);

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
                        <>
                            <BookItems
                                books={currentBooks}
                                onSelectBook={setSelectedBook}
                            />

                            {/* Pagination Controls */}
                            {books.length > ITEMS_PER_PAGE && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalItems={books.length}
                                    itemsPerPage={ITEMS_PER_PAGE}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </>
                    )}
                </main>
            </div>

            <BookModal
                book={selectedBook}
                onClose={() => setSelectedBook(null)}
            />
        </div>
    );
};

export default BookStore;
