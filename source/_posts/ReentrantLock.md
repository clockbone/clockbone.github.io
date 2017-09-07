layout: post
title: ReentrantLock(可重入互斥锁,独占锁)实现原理
date: 2017-08-23 16:36:24
categories: java
tags: [thread]
---
### 前言
  不太擅长记录原理类东西,但另一方面这些理论确实比较重要,只有掌握了这些东西,在出现问题的时候才能更好的解决.
### 一、ReentrantLock涉及到几个概念
#### 1、什么是AQS:AQS即是AbstractQueuedSynchronize抽象类
 AQS是java中管理“锁”的抽象类，锁的许多公共方法都是在这个类中实现。AQS是独占锁(例如，ReentrantLock)和共享锁(例如，Semaphore)的公共父类。它是基于FIFO等待队列实现的一个用于实现同步器的基础框架。
 JCU包里面几乎所有的有关锁、多线程并发以及线程同步器等重要组件的实现都是基于AQS这个框架。AQS核心是基于volatile int state这样的一个属性同时配合Unsafe工具对其原子性的操作来实现对当前锁的状态进行修改。当state的值为0的时候，标识改为Lock不被任何线程所占有。
 <!-- more -->
#### 2、AQS锁的类别(分为“独占锁”和“共享锁”两种)
(01) 独占锁:锁在一个时间点只能被一个线程锁占有。根据锁的获取机制，它又划分为“公平锁”和“非公平锁”。公平锁，是按照通过CLH等待线程按照先来先得的规则，公平的获取锁；而非公平锁，则当线程要获取锁时，它会无视CLH等待队列而直接获取锁。独占锁的典型实例子是ReentrantLock，此外，ReentrantReadWriteLock.WriteLock也是独占锁。
(02) 共享锁:能被多个线程同时拥有，能被共享的锁。JUC包中的ReentrantReadWriteLock.ReadLock，CyclicBarrier， CountDownLatch和Semaphore都是共享锁。
#### 3、CLH队列 (Craig, Landin, and Hagersten lock queue)
 CLH队列是AQS中“等待锁”的线程队列。在多线程中,竞争资源在一个时间点只能被一个线程,其它线程则需要等待,CLH就是管理这些“等待锁”的线程的队列。
  CLH是一个非阻塞的 FIFO 队列。也就是说往里面插入或移除一个节点的时候，在并发条件下不会阻塞，而是通过自旋锁和 CAS 保证节点插入和移除的原子性。
#### 4、CAS函数(Compare And Swap )
 CAS函数，是比较并交换函数，它是原子操作函数；即，通过CAS操作的数据都是以原子方式进行的。
 例如，compareAndSetHead(), compareAndSetTail(), compareAndSetNext()等函数。它们共同的特点是，这些函数所执行的动作是以原子的方式进行的。
#### 5、什么是ReentrantLock可重入性
当一个线程获取ReentrantLock锁,AQS的state会记录这个线程名,并将state加1,等下次这个线程又想获取锁时,不用等待可以直接再次获取锁,
并将state再加1,所以这个线程需要释放锁2次,将state减为0,其它线程再能获取锁。
### 二、ReentrantLock的公平和非公平2种模式
ReentrantLock支持两种获取锁的方式，一种是公平模型，一种是非公平模型,默认使用非公平锁。
ReentraantLock是通过一个FIFO的等待队列来管理获取该锁所有线程的。在“公平锁”的机制下，线程依次排队获取锁；而“非公平锁”在锁是可获取状态时，不管自己是不是在队列的开头都会获取锁。
```java
public ReentrantLock() {
    sync = new NonfairSync();
}

public ReentrantLock(boolean fair) {
    sync = fair ? new FairSync() : new NonfairSync();
}
```
ReentrantLock的内部类Sync继承了AQS，分为公平锁FairSync和非公平锁NonfairSync。
公平锁：线程获取锁的顺序和调用lock的顺序一样，FIFO；
非公平锁：线程获取锁的顺序和调用lock的顺序无关，全凭运气。
#### 1、公平模型
初始化state=0,表示没有线程占有锁(state被定义成volatile int 类型,为了保证线程可见性)
线程A请求锁,使用CAS方式将state加1,A线程执行任务
线程B请求锁,线程B无法获取锁,生成节点进行排队.
如果线程A再次请求锁,线程有优先权,不需排队,再次获取锁,使用CAS将state加1,所以当线程完全释放锁时,需要unlock 2次.
线程A执行完任务,state=0,然后再通知队列唤醒线程B,使B可以再次争锁,如果B线程后面还有C线程，C线程继续休眠，除非B执行完了，通知了C线程.当一个线程节点被唤醒然后取得了锁，对应节点会从队列中删除。
#### 2、主要方法(公平模型)
 ##### 1)、lock()获取锁方法
```java
final void lock() {
    acquire(1);
}
```
acquire AQS中实现
```java
public final void acquire(int arg) {
    if (!tryAcquire(arg) &&
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}
```
tryAcquire:尝试获取锁,成功返回true,失败返回false
addWaiter:创建节点并添加到队尾,即使当前线程获取锁失败,添加等待锁队列
acquireQueued:逐步的去执行CLH队列的线程,如果当前线程获取到了锁，则返回；否则，当前线程进行休眠，直到唤醒并重新获取锁了才返回
 #####  2)、unlock()释放锁方法
```java
public final boolean release(int arg) {
    if (tryRelease(arg)) {
        Node h = head;
        if (h != null && h.waitStatus != 0)
            unparkSuccessor(h);
        return true;
    }
    return false;
}
```
release()会先调用tryRelease()来尝试释放当前线程锁持有的锁。成功的话，则唤醒后继等待线程，并返回true。否则，直接返回false。

#### 3、非公平锁模型
当线程A执行完之后，要唤醒线程B是需要时间的，而且线程B醒来后还要再次竞争锁，
所以如果在切换过程当中，来了一个线程C，那么线程C是有可能获取到锁的，如果C获取到了锁，B就只能继续休眠了,这就是非公平模型。
#### 4、主要方法(非公平锁模型)
 ##### 1)、lock()获取锁方法
```java
final void lock() {
    if (compareAndSetState(0, 1))
        setExclusiveOwnerThread(Thread.currentThread());
    else
        acquire(1);
}
```
lock()会先通过compareAndSet(0, 1)来判断“锁”是不是空闲状态。是的话，“当前线程”直接获取“锁”；否则的话，调用acquire(1)获取锁。
 ##### 2)、unlock()释放锁方法
和公平锁模型一样






