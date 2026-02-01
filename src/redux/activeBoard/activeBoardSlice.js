import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizeAxiosInstance from '~/utils/authozizeAxios'
import { API_ROOT } from '~/utils/constants'
import { generatePlaceHolderCard } from '~/utils/formatters'
import { isEmpty } from 'lodash'
import { mapOrder } from '~/utils/sorts'

// Khởi tạo giá trị state của một cái slice trong react
const initialState = {
  currentActiveBoard: null
}
// Các hành động gọi API (bất đồng bộ) và cập nhập dữ liệu vào redux, dùng Middleware createAsyncThunk đi kèm với extraReducers

export const fetchBoardDetailsAPI = createAsyncThunk(
  'activeBoard/fetchBoardDetailsAPI',
  async (boardId) => {
    const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}`)
    // Lưu ý: axios sẽ trả về kết quả property của nó là data
    return response.data
  }
)

// Khởi tạo một cái slice trong kho lưu trữ redux store
export const activeSliceBoard = createSlice({
  name: 'activeBoard',
  initialState,
  // reducers: là nơi xử lý dữ liệu đồng bộ
  reducers: {
    // Lưu ý luôn là ở đây luôn luôn cần cặp ngoặc nhọn cho function trong reducer cho dù code bên trong chỉ có 1 dòng, đây là rule của Redux
    updateCurrentActiveBoard: (state, action) => {
      // action.payload là chuẩn đặt tên nhận dữ liệu vào reducer, ở đây chúng ta gán nó ra một biến có nghĩa hơn
      const board = action.payload

      // Xử lý dữ liệu nếu cần thiết...
      //...

      // Update lại xử liệu của updateCurrentActiveBoard
      state.currentActiveBoard = board
    },
    updateCardInBoard: (state, action) => {
      // Update nested data
      const inComingCard = action.payload

      // Tìm dần từ board > column > card
      const column = state.currentActiveBoard.columns.find( i => i._id === inComingCard.columnId)
      if (column) {
        const card = column.cards.find( i => i._id === inComingCard._id)
        if (card) {
          //card.title = inComingCard.title
          //card['title'] = inComingCardp['title']

          /**
           * Giải thích đoạn dưới
           * Đơn giản là  Object.keys để lấy toàn bộ các properties (keys) của inComingCardp về một array
           * Rồi forEach nó ra.
           * Sau đó tùy vào trường hợp cần thì kiểm tra thêm còn không thì cập nhập ngược lại giá trị vào card luôn như bên dưới
           */
          Object.keys(inComingCard).forEach( key => {
            card[key] = inComingCard[key]
          } )
        }
      }
    }
  },
  // ExtraReducers: Nới xử lý dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action) => {
      // action.payload chính là cái response.data trả về ở trên
      let board = action.payload

      // Thành viên trong cái board sẽ là gộp lại của 2 mảng owners và members
      board.FE_allUsers = board.owners.concat(board.members)

      // Sắp xếp thứ tự các column luôn ở đây trước khi đưa dữ liệu xuống bên dưới các component con (video 71)
      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')
      board.columns.forEach( column => {
        // Khi F5 trang web  Cần xử lý kéo thả vào một column rỗng (Video 37.2)
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceHolderCard(column)]
          column.cardOrderIds = [generatePlaceHolderCard(column)._id]
        } else {
          // Sắp xếp thứ tự các card luôn ở đây trước khi đưa dữ liệu xuống bên dưới các component con (video 71)
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
        }
      })
      // Update lại xử liệu của updateCurrentActiveBoard
      state.currentActiveBoard = board
    })
  }
})

// Actions: là nơi dành cho các components bên dưới gọi bằng dispath() tới nó để cập nhập lại dữ liệu thông qua reducer (chạy đồng bộ)
// Để ý ở trên thì không thấy properties đâu cả, bởi vì những cái actions này đơn giản là được thằng redux tạo tự động theo tên của reducer nhé
export const { updateCurrentActiveBoard, updateCardInBoard } = activeSliceBoard.actions

// Selecters: là nơi danh cho các component bên dưới gọi bằng hook useSelector() để lấy dữ liệu từ trong kho redux store ra sử dụng
export const selectCurrentActiveBoard = (state) => {
  return state.activeBoard.currentActiveBoard
}

//export default activeSliceBoard.reducer
export const activeBoardReducer = activeSliceBoard.reducer