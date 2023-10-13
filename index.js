import MyPromise from "./src/promise/mypromise.js";
/* 简单实现 */
// new MyPromise((resolve, reject) => {
//     resolve("hello");
//     reject("err");
// }).then((success)=>{
//     console.log("success",success);
// },(err)=>{
// console.log("err",err);
// })
// const promise = new MyPromise((resolve, reject) => {
//     resolve('success')
//     reject('err')
//  })


/* 简单处理异步 */
//  promise.then(value => {
//    console.log('resolve', value)
//  }, reason => {
//    console.log('reject', reason)
//  })

// const promise = new MyPromise((resolve, reject) => {
//     setTimeout(() => {
//         resolve('success')
//     }, 1000)
// })
// promise.then(value => {
//     console.log('resolve value', value)
// }, reason => {
//     console.log('reject', reason)
// })


/* 解决处理异步多个then，前面丢失的情况 */
// const promise = new MyPromise((resolve,reject)=>{
//     setTimeout(()=>{
//         resolve('success')
//     },3000)
// })

// promise.then(value=>{
//     console.log(1);
//     console.log('resolve',value);
// })

// promise.then(value=>{
//     console.log(2);
//     console.log('resolve',value);
// })
// promise.then(value=>{
//     console.log(3);
//     console.log('resolve',value);
// })


// 链式调用，仅处理同步,未处理异步，
// 如果 then 方法返回的是自己的 Promise 对象，则会发生循环调用，这个时候程序会报错

// const promise = new MyPromise((resolve,reject)=>{
//     // 目前只处理同步的问题
//     resolve('success')
// })

// function other(){
//     return new MyPromise((resolve,reject)=>{
//         resolve("other")
//     })
// }

// promise.then(value=>{
//     console.log("1");
//     console.log("resolve",value);
//     return other()
// }).then(value=>{
//     console.log(2);
//     console.log("resolve",value);
// })


// 循环调用

// const promise = new MyPromise((resolve, reject) => {
//     resolve('success')
// })

// // 这个时候将promise定义一个p1，然后返回的时候返回p1这个promise
// const p1 = promise.then(value => {
//    console.log(1)
//    console.log('resolve', value)
//    return p1
// })

// // 运行的时候会走reject
// p1.then(value => {
//   console.log(2)
//   console.log('resolve', value)
// }, reason => {
//   console.log(3)
//   console.log(reason.message)
// })

// 验证错误捕获

// const promise = new MyPromise((resolve, reject) => {
//     // resolve('success')
//     throw new Error('执行器错误')
// })

// promise.then(value => {
//   console.log(1)
//   console.log('resolve', value)
// }, reason => {
//   console.log(2)
//   console.log(reason.message)
// })

// then 执行的时错误捕获

// const promise = new MyPromise((resolve, reject) => {
//     resolve('success')
//     // throw new Error('执行器错误')
//  })

// 第一个then方法中的错误要在第二个then方法中捕获到
// promise.then(value => {
//   console.log(1)
//   console.log('resolve', value)
//   throw new Error('then error')
// }, reason => {
//   console.log(2)
//   console.log(reason.message)
// }).then(value => {
//   console.log(3)
//   console.log(value);
// }, reason => {
//   console.log(4)
//   console.log(reason.message)
// })

// 参考 fulfilled 状态下的处理方式，对 rejected 和 pending 状态进行改造
// 增加异步状态下的链式调用
// 增加回调函数执行结果的判断
// 增加识别 Promise 是否返回自己
// 增加错误捕获




// const promise = new MyPromise((resolve, reject) => {
//     setTimeout(()=>{
//         resolve('success')
//     },2000)
//     // resolve('success')
//     // throw new Error('执行器错误')
//  })
// promise.then(value => {
//   console.log(1)
//   console.log('resolve', value)
//   throw new Error('then error')
// }, reason => {
//   console.log(2)
//   console.log(reason.message)
// }).then(value => {
//   console.log(3)
//   console.log(value);
// }, reason => {
//   console.log(4)
//   console.log(reason.message)
// })


// then 中的参数变为可选
// const promise = new Promise((resolve, reject) => {
//     resolve(100)
//   })

//   promise
//     .then()
//     .then()
//     .then()
//     .then(value => console.log(value))


// MyPromise.resolve().then(() => {
//     console.log(0);
//     return MyPromise.resolve(4);
// }).then((res) => {
//     console.log(res)
// })

MyPromise.resolve().then(() => {
    console.log(0);
    return MyPromise.resolve(4);
  }).then((res) => {
    console.log(res)
  })

  MyPromise.resolve().then(() => {
    console.log(1);
  }).then(() => {
    console.log(2);
  }).then(() => {
    console.log(3);
  }).then(() => {
    console.log(5);
  }).then(() =>{
    console.log(6);
    console.log("-----------------------");
  })

// Promise.resolve().then(() => {
//   console.log(0);
//   return Promise.resolve(4)
// }).then((res) => {
//   console.log(res);
// })

// Promise.resolve().then(() => {
//   console.log(1);
// }).then(() => {
//   console.log(2);
// }).then(() => {
//   console.log(3);
// }).then(() => {
//   console.log(5);
// })