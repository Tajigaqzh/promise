// 先定义三个常量表示状态

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
class MyPromise {
    // 储存状态的变量，初始值是 pending
    status = PENDING;
     // 成功之后的值
    value = null;
    // 失败之后的原因
    reason = null;

    // 存储成功回调函数
    // onFulfilledCallback = null;
    onFulfilledCallbacks = [];
    // 存储失败回调函数
    // onRejectedCallback = null;
    onRejectedCallbacks = [];


    constructor(executor) {
        // executor 是一个执行器，进入会立即执行
        // 并传入resolve和reject方法
        try {
            executor(this.resolve, this.reject)
        } catch (error) {
            // 如果有错误，就直接执行 reject
            this.reject(error)
        }
    }

    // 更改成功后的状态
    resolve = (value) => {
        // console.log("resolve", value);
        if (this.status === PENDING) {
            this.status = FULFILLED;
            this.value = value;
            // // 判断成功回调是否存在，如果存在就调用
            // this.onFullfilledCallback && this.onFullfilledCallback(value);

            while (this.onFulfilledCallbacks.length) {
                // Array.shift() 取出数组第一个元素，然后（）调用，shift不是纯函数，取出后，数组将失去该元素，直到数组为空
                this.onFulfilledCallbacks.shift()(value)
            }
        }
    }



    reject = (reason) => {
        //只有状态是等待，才执行状态修改
        if (this.status === PENDING) {
            this.status = REJECTED;
            this.reason = reason;
            // this.onRejectedCallback && this.onRejectedCallback(reason);
            // resolve里面将所有失败的回调拿出来执行
            while (this.onRejectedCallbacks.length) {
                this.onRejectedCallbacks.shift()(reason)
            }
        }
    }

    /**
     * 加了处理多个的情况
     * @param {*} onFullfilled 
     * @param {*} onRejected 
     */
    /*    then(onFullfilled, onRejected) {
           if (this.status === FULFILLED) {
               // 调用成功回调，并且把值返回
               onFullfilled(this.value);
           } else if (this.status === REJECTED) {
               // 调用失败回调，并且把原因返回
               onRejected(this.reason);
           } else if (this.status === PENDING) {
               // 等待
               // this.onFullfilledCallback = onFullfilled;
               // this.onRejectedCallback = onRejected;
               this.onFulfilledCallbacks.push(onFullfilled);
               this.onRejectedCallbacks.push(onRejected);
   
           }
       } */

    /**
     * 加了链式调用，加了queueMicrotask解决循环调用
     * @param {*} onFullfilled 
     * @param {*} onRejected 
     */
    // then(onFullfilled, onRejected) {
    //     const promise2 = new MyPromise((resolve, reject) => {
    //         // 这里的内容在执行器中，会立即执行
    //         if (this.status === FULFILLED) {

    //             //// 创建一个微任务等待 promise2 完成初始化
    //             queueMicrotask(() => {
    //                 // 获取成功回调函数的执行结果
    //                 const x = onFullfilled(this.value)
    //                 // 传入一个函数集中管理，再将自己也传递进去，用来解决循环调用问题
    //                 resolvePromise(promise2, x, resolve, reject)
    //             })

    //         } else if (this.status === REJECTED) {
    //             onRejected(this.reason)
    //         } else if (this.status === PENDING) {
    //             this.onFulfilledCallbacks.push(onFullfilled)
    //             this.onRejectedCallbacks.push(onRejected)
    //         }
    //     })
    //     return promise2;

    // }
    /**
     * 再then中加入错误捕获
     * @param {*} onFulfilled 
     * @param {*} onRejected 
     * @returns 
     */
    // then(onFulfilled, onRejected) {
    //     // 为了链式调用这里直接创建一个 MyPromise，并在后面 return 出去
    //     const promise2 = new MyPromise((resolve, reject) => {
    //         // 判断状态
    //         if (this.status === FULFILLED) {
    //             // 创建一个微任务等待 promise2 完成初始化
    //             queueMicrotask(() => {
    //                 // ==== 新增 ====
    //                 try {
    //                     // 获取成功回调函数的执行结果
    //                     const x = onFulfilled(this.value);
    //                     // 传入 resolvePromise 集中处理
    //                     resolvePromise(promise2, x, resolve, reject);
    //                 } catch (error) {
    //                     reject(error)
    //                 }
    //             })
    //         } else if (this.status === REJECTED) {
    //             // 调用失败回调，并且把原因返回
    //             onRejected(this.reason);
    //         } else if (this.status === PENDING) {
    //             // 等待
    //             // 因为不知道后面状态的变化情况，所以将成功回调和失败回调存储起来
    //             // 等到执行成功失败函数的时候再传递
    //             this.onFulfilledCallbacks.push(onFulfilled);
    //             this.onRejectedCallbacks.push(onRejected);
    //         }
    //     })

    //     return promise2;
    // }

    // 参考 fulfilled 状态下的处理方式，对 rejected 和 pending 状态进行改造

    // then(onFulfilled, onRejected) {
    //     // 为了链式调用这里直接创建一个 MyPromise，并在后面 return 出去
    //     const promise2 = new MyPromise((resolve, reject) => {
    //         // 判断状态
    //         if (this.status === FULFILLED) {
    //             // 创建一个微任务等待 promise2 完成初始化
    //             queueMicrotask(() => {
    //                 try {
    //                     // 获取成功回调函数的执行结果
    //                     const x = onFulfilled(this.value);
    //                     // 传入 resolvePromise 集中处理
    //                     resolvePromise(promise2, x, resolve, reject);
    //                 } catch (error) {
    //                     reject(error)
    //                 }
    //             })
    //         } else if (this.status === REJECTED) {
    //             // ==== 新增 ====
    //             // 创建一个微任务等待 promise2 完成初始化
    //             queueMicrotask(() => {
    //                 try {
    //                     // 调用失败回调，并且把原因返回
    //                     const x = onRejected(this.reason);
    //                     // 传入 resolvePromise 集中处理
    //                     resolvePromise(promise2, x, resolve, reject);
    //                 } catch (error) {
    //                     reject(error)
    //                 }
    //             })
    //         } else if (this.status === PENDING) {
    //             // 等待
    //             // 因为不知道后面状态的变化情况，所以将成功回调和失败回调存储起来
    //             // 等到执行成功失败函数的时候再传递
    //             this.onFulfilledCallbacks.push(() => {
    //                 // ==== 新增 ====
    //                 queueMicrotask(() => {
    //                     try {
    //                         // 获取成功回调函数的执行结果
    //                         const x = onFulfilled(this.value);
    //                         // 传入 resolvePromise 集中处理
    //                         resolvePromise(promise2, x, resolve, reject);
    //                     } catch (error) {
    //                         reject(error)
    //                     }
    //                 })
    //             });
    //             this.onRejectedCallbacks.push(() => {
    //                 // ==== 新增 ====
    //                 queueMicrotask(() => {
    //                     try {
    //                         // 调用失败回调，并且把原因返回
    //                         const x = onRejected(this.reason);
    //                         // 传入 resolvePromise 集中处理
    //                         resolvePromise(promise2, x, resolve, reject);
    //                     } catch (error) {
    //                         reject(error)
    //                     }
    //                 })
    //             });
    //         }
    //     })

    //     return promise2;
    // }

    // then中的参数变为可选

    then(onFulfilled, onRejected) {
        // 可以不传递参数，是不是函数，不是函数把它变为函数
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };
        // 为了链式调用这里直接创建一个 MyPromise，并在后面 return 出去
        const promise2 = new MyPromise((resolve, reject) => {
            // 判断状态
            if (this.status === FULFILLED) {
                // 创建一个微任务等待 promise2 完成初始化
                queueMicrotask(() => {
                    try {
                        // 获取成功回调函数的执行结果
                        const x = onFulfilled(this.value);
                        // 传入 resolvePromise 集中处理
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (error) {
                        reject(error)
                    }
                })
            } else if (this.status === REJECTED) {
                // ==== 新增 ====
                // 创建一个微任务等待 promise2 完成初始化
                queueMicrotask(() => {
                    try {
                        // 调用失败回调，并且把原因返回
                        const x = onRejected(this.reason);
                        // 传入 resolvePromise 集中处理
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (error) {
                        reject(error)
                    }
                })
            } else if (this.status === PENDING) {
                // 等待
                // 因为不知道后面状态的变化情况，所以将成功回调和失败回调存储起来
                // 等到执行成功失败函数的时候再传递
                this.onFulfilledCallbacks.push(() => {
                    // ==== 新增 ====
                    queueMicrotask(() => {
                        try {
                            // 获取成功回调函数的执行结果
                            const x = onFulfilled(this.value);
                            // 传入 resolvePromise 集中处理
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (error) {
                            reject(error)
                        }
                    })
                });
                this.onRejectedCallbacks.push(() => {
                    // ==== 新增 ====
                    queueMicrotask(() => {
                        try {
                            // 调用失败回调，并且把原因返回
                            const x = onRejected(this.reason);
                            // 传入 resolvePromise 集中处理
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (error) {
                            reject(error)
                        }
                    })
                });
            }
        })

        return promise2;
    }

    /**
     * 静态方法
     * @param {*} parameter 
     * @returns 
     */
    static resolve(parameter) {
        if (parameter instanceof MyPromise) {
            return parameter;
        }
        return new MyPromise(resolve => {
            resolve(parameter)
        })
    }

    /**
     * 静态方法
     * @param {*} reason 
     * @returns 
     */
    static reject(reason) {
        return new MyPromise((resolve, reject) => {
            reject(reason);
        });
    }

}


function resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
        return reject(new TypeError('Chaining cycle detected for promise #'))
    }
    if (x instanceof MyPromise) {
        // x是promise
        x.then(resolve, reject)
    } else {
        // x是普通值
        resolve(x)
    }
}
export default MyPromise;
