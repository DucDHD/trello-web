import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import { useEffect, useState } from 'react'
import { mapOrder } from '~/utils/sorts'
import {
  fetchBoardDetailsAPI,
  createNewColumnAPI,
  createNewCardAPI,
  updateBoardDetailsAPI,
  updateColumnDetailsAPI
} from '~/apis'
import { generatePlaceHolderCard } from '~/utils/formatters'
import { isEmpty } from 'lodash'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { Typography } from '@mui/material'


function Board( ) {

  const [board, setBoard] = useState(null)

  useEffect(() => {
    // Tạm thời fix cứng boardId, flow chuẩn chỉ về sau khi học nâng cao trực tiếp với mình là chúng ta sẽ sử dụng react-router-dom để lấy chuẩn boardId từ URL về
    const boardId = '696f298f0d7fe9c172b118d9'
    // Call API
    fetchBoardDetailsAPI(boardId).then(board => {

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
      setBoard(board)
    } )
  }, [])

  // Func này có nhiệm gọi APi tạo mới column và làm lại dữ liệu state Board
  const createNewColumn = async ( newColumnData ) => {
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id
    })

    /**
     * Khi tạo column mới thì nó sẽ chứa card, cần xử lý vấn đề kéo thả vào một column rỗng
     */
    createdColumn.cards = [generatePlaceHolderCard(createdColumn)]
    createdColumn.cardOrderIds = [generatePlaceHolderCard(createdColumn)._id]

    /**
     * Cập nhật state board
     * Phía FE chúng ta tự làm đúng lại state data board ( Thay vì phải gọi lại api fetchBoardDetailsAPI)
     * Lưu ý: cách làm này phụ thuộc vào tùy lựa chọn và đặc thù dự án, có nơi thì BE sẽ hỗ trợ trả về luôn toàn bộ board dù
     * đây có là api tạo Column hay Card đi chăng nữa => Lúc này FE sẽ nhàn hơn
     */
    const newBoard = { ...board }
    newBoard.columns.push(createdColumn)
    newBoard.columnOrderIds.push(createdColumn._id)
    setBoard(newBoard)
  }

  // Func này có nhiệm gọi APi tạo mới card và làm lại dữ liệu state Board
  const createNewCard = async ( newCardData ) => {
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id
    })

    /**
     * Cập nhật state board
     * Phía FE chúng ta tự làm đúng lại state data board ( Thay vì phải gọi lại api fetchBoardDetailsAPI)
     * Lưu ý: cách làm này phụ thuộc vào tùy lựa chọn và đặc thù dự án, có nơi thì BE sẽ hỗ trợ trả về luôn toàn bộ board dù
     * đây có là api tạo Column hay Card đi chăng nữa => Lúc này FE sẽ nhàn hơn
     */
    const newBoard = { ...board }
    const columnnToUpdate = newBoard.columns.find( column => column._id === createdCard.columnId )
    if (columnnToUpdate) {
      columnnToUpdate.cards.push(createdCard)
      columnnToUpdate.cardOrderIds.push(createdCard._id)
    }
    setBoard(newBoard)

  }


  /**
   * Func này có nhiệm vụ gọi API và xử lý kéo thả Column xong xuôi
   * Chỉ cần gọi API để cập nhập mảng columnOrderIds của board chứa nó (thay đổi vị trí trong mảng)
   */
  const moveColumns = (dndOrderedColumns) => {
    const dndOrderedColumnsIds = dndOrderedColumns.map( column => column._id)
    // Update cho chuẩn dữ liệu state board
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    setBoard(newBoard)


    // Gọi API
    updateBoardDetailsAPI(newBoard._id, { columnOrderIds: newBoard.columnOrderIds })
  }

  /**
   * Khi di chuyển card trong cùng một column:
   * Chỉ cần gọi API để cập nhập mảng cardOrderdIds của column chứa nó (thay đổi vị trí trong mảng)
   */
  const moveCardInTheSameColumn = (dndOrderedCard, dndOrderedCardIds, columnId) => {
    // Update cho chuẩn dữ liệu state board
    const newBoard = { ...board }
    const columnnToUpdate = newBoard.columns.find( column => column._id === columnId )
    if (columnnToUpdate) {
      columnnToUpdate.cards = dndOrderedCard
      columnnToUpdate.cardOrderIds = dndOrderedCardIds
    }
    setBoard(newBoard)
    // Gọi API update column
    updateColumnDetailsAPI(columnId, { cardOrderIds: dndOrderedCardIds })
  }

  if (!board) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems:'center',
        justifyContent: 'center',
        gap: 2,
        width: '100vw',
        height: '100vh'
      }}>
        <CircularProgress />
        <Typography>Loading Board...</Typography>
      </Box>
    )
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent
        board={board}
        createNewColumn={createNewColumn}
        createNewCard={createNewCard}
        moveColumns={moveColumns}
        moveCardInTheSameColumn={moveCardInTheSameColumn}
      />
    </Container>
  )
}

export default Board
