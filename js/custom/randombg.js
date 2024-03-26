var backimg =[
    "https://pic.imgdb.cn/item/660249e29f345e8d03b8e7d4.png",
    "https://pic.imgdb.cn/item/660249909f345e8d03b7796c.png",
    "https://pic.imgdb.cn/item/660249ba9f345e8d03b830bd.png",
    "https://pic.imgdb.cn/item/66025fc59f345e8d032563fe.png"
  ];
  var bgindex =Math.floor(Math.random() * backimg.length);
  document.getElementById("web_bg").style.backgroundImage = backimg[bgindex];
  var bannerimg =[
    "https://pic.imgdb.cn/item/660249e29f345e8d03b8e7d4.png",
    "https://pic.imgdb.cn/item/660249909f345e8d03b7796c.png",
    "https://pic.imgdb.cn/item/660249ba9f345e8d03b830bd.png",
    "https://pic.imgdb.cn/item/66025fc59f345e8d032563fe.png"
  ];
  var bannerindex =Math.floor(Math.random() * bannerimg.length);
  document.getElementById("page-header").style.backgroundImage = bannerimg[bannerindex];
 
