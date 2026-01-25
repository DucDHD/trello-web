import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import { useEffect } from 'react'
import { cloneDeep } from 'lodash'
import {
  updateBoardDetailsAPI,
  updateColumnDetailsAPI,
  moveCardToDifferentColumnAPI
} from '~/apis'
import {
  fetchBoardDetailsAPI,
  updateCurrentActiveBoard,
  selectCurrentActiveBoard
} from '~/redux/activeBoard/activeBoardSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'

function Board( ) {
  const dispatch = useDispatch()
  // Không dùng State của component nữa mà chuyển qua dùng State của Redux
  //const [board, setBoard] = useState(null)
  const board = useSelector(selectCurrentActiveBoard)
  const { boardId } = useParams()

  useEffect(() => {
    dispatch(fetchBoardDetailsAPI(boardId))
  }, [dispatch, boardId])


  /**
   * Func này có nhiệm vụ gọi API và xử lý kéo thả Column xong xuôi
   * Chỉ cần gọi API để cập nhập mảng columnOrderIds của board chứa nó (thay đổi vị trí trong mảng)
   */
  const moveColumns = (dndOrderedColumns) => {
    // Update cho chuẩn dữ liệu state board
    const dndOrderedColumnsIds = dndOrderedColumns.map( column => column._id)
    /**
     * Trường hợp dùng Spread Operator này thì lại không sao bởi vì ở đây chúng ta không dùng push như ở trên
     * làm thay đổi trực tiếp kiểu mở rộng mảng, mà chỉ đang gán lại toàn bộ giá trị columns và columnOrderIds
     * bằng 2 mảng mới. Tương tự như cách làm concat ở trường hợp createNewColumn thôi.
     */
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    //setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))

    // Gọi API
    updateBoardDetailsAPI(newBoard._id, { columnOrderIds: newBoard.columnOrderIds })
  }

  /**
   * Khi di chuyển card trong cùng một column:
   * Chỉ cần gọi API để cập nhập mảng cardOrderdIds của column chứa nó (thay đổi vị trí trong mảng)
   */
  const moveCardInTheSameColumn = (dndOrderedCard, dndOrderedCardIds, columnId) => {
    // Update cho chuẩn dữ liệu state board
    //const newBoard = { ...board }
    /**
     * Cannot assign to read only property 'cards' of object
     * Trường hợp Immutability ở đây đụng tới giá trị card đang được coi là chỉ đọc read only - (nested object - can thiệp sâu dữ liệu)
     */
    const newBoard = cloneDeep(board)
    const columnnToUpdate = newBoard.columns.find( column => column._id === columnId )
    if (columnnToUpdate) {
      columnnToUpdate.cards = dndOrderedCard
      columnnToUpdate.cardOrderIds = dndOrderedCardIds
    }
    //setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))
    // Gọi API update column
    updateColumnDetailsAPI(columnId, { cardOrderIds: dndOrderedCardIds })
  }

  /**
   * Khi di chuyển Card sang Column khác
   * B1: Cập nhập mảng cardOrderIds của column ban đầu chứa nó ( Hiểu bản chất là xóa cái _id của Card ra khỏi mảng)
   * B2: Cập nhập mảng cardOrderIds của column tiếp theo ( Hiểu bản chất là thêm _id của card vào mảng )
   * B3: Cập nhập lại trường columnId mới của các Card đã kéo
   * => Làm một API support riêng
   */
  const moveCardToDifferentColumn = (currentCardId, prevColumnId, nextColumnId, dndOrderedColumns) => {
    const dndOrderedColumnsIds = dndOrderedColumns.map( column => column._id)
    /**
     * Tương tự xử lý chỗ moveColumn bên trên nên không ảnh hưởng Redux ToolKit Immubility gì ở đây
     */
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    //setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))
    // Gọi API xử lý phía BE
    let prevCardorderIds = dndOrderedColumns.find( c => c._id === prevColumnId)?.cardOrderIds
    // Xử lý vấn đề khi kéo card cuối cùng ra khỏi column, column sẽ có placeholder-card cần xóa nó đi trước khi gửi dữ liệu lên cho phía BE
    if (prevCardorderIds[0].includes('placeholder-card')) prevCardorderIds = []

    moveCardToDifferentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardorderIds,
      nextColumnId,
      nextCardOrderIds: dndOrderedColumns.find( c => c._id === nextColumnId)?.cardOrderIds
    })

  }

  if (!board) {
    return <PageLoadingSpinner caption="Loading Board..." />
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent
        board={board}

        // 3 Cái trường hợp dưới đây thì giữ nguyên để code xử lý kéo thả ở phần BoardContent không bị quá dài mất ki
        moveColumns={moveColumns}
        moveCardInTheSameColumn={moveCardInTheSameColumn}
        moveCardToDifferentColumn={moveCardToDifferentColumn}
      />
    </Container>
  )
}

export default Board
