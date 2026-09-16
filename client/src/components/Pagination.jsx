export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button type="button" className="btn-link" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        « Trước
      </button>
      <span className="pagination-info">
        Trang {page}/{totalPages}
      </span>
      <button
        type="button"
        className="btn-link"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Sau »
      </button>
    </div>
  );
}
