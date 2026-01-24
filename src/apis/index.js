import axios from 'axios'
import { API_ROOT } from '~/utils/constants'

/**
 * Lưu ý: Đối với việc sử dụng axios ở khóa MERN stack Pro trên kênh youtube :
 * Tất cả các function bên dưới các bạn sẽ thấy mình chỉ request và lấy data từ response luôn, mà không try catch hay then catch gì để bắt lỗi
 * Lý do là vì ở phía FE chúng ta không cần thiết làm như vậy đối với mọi request bởi nó sẽ gây ra việc dư thừa code catch lỗi quá nhiều
 * Giải pháp Clean code gọn gàng đó là chúng ta sẽ catch lỗi tập trung một nơi bằng cách tận dụng một thứ cực kỳ mạnh mẽ trong axios đó là Intercreptors
 * Hiểu đơn giản Intercreptors là cách chúng ta sẽ đánh chặn vào giữa request hoặc reponse để xủ lý logic mà chúng ta muốn.
 */

/** Board đã move vào redux */
// export const fetchBoardDetailsAPI = async (boardId) => {
//   const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`)
//   // Lưu ý: axios sẽ trả về kết quả property của nó là data
//   return response.data
// }

/** Update ColumnOrderedIds  */
export const updateBoardDetailsAPI = async (boardId, updateData) => {
  const response = await axios.put(`${API_ROOT}/v1/boards/${boardId}`, updateData)
  // Lưu ý: axios sẽ trả về kết quả property của nó là data
  return response.data
}

/** Update  moveCardToDifferentColumnAPI */
export const moveCardToDifferentColumnAPI = async (updateData) => {
  const response = await axios.put(`${API_ROOT}/v1/boards/supports/moving_card`, updateData)
  // Lưu ý: axios sẽ trả về kết quả property của nó là data
  return response.data
}


/** Columns */

export const createNewColumnAPI = async (newColumnData) => {
  const response = await axios.post(`${API_ROOT}/v1/columns`, newColumnData)
  return response.data
}


/** Columns updateColumnDetailsAPI */

export const updateColumnDetailsAPI = async (columnId, updateData) => {
  const response = await axios.put(`${API_ROOT}/v1/columns/${columnId}`, updateData)
  // Lưu ý: axios sẽ trả về kết quả property của nó là data
  return response.data
}

/** Columns deleteColumnDetails */
export const deleteColumnDetailsAPI = async (columnId) => {
  const response = await axios.delete(`${API_ROOT}/v1/columns/${columnId}`)
  // Lưu ý: axios sẽ trả về kết quả property của nó là data
  return response.data
}


/** Card */

export const createNewCardAPI = async (newCardData) => {
  const response = await axios.post(`${API_ROOT}/v1/cards`, newCardData)
  return response.data
}
