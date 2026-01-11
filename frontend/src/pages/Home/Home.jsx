import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';
const API_BASE_URL = 'http://localhost'

import BookModal from '../../components/BookModal.component';

function Home() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null); // State cho Modal

    // Tự động gọi API gợi ý khi người dùng gõ phím
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length > 1) { // Chỉ gợi ý khi gõ từ 2 ký tự trở lên
                try {
                    const res = await axios.get(API_BASE_URL + `:5000/api/suggest?q=${query}`);
                    setSuggestions(res.data);
                } catch (err) { console.error(err); }
            } else {
                setSuggestions([]);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300); // Debounce 300ms để tránh gọi API quá nhiều
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSearch = async (e, customQuery) => {
        if (e) e.preventDefault();
        const searchTerm = customQuery || query;
        setSuggestions([]); // Ẩn gợi ý sau khi tìm kiếm
        try {
            const response = await axios.post(API_BASE_URL + ':5000/api/search', { query: searchTerm });
            console.log(response)
            setResults(response.data);
        } catch (error) { console.error(error); }
    };

    return (
        <div className="Home">

            <h1 style={{ paddingLeft: '500px' }} >📚 Book Search Engine</h1>
            <div className="search-container">
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Nhập tên sách hoặc mô tả..."
                        autoComplete="off"
                    />
                    <button type="submit">Tìm Kiếm</button>
                    <button type="button" onClick={() => navigate('/bookstore')}>Nhà Sách</button>
                </form>

                {/* Danh sách gợi ý */}
                {suggestions.length > 0 && (
                    <ul className="suggestions-list">
                        {suggestions.map((s, index) => (
                            <li key={index} onClick={() => { setQuery(s); handleSearch(null, s); }}>
                                {s}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Phần hiển thị Kết quả */}
            <div style={{ width: '60%', paddingLeft: '210px' }} className="results">
                {results.map((book) => (
                    <div key={book.id} className="book-card">
                        <h3 dangerouslySetInnerHTML={{ __html: book.highlight.title ? `${book.highlight.title}` : book.title }}></h3>
                        <p dangerouslySetInnerHTML={{ __html: book.highlight.author ? `Tác giả: ${book.highlight.author}` : `Tác giả: ${book.author}` }}></p>
                        <p dangerouslySetInnerHTML={{ __html: book.highlight.description ? `...${book.highlight.description.join('...')}...` : book.description }} />
                        <button
                            className="detail-btn"
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                marginTop: '10px'
                            }}
                            onClick={() => setSelectedBook(book)}
                        >
                            Chi tiết
                        </button>
                    </div>
                ))}
            </div>

            <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />
        </div>
    );
}

export default Home;
