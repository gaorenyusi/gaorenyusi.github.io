# 记一次 edu 证书站失败的逻辑漏洞

<!--more-->
# 记一次 edu 证书站失败的逻辑漏洞

闲来无事，在礼物中心看到个证书站，看名称感觉应该挺好挖的，简单信息搜集一波，在 hunter 上查看子域名，发现有个管理系统

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20241018222953476.png)

访问该链接，是个登录框

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20241018223030237.png)

现在需要去搞一手学号什么的了（因为是随便看看的所以没有先信息搜集），利用 hack 语法找了半天只找到 16，17 级的学生学号，尝试利用显示账号错误，看来还是需要找近几年的了，

又去 dy，xhs 等社交平台上找了半天发现没有竟然没找到，最后直接通过 16，17 的学号重新构造爆破的 24 级学号，尝试弱密码登录发现没戏，直接试试抓包改回包

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20241018223703357.png)

把回包的 402 改为 200

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20241018223808670.png)

提示

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20241019170338625.png)

说明应该是成功登录进去了，但是还是需要对用户进行鉴权才会显示功能点，那么既然登录存在逻辑漏洞，是否修改密码也存在相同的漏洞，

同理抓包修改

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20241019165933048.png)

发现直接来到了设置新密码，说明逻辑漏洞绕过成功了，

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20241019170819414.png)

最后修改密码成功，

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20241019170144626.png)

再次进行登录，发现还是提示账号或密码有误，

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20241019171048286.png)

猜测该逻辑漏洞可能只是前端逻辑漏洞，通过修改的响应值只能决定前端的显示。数据并没有写入后端。
