layout: post
title: spark基础
date: 2018-03-06 12:40:32
tags:
---
### 1.基本概念
并发变并行
多线程转变多JVM计算
内存计算(内存为主,磁盘为车铺),延迟计算,分阶段计算
#### RDD Resilient Distributed DataSet
弹性式分布计算集合 -- 可并行计算、可重复计算
* 分区(partition) -- 一个基本的计算单元,也是Spark并行计算的基础
* 分区计算函数 -- 处理分区的数据,计算逻辑封装
* Partitioner -- 如何分布分区中的数据
典型的就是在RDD之间按键值对进行Shuffle操作的时候(如reduceByKey,join),Spark需要 根据某种规则来决定分区中的键被重新分配到哪些分区(一般是通过键的哈希,类似于Kafka往 分区中发送消息的策略)。
<!-- more -->
#### 重要概念

| 术语        | 含义                                                     |
| --------   | -----:            |
| Application jar     | 包含应用程序的jar包,一般会使用maven-assembly打成fat.jar |
| Driver program        |   运行main方法的进程,sparkcontext启动程序 |
| Worker node && Excutor        |     Executor是在Worker Node负责执行任务(Task)的,一个应用可能会启动多个Executor每一个Executor对应一个JVM进程|
 | Executor Cores        |    定义了Executor的核数,与同时能运行的Task数一致 |
 | Job/Stage/Task        |    当RDD的action被调用时,就会触发一个Job; 而每一个Job又可以 被分为若干个Stage,每一个Stage又对应多个Task, 而Task和 Partition一一对应 |

 简单执行:
 ```
  List<Integer> data = Arrays.asList(1, 2, 3, 4, 5);
 //并行集合，是通过对于驱动程序中的集合调用JavaSparkContext.parallelize来构建的RDD
 JavaRDD<Integer> distData = spark.parallelize(data);


 JavaRDD<Integer> lineLengths = distData.map(a->a);

 // 运行reduce 这是一个动作action 这时候，spark才将计算拆分成不同的task，
 // 并运行在独立的机器上，每台机器运行他自己的map部分和本地的reducation，并返回结果集给去驱动程序
 int totalLength = lineLengths.reduce((a,b)->a+b);

 System.out.println("总和" + totalLength);
 // 为了以后复用 持久化到内存...
 ```
 ### 2.性能调优
减少内存占用,更充分的利用并行,提高执行速度。
#### (1) 参数调优
```
# KyroSerializer提供更好的压缩和解压功能
 spark.serializer org.apache.spark.serializer.KryoSerializer

# SQL shuffle操作之后的分区大小
spark.sql.shuffle.partitions 20

# join, reduceByKey, parallelize等操作之后RDD分区大小
spark.default.parallelism 100

```
#### (2) 操作优化
* 适时缓存 -- RDD在action调用的时候回被计算(实际上是分区的运算),如果我们需要对 RDD反复操作的话,那么我们应该对其进行缓存,从而避免分区的再次计算。
* 避免使用collect -- 所有executor的数据拉取到driver上
* reduceByKey over groupByKey; Spark SQL operation over reduceByKey
  两者之间的核心区别在于是否使用了mapSideCombine,也就是在shuffle write之前是否进 行分区内同键记录的聚合。





