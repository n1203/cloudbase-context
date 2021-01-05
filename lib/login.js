import cloudbase from '@cloudbase/js-sdk'

/**
 * 登录模块
 */
export default (cloudbaseApp) => {
  const auth = app.auth({
    // 登录状态的持久保留
    // session	在 SessionStorage 中保留登录状态，当前页面关闭后会被清除。
    // local	在本地存储中长期地保留登录状态。
    // none	在内存中保留登录状态，当前页面刷新、重定向之后会被清除。
    persistence: "local"
  })

  // 应用初始化时,避免重复登录
  if (auth.hasLoginState()) {
    // 此时已经登录
  } else {
    // 此时未登录，执行您的登录流程
  }

  return {
    // 未登录
    noLogin: () => {

    },
    // 匿名登录
    anonymous: async () => {
      await auth.anonymousAuthProvider().signIn();
      // 匿名登录成功检测登录状态isAnonymous字段为true
      const loginState = await auth.getLoginState();
      console.log(loginState.isAnonymousAuth); // true
      return loginState
    },
    // 邮箱
    email: ({email, password}) => {
      // 首次注册的逻辑
      auth.signUpWithEmailAndPassword(email, password).then(() => {
        // 发送验证邮件成功
      });

      // 后续登录的逻辑
      auth.signInWithEmailAndPassword(email, password).then((loginState) => {
        // 登录成功
      });
    },
    // 微信授权登录
    wechat: () => {
      // 首先我们创建一个 Provider 实例，并且填入参数：
      const provider = auth.weixinAuthProvider({
        appid: "...",
        scope: "xxxx"
      });

      // 首先调用 Provider.signInWithRedirect()，用户将会跳转到微信 OAuth 授权页面：
      provider.signInWithRedirect();

      // 在授权页面内，需要用户对登录行为进行授权，成功后，会返回至当前页面。
      // 然后调用 Provider.getRedirectResult()，获取登录结果：
      provider.getRedirectResult().then((loginState) => {
        if (loginState) {
          // 登录成功！
        }
      });
    },
    // 自定义登录
    custom: () => {
      // TODO: https://cloud.tencent.com/document/product/876/41731
    },
    // 用户名密码登录
    user: async () => {
      // 绑定用户名时，可以检查在当前云开发环境下，此用户名是否存在。然后再调用绑定用户名的接口：
      if (!(await auth.isUsernameRegistered(username))) {
        // 检查用户名是否绑定过
        await auth.currentUser.updateUsername(username); // 绑定用户名
      }

      const loginState = await auth.signInWithUsernameAndPassword(username, password); // 用户名密码登录
    }
  }
}