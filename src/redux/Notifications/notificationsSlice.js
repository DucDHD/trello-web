import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizeAxiosInstance from '~/utils/authozizeAxios'
import { API_ROOT } from '~/utils/constants'


// Khởi tạo giá trị state của một cái slice trong Redux
const initialState = {
  currentNotifications: null
}
// Các hành động gọi API (bất đồng bộ) và cập nhập dữ liệu vào redux, dùng Middleware createAsyncThunk đi kèm với extraReducers

export const fetchInvitationsAPI = createAsyncThunk(
  'notifications/fetchInvitationsAPI',
  async () => {
    const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/invitations`)
    // Lưu ý: axios sẽ trả về kết quả property của nó là data
    return response.data
  }
)

export const updateBoardInvitationAPI = createAsyncThunk(
  'notifications/updateBoardInvitationAPI',
  async ({ status, invitationsId }) => {
    const response = await authorizeAxiosInstance.put(`${API_ROOT}/v1/invitations/board/${invitationsId}`, { status })
    // Lưu ý: axios sẽ trả về kết quả property của nó là data
    return response.data
  }
)


// Khởi tạo một cái slice trong kho lưu trữ redux store
export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearCurrentNotifications: (state) => {
      state.currentNotifications = null
    },
    updateCurrentNotifications: (state, action) => {
      state.currentActiveBoard = action.payload
    },
    // Thêm mới một cái bản ghi notification vào đầu mảng currentNotification
    addNotification: (state, action) => {
      // Update nested data
      const inComingInvitation = action.payload
      state.currentNotifications.unshift(inComingInvitation)
    }
  },
  // ExtraReducers: Nới xử lý dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(fetchInvitationsAPI.fulfilled, (state, action) => {
      let incommingInvitations = action.payload

      state.currentNotifications = Array.isArray(incommingInvitations) ? incommingInvitations.reverse() : []
    })
    builder.addCase(updateBoardInvitationAPI.fulfilled, (state, action) => {
      let incommingInvitation = action.payload
      // Cập nhập lại dữ liệu boardInvitation (Bên trong nó sẽ có status mới sau khi update)
      const getInvitition = state.currentNotifications.find(i => i._id === incommingInvitation._id )
      getInvitition.boardInvitation = incommingInvitation.boardInvitation
    })
  }
})

/**
 * Action creators are generated for each case reducer function
 * Actions: là nơi dành cho các component bên dưới gọi bằng dispatch() tới nó để cập nhập lại dữ liệu thông qua reducer (chạy đồng bộ)
 * Để ý ở trên thì không thấy properties actions đâu cả, vì những cái actions này đơn giản là được thằng redux tạo tự động theo tên của reducer nhé.
 */
export const {
  clearCurrentNotifications,
  updateCurrentNotifications,
  addNotification
} = notificationsSlice.actions

// Selecters: là nơi danh cho các component bên dưới gọi bằng hook useSelector() để lấy dữ liệu từ trong kho redux store ra sử dụng
export const selectCurrentNotifications = (state) => {
  return state.notifications.currentNotifications
}

//export default activeSliceBoard.reducer
export const notificationsReducer = notificationsSlice.reducer