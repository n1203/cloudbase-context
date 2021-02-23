---
nav:
  title: 基础
  order: 1
  toc: 'menu'
---

# 基础
你可以按照我们的规范往下走，当然你也可以参考我们的写法自己实现更优的解决方案。

## 实例化cloudbase-context
在对cloudbase-context进行相关配置并实例化后，会返回cloudbaseApp实例，后续的操作都会围绕着它来执行。
```js
import {mountCloudbase} from 'cloudbase-context'

// 实例化cloudbase-context
const cloudbaseApp = mountCloudbase({
  // 开启生产开发同环境，此时使用development环境配置
  isSingle: true,
  // 开发环境
  development: {
    // 环境id
    env: '',
    // app标识
    appSign: '',
    appSecret: {
      // 版本
      appAccessKeyId: '',
      // 密钥
      appAccessKey: '',
    },
  },
})
```

## 创建一个接口管理模块
假设在腾讯云开发含有数据表`testTable`，并且我们此时业务模块的命名空间为`users`，此时我们就可以这样创建一个接口管理模块。
```js
// 请求模块
cloudbaseApp.ioCreate({
  // 模块名称
  moduleName: 'users',
  // 数据库名称
  databaseName: 'testTable',
})
```
在创建好这个模块之后，我们可以这样去使用它，假如我们此时要使用的是get方法，则可以这样：
```js
cloudbaseApp.io.users.get({})
  .then(response => {})
  .catch(error => {})
```
或者说，是这样：
```js
const fetchUsers = async () => {
  const users = await cloudbaseApp.io.users.get({})
}
```
// todo 针对于管理模块内的其他方法，请参考 xxxxxx 下次写

