import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'

const APP_BAR_HEIGHT = '58px'
const BOARD_BAR_HEIGHT = '60px'
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`

function BoardContent() {
  return (
    <Box sx={{
      bgcolor: (theme) => (theme.palette.mode === 'dark' ?'#34495e' : '#1976d2' ),
      width: '100%',
      height: BOARD_CONTENT_HEIGHT,
      p: '10px 0'

    }}>
      <ListColumns />
    </Box>
  )
}

export default BoardContent
