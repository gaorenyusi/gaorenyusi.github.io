# URLDNS链分析

<!--more-->
## 配置调试ysoserial

下载项目ysoserial：https://github.com/frohoff/ysoserial

idea打开，在pom.xml下载好需要用的所有依赖。下载依赖的时候一定要把配置文件全勾上：

![QQ截图20240604105647](https://s2.loli.net/2024/06/05/sCDN6j2mnRtIFQB.png)

下载完成，看到没有报错后，就可以开始调试ysoserial了。

再pom.xml中找到入口类：

![QQ截图20240604105518](https://s2.loli.net/2024/06/05/Tr2cCs7g4fBvmyo.png)

跟踪入口类，右键点击调试发现只会打印uage信息：

![QQ截图20240604114457](https://s2.loli.net/2024/06/05/D4xpvrW6VfSJNUd.png)

![QQ截图20240604114511](https://s2.loli.net/2024/06/05/SfEoinL5Ikcl8x7.png)

这是因为我们没有传入参数，需要进行调试配置：

![QQ截图20240604115409](https://s2.loli.net/2024/06/05/vpKhNr1AcDyRuC4.png)

然后再次点击调试，发现序列化成功(呃，上面的地址需要加个http://头)：

![QQ截图20240604115621](https://s2.loli.net/2024/06/05/HlXqvYp68f5ZIkG.png)

然后就可以通过打断点对ysoserial的URLDNS链进行调试了。

## URLDNS链分析

`URLDNS` 是ysoserial中利用链的一个名字，通常用于检测是否存在Java反序列化漏洞。该利用链具有如下特点：

- 不限制jdk版本，使用Java内置类，对第三方依赖没有要求
- 目标无回显，可以通过DNS请求来验证是否存在反序列化漏洞
- URLDNS利用链，只能发起DNS请求，并不能进行其他利用

学了前面的java序列化，我们知道了要想利用反序列化漏洞就得要重写readObject，不然连最基本的反序列化都做不到。

ysoserial在URLDNS.java中已经写出了利用链：

```java
    Gadget Chain:
      HashMap.readObject()
        HashMap.putVal()
          HashMap.hash()
            URL.hashCode()
```

先看URLDNS.java类（属于ysoserial工具自己的类）：

![QQ截图20240604122409](https://s2.loli.net/2024/06/05/WCyo9LAhiSbxVGE.png)

这个类继承了一个泛型为对象的接口，然后第一步先实例化了一个handler，SilentURLStreamHandler这个类继承了URLStreamHandler，并重写openConnection和getHostAddress方法返回空，这个作用后面在说。

![QQ截图20240604125643](https://s2.loli.net/2024/06/05/ekR16jcuQqaLOPt.png)

之后创建hashMap、URL对象，然后将URL对象，也就是DnsLog的地址put进hashmap（这个put方法后面在跟进细说）。

然后通过反射调用重置hashCode的值为-1，再返回（作后面再说）。

可以看出：最终的payload结构是一个`HashMap`，里面包含了 一个修改了`HashCode`为-1的`URL`类。

跟进到`HashMap`类

![QQ截图20240604141656](https://s2.loli.net/2024/06/05/WX3UCj8zOrIi5Vs.png)

可以看到HashMap是个泛型可以接受类，并且继承了Serializable接口，可以实现序列化和反序列化。

反序列化时会调用readObject函数，搜索发现这里重写的`readObject()`函数。

![QQ截图20240604144330](https://s2.loli.net/2024/06/05/ArZQaYchbUvOuwx.png)

红框上面的就是一些对传入数据的检测，方法中最关键的就是红框部分，可以看出通过反序列化取出了k和v并对其调用putVal方法。

跟进行putVal方法没有什么好看的，就是把k和v放入table中。

回到readObject的putVal方法里面还调用了hash方法处理我们传入key。

跟进hash()，看到这个方法的内容并不多。

![QQ截图20240604145013](https://s2.loli.net/2024/06/05/BElvrpjVZkCHFfD.png)

会先判断key是否为空，不是空就调用hashCode来获取值的哈希码（即生成哈希值）。

继续跟进hashCode发现怎么到Object类了。

后面才知道不同对象的hash计算方法是在各自的类中实现的，也就是是说重写了Object类的hashCode方法。这里`key.hashCode()`调用URL类中的hashCode方法：`java.net.URL#hashCode`，跟进一下。

![QQ截图20240604150630](https://s2.loli.net/2024/06/05/UDjQwWcrnzgkxPJ.png)

如果hashCode不等于-1则直接返回，表示已经算过了，否则就调用handler类里面的hashCode方法。上面可以看到hashCode默认就是-1。

![QQ截图20240604150948](https://s2.loli.net/2024/06/05/jC1qbHLDNmz5YVI.png)

那么可以跟进handler的hashCode方法，

![QQ截图20240604151143](https://s2.loli.net/2024/06/05/w7Ui9PTEg8tZb65.png)

getHostAddress是获取ip地址，跟进一下getHostAddress方法，到达最终利用场景。

![QQ截图20240604180152](https://s2.loli.net/2024/06/05/foLWlR1ESxvtZTF.png)

可以看到其逻辑，判断是否有主机名，有就直接返回，没有就执行getByName触发解析然后返回。

那么链子主要的就这些了，但怎么感觉这个链子似乎和我们的payload没有关系呢。确实没有关系，这里分析的URLDNS链是利用链也就是说可以传入payload到readObject进行利用最后会造成DNS解析。

## ysoserial生成payload分析

这里生成paylaod是进行的序列化，利用的writeObject方法来把url进行序列化，经过调试发现ysoserial在生成URLDNS的payload时是不会调用readObject的（当然不动脑子都知道没有调用），但从上面的URLDNS类不难看到其调用了hashMap的put方法，跟进put方法：

![QQ截图20240604193005](https://s2.loli.net/2024/06/05/wOs82XRH6VzZEFW.png)

发现也是putVal方法，后面的就和readObject中一样了，会对url进行解析。但为什么在生成payload时明明调用了put方法却在DNSlog并没有收到请求呢。

回到最开始说的，发现重写了openConnection和getHostAddress方法使其返回为空，在调试时从put方法步过也可以看到直接到了`return null`，所以上面重写的目的就是为了防止在生成payload时发起DNS解析，至于重写openConnection方法的作用是实现类必须实现父类的所有抽象方法。但是如果看到我下面进行验证时会发现readObject在调用时为什么又会进行解析。

其实具体调用哪个类的getHostAddress方法是由handler来看的，跟进hanlder发现put时的handler是：

![QQ截图20240604220246](https://s2.loli.net/2024/06/05/Zx5KqYp6wdOc9bB.png)

而在反序列化时，URLStreamHandler是由transient修饰的，被`transient`修饰的变量无法被序列化，所以最终反序列化读取出来的`transient`依旧是其初始值，也就是`URLStreamHandler`，所以最后还是调用的`URLStreamHandler`的getHostAddress方法。

![QQ截图20240604214801](https://s2.loli.net/2024/06/05/4otSjKq8yIXQOGB.png)

那么生成payload时把hashCode设为-1又是为什么呢。这是因为在前面`HashMap#put`时已经调用过一次`hashCode()`函数，`hashCode`的值会改变不再为`-1`，那么进行漏洞验证传入readObject时就会直接返回HashCode值了。所以还得利用反射来让hashCode变为-1。



综上怎么感觉put这么麻烦又会触发dns解析又会让hashCode不为-1，就不能去掉吗？

这里就要看进行序列化时重写的writeObject方法了：

![QQ截图20240604221136](https://s2.loli.net/2024/06/05/1vyn85FlmRVJPCX.png)

看到就是将对象的默认序列化写入到输出流和将 `buckets` 变量的值和`size`变量的值写入到输出流。还有就是有个自定义的方法，跟进看看：

![QQ截图20240604221859](https://s2.loli.net/2024/06/05/gt6nqKIYNiwSGBs.png)

可以发现它让tab值等于table值，然后从中取出键值进行序列化。那么这个table是哪来的呢？

就是put方法中的putVal改变的。所以需要调用put方法才能成功序列化。至于反序列就和table没有关系了，就是正常的进行反序列化拿到kv值。

## ysoserial验证整条URLDNS链子

最后可以利用PayloadRunner.run()来进行一次完成的利用。

配置好参数后开始条调试：

![QQ截图20240604215512](https://s2.loli.net/2024/06/05/pOn2r3lazSZyLuo.png)

继续向下运行，可以看到对payload进行了序列化，

![QQ截图20240604215656](https://s2.loli.net/2024/06/05/4IwWDTjtcsyg8Cm.png)

调用的序列化函数writeObject是hashMap重写后的

继续向下，接下来要进行的是反序列化。

![QQ截图20240605121523](https://s2.loli.net/2024/06/05/SNlOwVYfApxeEXF.png)

跟进发现调用的就是hashMap的readObject方法。

readObject后面的内容我们就熟悉了，上面也说了readObject下面调用的getHostAddress就是URLStreamHandler类的，所以最后执行会有一次解析，在dnslog平台可以看到。

至此工具ysoserial的由生成payload到执行payload的链子就这样了。
