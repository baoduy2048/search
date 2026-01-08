import React from 'react';
import './BookModal.component.css';

const BookModal = ({ book, onClose }) => {
    if (!book) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>
                <div className="modal-body">
                    <div className="modal-image-col">
                        <img
                            src={book.images?.[0] || book.image_url || book.product_url || 'https://via.placeholder.com/300'}
                            alt={book.name || book.title}
                            onError={(e) => e.target.src = 'https://via.placeholder.com/300'}
                        />
                    </div>
                    <div className="modal-details-col">
                        <h2 className="modal-title">{book.name || book.title}</h2>

                        <div className="modal-meta">
                            <p><strong>Tác giả:</strong> {book.author || 'Đang cập nhật'}</p>
                            <p><strong>Nhà xuất bản:</strong> {book.publisher || 'Đang cập nhật'}</p>
                            <p><strong>Số trang:</strong> {book.number_of_pages || 'N/A'}</p>
                        </div>

                        <div className="modal-price-section">
                            <span className="modal-price">{Number(book.price || 0).toLocaleString('vi-VN')} ₫</span>
                            <div className="modal-rating">
                                {book.rating_average ? (
                                    <>
                                        <span>{book.rating_average}</span> <span className="star">⭐</span>
                                    </>
                                ) : (
                                    <span className="no-rating">Chưa có đánh giá</span>
                                )}
                            </div>
                        </div>

                        <div className="modal-description">
                            <h3>Giới thiệu sách</h3>
                            <div className="description-text" dangerouslySetInnerHTML={{ __html: book.description || book.abstract || 'Đang cập nhật mô tả...' }} />
                        </div>

                        <div className="modal-actions">
                            <button className="btn-buy">Chọn mua</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookModal;
