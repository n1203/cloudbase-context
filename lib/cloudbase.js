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
    'filePath',
    'fileContent',
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
  // 执行全局处理函数
  global[type] && (result = global[type](result) || result)

  // 执行局部处理函数
  current[type] && (result = current[type](result) || result)

  return result
}

/**
 * 获取文件上传路径
 * @param {*} param0
 */
const getCloudPath = ({config, ioObject, params}) => {

}

let cloudbaseApp = {};
let ioArray = {};

export const mountCloudbase = config => {
  /**
   * 没找到这个方法会报错，十分奇葩
   */
  try {
    wx.getAccountInfoSync =  wx.getAccountInfoSync || (() => {})
  } catch (error) {

  }

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
        {
          method: "get",
          type: 'cloudDatabase',
        },
        {
          method: "add",
          type: 'cloudDatabase',
          // 表示无需自动添加where条件
          noWhere: true,
        },
        {
          method: "set",
          type: 'cloudDatabase',
        },
        {
          method: "update",
          type: 'cloudDatabase',
        },
        {
          method: "count",
          type: 'cloudDatabase',
        },
        {
          method: "remove",
          type: 'cloudDatabase',
        },
        // 文件上传
        {
          method: "uploadFile",
          noWhere: true,
          type: 'cloudFile',
        },
        {
          method: 'deleteFile',
          noWhere: true,
          type: 'cloudFile',
        },
        {
          method: 'downloadFile',
          noWhere: true,
          type: 'cloudFile',
        }
      ).filter(({type}) => type === ioObject.type).forEach(({method, noWhere}) => {
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
            let requestCollection = () => {
              let result
              switch (ioObject.type) {
                case 'cloudFile':
                  result = cloudbaseApp
                  break;
                default:
                  result = cloudbaseApp.database().collection(checkCollection({
                    ...v,
                    collection
                  }))
                  break;
              }
              return result
            }

            // 如果啥也没有，默认传一个空的where
            !noWhere && (params.where = params.where || {})

            // 按当前所需构建请求方法
            checkType(params).forEach(type => {
              requestCollection = requestCollection[type](params[type])
            })

            switch(method) {
              case 'uploadFile':
                // 加上文件上传前缀
                params.cloudPath = `${config.cloudPathProFix}/${params.cloudPath}`
              case 'default':
            }

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