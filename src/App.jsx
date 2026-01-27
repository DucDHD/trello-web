
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Board from '~/pages/Boards/_id'
import NotFound from '~/pages/404/NotFound'
import Auth from '~/pages/Auth/Auth'
import AccountVerificaion from '~/pages/Auth/AccountVerificaion'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'

/**
 * Giải pháp Clean code trong việc xác định các route nào cần đăng nhập tài khoản xong thì mới cho truy cập
 * Sử dụng <Outlet /> của react-router-dom để hiển thị các Child Route (Xem cách sử dụng trong App() bên dưới)
 * Một bài hướng dẫn khá đầy đủ
 * https://www.robinwieruch.de/react-router-private-routes/
 */
const ProtectedRoute = ({ user }) => {
  console.log(user)
  if (!user) return <Navigate to='/login' replace={true} />
  return <Outlet />
}

function App() {
  const currentUser = useSelector(selectCurrentUser)
  return (
    <Routes>
      { /** Redirect */ }
      <Route path='/' element={
        /**
         * Ở đây cần replace giá trị true để nó thay thế route '/', có thể hiểu là route '/' sẽ không còn nằm trong history của Browser
         * Thực hành dễ hiểu hơn bằng cách nhần Go Home từ trang 404 xong thử quay lại bằng nút back của trình duyệt
         * giữa 2 trường hợp có replace hoặc không
         */
        <Navigate to="boards/696f298f0d7fe9c172b118d9" replace={true} />
      } />
      {/** Protected Route ( Hiểu đơn giản trong dự án của chúng ta là những route chỉ cho truy cập sau khi đã login) */}
      <Route element={<ProtectedRoute user={currentUser} />} >
        {/** <Outlet /> của react-router-dom sẽ chạy vào các child route trong này */}
        {/* { Board Detail } */}
        <Route path='/boards/:boardId' element={ <Board />} />
      </Route>

      <Route path='/login' element={ <Auth />} />
      <Route path='/register' element={ <Auth />} />
      <Route path='/account/verification' element={ <AccountVerificaion />} />
      {/** 404 not found page */}
      <Route path="*" element={<NotFound />}/>
    </Routes>
  )
}
export default App
