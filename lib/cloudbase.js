import cloudbase from '@cloudbase/js-sdk'

let isDev = process.env.NODE_ENV === 'development'

/**
 * 检验并获取当前所使用的的 collection 链接
 * @param {*} param0
 */
const checkCollection = ({useDev, devCollection, collection}) => {
  const collectionName = collection
  if (devCollection !== '' && useDev && typeof useDev === 'boolean') {
    collectionName = useDev ? devCollection : collection
  }
  return collectionName
}

/**
 * 返回当前所含有的触发请求集合
 */
const checkType = types => {
  const type = [
    'skip',
    'doc',
    'orderBy',
    'limit',
    'field',
    'where',
    'watch',
  ]
  return Object.keys(types).filter(v => type.includes(v))
}

/**
 * 通用处理函数
 * @param {*} type
 * @param {*} global
 * @param {*} current
 * @param {*} result
 */
const processer = ({type, global, current, result}) => {
  global[type] && (result = global[type](result))
  if (result === undefined) {
    return console.error('全局前置处理函数（processFix）定义了，但是没有提供返回值');
  }
  current[type] && (result = current[type](result))
  if (result === undefined) {
    return console.error('局部处理函数（processFix）定义了，但是没有提供返回值');
  }
  return result
}

let cloudbaseApp = {};
let ioArray = {};

export const mountCloudbase = config => {
  /**
   * 没找到这个方法会报错，十分奇葩
   */
  wx.getAccountInfoSync =  wx.getAccountInfoSync || (() => {})

  // 按用户需求，重写isDev
  typeof config.isDev === 'boolean' && (isDev = config.isDev)

  const {development, production, isSingle} = config

  let environment = config.useEnvironment || (isSingle ? development : isDev ? development : production)

  cloudbaseApp = cloudbase.init(environment);
  const auth = cloudbaseApp.auth();

  /**
   * 匿名登录
   */
  async function login(){
    // 不知道为啥，这个方法会报错
    // await auth.signInAnonymously();
    // 匿名登录成功检测登录状态isAnonymous字段为true
    const loginState = await auth.getLoginState();
  }
  login();

  cloudbaseApp.ioCreate = (path = 'default', collection = 'test', ioObject) => {
    let io = {}

    Object.entries(ioObject).forEach(([k, v], i) => {
      io[k] = {}

      Array(
        'get',
        'add',
        'set',
        'update',
        'count',
        'remove',
      ).forEach(method => {
        io[k][method] = (params = {}) => {
          if (typeof params !== 'object') {
            return console.error(`io.${k}.${method}()方法的参数必须传递对象！`);
          }
          // 前置处理
          params = processer({
            type: 'processFix',
            global: config,
            current: v,
            result: params
          })

          return new Promise((resolve, reject) => {
            // 获取到当前环境下请求所需要的 collection
            let requestCollection = cloudbaseApp.database().collection(checkCollection({
              ...v,
              collection
            }))

            // 如果啥也没有，默认传一个空的where
            method !== 'add' && (params.where = params.where || {})

            // 按当前所需构建请求方法
            checkType(params).forEach(type => {
              requestCollection = requestCollection[type](params[type])
            })

            // 真正的请求
            requestCollection[method](params.data || (method === 'add' ? params : '')).then(result => {
              // 后置处理
              try {
                resolve({...processer({
                  type: 'complateFix',
                  global: config,
                  current: v,
                  result
                }), collection: io[k]})
              }catch (error) {
                // 错误处理
                reject({...processer({
                  type: 'fail',
                  global: config,
                  current: v,
                  result: error,
                }), collection: io[k]})
              }
            }).catch(error => {
                // 错误处理
                reject({...processer({
                  type: 'fail',
                  global: config,
                  current: v,
                  result: error,
                }), collection: io[k]})
            })
          })
        }
      })
    })

    ioArray[path] = io;
  }
  cloudbaseApp.io = ioArray;
  return cloudbaseApp
}

export default mountCloudbase;