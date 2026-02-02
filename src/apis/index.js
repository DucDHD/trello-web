import { toast } from 'react-toastify'
import authorizeAxiosInstance from '~/utils/authozizeAxios'
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
  const response = await authorizeAxiosInstance.put(`${API_ROOT}/v1/boards/${boardId}`, updateData)
  // Lưu ý: axios sẽ trả về kết quả property của nó là data
  return response.data
}

/** Update  moveCardToDifferentColumnAPI */
export const moveCardToDifferentColumnAPI = async (updateData) => {
  const response = await authorizeAxiosInstance.put(`${API_ROOT}/v1/boards/supports/moving_card`, updateData)
  // Lưu ý: axios sẽ trả về kết quả property của nó là data
  return response.data
}


/** Columns */

export const createNewColumnAPI = async (newColumnData) => {
  const response = await authorizeAxiosInstance.post(`${API_ROOT}/v1/columns`, newColumnData)
  return response.data
}
export const updateColumnDetailsAPI = async (columnId, updateData) => {
  const response = await authorizeAxiosInstance.put(`${API_ROOT}/v1/columns/${columnId}`, updateData)
  // Lưu ý: axios sẽ trả về kết quả property của nó là data
  return response.data
}
export const deleteColumnDetailsAPI = async (columnId) => {
  const response = await authorizeAxiosInstance.delete(`${API_ROOT}/v1/columns/${columnId}`)
  // Lưu ý: axios sẽ trả về kết quả property của nó là data
  return response.data
}


/** Card */

export const createNewCardAPI = async (newCardData) => {
  const response = await authorizeAxiosInstance.post(`${API_ROOT}/v1/cards`, newCardData)
  return response.data
}

/** User */

export const registerUserAPI = async (data) => {
  const response = await authorizeAxiosInstance.post(`${API_ROOT}/v1/users/register`, data)
  toast.success('Account created successfully! please check and verify your account before logging in!', { theme: 'colored' })
  return response.data
}

export const verifyUserAPI = async (data) => {
  const response = await authorizeAxiosInstance.put(`${API_ROOT}/v1/users/verify`, data)
  toast.success('Account verified successfully! now you can login to enjoy our services! Have a good day~', { theme: 'colored' })
  return response.data
}


export const refreshTokenAPI = async () => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/users/refresh_token`)
  return response.data
}

export const fetchBoardsAPI = async (searchPath) => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/boards/${searchPath}`)
  return response.data
}

export const createNewBoardAPI = async (data) => {
  const response = await authorizeAxiosInstance.post(`${API_ROOT}/v1/boards`, data)
  toast.success('Board created Successfully')
  return response.data
}

export const updateCardDetailAPI = async (cardId, updateData) => {
  const response = await authorizeAxiosInstance.put(`${API_ROOT}/v1/cards/${cardId}`, updateData)
  return response.data
}

export const inviteUsertoBoardAPO = async (data) => {
  const response = await authorizeAxiosInstance.post(`${API_ROOT}/v1/invitations/board`, data)
  toast.success('user invited to board Successfully')
  return response.data
}
