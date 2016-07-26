layout: post
title: redis应用
date: 2015-04-15 10:26:52
categories: redis
tag: redis
---
redis是现在运用比较广泛的缓存服务器，如果我们能登录redis服务器并熟练运用redis下各种命令，那么在java项目运用redis就更加容易。
学习redis下各种命令可以参考：http://doc.redisfans.com/
redis官网提供了jar包来支持redis在java开发的运用，下面结合redis命令来介绍redis在java项目中的运用：
首先了解下redis支持的数据类型：`string`、`set`、`hash`、`list`
上面这4种类型也是在应用程序中经常会用到的，下面看看如何运用
### 一、存储string类型
 redis下命令为：
```
 SET key value
 GET key
```
`string类型运用`：可存储一个简单的string类型，也可将java复杂对象转成json格式字符串存储，根据key取出后再解析josn串也是一种很方便的做法。
### 二、有序的set集合
命令存储：
```
ZADD key score member [[score member] [score member] ...]
```

 因为是有序的set集合，`score`为存储的序列号，`member`为值
 应用：
 ```
 for(int i=0;i<listLength;i++){
     zadd key i list.get(i)
 }
 ```
 读取：
 ```
 redis > ZRANGE salary 0 -1 WITHSCORES  # 显示整个有序集成员
 ```
`WITHSCORES`参数:表示显示序号
`有序的set集合运用`：可用来存储有序的菜单，当然这里也可用list来存，因为List本身就是用序的，但list不可控制其重复性。
### 三、set集合
存储：
```
SADD bbs "discuz.net"
```
  读取：
```
SMEMBERS bbs
```
### 四、hash类型
存储：
```
HSET key field value
```
读取：
```
读取一个属性：  HGET key field
读取所有：     HGETALL key
```
`hash`类型一般可用来存储一个java对象,这里的`field`就对应java对象里面定义的属性。一般当hgetall命令可直接将取出来的所有属性转化为相应的java对象存储
###  五、list类型
list集合
查看list下所有元素：
```
lrange mylist 0 -1
```
写值：
```
lpush mylist value1 value2 value3
```
list可以写重复的值限 `lpush mylist 'test' 'test' 'test'`
三个test值 都可以写到list里面去

与set的区别是
set的值只会有一个 如  `sadd mykey   'test'  'test'`
只会写进去一个 test 值
### 6、其它
redis连接环境：
连接redis:`redis-cli -p 1221`
查看所有key:`keys *`

