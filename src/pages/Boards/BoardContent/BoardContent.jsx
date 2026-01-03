import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'
import {
  DndContext,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors

} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

import { useEffect, useState } from 'react'

const APP_BAR_HEIGHT = '58px'
const BOARD_BAR_HEIGHT = '60px'
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`

function BoardContent({ board }) {

  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })
  // yêu cầu chuộc di chuyển 10px thì mới kích hoạt event, fix trường hợp click bị gọi event
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })
  // Nhấn giữ 250ms và dung sai của cảm ứng (dễ hiểu là di chuyển / chênh lệnh 500px) thì mới kích hoạt event
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })

  // Ưu tiên sử dụng kết hợp là mouse và touch để có trải nghiệm trên mobile tốt nhất, không bị bug
  //const sensors = useSensors(pointerSensor)
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])
  useEffect (() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])


  const handleDragEnd = (event) => {
  //  console.log('handleDragEnd', event)
    const { active, over } = event
    // Nếu không tồn tại over (Kéo linh tinh ra ngoài thì return luôn tránh lỗi)
    if (!over) return

    // Nếu vị trí sau khi kéo thả khác với vị trí ban đầu
    if (active.id !== over.id) {
      // lấy vị trí cũ (từ thằng active)
      const oldIndex = orderedColumns.findIndex( c => c._id === active.id )
      // lấy vị trí mới (từ thằng over)
      const newIndex = orderedColumns.findIndex( c => c._id === over.id )
      // Dùng  arrayMove của thằng dnd-kit để sắp xếp lại lại columns ban đầu
      const dndOrderedColumns = arrayMove(orderedColumns, oldIndex, newIndex)
      // 2 cái console.log dữ liệu này để sau này  dùng để gọi API
      // const dndOrderedColumnsIds = dndOrderedColumns.map( c => c._id)
      // console.log('dndOrderedColumns', dndOrderedColumns)
      // console.log('dndOrderedColumnsIds', dndOrderedColumnsIds)

      // Cập nhập lại state columns ban đầu sau khi đã kéo thả
      setOrderedColumns(dndOrderedColumns)
    }
  }
  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors} >
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ?'#34495e' : '#1976d2' ),
        width: '100%',
        height: BOARD_CONTENT_HEIGHT,
        p: '10px 0'
      }}>
        <ListColumns columns={orderedColumns} />
      </Box>
    </DndContext>
  )
}

export default BoardContent
