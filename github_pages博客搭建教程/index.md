# Github Pages博客搭建教程

<!--more-->
# Github Pages博客搭建教程
## Github Pages+ Hexo 搭建个人博客

### 一、下载 **Git**

git是一个包管理工具，在linux是自带的，windows上需要下载。

参考：[https://www.cnblogs.com/xueweisuoyong/p/11914045.html](https://www.cnblogs.com/xueweisuoyong/p/11914045.html)
### 二、下载 **Node.js** & npm

下载参考：[https://blog.csdn.net/weixin_38610651/article/details/108721957 ](https://blog.csdn.net/weixin_38610651/article/details/108721957 )

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20250202202816350.png)

Node.js 默认配置了 npm，因此不需要额外下载，可以根据需要配置 npm下载路径。

### 三、安装 **Hexo**

执行命令

```bash
npm install hexo-cli -g
```

执行 `hexo -version` 查看是否安装成功，

![](https://raw.githubusercontent.com/gaorenyusi/img/master/img/file-20250202203310420.png)

### 四、本地预览

新建一个用于存储博客数据的目录(如 `D:\hexo-blog`)并确保该目录为空，随后在终端中执行，

```bash
hexo init （文件名）（可选，默认本文件夹）等待一段时间，即可成功初始化。此时可使用

hexo s -g 本地预览初始化成功的博客
```

![image-20240309154352903](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240309154352903.png)

```bash
g是部署，s是本地启动
```

本地预览效果如下：

![image-20240309154111102](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240309154111102.png)

### 五、部署到 Github 上

详细看参考：[https://blog.csdn.net/yaorongke/article/details/119089190](https://blog.csdn.net/yaorongke/article/details/119089190)

访问地址效果：

![image-20240309164151013](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240309164151013.png)

### 六、主题配置

这里选择下载主题 **butterfly**，

![image-20240309171045499](https://raw.githubusercontent.com/gaorenyusi/img/master/img/image-20240309171045499.png)

跟多主题详细配置参考：[butterfly主题配置](https://blog.csdn.net/mjh1667002013/article/details/129290903#:~:text=%E3%80%90Hexo%E3%80%91Hexo%E6%90%AD%E5%BB%BAButterfly%E4%B8%BB%E9%A2%98%E5%B9%B6%E5%BF%AB%E9%80%9F%E7%BE%8E%E5%8C%96%201%20%F0%9F%A7%8A1%E3%80%81%E5%AE%89%E8%A3%85butterfly%E4%B8%BB%E9%A2%98%20%E5%9C%A8%20hexo%20%E9%A1%B9%E7%9B%AE%E6%A0%B9%E7%9B%AE%E5%BD%95%E4%B8%8B%E4%B8%8B%E8%BD%BD%E4%B8%BB%E9%A2%98%E3%80%82%20...%202,_config.butterfly.yml%3A%20...%208%20%F0%9F%A7%8A8%E3%80%81%E5%9B%BE%E7%89%87%E8%AE%BE%E7%BD%AE%20%E5%9B%BE%E7%89%87%E5%8F%AF%E4%BB%A5%E7%94%A8%E4%BA%91%E9%93%BE%E6%8E%A5%E6%88%96%E8%80%85%E6%9C%AC%E5%9C%B0%E8%B7%AF%E5%BE%84%EF%BC%9A%20%2Fthemes%2Fbutterfly%2Fsource%2Fimg%20%E3%80%82%20) 

主题魔改参考：[butterfly主题魔改](https://cnhuazhu.top/butterfly/2021/03/28/Hexo%E9%AD%94%E6%94%B9/Hexo%E9%AD%94%E6%94%B9%E8%AE%B0%E5%BD%95/)

## Github Pages+ Hugo 搭建个人博客

参考：[https://www.shaohanyun.top/posts/env/blog_build2/](https://www.shaohanyun.top/posts/env/blog_build2/)

参考：[https://github.com/lazeroffmichael/example-hugo-blog](https://github.com/lazeroffmichael/example-hugo-blog)

参考：[https://lianpf.github.io/posts/other/tools-docs-hugo-papermod/](https://lianpf.github.io/posts/other/tools-docs-hugo-papermod/)

### 一、主题配置

把之前的 `gaorenyusi.github.io` 仓库清空，然后下载 hugo，执行下面命令生成网站主文件

```bash
hugo new site blog
hugo new site blog --format yaml
```

然后下载主题（这里用的是LoveIt主题，但还是可以参考上面链接）

```
cd blog
git clone https://github.com/dillonzq/LoveIt.git themes/LoveIt
```

可以把 `exampleSite` 目录中的配置文件 hugo.toml 复制到主文件，然后根据需要修改 hugo.toml

```toml
baseURL = "https://gaorenyusi.github.io/"
theme = "LoveIt"
title = "Gaorenyusi's Blog"

# determines default content language ["en", "zh-cn", "fr", "pl", ...]
# 设置默认的语言 ["en", "zh-cn", "fr", "pl", ...]
defaultContentLanguage = "zh-cn"
# language code ["en", "zh-CN", "fr", "pl", ...]
# 网站语言, 仅在这里 CN 大写 ["en", "zh-CN", "fr", "pl", ...]
languageCode = "zh-CN"
# language name ["English", "简体中文", "Français", "Polski", ...]
# 语言名称 ["English", "简体中文", "Français", "Polski", ...]
languageName = "简体中文"
# whether to include Chinese/Japanese/Korean
# 是否包括中日韩文字
hasCJKLanguage = true

# google analytics code [UA-XXXXXXXX-X]
# 谷歌分析代号 [UA-XXXXXXXX-X]
googleAnalytics = "UA-123-45"
# copyright description used only for seo schema
# 版权描述，仅仅用于 SEO
copyright = ""
enableRobotsTXT = true
enableGitInfo = false
enableEmoji = true

# ignore some build errors
# 忽略一些构建错误
ignoreErrors = ["error-remote-getjson", "error-missing-instagram-accesstoken"]

# Pagination config
# 分页配置
[pagination]
  disableAliases = false
  pagerSize = 10
  path = "page"

[params]
  # site default theme ["auto", "light", "dark"]
  # 网站默认主题 ["auto", "light", "dark"]
  defaultTheme = "auto"
  # public git repo url only then enableGitInfo is true
  # 公共 git 仓库路径，仅在 enableGitInfo 设为 true 时有效
  gitRepo = "https://github.com/dillonzq/LoveIt"
  # which hash function used for SRI, when empty, no SRI is used
  # ["sha256", "sha384", "sha512", "md5"]
  # 哪种哈希函数用来 SRI, 为空时表示不使用 SRI
  # ["sha256", "sha384", "sha512", "md5"]
  fingerprint = ""
  # date format
  # 日期格式
  dateFormat = "2006-01-02"
  # website title for Open Graph and Twitter Cards
  # 网站标题, 用于 Open Graph 和 Twitter Cards
  title = "gaorenyusi"
  # website description for RSS, SEO, Open Graph and Twitter Cards
  # 网站描述, 用于 RSS, SEO, Open Graph 和 Twitter Cards
  description = "白茶清欢无别事，我在等风也等你"
  # website images for Open Graph and Twitter Cards
  # 网站图片, 用于 Open Graph 和 Twitter Cards
  images = ["img/logo.jpg"]

  # Author config
  # 作者配置
  [params.author]
    name = "gaorenyusi"
    email = ""
    link = ""

  # Header config
  # 页面头部导航栏配置
  [params.header]
    # desktop header mode ["fixed", "normal", "auto"]
    # 桌面端导航栏模式 ["fixed", "normal", "auto"]
    desktopMode = "fixed"
    # mobile header mode ["fixed", "normal", "auto"]
    # 移动端导航栏模式 ["fixed", "normal", "auto"]
    mobileMode = "auto"
    # Header title config
    # 页面头部导航栏标题配置
    [params.header.title]
      # URL of the LOGO
      # LOGO 的 URL
      logo = ""
      # title name
      # 标题名称
      name = "Gaorenyusi's Blog"
      # you can add extra information before the name (HTML format is supported), such as icons
      # 你可以在名称 (允许 HTML 格式) 之前添加其他信息, 例如图标
      # pre = "<i class='far fa-kiss-wink-heart fa-fw' aria-hidden='true'></i>"
      # you can add extra information after the name (HTML format is supported), such as icons
      # 你可以在名称 (允许 HTML 格式) 之后添加其他信息, 例如图标
      post = ""
      # whether to use typeit animation for title name
      # 是否为标题显示打字机动画
      typeit = true

  # Footer config
  # 页面底部信息配置
  [params.footer]
    enable = true
    # Custom content (HTML format is supported)
    # 自定义内容 (支持 HTML 格式)
    custom = ""
    # whether to show Hugo and theme info
    # 是否显示 Hugo 和主题信息
    hugo = true
    # whether to show copyright info
    # 是否显示版权信息
    copyright = true
    # whether to show the author
    # 是否显示作者
    author = true
    # site creation time
    # 网站创立年份
    since = 2024
    # ICP info only in China (HTML format is supported)
    # ICP 备案信息，仅在中国使用 (支持 HTML 格式)
    icp = ""
    # license info (HTML format is supported)
    # 许可协议信息 (支持 HTML 格式)
    license= '<a rel="license external nofollow noopener noreffer" href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank">CC BY-NC 4.0</a>'

  # Section (all posts) page config
  # Section (所有文章) 页面配置
  [params.section]
    # special amount of posts in each section page
    # section 页面每页显示文章数量
    paginate = 10
    # date format (month and day)
    # 日期格式 (月和日)
    dateFormat = "01-02"
    # amount of RSS pages
    # RSS 文章数目
    rss = 10

  # List (category or tag) page config
  # List (目录或标签) 页面配置
  [params.list]
    # special amount of posts in each list page
    # list 页面每页显示文章数量
    paginate = 10
    # date format (month and day)
    # 日期格式 (月和日)
    dateFormat = "01-02"
    # amount of RSS pages
    # RSS 文章数目
    rss = 10

  # App icon config
  # 应用图标配置
  [params.app]
    # optional site title override for the app when added to an iOS home screen or Android launcher
    # 当添加到 iOS 主屏幕或者 Android 启动器时的标题, 覆盖默认标题
    title = "gaorenyusi"
    # whether to omit favicon resource links
    # 是否隐藏网站图标资源链接
    noFavicon = false
    # modern SVG favicon to use in place of older style .png and .ico files
    # 更现代的 SVG 网站图标, 可替代旧的 .png 和 .ico 文件
    svgFavicon = ""
    # Android browser theme color
    # Android 浏览器主题色
    themeColor = "#ffffff"
    # Safari mask icon color
    # Safari 图标颜色
    iconColor = "#5bbad5"
    # Windows v8-11 tile color
    # Windows v8-11 磁贴颜色
    tileColor = "#da532c"

  # Search config
  # 搜索配置
  [params.search]
    enable = true
    # type of search engine ["lunr", "algolia"]
    # 搜索引擎的类型 ["lunr", "algolia"]
    type = "algolia"
    # max index length of the chunked content
    # 文章内容最长索引长度
    contentLength = 4000
    # placeholder of the search bar
    # 搜索框的占位提示语
    placeholder = ""
    # max number of results length
    # 最大结果数目
    maxResultLength = 10
    # snippet length of the result
    # 结果内容片段长度
    snippetLength = 30
    # HTML tag name of the highlight part in results
    # 搜索结果中高亮部分的 HTML 标签
    highlightTag = "em"
    # whether to use the absolute URL based on the baseURL in search index
    # 是否在搜索索引中使用基于 baseURL 的绝对路径
    absoluteURL = false
    [params.search.algolia]
      index = ""
      appID = ""
      searchKey = ""

  # Home page config
  # 主页信息设置
  [params.home]
    # amount of RSS pages
    # RSS 文章数目
    rss = 10
    # Home page profile
    # 主页个人信息
    [params.home.profile]
      enable = true
      # Gravatar Email for preferred avatar in home page
      # Gravatar 邮箱，用于优先在主页显示的头像
      gravatarEmail = ""
      # URL of avatar shown in home page
      # 主页显示头像的 URL
      avatarURL = "/img/logo.jpg"
      # title shown in home page (HTML format is supported)
      # 主页显示的网站标题 (支持 HTML 格式)
      title = ""
      # subtitle shown in home page (HTML format is supported)
      # 主页显示的网站副标题 (允许 HTML 格式)
      subtitle = "A Clean, Elegant but Advanced Hugo Theme"
      # whether to use typeit animation for subtitle
      # 是否为副标题显示打字机动画
      typeit = true
      # whether to show social links
      # 是否显示社交账号
      social = true
      # disclaimer (HTML format is supported)
      # 免责声明 (支持 HTML 格式)
      disclaimer = ""
    # Home page posts
    # 主页文章列表
    [params.home.posts]
      enable = true
      # special amount of posts in each home posts page
      # 主页每页显示文章数量
      paginate = 6
      showFullContent = false
  # Social config in home page
  # 主页的社交信息设置
  [params.social]
    GitHub = ""
    Linkedin = ""
    Twitter = ""
    Instagram = ""
    Facebook = ""
    Telegram = ""
    Medium = ""
    Gitlab = ""
    Youtubelegacy = ""
    Youtubecustom = ""
    Youtubechannel = ""
    Tumblr = ""
    Quora = ""
    Keybase = ""
    Pinterest = ""
    Reddit = ""
    Codepen = ""
    FreeCodeCamp = ""
    Bitbucket = ""
    Stackoverflow = ""
    Weibo = ""
    Odnoklassniki = ""
    VK = ""
    Flickr = ""
    Xing = ""
    Snapchat = ""
    Soundcloud = ""
    Spotify = ""
    Bandcamp = ""
    Paypal = ""
    Fivehundredpx = ""
    Mix = ""
    Goodreads = ""
    Lastfm = ""
    Foursquare = ""
    Hackernews = ""
    Kickstarter = ""
    Patreon = ""
    Steam = ""
    Twitch = ""
    Strava = ""
    Skype = ""
    Whatsapp = ""
    Zhihu = ""
    Douban = ""
    Angellist = ""
    Slidershare = ""
    Jsfiddle = ""
    Deviantart = ""
    Behance = ""
    Dribbble = ""
    Wordpress = ""
    Vine = ""
    Googlescholar = ""
    Researchgate = ""
    Mastodon = ""
    Thingiverse = ""
    Devto = ""
    Gitea = ""
    XMPP = ""
    Matrix = ""
    Bilibili = ""
    Discord = ""
    DiscordInvite = ""
    Lichess = ""
    ORCID = ""
    Pleroma = ""
    Kaggle = ""
    MediaWiki= ""
    Plume = ""
    HackTheBox = ""
    RootMe= ""
    Malt = ""
    TikTok = ""
    TryHackMe = ""
    Codeberg = ""
    Email = ""
    RSS = ""

  # Page global config
  # 文章页面全局配置
  [params.page]
    # whether to hide a page from home page
    # 是否在主页隐藏一篇文章
    hiddenFromHomePage = false
    # whether to hide a page from search results
    # 是否在搜索结果中隐藏一篇文章
    hiddenFromSearch = false
    # whether to enable twemoji
    # 是否使用 twemoji
    twemoji = true
    # whether to enable lightgallery
    # 是否使用 lightgallery
    lightgallery = false
    # whether to enable the ruby extended syntax
    # 是否使用 ruby 扩展语法
    ruby = true
    # whether to enable the fraction extended syntax
    # 是否使用 fraction 扩展语法
    fraction = true
    # whether to enable the fontawesome extended syntax
    # 是否使用 fontawesome 扩展语法
    fontawesome = true
    # whether to show link to Raw Markdown content of the content
    # 是否显示原始 Markdown 文档内容的链接
    linkToMarkdown = true
    # whether to show the full text content in RSS
    # 是否在 RSS 中显示全文内容
    rssFullText = false
    # Table of the contents config
    # 目录配置
    [params.page.toc]
      # whether to enable the table of the contents
      # 是否使用目录
      enable = true
      # whether to keep the static table of the contents in front of the post
      # 是否保持使用文章前面的静态目录
      keepStatic = false
      # whether to make the table of the contents in the sidebar automatically collapsed
      # 是否使侧边目录自动折叠展开
      auto = true
    # Code config
    # 代码配置
    [params.page.code]
      # whether to show the copy button of the code block
      # 是否显示代码块的复制按钮
      copy = true
      # the maximum number of lines of displayed code by default
      # 默认展开显示的代码行数
      maxShownLines = 50
    # KaTeX mathematical formulas config (KaTeX https://katex.org/)
    # KaTeX 数学公式配置 (KaTeX https://katex.org/)
    [params.page.math]
      enable = false
      # default inline delimiter is $ ... $ and \( ... \)
      # 默认行内定界符是 $ ... $ 和 \( ... \)
      inlineLeftDelimiter = ""
      inlineRightDelimiter = ""
      # default block delimiter is $$ ... $$, \[ ... \], \begin{equation} ... \end{equation} and some other functions
      # 默认块定界符是 $$ ... $$, \[ ... \],  \begin{equation} ... \end{equation} 和一些其它的函数
      blockLeftDelimiter = ""
      blockRightDelimiter = ""
      # KaTeX extension copy_tex
      # KaTeX 插件 copy_tex
      copyTex = true
      # KaTeX extension mhchem
      # KaTeX 插件 mhchem
      mhchem = true
    # Mapbox GL JS config (Mapbox GL JS https://docs.mapbox.com/mapbox-gl-js)
    # Mapbox GL JS 配置 (Mapbox GL JS https://docs.mapbox.com/mapbox-gl-js)
    [params.page.mapbox]
      # access token of Mapbox GL JS
      # Mapbox GL JS 的 access token
      accessToken = "pk.eyJ1IjoiZGlsbG9uenEiLCJhIjoiY2s2czd2M2x3MDA0NjNmcGxmcjVrZmc2cyJ9.aSjv2BNuZUfARvxRYjSVZQ"
      # style for the light theme
      # 浅色主题的地图样式
      lightStyle = "mapbox://styles/mapbox/light-v10?optimize=true"
      # style for the dark theme
      # 深色主题的地图样式
      darkStyle = "mapbox://styles/mapbox/dark-v10?optimize=true"
      # whether to add NavigationControl (https://docs.mapbox.com/mapbox-gl-js/api/#navigationcontrol)
      # 是否添加 NavigationControl (https://docs.mapbox.com/mapbox-gl-js/api/#navigationcontrol)
      navigation = true
      # whether to add GeolocateControl (https://docs.mapbox.com/mapbox-gl-js/api/#geolocatecontrol)
      # 是否添加 GeolocateControl (https://docs.mapbox.com/mapbox-gl-js/api/#geolocatecontrol)
      geolocate = true
      # whether to add ScaleControl (https://docs.mapbox.com/mapbox-gl-js/api/#scalecontrol)
      # 是否添加 ScaleControl (https://docs.mapbox.com/mapbox-gl-js/api/#scalecontrol)
      scale = true
      # whether to add FullscreenControl (https://docs.mapbox.com/mapbox-gl-js/api/#fullscreencontrol)
      # 是否添加 FullscreenControl (https://docs.mapbox.com/mapbox-gl-js/api/#fullscreencontrol)
      fullscreen = true
    # Social share links in post page
    # 文章页面的分享信息设置
    [params.page.share]
      enable = true
      Twitter = true
      Facebook = true
      Linkedin = false
      Whatsapp = false
      Pinterest = false
      Tumblr = false
      HackerNews = false
      Reddit = false
      VK = false
      Buffer = false
      Xing = false
      Line = false
      Instapaper = false
      Pocket = false
      Flipboard = false
      Weibo = false
      Blogger = false
      Baidu = false
      Odnoklassniki = false
      Evernote = false
      Skype = false
      Trello = false
      Mix = false
    # Comment config
    # 评论系统设置
    [params.page.comment]
      enable = true
      # Disqus comment config (https://disqus.com/)
      # Disqus 评论系统设置 (https://disqus.com/)
      [params.page.comment.disqus]
        enable = false
        # Disqus shortname to use Disqus in posts
        # Disqus 的 shortname，用来在文章中启用 Disqus 评论系统
        shortname = ""
      # Gitalk comment config (https://github.com/gitalk/gitalk)
      # Gitalk 评论系统设置 (https://github.com/gitalk/gitalk)
      [params.page.comment.gitalk]
        enable = false
        owner = ""
        repo = ""
        clientId = ""
        clientSecret = ""
      # Valine comment config (https://github.com/xCss/Valine)
      # Valine 评论系统设置 (https://github.com/xCss/Valine)
      [params.page.comment.valine]
        enable = true
        appId = "QGzwQXOqs5JOhN4RGPOkR2mR-MdYXbMMI"
        appKey = "WBmoGyJtbqUswvfLh6L8iEBr"
        placeholder = ""
        avatar = "mp"
        meta= ""
        pageSize = 10
        # automatically adapt the current theme i18n configuration when empty
        # 为空时自动适配当前主题 i18n 配置
        lang = ""
        visitor = true
        recordIP = true
        highlight = true
        enableQQ = false
        serverURLs = "https://leancloud.hugoloveit.com"
        # emoji data file name, default is "google.yml"
        # ["apple.yml", "google.yml", "facebook.yml", "twitter.yml"]
        # located in "themes/LoveIt/assets/lib/valine/emoji/" directory
        # you can store your own data files in the same path under your project:
        # "assets/lib/valine/emoji/"
        # emoji 数据文件名称, 默认是 "google.yml"
        # ["apple.yml", "google.yml", "facebook.yml", "twitter.yml"]
        # 位于 "themes/LoveIt/assets/lib/valine/emoji/" 目录
        # 可以在你的项目下相同路径存放你自己的数据文件:
        # "assets/lib/valine/emoji/"
        emoji = ""
      # Facebook comment config (https://developers.facebook.com/docs/plugins/comments)
      # Facebook 评论系统设置 (https://developers.facebook.com/docs/plugins/comments)
      [params.page.comment.facebook]
        enable = false
        width = "100%"
        numPosts = 10
        appId = ""
        # automatically adapt the current theme i18n configuration when empty
        # 为空时自动适配当前主题 i18n 配置
        languageCode = ""
      # Telegram comments config (https://comments.app/)
      # Telegram comments 评论系统设置 (https://comments.app/)
      [params.page.comment.telegram]
        enable = false
        siteID = ""
        limit = 5
        height = ""
        color = ""
        colorful = true
        dislikes = false
        outlined = false
      # Commento comment config (https://commento.io/)
      # Commento comment 评论系统设置 (https://commento.io/)
      [params.page.comment.commento]
        enable = false
      # utterances comment config (https://utteranc.es/)
      # utterances comment 评论系统设置 (https://utteranc.es/)
      [params.page.comment.utterances]
        enable = false
        # owner/repo
        repo = ""
        issueTerm = "pathname"
        label = ""
        lightTheme = "github-light"
        darkTheme = "github-dark"
      # giscus comment config (https://giscus.app/)
      # giscus comment 评论系统设置 (https://giscus.app/zh-CN)
      [params.page.comment.giscus]
        # You can refer to the official documentation of giscus to use the following configuration.
        # 你可以参考官方文档来使用下列配置
        enable = false
        repo = ""
        repoId = ""
        category = "Announcements"
        categoryId = ""
        # automatically adapt the current theme i18n configuration when empty
        # 为空时自动适配当前主题 i18n 配置
        lang = ""
        mapping = "pathname"
        reactionsEnabled = "1"
        emitMetadata = "0"
        inputPosition = "bottom"
        lazyLoading = false
        lightTheme = "light"
        darkTheme = "dark"
    # Third-party library config
    # 第三方库配置
    [params.page.library]
      [params.page.library.css]
        # someCSS = "some.css"
        # located in "assets/" 位于 "assets/"
        # Or 或者
        # someCSS = "https://cdn.example.com/some.css"
      [params.page.library.js]
        # someJavascript = "some.js"
        # located in "assets/" 位于 "assets/"
        # Or 或者
        # someJavascript = "https://cdn.example.com/some.js"
    # Page SEO config
    # 页面 SEO 配置
    [params.page.seo]
      # image URL
      # 图片 URL
      images = ["img/logo.jpg"]
      # Publisher info
      # 出版者信息
      [params.page.seo.publisher]
        name = "xxxx"
        logoUrl = "/images/avatar.png"

  # TypeIt config
  # TypeIt 配置
  [params.typeit]
    # typing speed between each step (measured in milliseconds)
    # 每一步的打字速度 (单位是毫秒)
    speed = 100
    # blinking speed of the cursor (measured in milliseconds)
    # 光标的闪烁速度 (单位是毫秒)
    cursorSpeed = 1000
    # character used for the cursor (HTML format is supported)
    # 光标的字符 (支持 HTML 格式)
    cursorChar = "|"
    # cursor duration after typing finishing (measured in milliseconds, "-1" means unlimited)
    # 打字结束之后光标的持续时间 (单位是毫秒, "-1" 代表无限大)
    duration = -1

  # Site verification code for Google/Bing/Yandex/Pinterest/Baidu
  # 网站验证代码，用于 Google/Bing/Yandex/Pinterest/Baidu
  [params.verification]
    google = ""
    bing = ""
    yandex = ""
    pinterest = ""
    baidu = ""

  # Site SEO config
  # 网站 SEO 配置
  [params.seo]
    # image URL
    # 图片 URL
    image = "/images/Apple-Devices-Preview.png"
    # thumbnail URL
    # 缩略图 URL
    thumbnailUrl = "/images/screenshot.png"

  # Analytics config
  # 网站分析配置
  [params.analytics]
    enable = false
    # Google Analytics
    [params.analytics.google]
      id = ""
      # whether to anonymize IP
      # 是否匿名化用户 IP
      anonymizeIP = true
    # Fathom Analytics
    [params.analytics.fathom]
      id = ""
      # server url for your tracker if you're self hosting
      # 自行托管追踪器时的主机路径
      server = ""
    # Plausible Analytics
    [params.analytics.plausible]
      dataDomain = ""
    # Yandex Metrica
    [params.analytics.yandexMetrica]
      id = ""

  # Cookie consent config
  # Cookie 许可配置
  [params.cookieconsent]
    enable = false
    # text strings used for Cookie consent banner
    # 用于 Cookie 许可横幅的文本字符串
    [params.cookieconsent.content]
      message = ""
      dismiss = ""
      link = ""

  # CDN config for third-party library files
  # 第三方库文件的 CDN 设置
  [params.cdn]
    # CDN data file name, disabled by default
    # ["jsdelivr.yml"]
    # located in "themes/LoveIt/assets/data/cdn/" directory
    # you can store your own data files in the same path under your project:
    # "assets/data/cdn/"
    # CDN 数据文件名称, 默认不启用
    # ["jsdelivr.yml"]
    # 位于 "themes/LoveIt/assets/data/cdn/" 目录
    # 可以在你的项目下相同路径存放你自己的数据文件:
    # "assets/data/cdn/"
    data = "jsdelivr.yml"

  # Compatibility config
  # 兼容性设置
  [params.compatibility]
    # whether to use Polyfill.io to be compatible with older browsers
    # 是否使用 Polyfill.io 来兼容旧式浏览器
    polyfill = false
    # whether to use object-fit-images to be compatible with older browsers
    # 是否使用 object-fit-images 来兼容旧式浏览器
    objectFit = false

# Markup related configuration in Hugo
# Hugo 解析文档的配置
[markup]
  # Syntax Highlighting (https://gohugo.io/content-management/syntax-highlighting)
  # 语法高亮设置 (https://gohugo.io/content-management/syntax-highlighting)
  [markup.highlight]
    codeFences = true
    guessSyntax = true
    lineNos = true
    lineNumbersInTable = true
    # false is a necessary configuration (https://github.com/dillonzq/LoveIt/issues/158)
    # false 是必要的设置 (https://github.com/dillonzq/LoveIt/issues/158)
    noClasses = false
  # Goldmark is from Hugo 0.60 the default library used for Markdown
  # Goldmark 是 Hugo 0.60 以来的默认 Markdown 解析库
  [markup.goldmark]
    [markup.goldmark.extensions]
      definitionList = true
      footnote = true
      linkify = true
      strikethrough = true
      table = true
      taskList = true
      typographer = true
    [markup.goldmark.renderer]
      # whether to use HTML tags directly in the document
      # 是否在文档中直接使用 HTML 标签
      unsafe = true
  # Table Of Contents settings
  # 目录设置
  [markup.tableOfContents]
    startLevel = 2
    endLevel = 6

# Sitemap config
# 网站地图配置
[sitemap]
  changefreq = "weekly"
  filename = "sitemap.xml"
  priority = 0.5

# Permalinks config (https://gohugo.io/content-management/urls/#permalinks)
# Permalinks 配置 (https://gohugo.io/content-management/urls/#permalinks)
[permalinks]
  # posts = ":year/:month/:filename"
  posts = ":filename"

# Privacy config (https://gohugo.io/about/hugo-and-gdpr/)
# 隐私信息配置 (https://gohugo.io/about/hugo-and-gdpr/)
[privacy]
  # privacy of the Google Analytics (replaced by params.analytics.google)
  # Google Analytics 相关隐私 (被 params.analytics.google 替代)
  [privacy.googleAnalytics]
    # ...
  [privacy.twitter]
    enableDNT = true
  [privacy.youtube]
    privacyEnhanced = true

# Options to make output .md files
# 用于输出 Markdown 格式文档的设置
[mediaTypes]
  [mediaTypes."text/plain"]
    suffixes = ["md"]

# Options to make output .md files
# 用于输出 Markdown 格式文档的设置
[outputFormats.MarkDown]
  mediaType = "text/plain"
  isPlainText = true
  isHTML = false

# Options to make hugo output files
# 用于 Hugo 输出文档的设置
[outputs]
  home = ["HTML", "RSS", "JSON"]
  page = ["HTML", "MarkDown"]
  section = ["HTML", "RSS"]
  taxonomy = ["HTML", "RSS"]
  taxonomyTerm = ["HTML"]

# Multilingual
# 多语言
[languages]
  [languages.en]
    weight = 1
    languageCode = "en"
    languageName = "English"
    hasCJKLanguage = false
    copyright = "This work is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License."
    [languages.en.menu]
      [[languages.en.menu.main]]
        weight = 1
        identifier = "posts"
        pre = ""
        post = ""
        name = "Posts"
        url = "/posts/"
        title = ""
      [[languages.en.menu.main]]
        weight = 2
        identifier = "tags"
        pre = ""
        post = ""
        name = "Tags"
        url = "/tags/"
        title = ""
      [[languages.en.menu.main]]
        weight = 3
        identifier = "categories"
        pre = ""
        post = ""
        name = "Categories"
        url = "/categories/"
        title = ""
      [[languages.en.menu.main]]
        weight = 4
        identifier = "documentation"
        pre = ""
        post = ""
        name = "Docs"
        url = "/categories/documentation/"
        title = ""
      [[languages.en.menu.main]]
        weight = 5
        identifier = "about"
        pre = ""
        post = ""
        name = "About"
        url = "/about/"
        title = ""
      [[languages.en.menu.main]]
        weight = 6
        identifier = "github"
        pre = "<i class='fab fa-github fa-fw' aria-hidden='true'></i>"
        post = ""
        name = ""
        url = "https://github.com/dillonzq/LoveIt"
        title = "GitHub"
    [languages.en.params]
      [languages.en.params.search]
        enable = true
        type = "algolia"
        contentLength = 4000
        placeholder = ""
        maxResultLength = 10
        snippetLength = 30
        highlightTag = "em"
        absoluteURL = false
        [languages.en.params.search.algolia]
          index = "index.en"
          appID = "PASDMWALPK"
          searchKey = "b42948e51daaa93df92381c8e2ac0f93"
      [languages.en.params.home]
        rss = 10
        [languages.en.params.home.profile]
          enable = true
          gravatarEmail = ""
          avatarURL = "/images/avatar.png"
          title = ""
          subtitle = "A Clean, Elegant but Advanced Hugo Theme"
          typeit = true
          social = true
          disclaimer = ""
      [languages.en.params.social]
        GitHub = "xxxx"
        Twitter = "xxxx"
        Instagram = "xxxx"
        Facebook = "xxxx"
        Telegram = "xxxx"
        Youtubelegacy = "xxxx"
        Phone = "555-555-555"
        Email = "xxxx@xxxx.com"
        RSS = true
        [languages.en.params.social.Mastodon]
          id = "@xxxx"
          prefix = "https://mastodon.technology/"

  [languages.zh-cn]
    weight = 2
    languageCode = "zh-CN"
    languageName = "简体中文"
    hasCJKLanguage = true
    copyright = "This work is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License."
    [languages.zh-cn.menu]
      [[languages.zh-cn.menu.main]]
        weight = 1
        identifier = "home"
        pre = ""
        post = ""
        name = "主页"
        url = "/"
        title = ""
      [[languages.zh-cn.menu.main]]
        weight = 2
        identifier = "posts"
        pre = ""
        post = ""
        name = "文章"
        url = "/posts/"
        title = ""
      [[languages.zh-cn.menu.main]]
        weight = 3
        identifier = "tags"
        pre = ""
        post = ""
        name = "标签"
        url = "/tags/"
        title = ""
      [[languages.zh-cn.menu.main]]
        weight = 4
        identifier = "about"
        pre = ""
        post = ""
        name = "关于"
        url = "/about/"
        title = ""
    [languages.zh-cn.params]
      [languages.zh-cn.params.search]
        enable = true
        type = "algolia"
        contentLength = 4000
        placeholder = ""
        maxResultLength = 10
        snippetLength = 50
        highlightTag = "em"
        absoluteURL = false
        [languages.zh-cn.params.search.algolia]
          index = "index.zh-cn"
          appID = "PASDMWALPK"
          searchKey = "b42948e51daaa93df92381c8e2ac0f93"
      [languages.zh-cn.params.home]
        rss = 10
        [languages.zh-cn.params.home.profile]
          enable = true
          gravatarEmail = ""
          imageWidth= 150
          imageHeight= 150
          imageUrl = "/img/logo.jpg"
          title = "白茶清欢无别事，我在等风也等你"
          subtitle = "高人于斯"
          typeit = true
          social = true
          disclaimer = ""
      [languages.zh-cn.params.social]
        GitHub = "gaorenyusi"
        Bilibili = "353741931"
        Email = "2711547386@qq.com"
```

最后执行下面命令进行本地预览

```shell
hugo server -D
```

`-D` 是生成 public 目录，然后访问地址 `http://localhost:1313` 进行本地访问，

参考：[https://developer.aliyun.com/article/859477](https://developer.aliyun.com/article/859477)
### 二、部署到 github pages

在 public 目录下执行下面命令即可，

```
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin 仓库地址
git push -u origin main -f
```

### 三、Action 自动提交博客

参考：https://ratmomo.github.io/p/2024/06/%E4%BD%BF%E7%94%A8-hugo--github-pages-%E9%83%A8%E7%BD%B2%E4%B8%AA%E4%BA%BA%E5%8D%9A%E5%AE%A2/#%E7%95%AA%E5%A4%96%E7%AF%87%E4%BD%BF%E7%94%A8github-action%E8%87%AA%E5%8A%A8%E5%8F%91%E5%B8%83%E5%8D%9A%E5%AE%A2
