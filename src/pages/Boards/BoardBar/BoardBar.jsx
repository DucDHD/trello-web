import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterListIcon from '@mui/icons-material/FilterList'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import { Tooltip } from '@mui/material'
import Button from '@mui/material/Button'
import PersonAddIcon from '@mui/icons-material/PersonAdd'


const MENU_STYPE = {
  color: 'white',
  bgColor: 'transparent',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '& .MuiSvgIcon-root': {
    color: 'white'
  },
  '&:hover': {
    bgcolor: 'primary.50'
  }
}

function BoardBar() {
  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.trello.boardBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      paddingX: 2,
      overflowX: 'auto',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ?'#34495e' : '#1976d2' ),
    }}>
      <Box sx={{ display: ' flex', alignItems: 'center', gap: 2 }}>
        <Chip
          sx ={MENU_STYPE}
          icon={<DashboardIcon />}
          label="Learning Reactjs + Nodejs"
          //clickable
          onClick={ () => {} }
        />
        <Chip
          sx ={MENU_STYPE}
          icon={<VpnLockIcon />}
          label="Public/Private Workspace"
          //clickable
          onClick={ () => {} }
        />
        <Chip
          sx ={MENU_STYPE}
          icon={<AddToDriveIcon />}
          label="Add to Google Drive"
          //clickable
          onClick={ () => {} }
        />
        <Chip
          sx ={MENU_STYPE}
          icon={<BoltIcon />}
          label="Automation"
          //clickable
          onClick={ () => {} }
        />
        <Chip
          sx ={MENU_STYPE}
          icon={<FilterListIcon />}
          label="Filters"
          //clickable
          onClick={ () => {} }
        />
      </Box>
      <Box sx={{ display: ' flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon />}
          sx={{
            color: 'white',
            borderColor: 'white',
            '&:hover': { borderColor: 'white' }
          }}
        >
          Invite
        </Button>

        <AvatarGroup
          max={5}
          sx= {{
            gap:'10px',
            '& .MuiAvatar-root':{
              width: 34,
              height: 34,
              fontSize: 16,
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              '&:first-of-type': { bgcolor: '#a4b0be' }
            }
          }}>
          <Tooltip title="DucDH-Dev">
            <Avatar
              alt="DucDH-Dev"
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRurFbmJlO1wxuvxeLHTBxLNF8F9NxjeuYqjQ&s"
            />
          </Tooltip>
          <Tooltip title="DucDH-Dev">
            <Avatar
              alt="DucDH-Dev"
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2ajvXjysaUEH3sJbbNOkLuspQsHJQAdweKg&s"
            />
          </Tooltip>
          <Tooltip title="DucDH-Dev">
            <Avatar
              alt="DucDH-Dev"
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZLINbscG_crMN-J2-5Sw7nOPSUhQCx6mQHA&s"
            />
          </Tooltip>
          <Tooltip title="DucDH-Dev">
            <Avatar
              alt="DucDH-Dev"
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5U_ZqbG4mnA6RqrYORxJJ_6JTWwf1jqejqg&s"
            />
          </Tooltip>
          <Tooltip title="DucDH-Dev">
            <Avatar
              alt="DucDH-Dev"
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRr5UbVAim18tVM1Tfe9p-CJuvcfoYO1j_E3w&s"
            />
          </Tooltip>
          <Tooltip title="DucDH-Dev">
            <Avatar
              alt="DucDH-Dev"
              src="https://1.bp.blogspot.com/-y2r--6ROMXs/Xp5wqnzV2rI/AAAAAAAAiD0/JVtR68t8Dl8lsIBWKZk2Y5uIzlgf8vXtgCLcBGAsYHQ/s1600/Hnh-nen-one-piece-dep%2B%25284%2529.jpg"
            />
          </Tooltip>
        </AvatarGroup>
      </Box>
    </Box>

  )
}

export default BoardBar
