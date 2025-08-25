import {AccessInput, BaseAccess, IsAccess} from '@certd/pipeline';

/**
 * 这个注解将注册一个授权配置
 * 在certd的后台管理系统中，用户可以选择添加此类型的授权
 */
@IsAccess({
  name: 'volcengine',
  title: '火山引擎',
  desc: '',
  icon: 'svg:icon-volcengine',
  order: 1,
})
export class VolcengineAccess extends BaseAccess {

  @AccessInput({
    title: 'AccessKeyID',
    component: {
      placeholder: 'AccessKeyID',
    },
    helper:"[获取密钥](https://console.volcengine.com/iam/keymanage/)",
    required: true,
  })
  accessKeyId = '';
  @AccessInput({
    title: 'SecretAccessKey',
    component: {
      placeholder: 'SecretAccessKey',
    },
    required: true,
    encrypt: true,
  })
  secretAccessKey = '';

}

new VolcengineAccess();
