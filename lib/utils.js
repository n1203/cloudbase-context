/**
 * 检查当前是否为开发环境(webpack)
 */
export const isDev = process.env.NODE_ENV === 'development'

/**
 * 检验并获取当前所使用的的 collection 链接
 * 作用：通过判断当前用户配置环境，从而返回不同的 collection 去做后续的操作
 * @param {*} param0
 */
const checkCollection = ({useDev, devCollection, collection}) => {
  const collectionName = collection
  if (devCollection !== '' && useDev && typeof useDev === 'boolean') {
    collectionName = useDev ? devCollection : collection
  }
  return collectionName
}

