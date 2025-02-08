# java反序列化

<!--more-->
## 序列化反序列化基础

在Java语言中，实现序列化与反序列化的类：

位置： `Java.io.ObjectOutputStream` 　　`java.io.ObjectInputStream`

序列化： 　`ObjectOutputStream`类 --> `writeObject()`
注：该方法对参数指定的obj对象进行序列化，把字节序列写到一个目标输出流中，按Java的标准约定是给文件一个.ser扩展名

反序列化:　`ObjectInputStream`类 --> `readObject()`
注：该方法从一个源输入流中读取字节序列，再把它们反序列化为一个对象，并将其返回。

java在序列化一个对象时，会调用writeObject方法，参数类型时ObjectOutputStream，开发者可以将任何内容写入这个Stream中；反序列化时会调用readObject，可以从中读取到前面写入的内容，并进行处理。

demo:

```java
import java.io.*;
import java.util.Arrays;

public class Main implements Serializable {
    private void exec() throws Exception {
        String s = "hello";
        byte[] ObjectBytes=serialize(s);
        System.out.println(Arrays.toString(ObjectBytes));
        String after = (String) deserialize(ObjectBytes);
        System.out.println(after);
    }

    /*
     * 序列化对象到byte数组
     * */
    private byte[] serialize(final Object obj) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream(); //作用是将数据暂时存储在内存中
        ObjectOutputStream objOut = new ObjectOutputStream(out); //进行有参构造，使用out来接收序列化的数据
        objOut.writeObject(obj);  //进行序列化
        return out.toByteArray();
    }

    /*
     * 从byte数组中反序列化对象
     * */
    private Object deserialize(final byte[] serialized) throws IOException, ClassNotFoundException {
        ByteArrayInputStream in = new ByteArrayInputStream(serialized);
        ObjectInputStream objIn = new ObjectInputStream(in);
        return objIn.readObject();
    }
    public static void main(String[] args) throws Exception {
        new Main().exec();
    }
}
```

运行结果：

![QQ截图20240603165816](https://s2.loli.net/2024/06/03/cKJWvkNCXI139H6.png)

字节数组中的[-84, -19]表示对象的序列化版本信息，[0, 5]表示对象类型信息（Object类型），后续的[104, 101, 108, 108, 111]则编码了字符串"hello"的内容。

注意点：

* 实现Serializable和Externalizable接口的类的对象才能被序列化。
* Externalizable接口继承自 Serializable接口，实现Externalizable接口的类完全由自身来控制序列化的行为，而仅实现Serializable接口的类可以采用默认的序列化方式 。

**对象序列化包括如下步骤：**

```
1、创建一个对象输出流，它可以包装一个其他类型的目标输出流，如文件输出流；
2、通过对象输出流的writeObject()方法写对象。
```

**对象反序列化的步骤如下：**

```
1、创建一个对象输入流，它可以包装一个其他类型的源输入流，如文件输入流；
2、通过对象输入流的readObject()方法读取对象。
```

## java反序列化漏洞

**原理：**

如果Java应用对用户输入，即不可信数据做了反序列化处理，那么攻击者可以通过构造恶意输入，让反序列化产生非预期的对象，非预期的对象在产生过程中就有可能带来任意代码执行。

## ysoserial工具

ysoserial是java反序列化漏洞的一个工具。

**下载方法一、**

可以直接下载编译好的jar文件，直接就能用。

```
https://jitpack.io/com/github/frohoff/ysoserial/master-SNAPSHOT/ysoserial-master-SNAPSHOT.jar
```

**下载方法二、**

github下载源码后编译为jar包

```
https://github.com/angelwhu/ysoserial
```

进入`pom.xml`所属目录

然后执行：

```powershell
mvn clean package -D skipTests
```

如果出现包或者依赖无法下载多换几个仓库镜像试试（我用的阿里云+华为云一般就能解决问题了），发现还是有报错：

![image-20240507211140385](https://s2.loli.net/2024/06/03/hTsRiCaOoKXF4Zn.png)

搜索一下，说的是jdk的问题，换一个jdk（用的jdk1.8.0_411）

然后就是继续报错：

![image-20240507213241243](https://s2.loli.net/2024/06/03/xPgQTOZ4Ksm7pYa.png)

这个问题大概就是` <descriptors>`标签的问题

改一下：

![QQ截图20240507213321](https://s2.loli.net/2024/06/03/bnkCeX1usRmBazD.png)

最后再次编译：

![image-20240507213357747](https://s2.loli.net/2024/06/03/PHE8w3COU2fnocb.png)


