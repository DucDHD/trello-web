import { useState } from 'react'
import { toast } from 'react-toastify'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ContentCut from '@mui/icons-material/ContentCut'
import ContentCopy from '@mui/icons-material/ContentCopy'
import ContentPaste from '@mui/icons-material/ContentPaste'
import Cloud from '@mui/icons-material/Cloud'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Tooltip from '@mui/material/Tooltip'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import AddCardIcon from '@mui/icons-material/AddCard'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import theme from '~/theme'
import ListCards from './ListCards/ListCards'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'
import { useConfirm } from 'material-ui-confirm'
import { createNewCardAPI, deleteColumnDetailsAPI, updateColumnDetailsAPI } from '~/apis'
import {
  updateCurrentActiveBoard,
  selectCurrentActiveBoard
} from '~/redux/activeBoard/activeBoardSlice'
import { useDispatch, useSelector } from 'react-redux'
import { cloneDeep } from 'lodash'
import ToggleFocusInput from '~/components/Form/ToggleFocusInput'

const APP_BAR_HEIGHT = '58px'
const BOARD_BAR_HEIGHT = '60px'
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`
const COLUMN_HEADER_HEIGHT = '50px'
const COLUMN_FOOTER_HEIGHT = '56px'


function Colunm( { column } ) {

  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column._id,
    data: { ...column }
  })
  const dndKitColumnStyles= {
    //touchAction: 'none', // Dánh cho sensor defaul dạng poiter sensor
    transform: CSS.Translate.toString(transform),
    transition,
    // Chiều cao phải luôn max 100% vì nếu không sẽ lỗi lúc kéo column ngắn quá một cái column dài thì phải kéo
    // ở khu vực giữa giữa rất khó chịu ( demo video 32) lưu ở lúc này phải kết hợp với {...listeners} tại <Box>
    // chứ không phải ở dev ngoài cùng để tránh trường hợp kéo vào vùng xanh.
    height: '100%',
    opacity: isDragging ? 0.5 :undefined
  }

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => { setAnchorEl(event.currentTarget) }
  const handleClose = () => { setAnchorEl(null) }
  const orderedCards = column.cards

  const [openNewCardFrom, setOpenNewcardFrom] = useState(false)
  const toggleOpenNewcardFrom = () => setOpenNewcardFrom(!openNewCardFrom)

  const [newCardTitle, setNewCardTitle] = useState('')

  const addNewCard = async () => {
    if (!newCardTitle) {
      toast.error('Please Enter Card Title', {
        position: 'bottom-right'
      })
      return
    }

    // Tạo dữ liệu card để gọi API
    const newCardData = {
      title: newCardTitle,
      columnId: column._id
    }
    // Func này có nhiệm gọi APi tạo mới card và làm lại dữ liệu state Board
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
    //const newBoard = { ...board }
    // Tương tự hàm createNewColumn nên chỗ này dùng cloneDeep
    const newBoard = cloneDeep(board)
    const columnnToUpdate = newBoard.columns.find( column => column._id === createdCard.columnId )
    if (columnnToUpdate) {
      if (columnnToUpdate.cards.some(card => card.FE_placeholderCard)) {
        columnnToUpdate.cards = [createdCard]
        columnnToUpdate.cardOrderIds = [createdCard._id]
      } else {
        columnnToUpdate.cards.push(createdCard)
        columnnToUpdate.cardOrderIds.push(createdCard._id)
      }
    }
    //setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))

    // Đóng lại trạng thái thêm column mới và clear Input
    toggleOpenNewcardFrom()
    setNewCardTitle('')
  }

  const confirmDeleteColumn = useConfirm()

  //Xóa một column và cards bên trong nó
  const handleDeleteColumn = () => {
    confirmDeleteColumn ({
      title: 'Delete Column?',
      description: 'this action will permanently delete your column and its Cards ! Are you sure?',
      confirmationText:'Confirm',
      cancellationText: 'Cancel'

      // allowClose: false,
      // dialogProps: { maxWidth: 'xs' },
      // confirmationButtonProps: { color: 'secondary', variant:'outlined' },
      // cancellationButtonProps: { color:'inherit' }


      // confirmationKeyword: 'DucDHDev',
      // description: 'this action will permanently delete your column and its Cards ! Are you sure?'
    })
      .then(() => {
        // Update cho chuẩn dữ liệu state board
        /**
         * Tương tự xử lý chỗ moveColumn bên trên nên không ảnh hưởng Redux ToolKit Immubility gì ở đây
         */
        const newBoard = { ...board }
        newBoard.columns = newBoard.columns.filter(c => c._id !== column._id )
        newBoard.columnOrderIds = newBoard.columnOrderIds.filter(_id => _id !== column._id)
        //setBoard(newBoard)
        dispatch(updateCurrentActiveBoard(newBoard))
        // Gọi API xử lý phía BE
        deleteColumnDetailsAPI(column._id).then( res => {
          toast.success(res?.deleteResult)
        })
      })
      .catch( () => { } )
  }

  const onUpdateColumnTitle = (newTitle) => {
    // Gọi API update Column và xử lý dữ liệu board trong redux
    updateColumnDetailsAPI(column._id, { title: newTitle }).then(() => {
      const newBoard = cloneDeep(board)
      const columnnToUpdate = newBoard.columns.find( c => c._id === column._id)
      if (columnnToUpdate) {
        columnnToUpdate.title = newTitle
      }
      //setBoard(newBoard)
      dispatch(updateCurrentActiveBoard(newBoard))
    })
  }

  return (
    // Phải bọc div ở đây vì vấn để chiều cao của column khi kéo thả sẽ có bug kiểu kiểu flickering (demo video 32)
    <div ref={setNodeRef} style={dndKitColumnStyles} {...attributes} >
      <Box {...listeners}
        sx={{
          minWidth: '300px',
          maxWidth: '300px',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ?'#333643' : '#ebecf0' ),
          ml: 2,
          borderRadius: '6px',
          height: 'fit-content',
          maxHeight:  `calc(${BOARD_CONTENT_HEIGHT} - ${theme.spacing(5)})`
        }}>
        {/* {Box colunm header} */}
        <Box sx={{
          height: COLUMN_HEADER_HEIGHT,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <ToggleFocusInput
            value={column?.title}
            onChangedValue={ onUpdateColumnTitle }
            data-no-dnd="True"
          />
          <Box>
            <Tooltip title="More options" >
              <ExpandMoreIcon
                sx={{ color: 'text.primary', cursor: 'pointer' }}
                id="basic-colunm-dropdown"
                aria-controls={open ? 'basic-menu-colunm-dropdown' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
              />
            </Tooltip>
            <Menu
              id="basic-menu-colunm-dropdown"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-colunm-dropdown'
              }}
            >
              <MenuItem
                onClick={toggleOpenNewcardFrom}
                sx={{
                  '&:hover': {
                    color: 'success.light',
                    '& .add-card-icon': { color: 'success.light' }
                  }
                }}
              >
                <ListItemIcon> <AddCardIcon className="add-card-icon" fontSize="small" /></ListItemIcon>
                <ListItemText>Add new card</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon> <ContentCut fontSize="small" /></ListItemIcon>
                <ListItemText>Cut</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon> <ContentCopy fontSize="small" /></ListItemIcon>
                <ListItemText>Copy</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon> <ContentPaste fontSize="small" /></ListItemIcon>
                <ListItemText>Paste</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={handleDeleteColumn}
                sx={{
                  '&:hover': {
                    color: 'warning.dark',
                    '& .delete-forever-icon': { color: 'warning.dark' }
                  }
                }}
              >
                <ListItemIcon><DeleteForeverIcon className ='delete-forever-icon' fontSize="small" /></ListItemIcon>
                <ListItemText>Delete this column</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon><Cloud fontSize="small" /></ListItemIcon>
                <ListItemText>Archive this column</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        {/* {Box colunm list Card} */}
        <ListCards cards={orderedCards} />
        {/* {Box colunm list Footer} */}
        <Box sx={{
          height: COLUMN_FOOTER_HEIGHT,
          p:2
        }}>
          { !openNewCardFrom
            ? <Box sx ={{
              height:'100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent:'space-between'
            }}>
              <Button startIcon={<AddCardIcon />} onClick={toggleOpenNewcardFrom} > Add new card </Button>
              <Tooltip title="Drag to move">
                <DragHandleIcon sx={{ cursor:'pointer' }}/>
              </Tooltip>
            </Box>
            : <Box sx={{
              height:'100%',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <TextField
                label="Enter Card title..."
                type="text"
                size="small"
                variant='outlined'
                autoFocus
                data-no-dnd="True"
                value={newCardTitle}
                onChange={ (e) => setNewCardTitle(e.target.value) }
                sx={{
                  '& label': { color: 'text.primary' },
                  '& input': {
                    color: (theme) => theme.palette.primary.main,
                    bdcolor: (theme) => (theme.palette.mode === 'dark' ? '#333643' : 'white')
                  },
                  '& label.Mui-focused': { color: (theme) => theme.palette.primary.main },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor:  (theme) => theme.palette.primary.main },
                    '&:hover fieldset': { borderColor:  (theme) => theme.palette.primary.main },
                    '&:Mui-focused fieldset': { borderColor:  (theme) => theme.palette.primary.main }
                  },
                  '& .MuiOutlinedInput-input' : { borderRadius: 1 }
                }}
              />
              <Box sx={{ display: 'flex', alignItems:'center', gap:1 }} >
                <Button
                  className="interceptor-loading"
                  data-no-dnd="True"
                  onClick={addNewCard}
                  variant='contained'color='success' size='small'
                  sx={{
                    boxShadow:'none',
                    border:'0.5px solid',
                    borderColor: (theme) => theme.palette.success.main,
                    '&:hover': { bgcolor: (theme) => theme.palette.success.light }
                  }}
                >Add </Button>
                <CloseIcon
                  fontSize='small'
                  sx={{
                    color: (theme) => theme.palette.warning.light,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: (theme) => theme.palette.warning.light }
                  }}
                  onClick= {toggleOpenNewcardFrom}
                />
              </Box>
            </Box>
          }
        </Box>
      </Box>
    </div>
  )
}

export default Colunm
