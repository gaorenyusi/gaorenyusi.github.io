//随机背景图片数组,图片可以换成图床链接，注意最后一条后面不要有逗号
var backimg =[
    "https://pic.imgdb.cn/item/660249e29f345e8d03b8e7d4.png",
    "https://pic.imgdb.cn/item/660249909f345e8d03b7796c.png",
    "https://pic.imgdb.cn/item/660249ba9f345e8d03b830bd.png",
    "https://pic.imgdb.cn/item/66025fc59f345e8d032563fe.png"
  ];
  //获取背景图片总数，生成随机数
  var bgindex =Math.floor(Math.random() * backimg.length);
  //重设背景图片
  document.getElementById("web_bg").style.backgroundImage = backimg[bgindex];
  //随机banner数组,图片可以换成图床链接，注意最后一条后面不要有逗号
  var bannerimg =[
    "https://pic.imgdb.cn/item/660249e29f345e8d03b8e7d4.png",
    "https://pic.imgdb.cn/item/660249909f345e8d03b7796c.png",
    "https://pic.imgdb.cn/item/660249ba9f345e8d03b830bd.png",
    "https://pic.imgdb.cn/item/66025fc59f345e8d032563fe.png"
  ];
  //获取banner图片总数，生成随机数
  var bannerindex =Math.floor(Math.random() * bannerimg.length);
  //重设banner图片
  document.getElementById("page-header").style.backgroundImage = bannerimg[bannerindex];
 