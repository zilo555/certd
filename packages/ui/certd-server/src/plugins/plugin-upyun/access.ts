import {AccessInput, BaseAccess, IsAccess} from '@certd/pipeline';

/**
 * 这个注解将注册一个授权配置
 * 在certd的后台管理系统中，用户可以选择添加此类型的授权
 */
@IsAccess({
  name: 'upyun',
  title: '又拍云',
  desc: '',
  icon: 'svg:icon-upyun',
})
export class UpyunAccess extends BaseAccess {

  @AccessInput({
    title: '账号',
    component: {
      placeholder: '又拍云账号',
    },
    required: true,
  })
  username = '';
  @AccessInput({
    title: '密码',
    component: {
      placeholder: '又拍云密码',
    },
    required: true,
    encrypt: true,
  })
  password = '';

}

new UpyunAccess();
