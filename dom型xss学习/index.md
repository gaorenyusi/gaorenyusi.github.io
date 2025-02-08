# DOM型XSS学习

<!--more-->
# DOM型XSS学习

Ps：之前一直没好好学过 xss，特别是 dom 型 xss 快忘得差不多了，所以今天抽空简单补补，也不是学得很深入。

## DOM 型 XSS 是什么

DOM型XSS是基于DOM文档对象模型的一种漏洞，DOM 型 XSS 并不会和后台进行交互。由客户端的脚本程序通过DOM动态地检查和修改页面内容，从客户端获得DOM中的数据（如从URL中获取数据）并在本地进行执行。

常见的危险危险函数如：

document.URL，document.write，location，window.location。

如下面的HTML文件就存在DOM型XSS，其功能是当我们在URL栏输入参数name的值后，就会在当前页面显示输入如的name的值，其功能的实现全都在前端JS中进行、未与后台进行任何交互：

```html
<!DOCTYPE html>  
<html>  
<head>  
	<title>DOM XSS</title>  
</head>  
<body>  
<script>  
	var pos=document.URL.indexOf("name=")+5;  
	document.write(decodeURI(document.URL.substring(pos,document.URL.length)));  
</script>  
</body>  
</html>
```

`document.URL` 获取用户输入，代码中未经过任何过滤就传递给了 `document.write` 输出到当前页面中。那么传入 `name=<script>alert (111)</script>` 就可以触发 xss 漏洞

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240701113551792.png)

是不是感觉很像反射型 xss，只是不同的是这里不会后端进行交互，可以看到 dom 中已经插入了我们的元素，

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240701114200675.png)

但是查看源码是没有的。

## 常见的危险函数

下面列下外部输入Sources和危险敏感操作Sinks（包括执行/输出页面），而对于DOM型XSS漏洞挖掘来说，可以简单归纳为在客户端加载的JS代码中，存在Sources+Sinks的情况即有可能存在DOM型XSS。

#### Sources

- document.URL
- document.URLUnencoded
- document.location（及其许多属性）
- document.referrer
- window.location（及其许多属性）
- location
- location.href
- location.search
- location.hash
- location.pathname

#### Sinks

**直接执行脚本类**

- eval(…)
- window.execScript(…)
- window.setInterval(…)
- window.setTimeout(…)

#### 写HTML页面类

- document.write(…)
- document.writeln(…)
- element.innerHTML(…)

#### 直接修改DOM类

- document.forms[0].action=… (and various other collections)
- document.attachEvent(…)
- document.create…(…)
- document.execCommand(…)
- document.body. … (accessing the DOM through the body object)
- window.attachEvent(…)

#### 替换文档URL类

- document.location=… (and assigning to location’s href, host and hostname)
- document.location.hostname=…
- document.location.replace(…)
- document.location.assign(…)
- document.URL=…
- window.navigate(…)

#### 打开/修改窗口类

- document.open(…)
- window.open(…)
- window.location.href=… (and assigning to location’s href, host and hostname)

当然，除此之外，还有比较细节的特性这里就不列举了，可自行研究。

相关例子参考：http://www.mi1k7ea.com/2019/06/25/%E6%B5%85%E6%9E%90DOM%E5%9E%8BXSS/

## DVWA 的 DOM 型 XSS

开题：

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240702223519629.png)

#### **难度：一、简单**

由于是 dom 型 xss 直接查看其元素。

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240703144637043.png)

看到先是获取参数 defalut 的值然后把其写入 `<optinon>` 标签中，然后查看源码发现没有任何过滤

```php
<?php      
# No protections, anything goes      

?>
```

所以传参`?default=<script>alert("aaa")</script>`

执行

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240703145058201.png)

发现元素已经成功插入

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240703145130167.png)

#### **难度：二、中等**

原理是一样的，就是多做了些过滤，查看源码

```php
<?php      
// Is there any input?   
if ( array_key_exists( "default", $_GET ) && !is_null ($_GET[ 'default' ]) ) {    
$default = $_GET['default'];       
# Do not allow script tags    
if (stripos ($default, "<script") !== false) {        
header ("location: ?default=English");           
exit;       
    }   
}      
?>
```

意思就是我们输入的参数值中不能有 `<script` 标签，那么还可以用其它的标签

```
HTML 的 < img > 标签定义 HTML 页面中的图像，该标签支持 onerror 事件，在装载文档或图像的过程中如果发生了错误就会触发。使用这些内容构造出 payload 如下，因为我们没有图片可供载入，因此会出错从而触发 onerror 事件输出 cookie。
```

所以构造：

```html
?default=English</option></select><img src = 1 onerror = alert(document.cookie)>
```

或者

```html
></option></select><iframe onload=alert(/xss/)>
```

#### **难度：三、困难**

源码：

```php
<?php      
// Is there any input?   

if ( array_key_exists( "default", $_GET ) && !is_null ($_GET[ 'default' ]) ) {    

# White list the allowable languages    

switch ($_GET['default']) {           
    case "French":           
    case "English":           
    case "German":           
    case "Spanish":            
    
    # ok            
          break;           
    default:            
      header ("location: ?default=English");              
      exit;       
    }   
}     
?>
```

发现是个白名单，只允许输入指定的参数，其他的都会跳转为 `?default=English`

但这里没过滤 `<script>` 标签。

简单构造：

```html
English #<script>alert(document.cookie)</script>
```


