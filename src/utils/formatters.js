/**
 * YouTube: TrungQuanDev - Một Lập Trình Viên
 * Created by trungquandev.com's author on Jun 28, 2023
 */
/**
 * Capitalize the first letter of a string
 */
export const capitalizeFirstLetter = (val) => {
  if (!val) return ''
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`
}
/**
 * Video 37.2 : Cách xử lý bug logic thư viện Dnd-kit khi column là rỗng.
 * Phía FE sẽ tự tạo ra một cái card đặc biệt: placeholder Card, không liên quan đến back-end
 * Card đặc biệt này sẽ được ẩn ở giao diện Ui người dùng.
 * Cấu trúc Id của cái card này để Unique rất đơn giản, không cần phải làm romdom phức tạp:
 * "columnId-placeholder-card" ( Mỗi column chỉ có thể có tối đa một cái placeholder Card )
 * Quan trọng khi tạo: phải đầy đủ: ( _id, boardId, columnId, FE_placeholderCard )
 * Kỹ hơn nữa về cách tạo chuẩn ở bước nào thì sẽ ở học phần tích hợp API Back-End vào dự án.
*/
export const generatePlaceHolderCard = (column) => {
  return {
    _id:  `${column._id}-placeholder-card`,
    boardId: column.boardId,
    columnId: column._id,
    FE_placeholderCard: true
  }
}

// Kỹ thuật dùng css pointer-event để chặn user spam click tại bất kỳ chỗ nào có hành động click gọi api
// Đây là một kỹ thuật rất hay tận dụng Axios Interceptors và CSS Pointer-events để chỉ phải viết code xử lý một lần cho toàn bộ dự án
// Cách sử dụng: Với tất cả các link hoặc button mà có hành động gọi api thì thêm class "interceptor-loading" cho nó là xong.
export const interceptorLoadingElements = (calling) => {
  // DOM lấy ra toàn bộ phần tử trên page hiện tại có className là 'interceptor-loading'
  const elements = document.querySelectorAll('.interceptor-loading')
  for (let i = 0; i < elements.length; i++) {
    if (calling) {
      // Nếu đang trong thời gian chờ gọi API (calling === true) thì sẽ làm mờ phần tử và chặn click bằng css pointer-events
      elements[i].style.opacity = '0.5'
      elements[i].style.pointerEvents = 'none'
    } else {
      // Ngược lại thì trả về như ban đầu, không làm gì cả
      elements[i].style.opacity = 'initial'
      elements[i].style.pointerEvents = 'initial'
    }
  }
}
