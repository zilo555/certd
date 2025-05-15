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

如果仍然有问题,按如下步骤检查是否能够ping通域名
```shell
docker exec -it certd /bin/sh
ping www.baidu.com
ping gg.px.certd.handfree.work
ping app.handfree.work
```

如果您是宝塔部署的
可以试试将容器网络加入brige网络，看是否解决问题
![img.png](images/baota-net.png)

如果还是不行，请联系我们


## 2. 连接IPv6超时
docker-compose 需要放开IPv6网络的配置
```yaml
services:
  certd:
    networks:
      - ip6net
#    ↓↓↓↓ -------------------------------------------------------------- 启用ipv6网络，还需要把上面networks的注释放开
networks:
  ip6net:
    enable_ipv6: true
    ipam:
      config:
        - subnet: 2001:db8::/64

```

## 3. SSL_CERT_NOT_MATCH_DOMAIN_ERROR
部署证书任务报类似 `SSL_CERT_NOT_MATCH_DOMAIN_ERROR`错误
这是由于当前流水线的证书域名与要部署的目标站点的域名不匹配导致的，在申请证书任务中，增加目标站点域名，重新运行流水线即可


## 4. 没有服务器配置文件，请检查是否开启了外网映射！
宝塔网站证书部署报错：`Error: 没有服务器配置文件，请检查是否开启了外网映射！`    
解决方案：先手动在宝塔网站中设置一次证书    


## 5. 如何查看容器日志
```shell
docker logs -f --tail 200 certd
```







