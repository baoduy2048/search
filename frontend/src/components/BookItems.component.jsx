import React from 'react';
import './BookItems.component.css';

const BookItems = ({ books, onSelectBook }) => {
    if (books.length === 0) {
        return <div className="no-results">Không tìm thấy sách phù hợp...</div>;
    }

    return (
        <div className="book-grid">
            {books.map((book, index) => (
                <div key={index} className="book-card" onClick={() => onSelectBook(book)}>
                    <div className="book-image-container">
                        <img
                            src={book.images?.[0] || book.image_url || book.product_url || 'https://via.placeholder.com/150'}
                            alt={book.name || book.title}
                            onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                        />
                    </div>
                    <div className="book-info">
                        <h4 className="book-title" title={book.name || book.title}>{book.name || book.title}</h4>
                        <p className="book-author">{book.author || 'Đang cập nhật'}</p>
                        <div className="book-price-row">
                            <span className="current-price">
                                {Number(book.price || 0).toLocaleString('vi-VN')} ₫
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BookItems;
