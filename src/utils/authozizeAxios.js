import axios from 'axios'
import { toast } from 'react-toastify'
import { interceptorLoadingElements } from '~/utils/formatters'
import { refreshTokenAPI } from '~/apis'
import { logoutUserAPI } from '~/redux/user/userSlice'

/**
 * Không thể import { store } from '~/redux/store' theo cách thông thường ở đây
 * Giải pháp: Inject store: là kỹ thuật khi cần sử dụng biến redux store ở các file ngoài phạm vị component như file authozizeAxios.js hiện tại
 * Hiểu đơn giản: Khi ứng dụng bắt đầu chạy lên, code sẽ chạy vào main.jsx đầu tiên, từ bên đó chúng ta gọi hàm InjectStore ngay lập tức để gán biến
 * mainStore vào biến axiosReduxStore cục bộ trong file này
 * https://redux.js.org/faq/code-structure#how-can-i-use-the-redux-store-in-non-component-files
 */
let axiosReduxStore
export const injectStore = mainStore => {
  axiosReduxStore = mainStore
}

// Khởi tạo một đối tượng axios (authorizeAxiosInstance) mục đích để cấu hình chung cho dự án
let authorizeAxiosInstance = axios.create()
// Thời gian chờ tối đa của 1 request: để 10 phút
authorizeAxiosInstance.defaults.timeout = 1000 * 60 * 10

// withCredentials: Sẽ cho phép axios tự động gửi cookie trong mỗi request lên BE (Phục vụ việc chúng ta sẽ lưu JWT token ( refresh và access )
// vào trong httpOnly Cookie của trình duyệt )
authorizeAxiosInstance.defaults.withCredentials = true

/**
 * Cấu hình Interceptor (Bộ đánh chặn vào giữa mọi request & response)
 * https://axios-http.com/docs/interceptors
 */

// Interceptor request : can thiệp vào giữa những cái request api
authorizeAxiosInstance.interceptors.request.use( (config) => {
  // Kỹ thuận chặn spam click (xem kỹ mô tả ở file formatters.js chứa function interceptorLoadingElements)
  interceptorLoadingElements(true)
  return config
}, (error) => {
  // Do something with request error
  return Promise.reject(error)
}
)

// khởi tạo một cái Promise cho việc gọi api refresh_token
// Mục đính tạo Promise này để khi nào gọi api refresh_token xong xuôi thì mới retry lại nhiều api bị lỗi trước đó.
// https://www.thedutchlab.com/en/insights/using-axios-interceptors-for-refreshing-your-api-token

let refreshTokenPromise = null

// Interceptor response : can thiệp vào giữa những cái response nhận về
authorizeAxiosInstance.interceptors.response.use((response) => {
  // Kỹ thuận chặn spam click (xem kỹ mô tả ở file formatters.js chứa function interceptorLoadingElements)
  interceptorLoadingElements(false)
  return response
}, (error) => {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  /** Mội mã http status code nằm ngoài 200 - 299 sẽ là error rơi vào đây */
  // Kỹ thuận chặn spam click (xem kỹ mô tả ở file formatters.js chứa function interceptorLoadingElements)
  interceptorLoadingElements(false)

  /** Quan trọng : xử lý refresh Token tự động */
  // Trường hợp 1: Nếu như nhận mã 401 từ BE, thì gọi api đăng xuất luôn
  if (error.response?.status === 401) {
    axiosReduxStore.dispatch(logoutUserAPI(false))
  }

  // Trường hợp 2: Nếu như nhận mã 410 từ BE, thì sẽ gọi api refresh token để làm mới lại accessToken
  // Đầu tiên lấy được các request API đang bị lỗi thông qua error.config
  const orginalRequests = error.config
  //console.log('🚀 ~ orginalRequests:', orginalRequests)
  if (error.response?.status === 410 && !orginalRequests._retry ) {
    // Gán thêm giá trị _retry luôn = true trong khoảng thời gian chờ, đảm bảo việc refresh token này
    // chỉ luôn gọi 1 lần tại 1 thời điểm (nhìn lại điều kiện if ngày phía trên)
    orginalRequests._retry = true

    // Kiểm tra xem nếu chưa có refreshTokenPromise thì thực hiện gán việc gọi api refresh_token
    // Đồng thời gán vào cho cái refreshTokenPromise
    if (!refreshTokenPromise) {
      refreshTokenPromise = refreshTokenAPI()
        .then(data => {
          // Đồng thời accessToken đã nằm trong httpOnly cookie xử lý từ BE
          return data?.accessToken
        })
        .catch((_error) => {
          // Nếu nhận bất kỳ lỗi nào từ api refresh token thì cứ logout luôn
          axiosReduxStore.dispatch(logoutUserAPI(false))
          return Promise.reject(_error)
        } )
        .finally(() => {
          // Dù API có thành công hay không thì vấn luôn gán lại giá trị cái refreshTokenPromise về null như ban đầu
          refreshTokenPromise = null
        })
    }
    // Cần return trường hợp refreshTokenPromise chạy thành công và xử lý thêm ở đây
    // eslint-disable-next-line no-unused-vars
    return refreshTokenPromise.then(accessToken => {
      /**
       * Bước 1: đối với trường hợp nếu dự án cần lưu accessToken vào localStorage hoặc đâu đó thì sẽ viết thêm code xử lý ở đây
       * Hiện tại ở đây không cần bước 1 này vì chúng ta đã đưa accessToken vào cookie (xử lý từ phía BE) sau khi api refrestToken được gọi thành công
       */

      /**
       * Bước 2: Bước quan trọng: Return lại axios instance của chúng ta đã kết hợp các orginalRequests để gọi lại nhưng api ban đầu bị lỗi
       */
      return authorizeAxiosInstance(orginalRequests)
    })
  }
  // Xử lý tập trung phần hiển thị thông báo lỗi trả về từ mọi API ở đây (Viết code một lần : Clean Code)
  // Console.error ra là sẽ thấy cấu trúc data dẫn tới message lỗi như dưới đây
  let errorMessage = error?.message
  if (error.response?.data?.message) {
    errorMessage = error.response?.data?.message
  }
  /**
   *  Dùng toastify để hiển thị bất kể mọi mã lỗi trên màn hình - Ngoài trừ mã 410 - Gone phục vụ việc tự động refresh lại token.
   */
  if (error.response?.status !== 410) {
    toast.error(errorMessage)
  }
  return Promise.reject(error)
})


export default authorizeAxiosInstance