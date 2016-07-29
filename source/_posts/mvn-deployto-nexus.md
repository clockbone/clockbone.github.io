layout: post
title: 上传本地jar包到mvn仓库
date: 2016-07-29 11:07:47
categories: maven
tags: maven
---
目前maven项目是用的比较多的，那么上传本地jar到maven仓库也是常会有事，下面介绍一下如何上传jar到本地仓库和远程仓库。
### 一、用命令上传jar包到本地仓库
```
<dependency>
    <groupId>com.spreada</groupId>
    <artifactId>ZHConverter</artifactId>
    <version>1.0</version>
</dependency>

mvn install:install-file -Dfile=jar包的位置 -DgroupId=上面的groupId -DartifactId=上面的artifactId -Dversion=上面的version -Dpackaging=jar
```
### 二、用nexus页面上传jar包到远程仓库
#### 1、登录nexus
#### 2、选择左边的repository菜单
![](/images/mvn1.png)
#### 3、选择右边3rd party
![](/images/mvn3.png)
#### 4、在artifact Upload界面，填写参数
![](/images/mvn2.png)
![](/images/mvn4.png)
### 三、mvn clean package出错
当我们只是将所需要的jar包上传本地仓库开发时，当开发完成部署到服务器时，比如用jenkins来部署或其它自己实现的部署系统。编写shell脚本`mvn clean package -Ptest`打包会报错，因为此时还没有将所需要的jar上传到远程仓库。此时我们用上面的方法将jar上传到远程仓库，并且在本地项目打包尝试也是成功的。但在服务器上部署还是会报错，错误如下：
```
 xxx.jar in http://repository/url  was cached in the local repository, resolution will not be reattempted until the update interval of nexus has elapsed or updates are forced -> [Help 1]

```
意思是说我们之前缺失的jar包在远程仓库已经缓存过了，maven就不会再去拉取这个jar包了。
这里需要说明一下：`Maven不管下没下成功，都会有一个.lastupdate文件，一旦出现了这个文件，而你指定远程仓库的方式是mirror，而不是profile里的repository，那么Maven默认不会去更新这个文件`.
所以我们在jenkins的shell脚本里面或者自己编写打包命令的脚本需要这样写`mvn clean package -Ptest -U`，需要添加一个`-U`参数，意思是强制拉取远程的jar包。这样就可打包正功了。



