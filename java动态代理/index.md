# java动态代理

<!--more-->
## 代理模式是什么

**一、概念**

在有些情况下，一个客户不能或者不想直接访问另一个对象，这时需要找一个中介帮忙完成某项任务，这个中介就是代理对象。

例如：购买火车票不一定要去火车站买，可以通过 12306 网站或者去火车票代售点买。又如找女朋友、找保姆、找工作等都可以通过找中介完成。平时的交作业也是通过中介（课代表）来完成的。

**二、定义**

由于某些原因需要给某对象提供一个代理以控制对该对象的访问。

访问对象不适合或者不能直接引用目标对象，代理对象就可以作为访问对象和目标对象之间的中介。

**三、代理模式中涉及的主要成员**

* *抽象角色*：通过接口或抽象类*声明*真实主题和代理对象实现的业务方法。
* *真实角色*：*实现*了抽象主题中的具体业务，是代理对象所代表的真实对象，是最终要引用的对象。
* *代理*：提供了与真实主题相同的接口，其内部含有对真实主题的引用，它可以访问、控制或扩展真实主题的功能。
* *客户* : 将要使用代理角色来进行一些操作 。

**四、优点（都是些客套话）**

* 代理模式在客户端与目标对象之间起到一个中介作用和保护目标对象的作用
* 代理对象可以扩展目标对象的功能
* 代理模式能将客户端与目标对象分离，在一定程度上降低了系统的耦合度，增加了程序的可扩展性

**五、缺点**

* 冗余，由于代理对象要实现与目标对象一致的接口，会产生过多的代理类
* 系统设计中类的数量增加，变得难以维护

## 静态代理

需要代理对象和目标对象实现一致的接口。

例如：学生交作业，一般都是学生先交给课代表，课代表交给老师这种模式。课代表在这里相当于说一个学生代理类。

homework.java（抽象角色：交作业）

```java
//抽象角色：交作业
public interface homework {
    public void hwsent();
}
```

student.java（真实角色：学生）

```java
//真实角色：学生，交作业
public class student implements homework {
    public void hwsent() {
        System.out.println("张三交作业");
    }
}
```

Proxy.java（代理：课代表）

```java
//代理：课代表
public class Proxy implements homework{
    student Student; 
    public Proxy(student stu){  //代理类的构造函数，参数是待会传入的学生类的实列化
        this.Student = (student) stu;
    }
public void Helpsubmit(){    //添加的功能
        System.out.println("课代表帮忙交作业");
}
    public void hwsent() {  //接口方法的重写
        Helpsubmit();
        this.Student.hwsent();//调用学生类的方法hwsent()
    }
}
```

Main.java（客户：老师，收学生作业）

```java
public class Main{
    public static  void main(String[] args){
        System.out.println("老师收作业");
        student stu=new student(); 
        Proxy kdb=new Proxy(stu);
        kdb.hwsent(); //通过调用课代表的hwsent()，而课代表的hwsent()方法又调用了学生的hwsent()方法来实现调用学生的hwsent()
    }
}
```

![QQ截图20240621163830](https://raw.githubusercontent.com/gaorenyusi/img/master/img/QQ%E6%88%AA%E5%9B%BE20240621163830.png)

在这个过程中，老师接触的是课代表，没有接触到具体学生，但是依旧能够收到作业。

**缺点：**一旦实现的功能增加，将会变得异常冗余和复杂，而且当需要的代理的对象过多就需要实现大量的代理类。

所以又有了动态代理。

## 动态代理

与静态代理相同，需要公共接口（抽象角色），委托类（也就是上面的学生，真实角色），代理类。区别就是动态代理是利用反射机制在运行时创建代理类，这样可以解决静态代理代码冗余，难以维护的缺点。

在Java中常用的动态代理有如下几种方式：

- JDK 原生动态代理
- cglib 动态代理
- javasist 动态代理

### JDK 原生动态代理

1. 首先实现一个`InvocationHandler`，方法调用会被转发到该类的invoke()方法。具体看下面`newProxyInstance`方法的第三个参数。
2. 然后在需要使用student的时候，通过JDK动态代理获取student的代理对象。(下面的代理类就是上面所说的委托类)

**一、`InvocationHandler.invoke`方法**

负责提供调用代理的操作:

```java
public interface InvocationHandler {
    public Object invoke(Object proxy, Method method, Object[] args)
        throws Throwable;
}
```

其中`proxy`为代理类的实例对象，`method`表示调用的方法名，`args`为调用方法的参数数组。

那么既然代理对象是重写的接口的方法，而proxy又为代理类的实列对象，所以只要method为接口的方法就可以通过反射来调用代理对象的重写后的方法：

```java
method.invoke(proxy,arg);
```

所以构造一个新的`Handler`：

```java
// 首先实现一个InvocationHandler，方法调用会被转发到该类的invoke()方法，重写InvocationHandler接口的invoke方法。
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

class ProxyHandler implements InvocationHandler{
    public homework hw; 
    public ProxyHandler(homework work) {
        this.hw = work; ////设置需要代理的对象
    }
    public Object invoke(
            Object proxy,  //代理类的实例对象，也就是构造函数传下来的this.hw
            Method method, //调用的方法，由前面决定
            Object[] args) //调用方法的参数数组
            throws Throwable { 
        return method.invoke(hw, args);//反射调用student.hwswent()方法
    }
}
```

可以看出只要调用到了`ProxyHandler.invoke`方法后，`proxy`和`method`都是满足我们想要的就能成功调用到`student.hwsent()`方法。

那么又该怎么来调用`ProxyHandler.invoke`方法呢？接着看

**二、`Proxy.newProxyInstance`方法**

`Proxy`类：负责动态构建代理类，提供了一个静态方法用于得到代理对象：

```java
newProxyInstance(ClassLoader,Class<?>[],InvocationHandler);
```

`loader`指定代理对象的类加载器，`interfaces`是指代理对象需要实现的接口，可以同时指定多个接口，`handler`是方法调用的实际处理者，代理对象的方法调用都会转发到这里

`Proxy.newProxyInstance`会返回一个实现了指定接口的代理对象（这里就是实现homework接口的student嘛），对该对象的所有方法调用都会转发给`handler.invoke()`方法（假如返回的代理对象名字是`stu`，那么`stu.hwsent()`方法调用时就会转发到`handler.invoke()`方法）。

可以看到如果`handler`为`ProxyHandler`，就能触发`ProxyHandler.invoke`方法了，在`invoke()`方法里我们除了可以加入反射调用`student.hwsent`方法外，我们还可以加入其他任何逻辑，比如修改方法参数，加入日志功能、安全检查功能等等。

是不是感觉这个重写`invoke`方法不就是像上面静态代理的Proxy中的`hwsent`一样嘛，唯一区别就是可以通过前面的`newProxyInstance`传入的值来动态改变方法和代理对象，比静态代理方便了很多。

所以构造handler的invoke方法（比上面多加一句话）：

```java
// 首先实现一个InvocationHandler，方法调用会被转发到该类的invoke()方法，重写InvocationHandler接口的invoke方法。
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

class ProxyHandler implements InvocationHandler{
    public homework hw;
    public ProxyHandler(homework work) {
        this.hw = work;
    }
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("课代表帮忙交作业");
        return method.invoke(hw, args);
    }
}
```

客户（老师：收作业）

```java
// 2. 然后在需要使用student的时候，通过JDK动态代理获取student的代理对象。
import java.lang.reflect.Proxy;

public class Main{
    public static  void main(String[] args){
    student stu=new student();
        homework home = (homework) Proxy.newProxyInstance(
                stu.getClass().getClassLoader(), //1. 指定代理对象的类加载器
                new Class<?>[] {homework.class}, // 2. 代理需要实现的接口，可以有多个
                new ProxyHandler(stu));// 3. 方法调用的实际处理者，代理对象的方法调用都会转发到这里
        System.out.println("老师收作业");
        home.hwsent();
    }
}
```

最后效果和静态代理一样：

![QQ截图20240621200055](https://raw.githubusercontent.com/gaorenyusi/img/master/img/QQ%E6%88%AA%E5%9B%BE20240621200055.png)

### CGLIB动态代理

JDK动态代理还有上面的静态代理都是基于公共接口的，如果对象没有实现接口该如何代理呢？CGLIB代理登场

CGLIB(*Code Generation Library*)是一个基于ASM的字节码生成库，它允许我们在运行时对字节码进行修改和动态生成。CGLIB通过继承方式实现代理。

使用cglib需要引入cglib的jar包，在pom.xml中添加下面这段内容，然后重新加载

```xml
<dependency>
    <groupId>cglib</groupId>
    <artifactId>cglib</artifactId>
    <version>3.3.0</version>
</dependency>
```

如果出现这个就是ok了：

![QQ截图20240621201108](https://raw.githubusercontent.com/gaorenyusi/img/master/img/QQ%E6%88%AA%E5%9B%BE20240621201108.png)

假如现在的代理类`student`没有实现接口：

```java
public class student{
    public void hwsent() {
        System.out.println("张三交作业");
    }
}
```

和 jdk 动态代理差不多

1. 首先实现一个MethodInterceptor，方法调用会被转发到该类的intercept()方法。
2. 然后在需要使用student的时候，通过CGLIB动态代理获取代理对象。

**一、`MethodInterceptor.intercept()`方法**

对其进行重写：

```java
import net.sf.cglib.proxy.MethodInterceptor;
import net.sf.cglib.proxy.MethodProxy;
import java.lang.reflect.Method;

public class RentMethodInterceptor implements MethodInterceptor {
    public Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) throws Throwable {
        System.out.println("课代表帮忙交作业");
        return proxy.invokeSuper(obj, args);
    }
}
```

`obj`: 表示代理对象，`method`: 表示正在被调用的方法，`args`: 表示方法调用时传递的参数数组，`proxy`: 表示用于调用原始方法的 `MethodProxy` 对象（比上面的`InvocationHandler.invoke`方法多了一个参数，也正是这个参数可以使其在没有接口依然能实现动态代理）

至于`proxy.invokeSuper(obj, args);`这里的方法调用我就没深入跟进了，大概意思就是proxy是个代理类，而proxy.invokeSuper(obj, args)是调用代理类的父类（被代理类）的方法，这个感觉不用怎么管，这是这个工具自己的构造。

**二、`Enhancer`类**

构造：

```java
import net.sf.cglib.proxy.Enhancer;

public class Main{
    public static  void main(String[] args){
    student stu=new student();
        Enhancer en = new Enhancer(); //工具类
        en.setSuperclass(stu.getClass()); //设置父类
        en.setCallback(new RentMethodInterceptor()); //设置回调函数
        student proxy = (student) en.create(); //代理对象
        //上面的步骤就理解为这个工具使用Enhancer类进行代理的相关设置吧
        System.out.println("老师收作业");
        //执行代理对象方法
        proxy.hwsent();
    }
}
```

![QQ截图20240621210742](https://raw.githubusercontent.com/gaorenyusi/img/master/img/QQ%E6%88%AA%E5%9B%BE20240621210742.png)

