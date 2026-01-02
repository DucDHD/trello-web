import { useState } from 'react'
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

const APP_BAR_HEIGHT = '58px'
const BOARD_BAR_HEIGHT = '60px'
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`

function Colunm() {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => { setAnchorEl(event.currentTarget) }
  const handleClose = () => { setAnchorEl(null) }
  return (
    <Box sx={{
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
        height: (theme) => theme.trello.columnHeaderHeight,
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
            Column Title
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
      <ListCards />
      {/* {Box colunm list Footer} */}
      <Box sx={{
        height: (theme) => theme.trello.columnFooterHeight,
        p:2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Button startIcon={<AddCardIcon />} > Add new card </Button>
        <Tooltip title="Drag to move">
          <DragHandleIcon sx={{ cursor:'pointer' }}/>
        </Tooltip>
      </Box>
    </Box>
  )
}

export default Colunm
