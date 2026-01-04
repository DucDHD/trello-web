import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'
import {
  DndContext,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners

} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'
import { cloneDeep } from 'lodash'
import Column from './ListColumns/Column/Colunm'
import Card from './ListColumns/Column/ListCards/Card/Card'

const APP_BAR_HEIGHT = '58px'
const BOARD_BAR_HEIGHT = '60px'
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`

const ACTIVE_DRAG_ITEM_STYLE = {
  COLUMN : 'ACTIVE_DRAG_ITEM_STYLE_COLUMN',
  CARD : 'ACTIVE_DRAG_ITEM_STYLE_CARD'
}

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
  // cùng một thời điểm chỉ có một phần tử đang được kéo [column] hoặc [card]
  const [activeDragItemId, setActiveDragItemId] = useState([])
  const [activeDragItemStyle, SetActiveDragItemStyle] = useState([])
  const [activeDragItemData, SetActiveDragItemData] = useState([])

  useEffect (() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])


  // Tìm 1 cái column theoc cardId
  const findColumnByCardId = (cardId) => {
    // Đoạn này cần lưu ý, nên dùng c.cards thay vì c.cardOrderIds bởi vì ở bước handleDragOver chúng ta sẽ
    // làm giữ liệu cho card hoàn chỉnh trước rồi mới tạo ra cardOrderIds mới
    return orderedColumns.find(column => column?.cards?.map(card => card._id)?.includes(cardId))

  }

  // Trigger Khi bắt đầu hành động kéo 1 phần tử => hành động kéo (drag)
  const handleDragStart = (event) => {
    // console.log('handleDragStart', event)
    setActiveDragItemId(event?.active?.id)
    SetActiveDragItemStyle(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_STYLE.CARD : ACTIVE_DRAG_ITEM_STYLE.COLUMN)
    SetActiveDragItemData(event?.active?.data?.current)
  }

  // Trigger trong quá trình kéo (drag) một phần tử
  const handleDragOver = (event) => {
    // không làm gì thêm nếu như kéo column
    if (activeDragItemStyle === ACTIVE_DRAG_ITEM_STYLE.COLUMN ) return
    // còn nếu kéo card thì xử lí thêm để có thể kéo card qua lại giữa các column
    // console.log('handleDragOver', event)

    const { active, over } = event
    // Cần đảm bảo nếu không tồn tại active hoặc over (khi kéo thả ra khỏi phạm vi container) thì không làm gì (tránh crash trang)
    if (!active || !over) return

    // activeDraggingCard : là cái card chúng ta đang được kéo
    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    // overCard: là cái chúng ta tương tác trên hoặc dưới so với card được kéo ở trên
    const { id : overCardId } = over

    // Tìm 2 cái columns theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    // Nếu không tồn tại 1 trong 2 columns thì không làm gì hết, tránh crash trang
    if (!activeColumn || !overColumn ) return


    // Xử lý logic ở đây chỉ khi kéo card qua 2 column khác nhau, còn nếu kéo card trong chính column ban đầu của nó thì không làm gì
    // Vì đây đang là đoạn xử lý lúc kéo (handleDragOver), còn xử lý lúc kéo xong xuôi thì nó lại là vấn đề khác ở (handleDragEnd)
    if (activeColumn._id !== overColumn._id) {
      setOrderedColumns(prevColumns => {
        // Tìm vị trí (index) của cái overCard trong column đích ( nơi mà active card sắp được thả )
        const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId )
        // Logic tính toán "CardId" mới (Trên hoặc dưới của overCardId) lấy chuẩn ra từ code của thư viện
        let newCardIndex
        const isBelowOverItem = active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height
        const modifier = isBelowOverItem ? 1 : 0
        newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1
        const nextColumns = cloneDeep(prevColumns)
        const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
        const nextOverColunn = nextColumns.find(column => column._id === overColumn._id)

        //nextActiveColumn: column cũ
        if (nextActiveColumn) {
          // Xóa Card ở column active (cũng có thể hiểu là column cũ, cái lúc mà kéo card ra khỏi nó để sang column khác)
          nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)
          // Cập nhập lại mảng cardOrderIds cho chuẩn dữ liệu
          nextActiveColumn.cardOderIds = nextActiveColumn.cards.map(card => card._id)
        }
        //nextOverColunn: column mới
        if ( nextOverColunn) {
          // Kiểm tra xem card đang kéo có tồn tại ở overColumn hay chưa, nếu có thì cần xóa nó trước đi
          nextOverColunn.cards = nextOverColunn.cards.filter(card => card._id !== activeDraggingCardId)
          // Tiếp theo  là thêm cái card đang kéo vào overColumn theo vị trí index mới
          nextOverColunn.cards = nextOverColunn.cards.toSpliced(newCardIndex, 0, activeDraggingCardData)
          // Cập nhập lại mảng cardOrderIds cho chuẩn dữ liệu
          nextOverColunn.cardOderIds = nextOverColunn.cards.map(card => card._id)
        }
        return nextColumns
      })
    }
  }

  // Trigger Khi kết thúc hành động kéo 1 phần tử => hành động thả (drog)
  const handleDragEnd = (event) => {
  //  console.log('handleDragEnd', event)

    if (activeDragItemStyle === ACTIVE_DRAG_ITEM_STYLE.CARD ) {
    //  console.log('hành động kéo thả card tạm thời', event)
      return
    }

    const { active, over } = event
    // Cần đảm bảo nếu không tồn tại active hoặc over (khi kéo thả ra khỏi phạm vi container) thì không làm gì (tránh crash trang)
    if (!active || !over) return

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
    setActiveDragItemId(null)
    SetActiveDragItemStyle(null)
    SetActiveDragItemData(null)
  }


  // Animation khi thả (Drop) phần từ - Test bằng cách kéo xon thả trực tiếp và nhìn phần tử giữ chỗ Overlay (video 32)
  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } })
  }


  return (
    <DndContext
      // cảm biến (video 30)
      sensors={sensors}
      // Thuật toán phát hiện va chạm (nếu không có nó thì card với cover lớn sẽ không kéo qua column được vì lúc này)
      // Nó đang bị conflict giữa card và column), chúng ta sẽ dùng clossetCorners thay vì clossetCenter (video 34)
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ?'#34495e' : '#1976d2' ),
        width: '100%',
        height: BOARD_CONTENT_HEIGHT,
        p: '10px 0'
      }}>
        <ListColumns columns={orderedColumns} />
        <DragOverlay dropAnimation={customDropAnimation}>
          {(!activeDragItemStyle) && null}
          {(activeDragItemStyle === ACTIVE_DRAG_ITEM_STYLE.COLUMN) && <Column column={activeDragItemData} />}
          {(activeDragItemStyle === ACTIVE_DRAG_ITEM_STYLE.CARD) && <Card card={activeDragItemData} />}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent
