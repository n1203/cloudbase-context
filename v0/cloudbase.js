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
    'orderBy',
    'limit',
    'field',
    'where',
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

          params.where = params.where || {}

          return new Promise((resolve, reject) => {
            // 获取到当前环境下请求所需要的 collection
            let requestCollection = cloudbaseApp.database().collection(checkCollection({
              ...v,
              collection
            }))

            // 按当前所需构建请求方法
            checkType(params).map(type =>
              requestCollection = requestCollection[type](params[type])
            )

            // 真正的请求
            requestCollection[method]().then(result => {
              // 后置处理
              try {
                resolve(processer({
                  type: 'complateFix',
                  global: config,
                  current: v,
                  result
                }))
              }catch (error) {
                // 错误处理
                reject(processer({
                  type: 'fail',
                  global: config,
                  current: v,
                  result: error,
                }))
              }
            }).catch(result => {
                // 错误处理
                reject(processer({
                  type: 'fail',
                  global: config,
                  current: v,
                  result: error,
                }))
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


    // const params = {
    //   /**
    //    * 局部开发连接
    //    * 1. 默认使用模块开发连接
    //    * 2. 如果模块开发连接没传递，则使用全局默认模块连接，否则报错
    //    * 3. 如果传递了开发连接时，回去查看局部开发连接是否被禁用，如果禁用则使用模块连接。如果没有传值情况则会去查找全局配置中是否使用开发环境配置，如果是开发环境配置下，则启用开发连接。否则依然使用模块连接。
    //    */
    //   // 开发连接名称
    //   devCollection = '',
    //   // 是否使用开发连接
    //   useDev = false,

    //   // 写	add	新增文档（触发请求）
    //   // 计数	count	获取复合条件的文档条数
    //   // 读	get	获取集合中的文档，如果有使用 where 语句定义查询条件，则会返回匹配结果集 (触发请求)
    //   // 引用	doc	获取对该集合中指定 id 的文档的引用

    //   // 查询条件	where	通过指定条件筛选出匹配的文档，可搭配查询指令（eq, gt, in, ...）使用
    //   // skip	跳过指定数量的文档，常用于分页，传入 offset
    //   skip = {},
    //   // orderBy	排序方式
    //   orderBy = '',
    //   // limit	返回的结果集(文档数量)的限制，有默认值和上限值
    //   limit = '',
    //   // field	指定需要返回的字段} collection
    //   field = {},
    //   /**
    //    *
    //    */
    // }