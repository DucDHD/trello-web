import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizeAxiosInstance from '~/utils/authozizeAxios'
import { API_ROOT } from '~/utils/constants'

// Khởi tạo giá trị state của một cái slice trong redux
const initialState = {
  currentUser: null
}
// Các hành động gọi API (bất đồng bộ) và cập nhập dữ liệu vào redux, dùng Middleware createAsyncThunk đi kèm với extraReducers

export const loginUserAPI = createAsyncThunk(
  'user/loginUserAPI',
  async (data) => {
    const response = await authorizeAxiosInstance.post(`${API_ROOT}/v1/users/login`, data)
    // Lưu ý: axios sẽ trả về kết quả property của nó là data
    return response.data
  }
)

// Khởi tạo một cái slice trong kho lưu trữ redux store
export const userSlice = createSlice({
  name: 'user',
  initialState,
  // reducers: là nơi xử lý dữ liệu đồng bộ
  reducers: {},
  // ExtraReducers: Nới xử lý dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(loginUserAPI.fulfilled, (state, action) => {
      // action.payload chính là cái response.data trả về ở trên
      const user = action.payload

      // Update lại xử liệu của updateCurrentActiveBoard
      state.currentUser = user
    })
  }
})

export const selectCurrentUser = (state) => {
  return state.user.currentUser
}

export const userReducer = userSlice.reducer