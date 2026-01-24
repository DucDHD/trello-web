import { useState } from 'react'
import { toast } from 'react-toastify'
import Box from '@mui/material/Box'
import Colunm from './Column/Colunm'
import Button from '@mui/material/Button'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'
import { createNewColumnAPI } from '~/apis'
import { generatePlaceHolderCard } from '~/utils/formatters'
import {
  updateCurrentActiveBoard,
  selectCurrentActiveBoard
} from '~/redux/activeBoard/activeBoardSlice'
import { useDispatch, useSelector } from 'react-redux'

function ListColumns({ columns }) {
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)

  const [openNewColumnFrom, setOpenNewColumnFrom] = useState(false)
  const toggleOpenNewColumnFrom = () => setOpenNewColumnFrom(!openNewColumnFrom)

  const [newColumnTitle, setNewColumnTitle] = useState('')

  const addNewColumn = async () => {
    if (!newColumnTitle) {
      toast.error('please enter column Title')
      return
    }

    // Tạo dữ liệu column để gọi API
    const newColumnData = {
      title: newColumnTitle
    }
    // Func này có nhiệm gọi APi tạo mới card và làm lại dữ liệu state Board
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

    /**
         * Đoạn này sẽ dính lỗi object is not extensible bởi dù đã copy/clone ra giá trị newBoard nhưng bản chất
         * spread operator là shallow copy/Clone, nên dính phải rule Immutability trong Redux toolkit không dùng được hàm push
         * ( sửa giá trị mảng trực tiếp), cách đơn giản nhanh gọn nhất ở trường hợp này của chúng ta là dùng tời Deep copy/Clone
         * toàn bộ cái Board cho dễ hiểu là code ngắn hơn
         */
    //const newBoard = { ...board }
    // const newBoard = cloneDeep(board)
    // newBoard.columns.push(createdColumn)
    // newBoard.columnOrderIds.push(createdColumn._id)

    /**
         * Ngoài ra có một cách nữa là vẫn có thể dùng array.concat thay cho push như docs của Redux ToolKit ở trên vì
         * push như đã nói nó sẽ thay đổi giá trị mảng trực tiếp, còn thằng concat thì nó chỉ merge - ghép mảng lại
         * và tạo ra một mảng mới để chúng ta gán lại giá trị nên không vấn đề gì.
         */
    const newBoard = { ...board }
    newBoard.columns = newBoard.columns.concat([createdColumn])
    newBoard.columnOrderIds = newBoard.columnOrderIds.concat([createdColumn._id])

    // Cập nhập dữ liệu Board vào trong Redux store
    dispatch(updateCurrentActiveBoard(newBoard))

    // Đóng lại trạng thái thêm column mới và clear Input
    toggleOpenNewColumnFrom()
    setNewColumnTitle('')
  }
  return (
    <SortableContext items={columns?.map(c => c._id)} strategy={horizontalListSortingStrategy} >
      <Box sx={{
        bgcolor: 'inherit',
        width: '100%',
        height: '100%',
        display: 'flex',
        overflowX: 'auto',
        overflowY: 'hidden',
        '&::-webkit-scrollbar-track': { m :2 }
      }}>
        {columns?.map(column =>
          <Colunm key={column._id} column={column} />)}
        {/* { Add New Column } */}
        {!openNewColumnFrom
          ? <Box onClick={toggleOpenNewColumnFrom} sx={{
            minWidth: '250px',
            maxWidth: '250px',
            mx: 2,
            borderRadius: '6px',
            height: 'fit-content',
            bgcolor: '#ffffff3d'
          }}>
            <Button
              startIcon={<NoteAddIcon />}
              sx={{
                color: 'white',
                width: '100%',
                justifyContent: 'flex-start',
                pl: 2.5,
                py: 1
              }}
            >
            Add New Column
            </Button>
          </Box>
          : <Box sx = {{
            minWidth: '250px',
            maxWidth: '250px',
            mx: 2,
            p: 1,
            borderRadius: '6px',
            height: 'fit-content',
            bgcolor: '#ffffff3d',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}>
            <TextField
              label="Enter column title..."
              type="text"
              size="small"
              variant='outlined'
              autoFocus
              value={newColumnTitle}
              onChange={ (e) => setNewColumnTitle(e.target.value) }
              sx={{
                '& label': { color: 'white' },
                '& input': { color: 'white' },
                '& label.Mui-focused': { color: 'white' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'white' },
                  '&:hover fieldset': { borderColor: 'white' },
                  '&:Mui-focused fieldset': { borderColor: 'white' }
                }
              }}
            />
            <Box sx={{ display: 'flex', alignItems:'center', gap:1 }} >
              <Button
                onClick={addNewColumn}
                variant='contained'color='success' size='small'
                sx={{
                  boxShadow:'none',
                  border:'0.5px solid',
                  borderColor: (theme) => theme.palette.success.main,
                  '&:hover': { bgcolor: (theme) => theme.palette.success.light }
                }}
              >Add Column</Button>
              <CloseIcon
                fontSize='small'
                sx={{
                  color: 'white',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: (theme) => theme.palette.warning.light }
                }}
                onClick= {toggleOpenNewColumnFrom}
              />
            </Box>
          </Box>
        }
      </Box>
    </SortableContext>
  )
}

export default ListColumns
