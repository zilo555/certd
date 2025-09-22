#
set -e

echo "即将删除packages下除ui之外的其他目录，按y确认（如果您没有修改过源码，按y即可）"
read -p "y/n: " confirm
if [ $confirm != "y" ]; then
  echo "取消操作"
  exit 1
fi

find ./packages -mindepth 1 -maxdepth 1 -type d ! -name 'ui' -exec rm -rf {} +
echo "删除成功"

# 检查输入是否正确 循环输入
while true; do
  echo "是否后台运行(第一次运行建议选择n，调试没有问题之后，重新运行，选择y)"
  read -p "y/n: " confirmNohup
  # 校验输入是否正确
  if [ $confirmNohup != "y" ] && [ $confirmNohup != "n" ]; then
    echo "输入错误"
  else
    break
  fi
done


echo "安装pnpm, 前提是已经安装了nodejs"
sudo npm install -g pnpm --registry https://registry.npmmirror.com
echo "安装依赖"
sudo pnpm install --registry https://registry.npmmirror.com

echo "开始构建"
echo "构建certd-client"
export NODE_OPTIONS=--max-old-space-size=32768
cd packages/ui/certd-client
sudo -E pnpm run build
cp -r dist/* ../certd-server/public

echo "构建certd-server"
cd ../certd-server
sudo -E pnpm run build
echo "构建完成"
echo "启动服务"

# 前台运行
if [ $confirmNohup != "y" ]; then
  echo "当前运行模式为前台运行，ctrl+c或者关闭ssh将会停止运行"
  sudo pnpm run start
else
  echo "当前运行模式为后台运行，可以通过tail -f ./certd.log 命令查看日志"
  nohup sudo pnpm run start > certd.log &
fi


