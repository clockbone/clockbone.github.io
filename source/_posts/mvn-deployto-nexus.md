layout: post
title: 上传本地jar包到nexus私服
date: 2016-07-29 11:07:47
categories: maven
tags: maven
---
目前maven项目是用的比较多的，那么上传本地jar到maven仓库也是常会有事，下面介绍一下如何上传jar到本地仓库和远程仓库。
### 一、用命令上传jar包到本地仓库
```xml
<dependency>
    <groupId>com.spreada</groupId>
    <artifactId>ZHConverter</artifactId>
    <version>1.0</version>
</dependency>
mvn install:install-file -Dfile=jar包的位置 -DgroupId=上面的groupId -DartifactId=上面的artifactId -Dversion=上面的version -Dpackaging=jar
```
<!-- more -->
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
所以我们在jenkins的shell脚本里面或者自己编写打包命令的脚本需要这样写`mvn clean package -Ptest -U`，需要添加一个`-U`参数，意思是强制拉取远程的jar包。这样就可打包成功了。
### 四、Nexus仓库
我们上传jar时为什么选择`3rd party`，下面我们来了解下Nexus仓库
#### 1、Nexus仓库与仓库组
Nexus包含多种仓库概念。不同仓库提供不同配置、服务。
代理仓库：主要是提供下载缓存构件和插件、如果只是从远程仓库下载构件和插件、那么代理仓库完全足够。宿主仓库：主要用于存放项目部署的构件、或者第三方构件用于提供下载。
四种仓库类型：hosted（宿主仓库）、proxy（代理仓库）、group（仓库组）、irtual（虚拟仓库）。
#### 2、详细类型
Central：代理中央仓库、策略为Release、只会下载和缓存中央仓库中的发布版本构件。
Release： 策略为Release的宿主仓库、用来部署组织内部的发布版本内容。
Snapshot： 策略为Snapshot的宿主仓库、用来部署组织内部的快照版本内容。
3rd party： 策略为Release的宿主仓库类型、用来部署无法从公共仓库获取的第三方发布版本构件、如oracle连接驱动jar包。
ApacheSnapshot： 策略为Snapshot的代理仓库、用来代理ApacheMaven仓库的快照版本构件。
PublicRepositories：该仓库将上述所有策略为Release的仓库聚合并通过一致的地址提供服务。
Public Snapshot Repositories：该仓库将上述所有策略为Snapshot的仓库聚合并通过一致的地址提供服务。
到这里我们就很清楚为什么要选择`3rd party`了。


