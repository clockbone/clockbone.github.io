layout: post
title: 线程安全的实现方法
date: 2014-07-19 18:48:17
categories: java
tag: [thread , java]
---
要想知道如何实现线安全，首先要了解什么是线程安全，下面来看下什么是线程安全以及如何实现。
### 一、什么是线程安全
线程安全是指：当多个线程访问一个对象时，调用这个对象的行为都可以获得正确的结果，那这个对象就是线程安全的。或者说当多个线程能有序的访问共享资源也是线程安全的。
### 二、如何实现线程安全
#### 1、互斥同步。（会进行线程阻塞和唤醒带来性问题，也称阻塞同步---悲观的同步策略）
<!-- more -->
同步：指多个线程并发访问共享数据时，保证共享数据在同一时刻只被一条线程使用。
互斥是同步实现的种手段。
常用的互斥实现方式：临界区、互斥量、信号量。
互斥是方法，同步是目的。
最基本的互斥手段：synchronized关键字、ReecntrantLock（重入锁）。
ReecntrantLock比synchronized增加了一些高级功能：等待可中断、可实现公平锁、锁可绑定多个条件（一个ReecntrantLock可等待多个Codition对象）
通俗讲：无论共享数据是否出现竞争，都要进行加锁
> `说明：`
> jdk后来对synchronized作了优化性能已不比ReecntrantLock低，所以建议使用synchronized来进行同步，可增加代码的可读性。但是如果需要用到多个条件的同步那么使用ReecntrantLock是更好的

#### 2、非阻塞同步（基于冲突检测的   ----乐观并策略）
通俗讲：就是先进行操作，如果没有其它线程争用共享数据，那操作就成功；如果产生冲突，再进行其化补偿措施（常用不断重试试来补偿）---需要靠 ”硬件指令集的发展“完成
#### 3、无同步方案
如果一方法本来就不涉及共享数据，那它就无须任何同步措施
a 、可重入代码，如果一个方法，返回结果是可预测的，只要输入相同的数据，就都能返回相同的结查，就是可重入的
b 、线程本地存储，如果一段码中所需的数所必须与其他代码共享，如果能保证 这些共享数据代码在同一个线程中执行，就不需同步。

### 三、轻量级同步机制volatile型量介绍
volatile型变量的特殊规则
volatile是java JVM提供的轻量级同步机制，
#### 1、可保证变量可见性，但对于非原子操作 并不能保证线程安全。
一般用于：
```
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
```
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
```bash
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