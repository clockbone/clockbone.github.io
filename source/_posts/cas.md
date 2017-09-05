layout: post
title: cas
date: 2017-08-28 16:19:38
categories: java
tags: [thread , java]
---
### 一、cas简介
`java.util.concurrent`包完全建立在`CAS`之上的，没有`CAS`就不会有此包
ava.util.concurrent包中借助CAS实现了区别于`synchronouse`同步锁的一种乐观锁。
### 二、cas原理
CAS:`Compare and Swap`  比较并交换
CAS有三个参数,内存位置V、旧的预期值A、新的预期值B。**当且仅当V符合预期值A的时候，CAS用新值B原子化
的更新V的值；否则他什么都不做。在任何情况下都会返回V的真实值。**（这个变量称为`compare-and-set`，无论操作是否成功都会返回。）CAS的意思是，“ 我任务V的值应该是A，如果是A则将其赋值给B，若不是，则不修
改，并告诉我应该为多少。”CAS是以项乐观技术--它抱着成功的希望进行更新，并且如果，另一个线程在上次检查后更新了变量，它能够发现错误。
 <!-- more -->
#### AtomicInteger CAS举例
```java
private volatile int value;//保证线程可见性
public final int get() {
    return value;
}
public final int incrementAndGet() {
    for (;;) {
        int current = get();
        int next = current + 1;
        if (compareAndSet(current, next))
            return next;
    }
}
```
在这里采用了CAS操作，每次从内存中读取数据然后将此数据和+1后的结果进行CAS操作，如果成功就返回结果，否则重试直到成功为止。
而`compareAndSet`利用`JNI(java native interface)`来完成`CPU`指令的操作。
> CAS实际上是利用处理器提供的CMPXCHG指令实现的，而处理器执行CMPXCHG指令是一个原子性操作。
> JNI(java本地方法)充许java调用其它语言。compareAndSet就是借助C来调用CPU底层指令实现
> CPU保证原子性是通过总线锁,缓存锁实现

### 三、cas缺点
#### 1、ABA问题
 因为CAS需要在操作值的时候检查下值有没有发生变化，如果没有发生变化则更新，但是如果一个值原来是A，变
 成了B，又变成了A，那么使用CAS进行检查时会发现它的值没有发生变化，但是实际上却变化了。ABA问题的解
 决思路就是使用版本号。在变量前面追加上版本号，每次变量更新的时候把版本号加一，那么A－B－A 就会变成1A-2B－3A。
 从Java1.5开始JDK的atomic包里提供了一个类AtomicStampedReference来解决ABA问题。
#### 2、循环时间长开销大
### 四、cas总结
concurrent通用实现模式
1、声明共享变量为volatile；
2、使用CAS的原子条件更新来实现线程之间的同步；
3、配合以volatile的读/写和CAS所具有的volatile读和写的内存语义来实现线程之间的通信
AQS，非阻塞数据结构和原子变量类（java.util.concurrent.atomic包中的类），这些concurrent包中的基础类都是使用这种模式来实现的，而concurrent包中的高层类又是依赖于这些基础类来实现的。从整体来看，concurrent包的实现示意图如下：
valatile变量读写,cas->AQS,非阻塞数据结构,原子变量类


