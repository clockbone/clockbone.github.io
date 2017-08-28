layout: post
title: cyclicBarrier
date: 2017-08-28 10:52:13
categories: java
tags: [thread , java]
---
### 一、cyclicBarrier简介
CyclicBarrier允许N个线程相互等待。
基本使用
```java
//启动主方法
public static void main(String[] args){
        final int ROWS=10000;
        final int NUMBERS=1000;
        final int SEARCH=5;
        final int PARTICIPANTS=5;
        final int LINES_PARTICIPANT=2000;
        MatrixMock mock=new MatrixMock(ROWS, NUMBERS,SEARCH);
        Results results=new Results(ROWS);
        Grouper grouper=new Grouper(results,mock.getDatas());
        //需要等待5个线程执行完，执行grouper
        final CyclicBarrier barrier=new CyclicBarrier(PARTICIPANTS,grouper);

        Searcher searchers[]=new Searcher[PARTICIPANTS];
        for (int i=0; i<PARTICIPANTS; i++){
            if(i==PARTICIPANTS-1){
                searchers[i]=new Searcher(i*LINES_PARTICIPANT, (i*LINES_PARTICIPANT)+LINES_PARTICIPANT-1, mock, results, 5,barrier);
            }else{
                searchers[i]=new Searcher(i*LINES_PARTICIPANT, (i*LINES_PARTICIPANT)+LINES_PARTICIPANT-1, mock, results, 5,barrier);
            }

            Thread thread=new Thread(searchers[i]);
            thread.start();
        }
        System.out.printf("Main: The main thread has finished.\n");
    }

```
```java
public class Searcher implements  Runnable {
    private int firstRow;
    private int lastRow;
    private MatrixMock mock;
    private Results results;
    private int number;
    private final CyclicBarrier barrier;
    public Searcher(int firstRow, int lastRow, MatrixMock mock, Results results, int number, CyclicBarrier barrier) {
        this.firstRow = firstRow;
        this.lastRow = lastRow;
        this.mock = mock;
        this.results = results;
        this.number = number;
        this.barrier = barrier;
    }

        @Override
    public void run() {
    //do something
    }
        try {
            barrier.await();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (BrokenBarrierException e) {
            e.printStackTrace();
        }

    }
}
```

### 二、主要方法
1、构造方法
```java
public CyclicBarrier(int parties, Runnable barrierAction) {
    if (parties <= 0) throw new IllegalArgumentException();
    // parties表示“必须同时到达barrier的线程个数”。
    this.parties = parties;
    // count表示“处在等待状态的线程个数”。
    this.count = parties;
    // barrierCommand表示“parties个线程到达barrier时，会执行的动作”。
    this.barrierCommand = barrierAction;
}
```
count计数器初始化,表示需要等待count个线程执行完
2、等待方法
```java
public int await() throws InterruptedException, BrokenBarrierException {
    try {
        return dowait(false, 0L);
    } catch (TimeoutException toe) {
        throw new Error(toe); // cannot happen;
    }
}
```
等待方法,将count计数器`-1`,判断`if(index==0)`表明count个线程已经执行完,`if action is not null`,执行action线程
dowait通过lock实现作用就是让当前线程阻塞，直到“有parties个线程到达barrier” 或 “当前线程被中断” 或 “超时”这3者之一发生，当前线程才继续执行。
### 三、总结
