# 常见问题


## 1. 是否支持IP证书

因为ACME协议不支持IP证书，所以certd目前也不支持IP证书


## 2. 建议设置多长时间运行一次流水线
建议每天运行一次，检查证书过期时间
当证书没过期时，自动跳过部署
当证书到期前35天（创建流水线时可以修改），将会自动重新申请证书，自动部署


## 3. too many certificates 错误
当出现如下报错时，说明相同的域名短时间内申请超过5次
解决方案：可以加多一个子域名，重新执行就可以规避次错误
```
"detail": too many certificates (5) already issued for this exact set of idantifiers in the last 168hm0s
```