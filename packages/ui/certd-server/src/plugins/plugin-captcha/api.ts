export interface  ICaptchaAddon{
  onValidate(data?:any):Promise<any>;
  getCaptcha():Promise<any>;
}
