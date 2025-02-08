# XSS靶场训练

<!--more-->
# XSS靶场

## level-1

发现有个name传参，看源代码 get 传参 name 的值 test 插入了 html 里头

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE%202024-01-10%20114617.png)

然后应用 alter 函数就能触发第二关，那么传入

```html
<script>alert()</script>
```

![image-20240110115137784](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110115137784.png)

## level-2

传入参数值

```html
<script>alert()</script>
```

查看源代码

![image-20240110120207165](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110120207165.png)

<>符号被转义，但是下面一句是正常的，传入的 ">和<"与前后形成闭合。从而被当作标签处理，所以传入

```html
"><script>alert()</script><"
```

## level-3

![image-20240110122014222](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110122014222.png)

查看源码发现上下都被转义了，

![image-20240110122656369](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110122656369.png)

有 input 标签，那么就 onfocus 事件绕过，所以传入

```html
' onfocus=javascript:alert() '
```

单引号和前后闭合，javascript: 是伪协议，传入后再次点击输入框触发。

## level-4

查看源代码发现 input 标签会自动删除尖括号，继续用level-3的方法，改成双引号闭合。记得空格

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/屏幕截图%202024-01-10%20123740.png)

## level-5

![image-20240110125142687](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110125142687.png)

查看源代码，

![image-20240110131008010](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110131008010.png)

直接看源码吧，发现函数 strtolower 会转为小写，所以不能大小写绕过。前几关的方法也用不了了，那么这里传入

```html
"><a href=javascript:alert()>xxx</a><"
```

![image-20240110131403812](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110131403812.png)

## level-6

比上一关多过滤了 href ，但这关可以使用大小写绕过

![image-20240110131916777](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110131916777.png)

因为str_replace()函数不区分大小写，这里又没加大写转小写的函数

## leve-7

查看源码发现会把关键字替换为空。可以双写绕过

![image-20240110132552305](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110132552305.png)

![image-20240110132533496](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110132533496.png)

## level-8

直接看源码

![image-20240110133649272](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110133649272.png)

过滤的有点多，可以使用unicode编码绕过

![image-20240110133248152](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110133248152.png)

在线编码网址：https://www.matools.com/code-convert-unicode，和另一种的区别

![image-20240110133443772](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110133443772.png)

## level-9

多了个条件

![image-20240110134023426](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110134023426.png)

也就是传的值要有 http:// ，即传入

```
&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#41;/* http:// */
```

![image-20240110134252187](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110134252187.png)

## level-10

查看源码

![image-20240110141536806](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110141536806.png)

发现有隐藏参数 t_sort ，可以看到还过滤了尖括号，用 onfocus 事件绕过。这里还要把 type 从 hidden 改为 test

```html
" onfocus=javascript:alert() type="text
```

![image-20240110141947763](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110141947763.png)

## level-11

![屏幕截图 2024-01-10 142511](https://raw.githubusercontent.com/gaorenyusi/img/master/img/屏幕截图 2024-01-10 142511.png)

四个隐藏参数，都进行传参，发现只有 t_sort 有数据，但被转义了，然后看wp说 ref 是 referer 头部的数据，然后过滤了<>

所以上面的payload继续用，利用hacker传到referer头部

![image-20240110142920775](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110142920775.png)

## level-12

看源码

![image-20240110143150144](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110143150144.png)

从ua不难看出是user agent头部，和上关区别不大

![image-20240110143133909](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110143133909.png)

## level-13

这次参数是 t_cook ，那么看来是cookie了，抓包看看参数

![image-20240110143905319](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110143905319.png)

user，那么给user传上面构造。得到

```
这个也行 " onclick=alert() type="text 
```

 ![image-20240110144009177](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110144009177.png)

## level-14

这关卡的 iframe 引用的地址打不开了，参考师傅们的14关可以自己本地搭建，意思就是引用到本地的网址，在本地放上 exif xss 漏洞。

![image-20240110150733127](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110150733127.png)

复制师傅们的代码，开启 exif ，

![image-20240110151156916](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110151156916.png)

把地址改为 `http://127.0.0.1:89`，然后上传的图片里面有xss恶意代码就会因为exif解析而触发，

![image-20240110151233093](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110151233093.png)

![image-20240110152053247](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110152053247.png)

后面换成了index.php，端口换一下就行，影响不大，

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/屏幕截图 2024-01-10 152026.png)

参考：[https://blog.csdn.net/qq_40929683/article/details/120422266](https://blog.csdn.net/qq_40929683/article/details/120422266)

## level-15

源代码

![image-20240110152712083](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110152712083.png)

```
ng-include指令就是文件包涵的意思，用来包涵外部的html文件，如果包涵的内容是地址，需要加引号
```

列如

![image-20240110153023441](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110153023441.png)

然后有

![image-20240110152757457](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110152757457.png)

![image-20240110153545619](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110153545619.png)

但是不能包涵那些直接弹窗的东西如`<script>`，可以包含手动弹窗，比如`<a>、<input>、<img>、<p>`标签等等，那么构造

```js
?src='/level1.php?name=<img src=1 onmouseover=alert()>'
```

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/屏幕截图 2024-01-10 153113.png)

## level-16

直接看源码

![image-20240110160746591](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110160746591.png)

首先 script 标签被过滤了，那么换其他的标签（用不需要用 / 符号的标签），至于空格用%0a代替

```
<img%0asrc="x"%0aonerror=alert("xss");>
```

![image-20240110161403426](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110161403426.png)

## level-17

直接看源代码

![image-20240110161807711](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110161807711.png)

![image-20240110162212566](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110162212566.png)

简单解释就是包含正确的区域就行了，把源码改为包含level15.png（swf文件要下载 flash player 插件才行）就能正常包含区域，然后传入

```
?arg01= onmouseover&arg02=alert()
```

![image-20240110162840688](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110162840688.png)

## level-18

看源码和17关差不多，改了包含文件直接传17关的payload

![image-20240110163847522](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110163847522.png)

## level-19

涉及到了 swf 的反编译，下载个flash player看看（不知道为啥重复了几遍）。根据师傅解释这里`flash`里面提示`sifr.js`是没有定义的，所以需要反编译看看源码。

![image-20240110182516967](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110182516967.png)

![image-20240110165821013](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110165821013.png)

工具 jpexs

![image-20240110175023082](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110175023082.png)

下载后，跟着师傅做

![image-20240110180041947](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110180041947.png)

发现flash显示的内容

![image-20240110175853022](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110175853022.png)

发现%s是显示内容的一个变量，溯源%s，

![image-20240110180150858](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110180150858.png)

读不懂，看师傅wp大概是和version有关，

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110180519029.png)

看不懂一点:sweat::sweat::sweat:，不管那么多了，跟着传入payload，那个version就是反编译看出来的，大概是version=123，然后find里%s就显示的123

![image-20240110181016412](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110181016412.png)

继续

```js
arg01=version&arg02=<a href="javascript:alert(/xss/)">xss</a>
```

![image-20240110181225647](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240110181225647.png)

## level-20

也要反编译，看看wp得了

参考：[https://blog.csdn.net/u014029795/article/details/103217680](https://blog.csdn.net/u014029795/article/details/103217680)


