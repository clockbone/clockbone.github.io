---
title: Hexo、github搭建属于自己的blog
date: 2016-05-24 13:18:43
categories: hexo
tags: [ hexo, git]
---
Hexo 快速环境搭建

###  前言

用hexo搭建了一个blog，在此记录下

 一、环境安装


下载安装git

可以安装git命令行和TortoiseGit客户端

下载安装Node.js

下载好后，双击安装，一路next即可
安装Hexo

可以新建一文件夹作为博客的根目录
比如：E：blog/hexo
在此文件夹中右击任意位置，选择Git Bash，弹出命令行窗口，执行如下命令：
`npm install -g hexo`
如果报错，请换国内镜像源试试：
``` bash
   $ npm config set registry="http://registry.cnpmjs.org"
	```
然后再执行`npm install -g hexo`,成功！

二、安装依赖包


``` bash
npm install
```
相关命令缩写
``` bash
hexo generate=hexo g
hexo server=hexo s
hexo deploy=hexo d
hexo new=hexo 
```

三、本地查看



执行以下命令：
``` bash
    hexo g
    hexo s
```
然后浏览器输入`http://localhost:4000`查看效果。
到此，本地博客已经搭建，但别人看不到。

四、部署到GitHub



编辑E:\blog\hexo下的config.yml,修改Deployment部分：

#Deployment
#Docs: https://hexo.io/docs/deployment.html 
deploy:   
type: git   
repository: https://github.com/clockbone/clockbone.github.io.git  
branch: master

>注 ：
>* repository 地址中 clockbone对应你的github账号名

部署

执行命令：
    `hexo d` ,执行该命令，报错：
	``` bash
    ERROR Deployer not found:git
	```
	
执行命令：
``` bash
npm install hexo-deployer-git --save
```
,再次执行`hexo d`
会提示用户名和密码，输入github账号的用户名和密码即可。在此之前需要添加ssh key到你的github中，直接用TortoiseGit->Puttgen菜单生成key即可，保存公钥和私钥，将公钥添加到github账号中，私钥作为本地和公钥的验证。

五、访问测试



访问：[http://clockbone.github.io/][1]


  [1]: http://clockbone.github.io/

六、如何更改主题


  到官网查找主题：[https://hexo.io/themes/][1]
  [1]: https://hexo.io/themes/
  点击主题名字，如[indigo][1]
  [1]:https://github.com/yscoder/hexo-theme-indigo
  参照下列安装即可，需要注意一点，用`git clone`命令下载下来的主题需在放到themes目录下，主题所在文件夹需要修改成和主题名称一样
  如indigo主题下载下来的文件夹名称为`hexo-theme-indigo` 请重命名为`indigo`即和主题名称保持一致，否则`hexo g`命令时会报错

七、如何添加首页的菜单


 如：`归档`，`分类`，`标签`，`关于我`
 执行命令`hexo new page archives`，`hexo new page categories`，`hexo new page tags`，`hexo new page about`
 此时可以在source文件夹下面看到生成的archives,categories,tags,about文件夹，其中archives，categories会自动生成模版，
 以about文件夹下的index.md文件为例：
 index.md文件中内容如下：

 ---
 layout: about  #需要指定layout 为 about
 title: about
 date: 2016-05-27 11:26:43

 ---

八、如何添首页右侧标签，分类等

 在主的_config.xml 文件中，指定下列

 tag_dir: tags
 archive_dir: archives
 category_dir: categories
 写的文章源文件中添加：
 categories: hexo
 tags: [ hexo, git]

  
九、如何发布静态文章



可以用Cmd Markdown来编辑你的文章，编辑好后保存下来
还是在原来E:\blog\hexo目录下打开一个Git Bash，执行下面命令：
```bash
hexo new "My New Post"
```
`My New Post`是你的文章名，此时可以在`E:\blog\hexo\source\_posts\Hexo-create.md`看到生成的源文件，这是hexo文章的源文件，可以直接用Cmd Markdown编辑好的内容贴到此文件中，或者直接用其语法编写。
打开`http://localhost:4000`本地查看你的文章。
查看没问题了，可以执行：
```bash
hexo g
```
生成html,css,js的网页文件
再执行：
```bash
hexo d
```
部署到远程的github上。
如果需要修改此文章还是重复以下步骤及可：

 1. Cmd Markdown编辑修改的文章
 2. 在本地输入`http://localhost:4000`查看本地效果
 3. 执行`hexo g`，生成网页文件（Html,css,js等）
 4. 执行`hexo d`，将生成的网页文件部署到远程github。


十、如何将blog源文件托管github

 这个时候我们发现，如果我们想到其它计算机上也随时发布blog，这个时候还是办不到的。
 那么我们就会想到需要把blog部署项目也提交到github上，我们的博客静态文件是在github上的。那么，我们需要在此git地址上新建一个分支作为blog部署项目的地址，以我的博客为例：
 我的博客git地址为：`git@github.com:clockbone/clockbone.github.io.git`
 1.可直接登录`github`选择`clockbone.github.io.git`项目新建一个分支分支名为：`hexo`
 2.设置此项目的默认分支为：`hexo`
 3.在git客户端拉取项目，此时可以看到默认拉下来的分支名为：`hexo`
 4.删除除.git外的所有文件，将之前博客源文件：`source`,`themes`,`.gitgnore`,`_config.xml`,`package.json`全部提交到此分支上去
   >注：如果发现有文件提交框中不显示，请检查些文件夹中是否有.git文件夹，需要删除才能提交上去。

 5.依次执行：`npm install hexo`,`npm install`,`hexo-deployer-git`（记得，不需要`hexo init`这条指令）
  >注：
  > * 执行这些命令时需要到项目根目录下，打开Git Bash执行
  > * 如果报：`hexo command not found`,说明hexo没添加到环境变量中，需要将`node_modules\hexo\bin`添加到path下面，再执行`hexo g`成功！

 6.执行`hexo g`,`hexo s`，查看效果。访问`localhost:4000`
 7.部署到github，`hexo d`
   >注：
   > * 如果出现` ERROR Deployer not found:git` 错误，请先执行`npm install hexo-deployer-git --save`，再执行`hexo d`
