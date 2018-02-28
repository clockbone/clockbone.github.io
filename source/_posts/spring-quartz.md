layout: post
title: spring-quartz实现周末节假日排除的定时任务配置
date: 2018-02-28 19:14:18
tags:
---
### 一、前言
最新开发基金数据相关的需求,理财的同学知道对基金的开盘收盘是每天`9:15-15:30`之间,如果遇到某些数据只需要在开盘期间基金更新,那么我们需要设置定时
任务运行时间为每天`9:15-15:30`之间,经过学习quartz,发现我们常用使用的`SimperTrigger`和`CronTrgger`这两种触发器都无法满足这种需求的表达.经过不停查找相关资料,
终于发现`Calender`插件是可以实现的,下面看下具体配置
<!-- more -->
### 二、quartz配置
首先申明一下quartz maven版号,因为不同版本下的calender配置有可能是不一同的:
```
<dependency>
    <groupId>org.quartz-scheduler</groupId>
    <artifactId>quartz</artifactId>
    <version>2.2.2</version>
</dependency>
<dependency>
    <groupId>org.quartz-scheduler</groupId>
    <artifactId>quartz-jobs</artifactId>
    <version>2.2.2</version>
</dependency>
```
quartz calender配置:
```
<!--需要运行的定时任务-->
<bean id="testJob" class="org.springframework.scheduling.quartz.MethodInvokingJobDetailFactoryBean">
    <property name="targetObject" ref="testTask"/>
    <property name="targetMethod" value="testProcess"/>
    <property name="concurrent" value="false"/>
</bean>

<!--定义上午执行的触发器-->
<bean id="cronTriggerAM" class="org.springframework.scheduling.quartz.CronTriggerFactoryBean">
    <property name="jobDetail" ref="testJob"/>
    <!-- 每隔30秒钟(30000毫秒）执行一次 -->
    <property name="cronExpression" value="0/30 * * * * ?" />
    <!--定义一个dailyCalendarAM-->
    <property name="calendarName" value="dailyCalendarAM"/>
    <property name="priority" value="99"/>
</bean>


<!--定义下午执行的触发器-->
<bean id="cronTriggerPM" class="org.springframework.scheduling.quartz.CronTriggerFactoryBean">
    <property name="jobDetail" ref="currentNavJob"/>
    <!-- 每隔30秒钟(30000毫秒）执行一次 -->
    <property name="cronExpression" value="0/30 * * * * ?" />
    <property name="calendarName"  value="dailyCalendarPM"/>
    <property name="priority" value="99"/>
</bean>

<!-- 排除周六和周日的日历。这是quartz已经实现的日历类,直接引用,如果有更复杂的操作可以自定义日历类-->
<bean id="weeklyCalendar" class="org.quartz.impl.calendar.WeeklyCalendar" />

<bean id="dailyCalendarAM" class="org.quartz.impl.calendar.DailyCalendar">
    <constructor-arg ref="weeklyCalendar" />
    <!--配置这个calendar周一到周五,9:25-11:31之间 执行-->
    <constructor-arg value="09:25" type="java.lang.String" />
    <constructor-arg value="11:31" type="java.lang.String" />
    <!-- include hours between start and end -->
    <property name="invertTimeRange" value="true" />
</bean>
<bean id="dailyCalendarPM" class="org.quartz.impl.calendar.DailyCalendar">
    <constructor-arg ref="weeklyCalendar" />
    <constructor-arg value="13:00" type="java.lang.String" />
    <constructor-arg value="15:01" type="java.lang.String" />
    <!-- include hours between start and end -->
    <property name="invertTimeRange" value="true" />
</bean>

<!-- 上午和下午交易时间监控任务调度配置。 -->
<bean class="org.springframework.scheduling.quartz.SchedulerFactoryBean">
    <property name="triggers">
        <list>
            <ref bean="cronTriggerAM"/>
            <ref bean="cronTriggerPM"/>
        </list>
    </property>
    <!-- 定义calendars属性,刚开如没有写这部分,一直报找不到 相关dailyCalendar-->
    <property name="calendars">
        <map>
            <entry key="dailyCalendarAM" value-ref="dailyCalendarAM"></entry>
            <entry key="dailyCalendarPM" value-ref="dailyCalendarPM"></entry>
        </map>
    </property>

</bean>
```
