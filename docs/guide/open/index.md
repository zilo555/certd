# 开放接口
被动方式对第三方提供证书， 支持根据域名或证书id获取证书。

## 获取keyId和KeySecret

![](./images/1.png)

## 接口文档

https://apifox.com/apidoc/shared-2e76f8c4-7c58-413b-a32d-a1316529af44/254949529e0


## Token生成方法

header中传入x-certd-token即可调用开放接口   
1、首先从OpenKey页面生成keyId，keySecret；    
2、准备一个content( json字符串)： content={"keyId":keyId, t:时间戳秒数, encrypt:false, signType:"md5"} `// encrypt返回结果是否加密`   
3、将content加上keySecret进行签名： sign = md5(content + keySecret)   
4、然后将content和sign分别base64后用.号连接： x-certd-token = base64(content) +"."+base64(sign)   


## 补充说明
1.证书申请接口支持证书id和域名两种方式获取证书。
2.autoApply=true将在没有证书时自动触发申请，申请过程中会提示`正在申请中`，可轮循获取状态，直到证书申请成功。


## SDK
待开发

## 客户端工具

### SSL-Assistant
`SSL Assistant` 是一个基于 Go 语言开发的跨平台证书部署管理助手。    
支持自动扫描主机`Nginx`配置，然后从Certd拉取证书并部署。     
在不想暴露ssh主机密码情况下，该工具非常好用。

开源地址： https://github.com/Youngxj/SSL-Assistant