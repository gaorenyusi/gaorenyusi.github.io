# java反射机制

<!--more-->
## 基础内容

反射调用就是指通过反射机制进行的方法调用。反射机制是Java编程语言的一个重要特性，它允许程序在运行时检查、操作和实例化类，方法，字段等，并在运行时获取类的信息以及动态调用类的方法。反射机制使得Java程序可以在运行时动态地加载、探测和使用类，而不需要在编译时就知道这些类的具体信息。

通过反射机制，可以实现以下功能：

1. 获取类的信息：可以在运行时获取类的信息，如类的名称、父类、接口、成员变量、方法等。
2. 实例化类：可以通过类的名称动态实例化类的对象。
3. 调用方法：可以通过方法名动态调用类的方法。
4. 获取字段信息：可以通过字段名获取类的字段信息。
5. 动态代理：可以在运行时动态生成代理类，实现代理相关的功能。

## java基本反射调用

反射调用一般分为4个步骤：

* 类的实例化
* 得到要调用类的class
* 得到要调用的类中的方法(Method)
* 方法调用(invoke)

#### **obj.getClass()获得类：**

demo：

```java
import java.lang.reflect.Method;
public class Main{
    public static void main(String[] args) throws Exception{
        Reflect r1= new Reflect(); //对类进行是实例化
        r1.print(1,3); //直接调用
        Class c = r1.getClass(); //获取实列化对象所属类的类的对象
        Method m1 = c.getMethod("print",int.class,int.class); //获得方法
        Object i = m1.invoke(r1, 1, 2); //反射机制调用方法
    }
}
class Reflect{
    public void print(int a,int b){
        System.out.println(a+b);
    }
}
```

上面分别是两种调用类的方法的方法

第一种是通过类的实例化直接调用，

第二种是通过类的对象用`getMethod`获得方法，然后利用反射机制调用方法；

至于一些函数的具体使用如`getClass`，`getMethod`,`invoke`可以直接问gpt。

加上`throws Exception`是因为`getMethod()`和`invoke()`方法会抛出`NoSuchMethodException`、`IllegalAccessException`、`IllegalArgumentException`等异常，可以去掉看看报错。

<font color=red>那么可以利用这种反射调用来调用恶意类实现rce：</font>

```java
import java.lang.reflect.Method;
public class Main{
    public static void main(String[] args)throws Exception {
        Runtime runtime=Runtime.getRuntime(); //获得Runtime的实例化
        runtime.exec("calc.exe"); //实列化直接调用
        Class c=runtime.getClass();
        Method m1=c.getMethod("exec",String.class);
        Object i=m1.invoke(runtime,"calc.exe");  //过程同上
    }
}
```

为什么这里不用`Runtime runtime=new Runtime();`来进行实例化，这个后面再说。

剩下的步骤的就不用多解释了，通过`getClass()`来获取类对象，从而用`getMethod`获取方法，在用反射进行调用来执行命令。

#### **Class.forName()获得类**

还可以直接通过`Class.forName()`反射获得类（根据给定的类名加载并返回对应的 `Class` 对象），通过反射调用方法getRuntime得到类的实例化，最后调用exec方法。

```java
import java.lang.reflect.Method; //引入Method类
public class Main{
    public static void main(String[] args) throws Exception{ //抛出异常就不说了
        Class c=Class.forName("java.lang.Runtime");  //获得类得class对象
        Method m1= c.getMethod("getRuntime",new Class[]{}); //利用getMethod获得getRuntime方法
        Object runtime=m1.invoke(null); //利用反射来调用方法getRuntime
        Method m2=c.getMethod("exec",String.class); //利用getMethod获得getRuntime方法
        Object o=m2.invoke(runtime,"calc.exe"); //反射调用exec方法
    }
}
```

null是因为getRuntime是静态方法，静态方法不用实例化的对象就能调用。

![QQ截图20240428222037](https://s2.loli.net/2024/06/03/8aox4KZj9BlNSOR.png)

![QQ截图20240602194554](https://s2.loli.net/2024/06/03/HdyqC8ARl2fiUz4.png)

这样可以获得Runtime得实列化对象后就能调用exec方法了。

简写一下：

```java
public class Main{
    public static void main(String[] args) throws Exception{
        Object runtime=Class.forName("java.lang.Runtime").getMethod("getRuntime",new Class[]{}).invoke(null);
        Class.forName("java.lang.Runtime").getMethod("exec",String.class).invoke(runtime,"calc.exe");
    }
}
```

这样就不用引入`Method`类了（当然这里虽然获得实列化对象的效果一样，还是略有区别的）这里的实列化不能直接调用方法机进行命令执行`runtime.exec("calc.exe");`

想要直接调用方法还需要强制类型转换：

```java
public class Main{
    public static void main(String[] args) throws Exception{
        Object runtime=Class.forName("java.lang.Runtime").getMethod("getRuntime",new Class[]{}).invoke(null);
        Runtime run=(Runtime) runtime;
        run.exec("calc.exe");
    }
}
```



**上面写了两种获得Class类的方法，一般是三种方法：**

* obj.getClass()：获得实例化对象所属类的的类。
* Class.forName：知道某个类的名字，想获取到这个类，直接用forName来获取。
* Test.class：如果已经加载了某个类，只是想获取到它的`java.lang.Class`对象，可以直接拿到它的Class属性。这个方法其实不属于反射了。

**<font color=red>综上所述，反射三要素：类的对象(类)，类的实列化对象，方法。</font>**

## 获得类的实列化对象

#### **一、Class.newInstance获取**

获得类的实例化对象一般使用`Class.newInstance`（虽然上面的例子是使用的是getRuntime方法），但很多情况下会失败，因为这个方法只能调用无参构造函数，对于一些类里面**没有无参构造函数**或者**是私有属性的构造方法**就会失败。

#### **二、静态方法调用**

上面的Runtime类就是一个例子，它的无参构造函数就是私有属性，但它是单列模式，可以通过静态方法`getRuntime()`调用其构造函数进行实例化（搞成私有属性利用方法进行调用的目的是为了防止建立多次数据库连接）。

![QQ截图20240602220638](https://s2.loli.net/2024/06/03/5R4A3wzeugXZLml.png)

但是对于一些于没有静态方法的又该怎么办呢。

#### **三、getConstructor()函数**

对于**没有静态方法**或者**构造函数有参**时可以用一个新的反射方法进行获取，`getConstructor()`(无参有参都可以获取)

和`getMethod`类似，`getConstructor`的接收参数是构造函数列表类型（因为构造函数也支持重载），获取到构造函数再使用`newInstance`来执行就可以获得类的实列化对象。

例如常用的另一种命令执行方式`ProcessBuilder`，使用反射来获取其构造函数，然后调用start来进行命令执行：

```java
import java.lang.reflect.Constructor;
import java.util.Arrays;
import java.util.List;

public class Main{
    public static void main(String[] args)throws Exception{
        Class c=Class.forName("java.lang.ProcessBuilder"); //获取类
        Constructor con=c.getConstructor(List.class);  //获得有参构造函数，如果要获得无参就什么都不用添
        Object obj=con.newInstance(Arrays.asList("calc.exe")); //进行实列化
        ProcessBuilder pro = (ProcessBuilder) obj; //强制类型转换
        pro.start(); //调用方法
    }
}
```

全反射调用:

```java
import java.lang.reflect.Constructor;
import java.util.Arrays;
import java.util.List;

public class Main{
    public static void main(String[] args)throws Exception{
        Class c=Class.forName("java.lang.ProcessBuilder");
        Constructor con=c.getConstructor(List.class);
        Object obj=con.newInstance(Arrays.asList("calc.exe"));
        c.getMethod("start").invoke(obj); //利用反射进行方法调用
    }
}
```

进入`ProcessBuilder`类看见还有个有参构造方法，参数类型是`ProcessBuilder(String... command)`，即可变长参数

![QQ截图20240602222959](https://s2.loli.net/2024/06/03/kfNrsJwAYoMjxQ2.png)

对于可变长参数，java在编译时会编译为一个数组，也就是说，下面写法底层上是等效的（不能重载）

```java
public void m1(String[] names){}
public void m1(String... names){}
```

因此对m1函数传参就直接传数组

```java
String[] names={"hello","world","!!!!"};
m1(names)；
```

所以还可以这样构造：

```java
import java.lang.reflect.Constructor;

public class Main{
    public static void main(String[] args)throws Exception{
        Class c=Class.forName("java.lang.ProcessBuilder");
        Constructor con=c.getConstructor(String[].class);
        Object obj=con.newInstance(new String[][]{{"calc.exe"}}); //因为newInstance接受的参数是Object... args，所以这里传入的是二维数组，二维数组在处理是会当作一个整体对象处理
        c.getMethod("start").invoke(obj);
    }
}
```

或者把参数强制类型转换为object：

```java
import java.lang.reflect.Constructor;

public class Main{
    public static void main(String[] args)throws Exception{
        Class c=Class.forName("java.lang.ProcessBuilder");
        Constructor con=c.getConstructor(String[].class);
        Object obj=con.newInstance((Object) new String[]{"calc.exe"}); //强制类型转换
        c.getMethod("start").invoke(obj);
    }
}
```

**有参的构造方法大概就是这样了**

当然这个类是可以直接调用的：

```java
public class Main{
    public static void main(String[] args)throws Exception{
        ProcessBuilder pro=new ProcessBuilder("calc.exe");
        pro.start();
    }
}
```

#### **四、getDeclared系列**

**构造函数为私有方法的解决办法：**

这就涉及到`getDeclared`系列的反射了，与普通的 `getMethod` 、 `getConstructor` 区别是： 

`getMethod` 系列方法获取的是当前类中所有公共方法，包括从父类继承的方法 

`getDeclaredMethod` 系列方法获取的是当前类中“声明”的方法，是实在写在这个类里的，包括私有的方法，但从父类里继承来的就不包含了 

 `getDeclaredMethod` 的具体用法和 `getMethod `类似， `getDeclaredConstructor` 的具体用法和 `getConstructor` 类似，不再赘述。

举个例子，上面说了Runtime的构造函数是私有方法，试一试：

```java
import java.lang.reflect.Constructor;

public class Main {
    public static void main(String[] args) throws Exception {
        Class clazz = Class.forName("java.lang.Runtime");
        Constructor constructor = clazz.getDeclaredConstructor();  //获取私有的无参构造函数
        constructor.setAccessible(true); //修改其作用域，必须的
        Object runtime = constructor.newInstance();  //进行实例化
        clazz.getMethod("exec", String.class).invoke(runtime, "calc.exe"); //反射调用方法
    }
}
```

jdk11虽然有很多报错但是还是能执行：

![QQ截图20240506191157](https://s2.loli.net/2024/06/03/mE3n4fdbIVRGW8S.png)

jdk1.8（java8）就能完美执行：

![QQ截图20240506191429](https://s2.loli.net/2024/06/03/DmvcVXx8NtLI4kB.png)

## 总结一下：

* 获取Class对象一般有三种方法`Class.forName`,`obj.getClass`,`test.class`
* 获取实列化类一般直接`newInstance`，失败就两种情况要么是有参构造函数，要么就是私有的。一般有静态调用方法就直接用方法，如：`getRuntime`,没有就`Constructor`配合`newInstance`，私有的就用`getDeclared`系列的反射
* 最后就是`getMethod`获取方法然后`invoke`进行调用方法。

## 利用反射一个重要目的就是绕沙盒机制（forName）

例如上下文只有intger类型的数字，怎么获得Runtime类

`123.getClass().forNmae("java.lang.Runtime");`

forName有两个函数重载：  

* `Class<?> forName(String name) `

* `Class<?> forName(String name, **boolean** initialize, ClassLoader loader)` 

第一个就是我们最常见的获取class的方式，其实可以理解为第二种方式的一个封装：

```java
Class.forName(String name)
//等于
Class.forName(Stirng name,true,currentLoder)
```

 默认情况下， forName 的第一个参数是类名；第二个参数表示是否初始化；第三个参数就 是 ClassLoader 。 

ClassLoader 是什么呢？它就是一个“加载器”，告诉Java虚拟机如何加载这个类。 Java默认的 ClassLoader 就是根据类名来加载类， 这个类名是类完整路径，如 java.lang.Runtime 

现在来说说第二个参数可能造成的漏洞：

第二个参数的意思是告诉java虚拟机是否执行“类初始化”

例子：

```java
public class Main {
    {
        System.out.println("1block initial" + this.getClass());
    }

    static {
        System.out.println("2initail" + Main.class);
    }

    public Main() {
        System.out.println("3initial:" + this.getClass());
    }

    public static void main(String[] args) {
        Main main = new Main();
    }
}
```

结果：

![QQ截图20240506152357](https://s2.loli.net/2024/06/03/NOlGMCKmSJ5pXwE.png)

可以看到首先调用的是static{}，然后是{}，最后是构造函数{}

static{}是在“类初始化”调用，而{}中的代码会在构造函数的`super()`后面，在当前构造函数前面

所以当有如下代码(name可控)：

```java
public void ref(String[] name)throws Exception{
		Class.forName(name);
}
```

就可以构造个static{}的执行代码，例如：

```java
import java.lang.Runtime; 
import java.lang.Process; 

public class TouchFile { 
	static { 
		try { 
            Runtime rt = Runtime.getRuntime(); 
		   String[] commands = {"touch", "/tmp/success"}; 
		   Process pc = rt.exec(commands); pc.waitFor(); 
		} 
	catch (Exception e) { 
		// do nothing 
		} 
	} 
}
```

那么就会在初始化类时执行代码。
