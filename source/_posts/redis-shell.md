layout: post
title: redis-shell
date: 2016-06-03 00:18:25
tags:
---

![](http://redis.io/images/redis-small.png) Redis-Server 集群指南
================================================================


---------------------------


### 服务命令

* 启动顺序
```
	1. Master
	2. Slave1
	3. Slave2
	4. Monitor
```
* 启动命令

	+ Master
	```
			# 启动session主
			sudo service redis-session start
			# 启动site主
			sudo service redis-site start
```
	+ Slave1
```
			# 启动session从1
			sudo service redis-session start
			# 启动site从1
			sudo service redis-site start
```
	+ Slave2
```
			# 启动session从2
			sudo service redis-session start
			# 启动site从2
			sudo service redis-site start
```
	+ Monitor
	```
			# 启动 Monitor
			sudo service redis-monitor start
```

### CLI 命令集

请参考 [这里](http://redis.readthedocs.org/en/latest/)

