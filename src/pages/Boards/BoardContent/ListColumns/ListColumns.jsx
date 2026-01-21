import { useState } from 'react'
import { toast } from 'react-toastify'
import Box from '@mui/material/Box'
import Colunm from './Column/Colunm'
import Button from '@mui/material/Button'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'


function ListColumns({ columns, createNewColumn, createNewCard }) {

  const [openNewColumnFrom, setOpenNewColumnFrom] = useState(false)
  const toggleOpenNewColumnFrom = () => setOpenNewColumnFrom(!openNewColumnFrom)

  const [newColumnTitle, setNewColumnTitle] = useState('')

  const addNewColumn = () => {
    if (!newColumnTitle) {
      toast.error('please enter column Title')
      return
    }

    // Tạo dữ liệu column để gọi API
    const newColumnData = {
      title: newColumnTitle
    }
    /**
     * Gọi props function createNewColumn nằm ở component cha cao nhất (board/ _id.jsx)
     * Lưu ý: Về sau ở học phần MERN stack Advence nâng cao học trực tiếp mình với mình thì chúng ta đưa dữ liệu Board ra ngoài Redux Global Store
     * Và lúc này chúng ta có thể gọi luôn API ở đây là xong thày vì phải lần lượt gọi ngược lên cũng component cha phía trên.
     * (Đối với component càng sâu thì càng khổ)
     * - Với việc sử dụng redux như vậy thì code sẽ clean chuẩn chỉnh hơn rất nhiều.
     */
    createNewColumn(newColumnData)

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
        {columns?.map(column => <Colunm key={column._id} column={column} createNewCard={createNewCard} />)}
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
