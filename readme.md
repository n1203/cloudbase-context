# cloudbase-context
腾讯云开发云数据库统一管理工具包，之前全局前、后置处理请求所携带的信息，分离业务以及请求代码相关。方便后续开发容错，随时做处理。

## 名称空间支持
在大型项目中会经常碰见一种情况，不同的业务模块有着很多非常相似(甚至相同)的数据接口。`cloudbase-context`在名称空间方面做了一定的设计，书写十分灵活。

## 数据请求参数/返回值处理
在`cloudbase-context`中支持前置处理、后置处理、错误处理三个处理节点，类似于MVC开发模式下组件生命周期的概念。当一个数据请求发起之前，可以先走前置处理函数做一次校验，发起之后拿到返回值可以走后置处理函数再做一次处理，当发生错误时，会调用错误处理函数，在多接口的情况下会显得十分方便。
> 仅仅如此吗？

当然不是，`cloudbase-context`的值处理还分为全局、模块两个级别。设想，当你写一个小程序，接口报错你是一概不知的，这是如果有一个全局处理的钩子来抓取每一次获取数据所返回的错误并作出友好的提示，那岂不是很香？刚好`cloudbase-context`就做了这件事！

# 安装方法
## npm
```
npm install cloudbase-context -S
```
## yarn
```
yarn add cloudbase-context
```

# 使用方法
建议创建一个单独的文件 `common/io.js` 来管理所有的io请求。
## 引入
```js
import mountCloudbase from 'cloudbase-context';
```
然后准备相关`配置项`后执行方法
```js
mountCloudbase({
  // 是否生产开发同环境，如果开启，则均适用 development 内部配置
  isSingle: false,
  // 是否自定义当前环境配置信息，useEnvironment的值需要在本配置信息中定义
  // useEnvironment: 'custom',
  // custom: {
  //   env: '',
  //   .....
  // },
  // 如果不支持 process.env.NODE_ENV === 'development' 来判断当前是否是开发环境的，可以独立配置 isDev 属性
  // isDev: false,
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
  // 生产环境
  production: {
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
  // 全局统一的前置处理
  processFix: v => v,
  // 全局统一的后置处理
  complateFix: v => v,
  // 全局统一的错误处理
  fail: v => v,
})
```
方法执行完成后，可以通过调用`ioCreate`api来创建模块
```js
// 请求模块
// 第一个参数为模块命名空间，
// 第二个参数为当前模块所使用的数据集，
// 第三个参数为请求所封装的方法，每个方法默认含有 get、set、remove、update、count方法。
cloudbaseContext.ioCreate('example', 'databaseName', {
  thread: {
    // 开发连接名称
    // devCollection = '',
    // 是否使用开发连接
    // useDev = false,
    // 前置处理
    processFix: params => {
      return params
    },
    // 后置处理
    complateFix: response => {
      return response
    },
    // 错误处理
    fail: error => {
      return error
    },
  },
  thread2: {
    ....
  }
})
```
最后将`cloudbaseContext`实例返回
```js
export default cloudbaseContext;
```
# 文档
空了写~

# 维护支持&联系作者
- 邮箱：`pingxi8@dingtalk.com`
- 微信：`SouWinds`
- 哔哩哔哩：`全栈知识库`



# License
MIT

Copyright (c) 2020-present, Junping (SouWind) Hu