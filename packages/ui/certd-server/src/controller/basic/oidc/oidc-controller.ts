import { BaseController, Constants } from "@certd/lib-server";
import { ALL, Body, Controller, Get, Post, Provide, Query } from "@midwayjs/core";

/**
 */
@Provide()
@Controller('/api/connect')
export class LoginController extends BaseController {


  @Get('/login', { summary: Constants.per.guest })
  public async login(@Query(ALL) body: any) {
    //构造登录url
    return this.ok(1);
  }
  @Get('/callback', { summary: Constants.per.guest })
  public async callback(@Query(ALL) body: any) {
    //处理登录回调
    return this.ok(1);
  }

  @Post('/bind', { summary: Constants.per.guest })
  public async bind(@Body(ALL) body: any) {
    const autoRegister = body.autoRegister || false;
    const bindInfo = body.bind || {};
    //处理登录回调
    return this.ok(1);
  }
  
}
