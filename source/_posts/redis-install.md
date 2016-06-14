layout: post
title: redis-install
date: 2016-06-03 00:13:30
categories: redis
tags: redis
---
![](http://redis.io/images/redis-small.png) Redis-Server 安装指南
================================================================


---------------------------


### 安装redis

* 使用管理员登陆，进入`software`目录，下载 `redis`
```
		cd /home/admin/software
		wget http://download.redis.io/releases/redis-2.6.16.tar.gz
```
* 解压 `redis` 并将此目录复制到临时目录解压
```
		tar xvzf redis-2.6.16.tar.gz
		mv redis-2.6.16 /opt/
		cd /opt/redis-2.6.16
```

* 编译
```
		make
		make test
```
	注意：如果执行中遇到如下错误"You need tcl 8.5 or newer in order to run the Redis test",请安装tcl8.5+.
```
		yum install tcl
```
* 执行完单元测试后，在 `src` 目录下会生成下述文件

	+ **redis-server**
	+ **redis-cli**

* 将可执行文件复制到 `/usr/local/bin` 目录
```
		sudo cp /opt/redis-2.6.16/src/redis-server /usr/local/bin
		sudo cp /opt/redis-2.6.16/src/redis-cli /usr/local/bin
		sudo chown -R admin:admin /usr/local/bin/redis-server
		sudo chown -R admin:admin /usr/local/bin/redis-cli
```
* 创建 `redis-session`、 `redis-site` 软连接
```
		cd /usr/local/bin
		sudo ln -s /usr/local/bin/redis-server redis-site
		sudo ln -s /usr/local/bin/redis-server redis-session
```
* 创建`redis`目录
```
		sudo mkdir /etc/redis
		sudo mkdir /var/log/redis
		sudo mkdir /var/data/redis
		sudo mkdir /var/run/redis
		sudo mkdir /var/lock/redis
		sudo mkdir /var/data/redis/session
		sudo mkdir /var/data/redis/site
```
* 赋予目录权限
```
		sudo chown -R admin:admin /etc/redis
		sudo chown -R admin:admin /var/log/redis
		sudo chown -R admin:admin /var/data/redis
		sudo chown -R admin:admin /var/run/redis
		sudo chown -R admin:admin /var/lock/redis
```

* 创建 `redis` 配置文件
```
		touch /etc/redis/session.conf
		touch /etc/redis/site.conf
```
* 修改 `session.conf`、 `site.conf` 文件

	+ `session.conf` 文件内容如下(除注释部分及缺省配置)
```
			# 以守护进程启动
			daemonize yes
			# 进程文件
			pidfile /var/run/redis/session.pid
			# 端口号
			port 6379
			# 日志文件
			logfile /var/log/redis/session.log
			# 关闭持久化配置
			#save 900 1
			#save 300 10
			#save 60 10000
			# 数据文件
			dbfilename session.rdb
			# 数据文件存放目录
			dir /var/data/redis/session
```
	+ `site.conf` 文件内容如下(除注释部分及缺省配置)
```
			daemonize yes
			pidfile /var/run/redis/site.pid
			port 1221
			logfile /var/log/redis/site.log
			save 900 1
			save 300 10
			save 60 10000
			dbfilename site.rdb
			dir /var/data/redis/site
```

* 启动服务
```
			redis-server /etc/redis/session.conf
			redis-server /etc/redis/site.conf
```

* 检查日志输出 `/var/log/redis/session.log`
```

						 _._
			           _.-``__ ''-._
			      _.-``    `.  `_.  ''-._           Redis 2.6.16 (00000000/0) 64 bit
			  .-`` .-```.  ```\/    _.,_ ''-._
			 (    '      ,       .-`  | `,    )     Running in stand alone mode
			 |`-._`-...-` __...-.``-._|'` _.-'|     Port: 6379
			 |    `-._   `._    /     _.-'    |     PID: 16070
			  `-._    `-._  `-./  _.-'    _.-'
			 |`-._`-._    `-.__.-'    _.-'_.-'|
			 |    `-._`-._        _.-'_.-'    |           http://redis.io
			  `-._    `-._`-.__.-'_.-'    _.-'
			 |`-._`-._    `-.__.-'    _.-'_.-'|
			 |    `-._`-._        _.-'_.-'    |
			  `-._    `-._`-.__.-'_.-'    _.-'
			      `-._    `-.__.-'    _.-'
			          `-._        _.-'
			              `-.__.-'

			[16070] 21 Nov 14:50:03.016 # Server started, Redis version 2.6.16
			[16070] 21 Nov 14:50:03.017 # WARNING overcommit_memory is set to 0! Background save may fail under low memory condition. To fix this issue add 'vm.overcommit_memory = 1' to /etc/sysctl.conf and then reboot or run the command 'sysctl vm.overcommit_memory=1' for this to take effect.
			[16070] 21 Nov 14:50:03.017 * The server is now ready to accept connections on port 6379

```

* 检查日志输出 `/var/log/redis/site.log`
```
			               _._
			           _.-``__ ''-._
			      _.-``    `.  `_.  ''-._           Redis 2.6.16 (00000000/0) 64 bit
			  .-`` .-```.  ```\/    _.,_ ''-._
			 (    '      ,       .-`  | `,    )     Running in stand alone mode
			 |`-._`-...-` __...-.``-._|'` _.-'|     Port: 1221
			 |    `-._   `._    /     _.-'    |     PID: 4589
			  `-._    `-._  `-./  _.-'    _.-'
			 |`-._`-._    `-.__.-'    _.-'_.-'|
			 |    `-._`-._        _.-'_.-'    |           http://redis.io
			  `-._    `-._`-.__.-'_.-'    _.-'
			 |`-._`-._    `-.__.-'    _.-'_.-'|
			 |    `-._`-._        _.-'_.-'    |
			  `-._    `-._`-.__.-'_.-'    _.-'
			      `-._    `-.__.-'    _.-'
			          `-._        _.-'
			              `-.__.-'

			[4589] 25 Nov 15:08:14.352 # Server started, Redis version 2.6.16
			[4589] 25 Nov 15:08:14.352 # WARNING overcommit_memory is set to 0! Background save may fail under low memory condition. To fix this issue add 'vm.overcommit_memory = 1' to /etc/sysctl.conf and then reboot or run the command 'sysctl vm.overcommit_memory=1' for this to take effect.
			[4589] 25 Nov 15:08:14.356 * DB loaded from disk: 0.004 seconds
			[4589] 25 Nov 15:08:14.356 * The server is now ready to accept connections on port 1221

```

* 使用`redis-cli`命令检验端口

	+ 输入
```
			redis-cli -p 6379
```
	+ 输出
```
			redis 127.0.0.1:6379>
```

	+ 输入
```
			redis-cli -p 1221
```
	+ 输出
```
			redis 127.0.0.1:1221>
```

* 至此 redis 单机安装成功
