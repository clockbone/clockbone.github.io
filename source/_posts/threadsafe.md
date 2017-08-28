layout: post
title: 线程安全的实现方法
date: 2014-07-19 18:48:17
categories: java
tag: [thread , java]
---
要想知道如何实现线安全，首先要了解什么是线程安全，下面来看下什么是线程安全以及如何实现。
### 一、什么是线程安全
线程安全是指：当多个线程访问一个对象时，调用这个对象的行为都可以获得正确的结果，那这个对象就是线程安全的。或者说当多个线程能有序的访问共享资源也是线程安全的。
> 其它概念：
> 同步：指多个线程并发访问共享数据时，保证共享数据在同一时刻只被一条线程使用。
>  互斥是同步实现的种手段。
>  常用的互斥实现方式：临界区、互斥量、信号量。
>  互斥是方法，同步是目的。
>  最基本的互斥手段：synchronized关键字、ReecntrantLock（重入锁）。
>  ReecntrantLock比synchronized增加了一些高级功能：等待可中断、可实现公平锁、锁可绑定多个条件（一个ReecntrantLock可等待多个Codition对象）
>  通俗讲：无论共享数据是否出现竞争，都要进行加锁

### 二、如何实现线程安全
实现线程安全通过锁机制，锁机制有以下二个层面
#### 1、代码层次上的，如java中同步锁，如比synchronized关键字、ReecntrantLock（重入锁）。
这种实现方式有一个典型的缺点就是，当在分布式应用中就会出现问题了
#### 2、数据链层次上的，比较典型的就是悲观锁和乐观锁
悲观锁：就是不管是否发生多线程冲突，假设都存在这种可能，就每次访问都加锁
比如：select …… for update语句，获取数据的时候就去加锁
> `说明：`
> 以MySQL中select * for update锁表的问题为例
> 由于InnoDB预设是Row-Level Lock，所以只有「明确」的指定主键，MySQL才会执行Row lock (只锁住被选取的资料例) ，否则MySQL将会执行Table
> 举个例子: 假设有个表单order ，里面有orderId跟amount二个栏位，orderId是主键。
> 例1: (明确指定主键，并且有此笔资料，row lock)
> SELECT * FROM order WHERE orderId='3' FOR UPDATE;
> SELECT * FROM order WHERE orderId='3' and type=1 FOR UPDATE;
> 例2: (明确指定主键，若查无此笔资料，无lock)
> SELECT * FROM order WHERE orderId='-1' FOR UPDATE;
> 例2: (无主键，table lock)
> SELECT * FROM order WHERE amount='Mouse' FOR UPDATE;
> 例3: (主键不明确，table lock)
> SELECT * FROM order WHERE orderId<>'3' FOR UPDATE;
> 例4: (主键不明确，table lock)
> SELECT * FROM order WHERE orderId LIKE '3' FOR UPDATE;
> 注1: FOR UPDATE仅适用于InnoDB，且必须在交易区块(BEGIN/COMMIT)中才能生效。

乐观锁：假设不会发生并发冲突，只在提交操作时检查是否违反数据完整性。
乐观锁，大多是基于数据版本   Version ）记录机制实现。何谓数据版本？即为数据增加一个版本标识，在基于数据库表的版本解决方案中，一般是通过为数据库表增加一个 “version” 字段来 实现。 读取出数据时，将此版本号一同读出，之后更新时，对此版本号加一。此时，将提 交数据的版本数据与数据比如一张order表，orderId,amount,version字段
select orderId,amount,version as oldVersion from order where orderId=3;
update order set amount=amount-100 where orderId=#{orderId} and version=#{oldVersion}
更新的时候带上旧的版本号，如果不相同表明此记录已经修改过，就会更新失败。
> 一个具体的红包案例(有一个主红包分成10个子红包，有100个人来抢，如何控制并发，红包主表mainorder)
> select remain_amt,orderid from mainorder t where orderId = #{orderId}
> update mainorder set remain_amt=remain_amt-#{amount} where orderId=#{orderId} and remain_amt=#{remain_amt}
> 这里的remain_amt就是控制乐观锁的字段，相当于version
> 当更新失败表明抢红包失败，但通常会发现，并发量大的时候红包余额还有，但也会失败的情况，可以在外层加一个while循环来控制，如果update成功退出while，如失败继续while，但还是有风险，如果些时这条记录锁住，会导致死循环，我们加一个重试的控制变量，定义retry_count=0,每更新失败一次就retry+1,当retry_count>10时就退出循环，避免死循环



### 三、轻量级同步机制volatile型量介绍
volatile型变量的特殊规则
volatile是java JVM提供的轻量级同步机制，
#### 1、可保证变量可见性，但对于非原子操作 并不能保证线程安全。
一般用于：
```java
volatile  boolean shutdownRequested;

    public void shutDown(){
        shutdownRequested = true;
    }

    public void doWork(){
        while(!shutdownRequested){
            //do stuff
        }
    }
```
#### 2、使用他的第二个语义是禁止指令重排序优化。
一般用于处理配置文件是用到，比如下面一段代码：
```java
Map configOptions;
    char[] confitText;
    volatile  boolean initialized = false;
    //假设以下代码在线程A中执行
    //模拟读取配置信息，当读取完成后，将initialized设置为true来通知其他线配置可用
    public void init(){
        configOptions = new HashMap();
        confitText = readConfigFile(finalName);
        processsConfigOptions(confitText,configOptions);
        initialized = true;
    }

    //假设以下代码在线程B中执行
    //等待initialized为true，代码线程A已经把配置信息初始化守成
    public void getWork(){
        while ((!initialized)){
            sleep();
        }
        doSomethingWithConfig();
    }
```
> volatile型变量使用场景：
> 要使 volatile 变量提供理想的线程安全，必须同时满足下面两个条件：
> 对变量的写操作不依赖于当前值。
> 该变量没有包含在具有其他变量的不变式中。

### 四、ReecntrantLock用法举例
```java
public class TheadTest2 {
    private static Lock lock  = new ReentrantLock();
    private static Condition subThreadCondition = lock.newCondition();
    private static boolean bBhouldSubThread = false;
    public static void main(String [] args){
        ExecutorService threadPool = Executors.newFixedThreadPool(3);
        threadPool.execute(new Runnable() {
            @Override
            public void run() {
                for(int i=0;i<50;i++){
                    lock.lock();
                    try {
                        if(!bBhouldSubThread){
                           subThreadCondition.await();
                        }
                        for(int j=0;j<10;j++){
                            System.out.println(Thread.currentThread().getName()+ ",j=" + j);
                        }
                        bBhouldSubThread=false;
                        subThreadCondition.signal();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }finally {
                        lock.unlock();
                    }
                }
            }
        });
        threadPool.shutdown();
        for(int i=0;i<50;i++){
           lock.lock();
            try{
                if(bBhouldSubThread){
                    subThreadCondition.await();
                }
                for(int j=0;j<10;j++){
                    System.out.println(Thread.currentThread().getName()+ ",j=" + j);
                }
                bBhouldSubThread= true;
                subThreadCondition.signal();
            }catch (InterruptedException e){
            }finally{
                lock.unlock();
            }
        }
    }
}
```
### 五、总结
synchronized关键字、ReecntrantLock都是通过互斥来实现线程安全,如果线程间需要通信可以使用Lock的Condition来实现
