// Redux : State Management tool
import { configureStore } from '@reduxjs/toolkit'
import { activeBoardReducer } from './activeBoard/activeBoardSlice'
import { userReducer } from './user/userSlice'
import { activeCardReducer } from './activeCard/activeCardSlice'
/**
 * Cấu hình redux-persist
 * https://www.npmjs.com/package/redux-persist
 * Bài viết hướng dẫn dễ hiểu hơn
 */

import { combineReducers } from 'redux' // Lưu ý: chúng ta có sẵn redux trong node_modules bởi vì khi cài @reduxjs/toolkit là đã có luôn
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaul là localstorage

// Cầu hình persist
const rootPersistConfig = {
  key: 'root', // Key của cái persist do chúng ta chỉ định, cứ để mặc định là root
  storage: storage, // Biến của storage ở trên -  lưu vào localstorage
  whitelist: ['user'], // Định nghĩa của các slice dữ liệu được phép duy trì qua mỗi lần F5 trình duyệt
  blacklist : ['activeCard'] // Định nghĩa các slice không được phép duy trì qua mỗi lần F5 trình duyệt
}

// combine các reducers trong dự án của chúng ta ở đây
const reducers = combineReducers({
  activeBoard: activeBoardReducer,
  user: userReducer,
  activeCard: activeCardReducer
})

// thực hiện persist Reducer
const persistedReducers = persistReducer(rootPersistConfig, reducers)

export const store = configureStore({
  reducer: persistedReducers,
  // Fix waring error when implement redux-persist
  middleware: (getDefaulMiddleware) => getDefaulMiddleware({ serializableCheck:false })
})

