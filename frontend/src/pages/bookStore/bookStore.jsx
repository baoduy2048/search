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

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    // Fetch initial books or handle search
    const fetchBooks = async (searchTerm = '') => {
        setLoading(true);
        try {
            const endpoint = 'http://localhost:5000/api/search';
            const termToSearch = searchTerm || 'sách';

            const response = await axios.post(endpoint, { query: termToSearch });

            let resultBooks = response.data;

            // CLIENT-SIDE FILTERING (Updated for Double Slider)
            if (filters.maxPrice !== undefined) {
                resultBooks = resultBooks.filter(b => (b.price || 0) <= filters.maxPrice);
            }
            if (filters.minPrice !== undefined) {
                resultBooks = resultBooks.filter(b => (b.price || 0) >= filters.minPrice);
            }
            if (filters.minPages) {
                resultBooks = resultBooks.filter(b => (b.number_of_pages || 0) >= filters.minPages);
            }
            if (filters.publisher) {
                resultBooks = resultBooks.filter(b => b.publisher && b.publisher.includes(filters.publisher));
            }

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

    // Trigger re-fetch/re-filter when filters or query changes
    // Note: In a real app with server-side filtering, we would pass params to API.
    // Since we do client-side filtering on the search result here, we might just re-apply filters 
    // to the *existing* search result if we stored the 'raw' results separately. 
    // But to keep it simple and consistent with previous logic, we re-fetch (or re-process) data.
    // Optimization: Store rawResults separate from activeBooks. 
    // For now, re-fetching search is okay as local mock/demo.

    // BETTER approach for this demo: only re-fetch if Query changes. 
    // If Filter changes, just re-filter the *current* raw results. 
    // But since I don't want to re-write the whole state management right now, 
    // I will stick to the existing pattern but just ensure 'fetchBooks' uses the latest 'filters'.
    // Actually, 'fetchBooks' uses 'filters' state which is a closure trap in the current version 
    // if not careful, but 'filters' is read from strict state if passed or accessed via ref. 
    // Wait, 'fetchBooks' captures 'filters' from closure at definition time? 
    // No, it's defined inside component, so it captures current render scope. 
    // useEffect on [filters] creates a new fetchBooks? No.
    // Let's rely on the useEffect dependency array.

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
                        <>
                            <BookItems
                                books={books.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)}
                                onSelectBook={setSelectedBook}
                            />

                            {/* Pagination Controls */}
                            {books.length > ITEMS_PER_PAGE && (
                                <div className="pagination">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        &laquo; Trước
                                    </button>

                                    <span className="page-info">
                                        Trang {currentPage} / {Math.ceil(books.length / ITEMS_PER_PAGE)}
                                    </span>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(books.length / ITEMS_PER_PAGE)))}
                                        disabled={currentPage === Math.ceil(books.length / ITEMS_PER_PAGE)}
                                    >
                                        Sau &raquo;
                                    </button>
                                </div>
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
