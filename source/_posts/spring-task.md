layout: post
title: 定时任务之spring-task
date: 2017-07-25 19:54:24
tags: [spring]
---
### 前言
主要记录在项目中使用spring-taks作为定时任务需要注意的地方
### 一、spring-task 配置文件
```xml
<!--使用注解方式启动task -->
<task:annotation-driven />
<task:scheduled-tasks >
    <task:scheduled ref="serviceTestTask" method="test1" cron="0 0/30 0,1,2,3,4,22,23 * * ?" />
    <task:scheduled ref="serviceTestTask" method="test2" cron="0 0/30 0,1,2,3,4,22,23 * * ?" />
</task:scheduled-tasks>
```
大概只要这样配置就可以运行了,注意这样的配置,单个定时任务之间是串行的,就是说一个时间点只有一个job在执
行,因为spring-task默认的线程数是1,但我们需要的是在不同的定进任务之间是并行,需要修改成:
<!-- more -->

```xml
<!--使用注解方式启动task -->
<task:annotation-driven />
<task:scheduled-tasks  pool-size="5" >
    <task:scheduled ref="serviceTestTask" method="test1" cron="0 0/30 0,1,2,3,4,22,23 * * ?" />
    <task:scheduled ref="serviceTestTask" method="test2" cron="0 0/30 0,1,2,3,4,22,23 * * ?" />
</task:scheduled-tasks>
```
指定一个线程池的大小大于1就可以让多个任不同Job并行,具体线程池的大小可根据实际任务数据合理设置.
但如果有以下情况的定进任务
```xml
<task:scheduled-tasks  pool-size="5" >
    <!--设置方法test1在 0,1,2,3,4,22,23 每30分钟执行一次,设置其它时间每2小时执行一次-->
    <task:scheduled ref="serviceTestTask" method="test1" cron="0 0/30 0,1,2,3,4,22,23 * * ?" />
    <task:scheduled ref="serviceTestTask" method="test1" cron="0 0 0/2 * * ?" />
    <task:scheduled ref="serviceTestTask" method="test2" cron="0 0/30 0,1,2,3,4,22,23 * * ?" />
</task:scheduled-tasks>
```
这个时候我们希望同一个方法test1是可以串行执行,而不同的方法test1,test2是可并行执行的.
但这个配置test1,test1,test2都会并行实现,如何实现同一任务串行,不同任务并行?此时我们需要配置2个scheduled,如下

```xml
<task:scheduler id="myScheduler1"/>
<task:scheduler id="myScheduler2" pool-size="5"/>
<task:scheduled-tasks  scheduler="myScheduler1">
    <!--设置方法test1在 0,1,2,3,4,22,23 每30分钟执行一次,设置其它时间每2小时执行一次-->
    <task:scheduled ref="serviceTestTask" method="test1" cron="0 0/30 0,1,2,3,4,22,23 * * ?" />
    <task:scheduled ref="serviceTestTask" method="test1" cron="0 0 0/2 * * ?" />
</task:scheduled-tasks>

<task:scheduled-tasks  scheduler="myScheduler2">
     <task:scheduled ref="serviceTestTask" method="test2" cron="0 0/30 0,1,2,3,4,22,23 * * ?" />
</task:scheduled-tasks>
```
同一任务,不同时间段执行,我们定义在一个scheduler,直接用默认的线程数1,让其串行.可并行的线程定义在另一个多线程的scheduler,
并且不同scheduler之间也并行的.
> 还有一点,在并行的scheduler中,同一个时间任务Job 执行时长是30分钟,设置每10分钟,此时执行耗时超过了
> 任务执行间隔,此时Job还是会等任务执行完后,才会再执行这个任务,而不是到时候后另一个线程重复执行.

