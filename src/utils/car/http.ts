import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { useStoreLink } from '@/store/link'

declare module 'axios' {
  export interface AxiosInstance {
    <T = any>(config: AxiosRequestConfig): Promise<T>

    request<T = any>(config: AxiosRequestConfig): Promise<T>

    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>

    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>

    head<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>

    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>

    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>

    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
  }
}

const Http = axios.create({
  timeout: 1000,
})
Http.interceptors.response.use(async (res: AxiosResponse) => {
  if (res.status !== 200) {
    return Promise.reject(res)
  }
  return res.data
})
export default Http
