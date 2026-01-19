import { useState } from 'react'
import { toast } from 'react-toastify'
import Typography from '@mui/material/Typography'
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
import { mapOrder } from '~/utils/sorts'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'


const APP_BAR_HEIGHT = '58px'
const BOARD_BAR_HEIGHT = '60px'
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`
const COLUMN_HEADER_HEIGHT = '50px'
const COLUMN_FOOTER_HEIGHT = '56px'


function Colunm( { column } ) {
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
  const orderedCards = mapOrder(column?.cards, column?.cardOrderIds, '_id')

  const [openNewCardFrom, setOpenNewcardFrom] = useState(false)
  const toggleOpenNewcardFrom = () => setOpenNewcardFrom(!openNewCardFrom)

  const [newCardTitle, setNewCardTitle] = useState('')

  const addNewCard = () => {
    if (!newCardTitle) {
      toast.error('Please Enter Card Title', {
        position: 'bottom-right'
      })
      return
    }
    //console.log(newCardTitle)

    // Gọi API...

    // Đóng lại trạng thái thêm column mới và clear Input
    toggleOpenNewcardFrom()
    setNewCardTitle('')
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
          <Typography variant='h6'
            sx={{
              fontSize: '1rem',
              fontWeight:'bold',
              cursor: 'pointer'
            }}
          >
            {column?.title}
          </Typography>
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
              MenuListProps={{
                'aria-labelledby': 'basic-colunm-dropdown'
              }}
            >
              <MenuItem>
                <ListItemIcon> <AddCardIcon fontSize="small" /></ListItemIcon>
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
              <MenuItem>
                <ListItemIcon><DeleteForeverIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Remove this column</ListItemText>
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
