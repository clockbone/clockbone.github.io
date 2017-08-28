layout: post
title: ReentrantReadWriteLock读写锁
date: 2017-08-25 10:01:01
categories: java
tags: [thread , java]
---
### ReentrantReadWriteLock介绍
ReentrantReadWriteLock是读写锁,它维护了一对相关的锁`读取锁`和`写入锁`,一个用于读操作,另一个用于写操作
`读取锁`:用于只读操作,这它是“共享锁“,能同时被多个线程获取.
`写入锁`:用于写入操作，它是“独占锁”，写入锁只能被一个线程锁获取。