import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Filter.component.css';

const Filter = ({ onFilterChange }) => {
    const [publishers, setPublishers] = useState([]);
    const [selectedPublisher, setSelectedPublisher] = useState('');
    const [minPages, setMinPages] = useState('');
    const [maxPrice, setMaxPrice] = useState(500000);

    useEffect(() => {
        // 1. Gọi API để liệt kê ra 'nhà xuất bản'
        const fetchPublishers = async () => {
            try {
                // Giả sử API trả về danh sách publisher
                // Nếu chưa có API thực, dùng mock data ở đây để test UI
                const res = await axios.get('http://localhost:5000/api/publishers');
                setPublishers(res.data);
            } catch (error) {
                console.error("Failed to fetch publishers:", error);
                // Fallback data nếu gọi API lỗi
                setPublishers(["Nhà Xuất Bản Trẻ", "NXB Kim Đồng", "NXB Văn Học", "NXB Giáo Dục", "NXB Lao Động"]);
            }
        };

        fetchPublishers();
    }, []);

    const handleFilterChange = (updates) => {
        const newFilters = {
            publisher: updates.publisher !== undefined ? updates.publisher : selectedPublisher,
            minPages: updates.minPages !== undefined ? updates.minPages : minPages,
            maxPrice: updates.maxPrice !== undefined ? updates.maxPrice : maxPrice,
        };

        // Gửi thông tin filter lên component cha (nếu có prop)
        if (onFilterChange) {
            onFilterChange(newFilters);
        }
    };

    return (
        <div className="filter-container">
            <h3>Bộ Lọc Tìm Kiếm</h3>

            {/* 1. Nhà xuất bản */}
            <div className="filter-group">
                <label htmlFor="publisher-select">Nhà xuất bản</label>
                <select
                    id="publisher-select"
                    value={selectedPublisher}
                    onChange={(e) => {
                        setSelectedPublisher(e.target.value);
                        handleFilterChange({ publisher: e.target.value });
                    }}
                >
                    <option value="">-- Tất cả --</option>
                    {publishers.map((pub, index) => (
                        <option key={index} value={pub}>
                            {pub}
                        </option>
                    ))}
                </select>
            </div>

            {/* 2. Số trang tối thiểu */}
            <div className="filter-group">
                <label htmlFor="min-pages">Số trang tối thiểu</label>
                <input
                    type="number"
                    id="min-pages"
                    placeholder="VD: 100"
                    value={minPages}
                    min="0"
                    onChange={(e) => {
                        setMinPages(e.target.value);
                        handleFilterChange({ minPages: e.target.value });
                    }}
                />
            </div>

            {/* 3. Khoảng giá (0đ - 500,000đ) */}
            <div className="filter-group">
                <label>Giá tối đa: {Number(maxPrice).toLocaleString('vi-VN')} đ</label>
                <input
                    type="range"
                    min="0"
                    max="500000"
                    step="1000"
                    value={maxPrice}
                    onChange={(e) => {
                        setMaxPrice(e.target.value);
                        handleFilterChange({ maxPrice: e.target.value });
                    }}
                />
                <div className="price-range">
                    <span className="price-label">0đ</span>
                    <span className="price-label">500.000đ</span>
                </div>
            </div>
        </div>
    );
};

export default Filter;
