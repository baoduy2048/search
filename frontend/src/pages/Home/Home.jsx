import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';

function Home() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [suggestions, setSuggestions] = useState([]);

    // Tự động gọi API gợi ý khi người dùng gõ phím
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length > 1) { // Chỉ gợi ý khi gõ từ 2 ký tự trở lên
                try {
                    const res = await axios.get(`http://localhost:5000/api/suggest?q=${query}`);
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
            const response = await axios.post('http://localhost:5000/api/search', { query: searchTerm });
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
                    <button type="submit">Tìm kiếm</button>
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

            {/* Phần hiển thị Results giữ nguyên như cũ */}
            <div style={{ width: '60%', paddingLeft: '210px' }} className="results">
                {results.map((book) => (
                    <div key={book.id} className="book-card">
                        <h3>{book.title}</h3>
                        <p dangerouslySetInnerHTML={{ __html: book.highlight ? book.highlight.join(' ') : book.description }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;
