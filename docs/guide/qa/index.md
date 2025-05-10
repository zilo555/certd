# 常见报错解决

## 1. getaddrinfo ENOTFOUND错误
如果出现`getaddrinfo ENOTFOUND`错误，可以尝试在`docker-compose.yaml`中设置dns
```yaml
version: '3.3' # 兼容旧版docker-compose
services:
  certd:
    #↓↓↓↓ ------------ # 如果出现getaddrinfo ENOTFOUND错误，可以尝试设置dns
    dns:
      - 223.5.5.5      # 阿里云公共dns
      - 223.6.6.6
#       # ↓↓↓↓ ------- # 如果你服务器在腾讯云，可以用这个替换上面阿里云的公共dns
#      - 119.29.29.29  # 腾讯云公共dns
#      - 182.254.116.116
#       # ↓↓↓↓ ------- # 如果你服务器部署在国外，可以用这个替换上面阿里云的公共dns
#      - 8.8.8.8       # 谷歌公共dns
#      - 8.8.4.4
```