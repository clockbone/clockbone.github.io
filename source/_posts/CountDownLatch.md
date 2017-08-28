layout: post
title: CountDownLatch共享锁
date: 2017-08-23 17:27:06
categories: java
tags: [thread , java]
---
### 一、CountDownLatch简介
CountDownLatch是同步工具类之一，可以指定一个计数值，在并发环境下由线程进行减1操作，当计数值变为0之后，被await方法阻塞的线程将会唤醒，实现线程间的同步。
>CountDownLatch和CyclicBarrier的区别
>(01) CountDownLatch的作用是允许1或N个线程等待其他线程完成执行；而CyclicBarrier则是允许N个线程相互等待。
>(02) CountDownLatch的计数器无法被重置；CyclicBarrier的计数器可以被重置后使用，因此它被称为是循环的barrier。

<!-- more -->
基本使用方法:
```java
public void CountDownLatch() {
   int threadNum = 10;
   final CountDownLatch countDownLatch = new CountDownLatch(threadNum);
   for (int i = 0; i < threadNum; i++) {
       final int finalI = i + 1;
       ServiceThread thread = new ServiceThread();
       executor.execute(thread)
   }
   try {
       countDownLatch.await();
   } catch (InterruptedException e) {
       e.printStackTrace();
   }
   //do some thing
   System.out.println(threadNum + " thread finish");
}
public class ServiceThread implements Runnable {
    @Override
    public void run() {
        try{
            //do some thing
        }catch (Exception e){

        }finally {
            latch.countDown();
        }
    }
}

```
只有当子线程执行完,主线程await后面的方法才会执行。
### 二、主要方法
#### 1、new CountDownLatch(threadNum)构造方法
CountDownLatch和ReentrantLock一样，内部使用Sync继承AQS。构造函数很简单地传递计数值给Sync，并且设置了state。
```java
Sync(int count) {
    setState(count);//setState在AQS中实现
}
```
AQS的state是一个由子类决定含义的"状态",被定义private volatile long,对于ReentrantLock来说,state是线程获取次数;对于CountDownLatch来说,则表示计数值大小.
#### 2、await()阻塞方法
```java
public void await() throws InterruptedException {
    sync.acquireSharedInterruptibly(1);
}
```
await调用AQS的acquireSharedInterruptibly
```java
public final void acquireSharedInterruptibly(int arg)
        throws InterruptedException {
    if (Thread.interrupted())
        throw new InterruptedException();
    if (tryAcquireShared(arg) < 0)
        doAcquireSharedInterruptibly(arg);
}
```
acquireSharedInterruptibly方法尝试获取共享锁,如果当前线程是中断则抛出异常。否则调用tryAcquireShared(tryAcquireShared由CountDownLatch实现)尝试获取共享锁,如果成功则返回,否则调用
doAcquireSharedInterruptibly。doAcquireSharedInterruptibly()会使当前线程一直等待,直到当前线程获取到共享锁(或中断才返回)。
```java
protected int tryAcquireShared(int acquires) {
   return (getState() == 0) ? 1 : -1;
}
```
返回1表示获取成功,返回-1获取失败,调用doAcquireSharedInterruptibly
#### 3、 countDown()释放方法
```java
public void countDown() {
    sync.releaseShared(1);
}
```
每调用一次state减1
```java
public final boolean releaseShared(int arg) {
    if (tryReleaseShared(arg)) {
        doReleaseShared();
        return true;
    }
    return false;
}
```
首先尝试释放锁,在CountDownLatch实现
```java
protected boolean tryReleaseShared(int releases) {
    // Decrement count; signal when transition to zero
    for (;;) {
        int c = getState();
        if (c == 0)
            return false;
        int nextc = c-1;
        // 通过CAS函数进行赋值。
        if (compareAndSetState(c, nextc))
            return nextc == 0;
    }
}
```
死循环加上cas的方式保证state的减1操作，当计数值等于0，代表所有子线程都执行完毕，被await阻塞的线程可以唤醒了.
### 三、总结
CountDownLatch是通过“共享锁”实现的。在创建CountDownLatch中时，会传递一个int类型参数count，该参数是“锁计数器”的初始状态，表示该“共享锁”最多能被count个线程同时获取。
当某线程调用该CountDownLatch对象的await()方法时，该线程会等待“共享锁”可用时，才能获取“共享锁”进而继续运行。而“共享锁”可用的条件，就是“锁计数器”的值为0！而“锁计数器”的初始值为count，
每当一个线程调用该CountDownLatch对象的countDown()方法时，才将“锁计数器”-1；通过这种方式，必须有count个线程调用countDown()之后，“锁计数器”才为0，而前面提到的等待线程才能继续运行！




