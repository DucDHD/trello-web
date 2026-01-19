import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'
import {
  DndContext,
  // PointerSensor,
  // MouseSensor,
  // TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  // closestCenter,
  pointerWithin,
  // rectIntersection,
  getFirstCollision

} from '@dnd-kit/core'

import { MouseSensor, TouchSensor } from '~/customLibraries/dnd-kit-sensers'
import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState, useCallback, useRef } from 'react'
import { cloneDeep, isEmpty } from 'lodash'
import Column from './ListColumns/Column/Colunm'
import Card from './ListColumns/Column/ListCards/Card/Card'
import { generatePlaceHolderCard } from '~/utils/formatters'

const APP_BAR_HEIGHT = '58px'
const BOARD_BAR_HEIGHT = '60px'
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`

const ACTIVE_DRAG_ITEM_STYLE = {
  COLUMN : 'ACTIVE_DRAG_ITEM_STYLE_COLUMN',
  CARD : 'ACTIVE_DRAG_ITEM_STYLE_CARD'
}

function BoardContent({ board }) {

  //const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })
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
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState([])

  //  Điểm va chạm cuối cùng trước đó ( xử lý thuật toán phát hiện va chạm video 37)
  const lastOverId = useRef(null)

  useEffect (() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])


  // Tìm 1 cái column theoc cardId
  const findColumnByCardId = (cardId) => {
    // Đoạn này cần lưu ý, nên dùng c.cards thay vì c.cardOrderIds bởi vì ở bước handleDragOver chúng ta sẽ
    // làm giữ liệu cho card hoàn chỉnh trước rồi mới tạo ra cardOrderIds mới
    return orderedColumns.find(column => column?.cards?.map(card => card._id)?.includes(cardId))

  }
  // Function chung xử lý Cập nhập lại state trong trường hợp di chuyển card giữa các Column khác nhau
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData

  ) => {
    setOrderedColumns(prevColumns => {
      // Tìm vị trí (index) của cái overCard trong column đích ( nơi mà active card sắp được thả )
      const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId )
      // Logic tính toán "CardId" mới (Trên hoặc dưới của overCardId) lấy chuẩn ra từ code của thư viện
      let newCardIndex
      const isBelowOverItem = active.rect.current.translated &&
      active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0
      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1
      // Clone mảng orderedColumnsState cũ ra một cái mới để xử lý data rồi return - cập nhập lại orderedColumnsState mới
      const nextColumns = cloneDeep(prevColumns)
      const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
      const nextOverColunn = nextColumns.find(column => column._id === overColumn._id)

      //nextActiveColumn: column cũ
      if (nextActiveColumn) {
        // Xóa Card ở column active (cũng có thể hiểu là column cũ, cái lúc mà kéo card ra khỏi nó để sang column khác)
        nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)

        // Thêm placeholder card nếu column bị rỗng: Bị kéo hết card đi, không còn cái nào nữa (video 37.2)
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceHolderCard(nextActiveColumn)]
        }

        // Cập nhập lại mảng cardOrderIds cho chuẩn dữ liệu
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }
      //nextOverColunn: column mới
      if ( nextOverColunn) {
        // Kiểm tra xem card đang kéo có tồn tại ở overColumn hay chưa, nếu có thì cần xóa nó trước đi
        nextOverColunn.cards = nextOverColunn.cards.filter(card => card._id !== activeDraggingCardId)
        //  Phải cập nhập lại chuẩn dữ liệu columnId trong card sau khi kéo thả card giữa 2 colunm khác nhau
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColunn._id
        }
        // Tiếp theo  là thêm cái card đang kéo vào overColumn theo vị trí index mới
        nextOverColunn.cards = nextOverColunn.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData)

        // Xóa placeholder-card đi nếu nó đang tồn tại (video 37.2)
        nextOverColunn.cards = nextOverColunn.cards.filter(card => !card.FE_placeholderCard)
        // Cập nhập lại mảng cardOrderIds cho chuẩn dữ liệu
        nextOverColunn.cardOrderIds = nextOverColunn.cards.map(card => card._id)
      }
      return nextColumns
    })
  }

  // Trigger Khi bắt đầu hành động kéo 1 phần tử => hành động kéo (drag)
  const handleDragStart = (event) => {
    // console.log('handleDragStart', event)
    setActiveDragItemId(event?.active?.id)
    SetActiveDragItemStyle(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_STYLE.CARD : ACTIVE_DRAG_ITEM_STYLE.COLUMN)
    SetActiveDragItemData(event?.active?.data?.current)

    //  Nếu là kéo card thì mới thực hiện những hành động set giá trị oldColumn
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
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
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData
      )
    }
  }

  // Trigger Khi kết thúc hành động kéo 1 phần tử => hành động thả (drog)
  const handleDragEnd = (event) => {
  //  console.log('handleDragEnd', event)

    const { active, over } = event
    // Cần đảm bảo nếu không tồn tại active hoặc over (khi kéo thả ra khỏi phạm vi container) thì không làm gì (tránh crash trang)
    if (!active || !over) return

    // Xử lý kéo thả cards
    if (activeDragItemStyle === ACTIVE_DRAG_ITEM_STYLE.CARD ) {
      //console.log('hành động kéo thả card tạm thời: ', event)
      // Cần đảm bảo nếu không tồn tại active hoặc over (khi kéo thả ra khỏi phạm vi container) thì không làm gì (tránh crash trang)
      // activeDraggingCard : là cái card chúng ta đang được kéo
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      // overCard: là cái chúng ta tương tác trên hoặc dưới so với card được kéo ở trên
      const { id : overCardId } = over

      // Tìm 2 cái columns theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      // Nếu không tồn tại 1 trong 2 columns thì không làm gì hết, tránh crash trang
      if (!activeColumn || !overColumn ) return

      // hành động kéo thả card giữa 2 column khác nhau
      // Phải dùng tới activeDragItemData.columnId hoặc oldColumnWhenDraggingCard (set vào state từ bước handleStart) chứ không phải activeData
      // Trong scope handleDragEnd này vì sau khi đi qua onDragOver tới đây là state của card bị cập nhập một lần rồi.
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData
        )
      } else {
        // Hành động kéo thả card trong cùng một column

        // lấy vị trí cũ (từ thằng oldColumnWhenDraggingCard)
        const oldCardIndex = oldColumnWhenDraggingCard?.cards.findIndex( c => c._id === activeDragItemId )
        // lấy vị trí mới (từ thằng overColumn)
        const newCardIndex = overColumn?.cards.findIndex( c => c._id === overCardId )

        // Dùng  arrayMove vì chúng ta kéo card trong một cái column thì tương tự với logic kéo column trong một cái board content
        const dndOrderedCard = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)

        setOrderedColumns(prevColumns => {
          // Clone mảng orderedColumnsState cũ ra một cái mới để xử lý data rồi return - cập nhập lại orderedColumnsState mới
          const nextColumns = cloneDeep(prevColumns)

          // Tìm tới cái column mà chúng ta đang thả
          const targerColumn = nextColumns.find( column => column._id === overColumn._id )
          // Cập nhập lại 2 giá trị mới là card và cardOrderIds trong cái targetColumn
          targerColumn.cards = dndOrderedCard
          targerColumn.cardOrderIds = dndOrderedCard.map( card => card._id )

          // Trả về giá trị state mới chuẩn vị trí
          return nextColumns
        })
      }

    }

    // Xử lý kéo thả colums trong 1 cái boardContent
    if (activeDragItemStyle === ACTIVE_DRAG_ITEM_STYLE.COLUMN ) {
      // Nếu vị trí sau khi kéo thả khác với vị trí ban đầu
      if (active.id !== over.id) {
        // lấy vị trí cũ (từ thằng active)
        const oldColumnIndex = orderedColumns.findIndex( c => c._id === active.id )
        // lấy vị trí mới (từ thằng over)
        const newColumnIndex = orderedColumns.findIndex( c => c._id === over.id )
        // Dùng  arrayMove của thằng dnd-kit để sắp xếp lại lại columns ban đầu
        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)
        // 2 cái console.log dữ liệu này để sau này  dùng để gọi API
        // const dndOrderedColumnsIds = dndOrderedColumns.map( c => c._id)
        // console.log('dndOrderedColumns', dndOrderedColumns)
        // console.log('dndOrderedColumnsIds', dndOrderedColumnsIds)

        // Cập nhập lại state columns ban đầu sau khi đã kéo thả
        setOrderedColumns(dndOrderedColumns)
      }
    }

    // Những dữ liệu sau khi kéo thả này luôn phải đưa về giá trị null mặc định ban đầu
    setActiveDragItemId(null)
    SetActiveDragItemStyle(null)
    SetActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }


  // Animation khi thả (Drop) phần từ - Test bằng cách kéo xon thả trực tiếp và nhìn phần tử giữ chỗ Overlay (video 32)
  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } })
  }

  // args = arguments = Các đối số tham số
  const collisionDetectionStrategy = useCallback((args) => {
    // trường hợp kéo column thì dùng thuật toán closestCenter là chuẩn nhất
    if (activeDragItemStyle === ACTIVE_DRAG_ITEM_STYLE.COLUMN) {
      return closestCorners({ ...args })
    }
    // Tìm các điểm giao nhau, va chạm Intersections với con trỏ
    const pointerIntersections = pointerWithin(args)

    // video 37.1 : Nếu pointerIntersections là mảng rỗng, return luông không làm gì.
    // Fix triệt để cái bug flickering của thư viện Dnd-kit trong trường hợp sau:
    // - Kéo thả một cái card có Image cover lớn và kéo lên phía trên cùng ra khỏi khu vực kéo thả
    if ( !pointerIntersections?.length) return
    // Thuận toán phát hiện va chạm sẽ trả về một mảng các va chạm ở đây
    // const intersections = !!pointerIntersections?.length
    //   ? pointerIntersections
    //   : rectIntersection(args)

    // Tìm overId đầu tiền của đám intersections ở trên
    let overId = getFirstCollision(pointerIntersections, 'id')
    if (overId) {
      // Video 37: đoạn này để fix cái vụ flickering nhé.
      // Nếu cái over nó là column thì sẽ tím tới cái cardId gần nhất bên trong khu vực va chạm đó dựa vào
      // Thuật toán phát hiện va chạm closestCenter hoặc closestCorners đều được. Tuy nhiên ở đây dùng closestCorners thì mượt mà hơn

      const checkColumn = orderedColumns.find( column => column._id === overId)
      if ( checkColumn ) {
        overId = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return (container.id !== overId) && (checkColumn?.cardOrderIds?.includes(container.id) )
          })
        })[0]?.id
      }

      lastOverId.current = overId
      return [{ id: overId }]
    }
    // Nếu overId là null thì trả về mảng rỗng - tránh bug crash trang
    return lastOverId.current ? [{ id: lastOverId.current }] : []

  }, [activeDragItemStyle, orderedColumns])

  return (
    <DndContext
      // cảm biến (video 30)
      sensors={sensors}
      // Thuật toán phát hiện va chạm (nếu không có nó thì card với cover lớn sẽ không kéo qua column được vì lúc này)
      // Nó đang bị conflict giữa card và column), chúng ta sẽ dùng clossetCorners thay vì clossetCenter (video 34)
      //collisionDetection={closestCorners}
      // Update video 37: nếu chỉ dùng closestCorners sẽ có bug flickering + sai lệch dữ liệu

      // Tự custom nâng cao thuật toán va chạm (video fix bug số 37)
      collisionDetection={collisionDetectionStrategy}
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
