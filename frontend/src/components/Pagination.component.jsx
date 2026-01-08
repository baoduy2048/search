import React from 'react';
import './Pagination.component.css';

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5; // Number of pages to show around current page

        if (totalPages <= maxVisiblePages + 2) {
            // If total pages is small, show all
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Logic for ellipsis
            if (currentPage <= 3) {
                // Near start: 1, 2, 3, 4, ..., 10
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Near end: 1, ..., 7, 8, 9, 10
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                // Middle: 1, ..., 4, 5, 6, ..., 10
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="pagination-container">
            <div className="pagination">
                <button
                    className="page-btn prev"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    &laquo;
                </button>
                <button
                    className="page-btn prev"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    &lt;
                </button>

                {getPageNumbers().map((page, index) => (
                    <button
                        key={index}
                        className={`page-btn ${page === currentPage ? 'active' : ''} ${page === '...' ? 'dots' : ''}`}
                        onClick={() => typeof page === 'number' ? onPageChange(page) : null}
                        disabled={page === '...'}
                    >
                        {page}
                    </button>
                ))}

                <button
                    className="page-btn next"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    &gt;
                </button>
                <button
                    className="page-btn next"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    &raquo;
                </button>
            </div>
        </div>
    );
};

export default Pagination;
