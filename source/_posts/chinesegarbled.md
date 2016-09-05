layout: post
title: tomcat request.getParameter() 乱码解释
date: 2014-09-02 15:09:25
tags: java
---
初学的时候经常会遇到在某些服务器上request.getParameter("中文")获取中文的时候得到乱码，而有些不是。
通常我们都知道传输中文时需要给参数utf-8，但request.getParameter时在有一些服务器上还是得到乱码，在一些服务器又是正常的
比如常用的tomcat，编码正常是因为在tomcat的server.xml文件有一个字符集的设置：
```
<Connector port="8080" protocol="HTTP/1.1"
    connectionTimeout="20000"
    redirectPort="8444"
    useBodyEncodingForURI="true" URIEncoding="UTF-8"/>
```
重点在 userBodyEncodingForURI 和 URIEncoding 这两个属性意思是
`useBodyEncodingForURI参数表示是否用request.setCharacterEncoding参数对URL提交的数据和表单中GET方式提交的数据进行重新编码，在默认情况下，该参数为false。`
`URIEncoding参数指定对所有GET方式请求进行统一的重新编码（解码）的编码。`
URIEncoding和useBodyEncodingForURI区别是
`URIEncoding是对所有GET方式的请求的数据进行统一的重新编码，而useBodyEncodingForURI则是根据响应该请求的页面的request.setCharacterEncoding参数对数据进行的重新编码，不同的页面可以有不同的重新编码的编码`
设置了URIEncoding="UTF-8"，那么代码中request.getParameters()时就可以得到正确的中文
如果没有设置，那么tomcat中，当我们用request.getParameters()tomcat是用“ISO-8859-1”来解码的，而我们的参数是用utf-8编码的，tomcat用了其它编码方式来解码就出了乱码。要解决此问题就需要这样来接收字符串
```
String str = new String(request.getParameter("参数名").getBytes("iso-8859-1"), "utf-8");
```
另一种方式是在设置了`useBodyEncodingForURI="true"` 的情况下用 `request.setCharacterEncoding("UTF-8");` 也能解决乱码。
此时可以试下，在设置`request.setCharacterEncoding("iso-8859-1");`后，直接用`request.getParameters()`接收到的中文变成的乱码，说明这个设置是可以改变字符设置的,
而用`String str = new String(request.getParameter("参数名").getBytes("iso-8859-1"), "utf-8");` 得到的中文是正确的。


另外：
在没有设置字符集的tomcat下，request.getParameter()得到乱码，而request.getQueryString，可以得到原始值，是因为request.getQueryString没有对参数decode保留了原始值，所以接收到的数据是正常的。
