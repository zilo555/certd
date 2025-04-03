import {AccessInput, BaseAccess, IsAccess} from '@certd/pipeline';

/**
 * 这个注解将注册一个授权配置
 * 在certd的后台管理系统中，用户可以选择添加此类型的授权
 */
@IsAccess({
  name: 'jdcloud',
  title: '京东云',
  desc: '',
  icon: 'svg:icon-jdcloud',
})
export class JDCloudAccess extends BaseAccess {

  @AccessInput({
    title: 'AccessKeyID',
    component: {
      placeholder: 'AccessKeyID',
    },
    helper:"[获取密钥](https://uc.jdcloud.com/account/accesskey)",
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

new JDCloudAccess();
