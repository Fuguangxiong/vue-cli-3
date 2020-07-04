import http from 'http';
import https from 'https';
import axios, { AxiosResponse, AxiosRequestConfig, CancelTokenStatic } from 'axios';
import { Message, MessageBox } from 'element-ui';
import qs from 'qs';
//import { UserModule } from '@/store/modules/user'

class Request {
    protected baseURL: any = process.env.VUE_APP_BASE_API
    protected service: any = axios
    protected pending: Array<{
        url: string;
        cancel: Function;
    }> = []
    protected CancelToken: CancelTokenStatic = axios.CancelToken
    protected axiosRequestConfig: AxiosRequestConfig = {}
    protected successCode: Array<number> = [200, 201, 204]
    private static _instance: Request;

    constructor() {
        this.requestConfig();
        this.service = axios.create(this.axiosRequestConfig);
        this.interceptorsRequest();
        this.interceptorsResponse();
    }

    public static getInstance(): Request {
        // 如果 instance 是一个实例 直接返回，  如果不是 实例化后返回
        this._instance || (this._instance = new Request());
        return this._instance;
    }

    protected requestConfig(): void {
        this.axiosRequestConfig = {
            baseURL: this.baseURL,
            headers: {
                timestamp: new Date().getTime(),
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            transformRequest: [obj => qs.stringify(obj)],
            transformResponse: [function(data: AxiosResponse) {
                return data;
            }],
            paramsSerializer: function(params: any) {
                return qs.stringify(params, { arrayFormat: 'brackets' });
            },
            timeout: 30000,
            withCredentials: false,
            responseType: 'json',
            xsrfCookieName: 'XSRF-TOKEN',
            xsrfHeaderName: 'X-XSRF-TOKEN',
            maxRedirects: 5,
            maxContentLength: 2000,
            validateStatus: function(status: number) {
                return status >= 200 && status < 500;
            },
            httpAgent: new http.Agent({ keepAlive: true }),
            httpsAgent: new https.Agent({ keepAlive: true })
        };
    }

    protected interceptorsRequest() {
        this.service.interceptors.request.use(
            (config: any) => {
                this.removePending(config);
                config.CancelToken = new this.CancelToken((c: any) => {
                    this.pending.push({ url: `${config.url}/${JSON.stringify(config.data)}&request_type=${config.method}`, cancel: c });
                });
                // if (UserModule.token) {
                //     config.headers['authorization'] = UserModule.token
                // }
                this.requestLog(config);
                return config;
            },
            (error: any) => {
                return Promise.reject(error);
            }
        );
    }

    protected interceptorsResponse(): void {
        this.service.interceptors.response.use(
            (response: any) => {
                this.responseLog(response);
                this.removePending(response.config);
                if (this.successCode.indexOf(response.status) === -1) {
                    Message({
                        message: response.data.message || 'Error',
                        type: 'error',
                        duration: 5 * 1000
                    });
                    if (response.data.code === 401) {
                        MessageBox.confirm(
                            '你已被登出，可以取消继续留在该页面，或者重新登录',
                            '确定登出',
                            {
                                confirmButtonText: '重新登录',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }
                        ).then(() => {
                            // UserModule.ResetToken()
                            location.reload();
                        });
                    }
                    return Promise.reject(new Error(response.message || 'Error'));
                } else {
                    return response.data;
                }
            },
            (error: any) => {
                Message({
                    message: error.message,
                    type: 'error',
                    duration: 5 * 1000
                });
                return Promise.reject(error);
            }
        );
    }
//重复点击取消上一次请求 removePending
    protected removePending(config: any): void {
        for (const p in this.pending) {
            const item: any = p;
            const list: any = this.pending[p];
            if (list.url === `${config.url}/${JSON.stringify(config.data)}&request_type=${config.method}`) {
                list.cancel();
                console.log('=====', this.pending);
                this.pending.splice(item, 1);
                console.log('+++++', this.pending);
            }
        }
    }

    public async post(url: string, data: any = {}, config: object = {}) {
        try {
            const result = await this.service.post(url, qs.stringify(data), config);
            return result.data;
        } catch (error) {
            console.error(error);
        }
    }

    public async delete(url: string, config: object = {}) {
        try {
            await this.service.delete(url, config);
        } catch (error) {
            console.error(error);
        }
    }

    public async put(url: string, data: any = {}, config: object = {}) {
        try {
            await this.service.put(url, qs.stringify(data), config);
        } catch (error) {
            console.error(error);
        }
    }

    public async get(url: string, parmas: any = {}, config: object = {}) {
        try {
            await this.service.get(url, parmas, config);
        } catch (error) {
            console.error(error);
        }
    }

    protected requestLog(request: any): void {
    }

    protected responseLog(response: any): void {
        if (process.env.NODE_ENV === 'development') {
            const randomColor = `rgba(${Math.round(Math.random() * 255)},${Math.round(
                Math.random() * 255
            )},${Math.round(Math.random() * 255)})`;
            console.log(
                '%c┍------------------------------------------------------------------┑',
                `color:${randomColor};`
            );
            console.log('| 请求地址：', response.config.url);
            console.log('| 请求参数：', qs.parse(response.config.data));
            console.log('| 返回数据：', response.data);
            console.log(
                '%c┕------------------------------------------------------------------┙',
                `color:${randomColor};`
            );
        }
    }
}

export default Request.getInstance();



//撸基础结构

// # public 公开的
// # protected 受保护的
// # private 私有的
//
//
// import http from 'http'
// import https from 'https'
// import axios, { AxiosResponse, AxiosRequestConfig, CancelTokenStatic } from 'axios'
// import { Message, MessageBox } from 'element-ui'
// import qs from 'qs'
// import { UserModule } from '@/store/modules/user'
//
// // 类名
// class Request {
//     // 属性
//     protected baseURL: any = process.env.VUE_APP_BASE_API
//     protected service: any
//     protected pending: Array<{
//         url: string,
//         cancel: Function
//     }> = []
//     protected CancelToken: CancelTokenStatic = axios.CancelToken
//     protected axiosRequestConfig: AxiosRequestConfig = {}
//     protected successCode: Array<Number> = [200, 201, 204]
//     private static _instance: Request;
//
//     // 构造函数 初始化工作
//     private constructor() {
//
//     }
//
//     // 唯一实例
//     public static getInstance() : Request {}
//
//     protected requestConfig(): void {}
//
//     protected interceptorsRequest() {}
//
//     protected interceptorsResponse(): void {}
//
//     protected removePending(config: any): void {}
//
//     public async post(url: string, data: any = {}, config: object = {}) {}
//
//     public async delete(url: string, config: object = {}) {}
//
//     public async put(url: string, data: any = {}, config: object = {}) {}
//
//     public async get(url: string, params: any = {}, config: object = {}) {}
//
//     protected requestLog(request: any): void {}
//
//     protected responseLog(response: any): void {}
// }
//
// export default Request.getInstance()

//自定义实例默认值 requestConfig

// protected requestConfig(): void {
//     this.axiosRequestConfig = {
//         // baseURL`将自动加在 `url` 前面，除非 `url` 是一个绝对 URL
//         baseURL: this.baseURL,
//         // `headers` 是即将被发送的自定义请求头
//         headers: {
//             timestamp: new Date().getTime(),
//             'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
//         },
//         // transformRequest` 允许在向服务器发送前，修改请求数据
//         transformRequest: [function (data: any) {
//             //对data进行任意转换处理
//             return data;
//         }],
//         // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
//         transformResponse: [function(data: AxiosResponse) {
//             return data
//         }],
//         // `paramsSerializer` 是一个负责 `params` 序列化的函数
//         paramsSerializer: function(params: any) {
//             return qs.stringify(params, { arrayFormat: 'brackets' })
//         },
//         // `timeout` 指定请求超时的毫秒数(0 表示无超时时间)
//         // 如果请求话费了超过 `timeout` 的时间，请求将被中断
//         timeout: 30000,
//         // `withCredentials` 表示跨域请求时是否需要使用凭证
//         withCredentials: false,
//         // `responseType` 表示服务器响应的数据类型，可以是 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
//         responseType: 'json',
//         // `xsrfCookieName` 是用作 xsrf token 的值的cookie的名称
//         xsrfCookieName: 'XSRF-TOKEN',
//         // `xsrfHeaderName` 是承载 xsrf token 的值的 HTTP 头的名称
//         xsrfHeaderName: 'X-XSRF-TOKEN',
//         // `maxRedirects` 定义在 node.js 中 follow 的最大重定向数目
//         maxRedirects: 5,
//         // `maxContentLength` 定义允许的响应内容的最大尺寸
//         maxContentLength: 2000,
//         // `validateStatus` 定义对于给定的HTTP 响应状态码是 resolve 或 reject  promise 。如果 `validateStatus` 返回 `true` (或者设置为 `null` 或 `undefined`)，promise 将被 resolve; 否则，promise 将被 rejecte
//         validateStatus: function(status: number) {
//             return status >= 200 && status < 300
//         },
//         // `httpAgent` 和 `httpsAgent` 分别在 node.js 中用于定义在执行 http 和 https 时使用的自定义代理。允许像这样配置选项：
//         // `keepAlive` 默认没有启用
//         httpAgent: new http.Agent({ keepAlive: true }),
//         httpsAgent: new https.Agent({ keepAlive: true })
//     }
// }



