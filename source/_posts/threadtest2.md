layout: post
title: 多线程设计2
date: 2016-06-14 13:28:15
categories: java
tags: [java , thread]
---
子线程循环10次，接着主线程循环100，接着又回到子线程循环10次，接着再回到主线程又循环100，如此循环50次，请写出程序。

```bash
public class TheadTest1 {

    private static boolean bShouldMain=false;
    public static void main(String[] args){
        /*new Thread(new Runnable() {
            @Override
            public void run() {
                for(int i=0;i<50;i++){
                    for(int j=0;j<10;j++){
                        System.out.println("i="+ i + ",j=" + j);

                    }
                }
            }
        });*/
        final String s ="";

        new Thread(
                new Runnable()
                {
                    public void run()
                    {
                        for(int i=0;i<50;i++)
                        {
                            synchronized(s) {
                                if(bShouldMain)
                                {
                                    try {
                                        s.wait();}
                                    catch(InterruptedException e) {
                                        e.printStackTrace();
                                    }
                                }
                                for(int j=0;j<10;j++)
                                {
                                    System.out.println(
                                            Thread.currentThread().getName()+"i="+ i + ",j=" + j);
                                }
                                bShouldMain= true;
                                s.notify();
                            }
                        }
                    }
                }
        ).start();

        for(int i=0;i<50;i++)
        {
            synchronized (s){
                if(!bShouldMain)
                {
                    try {
                        s.wait();}
                    catch(InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                for(int j=0;j<5;j++)
                {
                    System.out.println(
                            Thread.currentThread().getName()+
                                    "i=" + i +",j=" + j);
                }
                bShouldMain =false;
                s.notify();
            }
        }
    }
}
```

下面使用jdk5中的并发库来实现的：
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

            }finally
            {
                lock.unlock();
            }

        }

    }
}
```
