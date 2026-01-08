import React from 'react';

const BookItems = ({ books, onSelectBook }) => {
    if (books.length === 0) {
        return <div className="loading">Không tìm thấy sách phù hợp...</div>;
    }

    return (
        <div className="book-grid">
            {books.map((book, index) => (
                <div key={index} className="book-card" onClick={() => onSelectBook(book)}>
                    <img
                        src={book.product_url}
                        alt={book.title}
                        onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                    />
                    <h4>{book.title}</h4>
                    <p className="author">{book.author}</p>
                    <p className="price">{Number(book.price).toLocaleString()} ₫</p>
                </div>
            ))}
        </div>
    );
};

export default BookItems;
