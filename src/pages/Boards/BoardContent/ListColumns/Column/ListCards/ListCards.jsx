
import Box from '@mui/material/Box'
import theme from '~/theme'
import Card from './Card/Card'

const APP_BAR_HEIGHT = '58px'
const BOARD_BAR_HEIGHT = '60px'
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`
const COLUMN_HEADER_HEIGHT = '50px'
const COLUMN_FOOTER_HEIGHT = '56px'


function ListCards({ cards }) {
  return (
    <Box sx={{
      p: '0 5px',
      m: '0 5px',
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      overflowX: 'hidden',
      overflowY: 'auto',
      maxHeight: `calc(
            ${BOARD_CONTENT_HEIGHT} - 
            ${theme.spacing(5)} -
            ${COLUMN_HEADER_HEIGHT} -
            ${COLUMN_FOOTER_HEIGHT}
        )`,
      '&::-webkit-scrollbar-thumb': { backgroundColor: '#ced0da' },
      '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#bfc2cf' }
    }}>
      { cards?.map( card => <Card key={card._id} card={card} /> ) }
    </Box>
  )
}

export default ListCards
