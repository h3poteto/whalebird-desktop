import axios, { AxiosResponse } from 'axios'
import { EventEmitter } from 'events'

class AxiosLoading extends EventEmitter {
  public requestCounter: number

  constructor() {
    super()
    this.requestCounter = 0
    this.setupRequest()
    this.setupResponse()
  }

  private setupRequest() {
    axios.interceptors.request.use(config => {
      this.requestCounter++
      this.emit('start', this.requestCounter)
      return config
    })
  }

  private setupResponse() {
    const response = (response: AxiosResponse) => {
      if (--this.requestCounter === 0) {
        this.emit('done', {})
      }
      return response
    }
    const error = (error: any) => {
      if (--this.requestCounter === 0) {
        this.emit('done', {})
      }
      return Promise.reject(error)
    }
    axios.interceptors.response.use(response, error)
  }
}

export default AxiosLoading
