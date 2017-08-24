layout: post
title: redis配置优化(记一次线上redis问题排查)
date: 2017-06-22 15:32:31
categories: redis
tags: redis
---
###  一、问题描述
在通过redis缓存进行了一系列的接口性能优化后,大部分接口返回在1ms~200ms间,这都是redis的功劳,但随着接口redis缓存越来越多,新的问题产生了,从redis取数据竟然用了5s = =,通过观察日志,并不是每次取数据都是5s,
大部分情况从redis取数据还是很快的不会超过5ms.
<!-- more -->
### 二、解决
1 在查看代码后,发现有些redis的key设计的过长,于是首先重命名了rediskey尽量减少其长度,但观察发现这种情况还
是存在,并且观察日志,redis取数据耗时长的问题大概隔一段时间才发生
2 查看redis配置,发现redis初始化线程池大小没有设置= =,需要知道的是redis初始化线程大默认是0,在了解redis模式
和服务器端设置的连数大小后,果断加上redis初始化线程大小.问题解决,如果以后发现这种问题,但检察初始连接数已配置,可考虑初始连接数是否配置过小.
> 注意:
> redis初始化线程数大小是需要根据redis并发数来设置的.

首先确定本项目reids是从主模式,单机配置,和服务端设置的最大连接数为10000,以及综合考虑redis并发数大小
所以redis初始化连接数大小设置 100,具体redis配置如下:
```
<bean id="jedisPoolConfig" class="redis.clients.jedis.JedisPoolConfig">
        <!--最大连接连接-->
      	<property name="maxTotal" value="500" />
      	<!--最大空闲连接数,在连接空闲一段时间后,会自动回收,并恢复到最小空闲连接数个数-->
        <property name="maxIdle" value="300"/>
        <!--初始化连接数或最小空闲连接-->
        <property name="minIdle" value="100"/>
         <!--最大等待连接数-->
        <property name="maxWaitMillis" value="2000" />
        <property name="testOnBorrow" value="true"/>
    </bean>
```
在配置完连接数后,还可观察redis目前最大连数,最小连接数,来适当调整redis连接数大小
