import axios from 'axios'
import { toast } from 'react-toastify'
import { interceptorLoadingElements } from '~/utils/formatters'

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