// MyPromise.js

// 先定义三个常量表示状态
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

// 新建 MyPromise 类
class MyPromise {
    constructor(executor) {
        // executor 是一个执行器，进入会立即执行
        // 并传入resolve和reject方法
        try {
            executor(this.resolve, this.reject)
        } catch (error) {
            this.reject(error)
        }
    }

    // 储存状态的变量，初始值是 pending
    status = PENDING;
    // 成功之后的值
    value = null;
    // 失败之后的原因
    reason = null;

    // 存储成功回调函数
    onFulfilledCallbacks = [];
    // 存储失败回调函数
    onRejectedCallbacks = [];

    // 更改成功后的状态
    resolve = (value) => {
        // 只有状态是等待，才执行状态修改
        if (this.status === PENDING) {
            // 状态修改为成功
            this.status = FULFILLED;
            // 保存成功之后的值
            this.value = value;
            // resolve里面将所有成功的回调拿出来执行
            while (this.onFulfilledCallbacks.length) {
                // Array.shift() 取出数组第一个元素，然后（）调用，shift不是纯函数，取出后，数组将失去该元素，直到数组为空
                this.onFulfilledCallbacks.shift()(value)
            }
        }
    }

    // 更改失败后的状态
    reject = (reason) => {
        // 只有状态是等待，才执行状态修改
        if (this.status === PENDING) {
            // 状态成功为失败
            this.status = REJECTED;
            // 保存失败后的原因
            this.reason = reason;
            // resolve里面将所有失败的回调拿出来执行
            while (this.onRejectedCallbacks.length) {
                this.onRejectedCallbacks.shift()(reason)
            }
        }
    }

    then(onFulfilled, onRejected) {
        const realOnFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
        const realOnRejected = typeof onRejected === 'function' ? onRejected : reason => {
            throw reason
        };
        /**
         * 实现微任务的几种方式以及优缺点
         * Promise.resolve().then()  then方法会在promise状态为fulfilled或rejected时将对应的任务(onFulfilled和onRejected)放到任务队列中
         * MutationObserver   nodejs环境不支持MutationObserver API
         * process.nextTick  这个方法只能用于Node环境
         * queueMicrotask
         * @type {MyPromise}
         */

            // 为了链式调用这里直接创建一个 MyPromise，并在后面 return 出去
        const promise2 = new MyPromise((resolve, reject) => {
                const fulfilledMicrotask = () => {
                    // 创建一个微任务等待 promise2 完成初始化
                    queueMicrotask(() => {
                        try {
                            // 获取成功回调函数的执行结果
                            const x = realOnFulfilled(this.value);
                            // 传入 resolvePromise 集中处理
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (error) {
                            reject(error)
                        }
                    })
                }

                const rejectedMicrotask = () => {
                    // 创建一个微任务等待 promise2 完成初始化
                    queueMicrotask(() => {
                        try {
                            // 调用失败回调，并且把原因返回
                            const x = realOnRejected(this.reason);
                            // 传入 resolvePromise 集中处理
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (error) {
                            reject(error)
                        }
                    })
                }
                // 判断状态
                if (this.status === FULFILLED) {
                    fulfilledMicrotask()
                } else if (this.status === REJECTED) {
                    rejectedMicrotask()
                } else if (this.status === PENDING) {
                    // 等待
                    // 因为不知道后面状态的变化情况，所以将成功回调和失败回调存储起来
                    // 等到执行成功失败函数的时候再传递
                    this.onFulfilledCallbacks.push(fulfilledMicrotask);
                    this.onRejectedCallbacks.push(rejectedMicrotask);
                }
            })

        return promise2;
    }


    catch(onRejected) {
        return this.then(null, onRejected);
    }

    /**
     * finally特点
     * 无论成功或失败，都会执行
     * 入参是一个函数，这个函数在resolve和reject中都会调用
     * 返回的是一个promise
     * 使用Promise.resolve会等f()的函数执行完再返回结果
     * p.finally(() => {})本质是一个then方法
     * @param callback
     * @returns {MyPromise}
     */

    finally(callback) {
        return this.then(
            value => MyPromise.resolve(callback()).then(() => value),
            reason => MyPromise.resolve(callback()).then(() => {
                throw reason
            })
        )
    }

    // resolve 静态方法
    static resolve(parameter) {
        // 如果传入 MyPromise 就直接返回
        if (parameter instanceof MyPromise) {
            return parameter;
        }

        if (parameter === null) return null;

        // 转成常规方式
        return new MyPromise(resolve => {
            resolve(parameter);
        });
    }

    // reject 静态方法
    static reject(reason) {
        return new MyPromise((resolve, reject) => {
            reject(reason);
        });
    }

    // all 静态方法,全部成功了才成功，有一个失败了就失败了，如果是普通值就直接返回
    static all(promises) {
        return new MyPromise((resolve, reject) => {
            let result = [];
            let counter = 0;

            const processResult = (index, value) => {
                result[index] = value;
                counter++;
                if (counter === promises.length) {
                    resolve(result)
                }
            }

            for (let i = 0; i < promises.length; i++) {
                let current = promises[i];
                if (current && typeof current.then === 'function') {
                    current.then((value) => {
                        processResult(i, value)
                    }, reject)
                } else {
                    // 如果不是promise，传入的是普通值，则直接返回
                    processResult(i, current)
                }
            }

        })
    }

    //race 静态方法,返回最先改变状态的那个
    static race(promises) {
        return new MyPromise((resolve, reject) => {
            for (let i = 0; i < promises.length; i++) {
                let p = promises[i];
                if (p && typeof p.then === 'function') {
                    p.then(resolve, reject)
                } else {
                    resolve(p)
                }
            }
        })
    }


    static allSettled(promises) {
        return new MyPromise((resolve, reject) => {
            let result = [];
            let counter = 0;

            const processResult = (index, value, status) => {
                result[index] = {
                    status,
                    value
                };
                counter++;
                if (counter === promises.length) {
                    resolve(result)
                }
            }

            for (let i = 0; i < promises.length; i++) {
                let current = promises[i];
                if (current && typeof current.then === 'function') {
                    current.then((value) => {
                        processResult(i, value, 'fulfilled')
                    }, (reason) => {
                        processResult(i, reason, 'rejected')
                    })
                } else {
                    processResult(i, current, 'fulfilled')
                }
            }
        })
    }


    static any(promises) {
        return new MyPromise((resolve, reject) => {
            let result = [];
            let counter = 0;

            const processResult = (value) => {
                result.push(value);
                counter++;
                if (counter === promises.length) {
                    reject(result)
                }
            }

            for (let i = 0; i < promises.length; i++) {
                let current = promises[i];
                if (current && typeof current.then === 'function') {
                    current.then(resolve, processResult)
                } else {
                    resolve(current)
                }
            }
        })
    }

    //  延迟对象，
    static defer() {
        let dfd = {};
        dfd.promise = new MyPromise((resolve, reject) => {
            dfd.resolve = resolve;
            dfd.reject = reject;
        });
        return dfd;
    }
}

function resolvePromise(promise, x, resolve, reject) {
    // 如果相等了，说明return的是自己，抛出类型错误并返回
    if (promise === x) {
        return reject(new TypeError('The promise and the return value are the same'));
    }

    if (typeof x === 'object' || typeof x === 'function') {
        // x 为 null 直接返回，走后面的逻辑会报错
        if (x === null) {
            return resolve(x);
        }

        let then;
        try {
            // 把 x.then 赋值给 then
            then = x.then;// 取then有可能会出错，then有可能是别的promise的或者不存在
        } catch (error) {
            // 如果取 x.then 的值时抛出错误 error ，则以 error 为据因拒绝 promise
            return reject(error);
        }

        // 如果 then 是函数
        if (typeof then === 'function') {
            // 防止多次调用成功或失败
            let called = false;
            try {
                then.call(
                    x, // this 指向 x
                    // 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
                    y => {
                        // 如果 resolvePromise 和 rejectPromise 均被调用，
                        // 或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
                        // 实现这条需要前面加一个变量 called
                        if (called) return;
                        called = true;
                        resolvePromise(promise, y, resolve, reject);
                    },
                    // 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
                    r => {
                        if (called) return;
                        called = true;
                        reject(r);
                    });
            } catch (error) {
                // 如果调用 then 方法抛出了异常 error：
                // 如果 resolvePromise 或 rejectPromise 已经被调用，直接返回
                if (called) return;

                // 否则以 error 为据因拒绝 promise
                reject(error);
            }
        } else {
            // 如果 then 不是函数，以 x 为参数执行 promise
            resolve(x);
        }
    } else {
        // 如果 x 不为对象或者函数，以 x 为参数执行 promise
        resolve(x);
    }
}

export default MyPromise