import { createSlice } from '@reduxjs/toolkit'

// Khởi tạo giá trị một Slice trong redux
const initialState = {
  currentActiveCard : null
}

// Khởi tạo một slice trong kho lưu trữ - redux store
export const activeCardSlice = createSlice({
  name: 'activeCard',
  initialState,
  // Nơi xử lý dữ liệu đồng bộ
  reducers: {
    // Lưu ý luôn là ở đây cần cặp ngoặc nhọn cho function trong reducer cho dù code bên trong chỉ có 1 dòng, đây là rule của redux
    clearCurrentActiveCard: (state) => {
      state.currentActiveCard = null
    },

    updateCurrentActiveCard: (state, action) => {
      const fullCard = action.payload // action.payload  là chuẩn đặt tên nhận dữ liệu vào reducer, ở đây chúng ta gán nó một biến có nghĩa hơn
      // Xử lý dữ liệu cần thiết
      //...
      state.currentActiveCard = fullCard

    }
  },
  // extraReducers: xử lý dữ liệu bất đồng bộ
  // eslint-disable-next-line no-unused-vars
  extraReducers: (builder) => {}

})


// Action creators are generated for each case reducer function
// Action: là nơi dành cho các components bên dưới bọi bằng dispatch() tới nó để cập nhập lại dữ liệu thông qua reducer(chạy đồng bộ)
// Để ý ở trên thì không thấy properties actions đâu cả, bởi vì những cái actions này đơn giản là được thằng redux tạo tự động theo tên của reducer nhé.
export const { clearCurrentActiveCard, updateCurrentActiveCard } = activeCardSlice.actions


// Selecttors: là nơi dành cho các components bên dưới gọi bằng hook useSelector() để lấy dữ liệu từ trong kho Redux store ra sử dụng
export const selectCurrentActiveCard = (state) => {
  return state.activeCard.currentActiveCard
}

// Cài file này tên là activeCardSlice nhưng chúng ta sẽ export một thứ tên là Reducer, mọi người lưu ý,
// export default activeCardSlice.reducer
export const activeCardReducer = activeCardSlice.reducer