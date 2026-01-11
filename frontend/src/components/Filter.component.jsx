import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Filter.component.css';

const Filter = ({ onFilterChange }) => {
    const [publishers, setPublishers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedPublisher, setSelectedPublisher] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [minPages, setMinPages] = useState('');

    // Price Range State
    const MIN_GAP = 10000; // Minimum difference between min and max
    const MAX_PRICE_LIMIT = 500000;
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(MAX_PRICE_LIMIT);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Publishers
                const pubRes = await axios.get('http://localhost:5000/api/publishers/top');
                setPublishers(pubRes.data.map(p => p.key));

                // Fetch Categories
                const catRes = await axios.get('http://localhost:5000/api/categories');
                setCategories(catRes.data.map(c => c.key));
            } catch (error) {
                console.error("Failed to fetch filter data:", error);
                setPublishers(["Nhà Xuất Bản Trẻ", "NXB Kim Đồng", "NXB Văn Học", "NXB Giáo Dục", "NXB Lao Động"]);
            }
        };
        fetchData();
    }, []);

    const notifyChange = (updates) => {
        if (onFilterChange) {
            onFilterChange({
                publisher: selectedPublisher,
                category: selectedCategory,
                minPages: minPages,
                minPrice: minPrice,
                maxPrice: maxPrice,
                ...updates
            });
        }
    };

    const handlePublisherChange = (e) => {
        const val = e.target.value;
        setSelectedPublisher(val);
        notifyChange({ publisher: val });
    };

    const handleCategoryChange = (e) => {
        const val = e.target.value;
        setSelectedCategory(val);
        notifyChange({ category: val });
    };

    const handleMinPagesChange = (e) => {
        const val = e.target.value;
        setMinPages(val);
        notifyChange({ minPages: val });
    };

    const handleMinPriceChange = (e) => {
        let val = parseInt(e.target.value);
        if (val > maxPrice - MIN_GAP) {
            val = maxPrice - MIN_GAP;
        }
        setMinPrice(val);
        notifyChange({ minPrice: val });
    };

    const handleMaxPriceChange = (e) => {
        let val = parseInt(e.target.value);
        if (val < minPrice + MIN_GAP) {
            val = minPrice + MIN_GAP;
        }
        setMaxPrice(val);
        notifyChange({ maxPrice: val });
    };

    // Calculate progress bar styling
    const progressLeft = (minPrice / MAX_PRICE_LIMIT) * 100;
    const progressRight = 100 - (maxPrice / MAX_PRICE_LIMIT) * 100;

    return (
        <div className="filter-container">
            <h3>Bộ Lọc Tìm Kiếm</h3>

            {/* 1. Nhà xuất bản */}
            <div className="filter-group">
                <label htmlFor="publisher-select">Nhà xuất bản</label>
                <select id="publisher-select" value={selectedPublisher} onChange={handlePublisherChange}>
                    <option value="">-- Tất cả --</option>
                    {publishers.map((pub, index) => (
                        <option key={index} value={pub}>{pub}</option>
                    ))}
                </select>
            </div>

            {/* 2. Thể loại */}
            <div className="filter-group">
                <label htmlFor="category-select">Thể loại</label>
                <select id="category-select" value={selectedCategory} onChange={handleCategoryChange}>
                    <option value="">-- Tất cả --</option>
                    {categories.map((cat, index) => (
                        <option key={index} value={cat}>{cat}</option>
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
                    onChange={handleMinPagesChange}
                />
            </div>

            {/* 3. Khoảng giá (Double Slider) */}
            <div className="filter-group">
                <label>Khoảng giá (VNĐ)</label>
                <div className="range-slider">
                    {/* The visual colored bar */}
                    <div
                        className="range-progress"
                        style={{ left: `${progressLeft}%`, right: `${progressRight}%` }}
                    ></div>

                    {/* The inputs */}
                    <div className="range-input">
                        <input
                            type="range"
                            min="0"
                            max={MAX_PRICE_LIMIT}
                            step="1000"
                            value={minPrice}
                            onChange={handleMinPriceChange}
                        />
                        <input
                            type="range"
                            min="0"
                            max={MAX_PRICE_LIMIT}
                            step="1000"
                            value={maxPrice}
                            onChange={handleMaxPriceChange}
                        />
                    </div>
                </div>

                <div className="price-values">
                    <span>{minPrice.toLocaleString('vi-VN')}</span>
                    <span>{maxPrice.toLocaleString('vi-VN')}</span>
                </div>
            </div>
        </div>
    );
};

export default Filter;
