import React from 'react';

const BookModal = ({ book, onClose }) => {
    if (!book) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>
                <div className="modal-body">
                    <div className="modal-image">
                        <img
                            src={book.product_url}
                            alt={book.title}
                            onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                        />
                    </div>
                    <div className="modal-details">
                        <h2>{book.title}</h2>
                        <p className="modal-author">Tác giả: <strong>{book.author}</strong></p>
                        <p className="modal-category">Thể loại: {book.category || 'Khác'}</p>
                        <p className="modal-price">{Number(book.price).toLocaleString()} ₫</p>
                        <p className="modal-rating">Đánh giá: {book.rating || 0} ⭐</p>
                        <div className="modal-description">
                            <h3>Giới thiệu sách</h3>
                            <p>{book.description}</p>
                        </div>
                        <button className="buy-button">Chọn mua</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookModal;
