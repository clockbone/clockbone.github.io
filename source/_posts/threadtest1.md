layout: post
title: 多线程设计1
date: 2015-04-14 13:24:36
categories: java
tags: [java , thread]
---

设计4个线程，其中两个线程每次对j增加1，另外两个线程对j每次减少1。写出程序。

```bash
/**
 * Created by qinjun on 2016/6/14.
 */
public class TheadTest {

    private int j;
    public  synchronized void  inc(){
        j++;
        System.out.println("j++ ="+j);
    }
    public synchronized void dec(){
        j--;
        System.out.println("j-- ="+j);
    }

    public static void main(String[] args){
        TheadTest theadTest = new TheadTest();
        incc inc = theadTest.new incc();
        decc dec= theadTest.new decc();
        for(int i=0;i<2;i++){
           Thread t =  new Thread(inc);
            t.start();
            t = new Thread(dec);
            t.start();
        }

    }

    class incc implements Runnable{

        @Override
        public void run() {
            for(int i=0;i<100;i++){
                inc();
            }

        }
    }

    class decc implements Runnable{
        @Override
        public void run() {
            for(int i=0;i<100;i++){
                dec();
            }

        }
    }
}
```
