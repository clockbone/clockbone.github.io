layout: post
title: redis-monitor
date: 2015-06-03 00:18:15
categories: redis
tags: redis
---

![](http://redis.io/images/redis-small.png) Redis-Server 监控机安装
================================================================


---------------------------


### 安装redis

此过程请参考　[这里](/documentation/blob/master/deploy/redis/install.md)

* 复制可执行文件
```
		sudo cp /usr/local/redis/src/redis-server /usr/local/bin
		sudo cp /usr/local/redis/src/redis-cli /usr/local/bin
```
* 创建 `redis-monitor` 的软链
```
		cd /usr/local/bin
		sudo ln -s /usr/local/bin/redis-server redis-monitor
```
### 配置监控

* 创建`redis`目录
```
		sudo mkdir /etc/redis
		sudo mkdir /etc/log/redis
	```
* 赋予`redis`目录权限
```
		sudo chown -R admin:admin /etc/redis
		sudo chown -R admin:admin /etc/log/redis
	```
* 创建监控配置文件`sentinel.conf`
```
		touch /etc/redis/sentinel.conf
```
* 修改`sentinel.conf`增加`portal-session`、`portal-site`配置段
```
		# 监控端口
		port 26379

		# 集群master端口及地址,名称支持 A-z 0-9 特殊字符可包含 ".-_"
		sentinel monitor portal-site 172.17.121.33 1221 1
		sentinel monitor portal-session 172.17.121.33 6379 1

		# Master宕机后 N 秒内由slave接替其工作，单位：毫秒
		sentinel down-after-milliseconds portal-site 30000
		sentinel down-after-milliseconds portal-session 30000

		# 设置是否可以由监控发起自动切换
		sentinel can-failover portal-site yes
		sentinel can-failover portal-session yes

		# 设置当master宕机后由 N 个slave同步提供服务
		# 如果仅使用redis供查询使用，请尽量设置一个较低的值以避免同步锁问题
		sentinel parallel-syncs portal-site 1
		sentinel parallel-syncs portal-session 1

		# Default is 15 minutes.
		sentinel failover-timeout portal-site 900000
		sentinel failover-timeout portal-session 900000
```

* 创建服务启动脚本
```
		sudo touch /etc/init.d/redis-monitor
```
* 修改`redis-monitor`脚本内容
```
		#!/bin/sh
		#
		# redis - this script starts and stops the redis-server daemon
		#
		# chkconfig:   - 85 15
		# description:  Redis is a persistent key-value database
		# processname: redis-server
		# config:      /etc/redis/sentinel.conf
		# pidfile:     /var/run/sentinel.pid
		# lockfile:    /var/lcok/sentinel

		# Source function library.
		. /etc/rc.d/init.d/functions

		# Source networking configuration.
		. /etc/sysconfig/network

		# Check that networking is up.
		[ "$NETWORKING" = "no" ] && exit 0

		# define the exec progrom
		REDIS_EXEC="/usr/local/bin/redis-monitor"
		REDIS_CONF_FILE="/etc/redis/sentinel.conf"
		PROG=$(basename $REDIS_EXEC)

		# if /etc/sysconfig/redis exists,use this config env
		[ -f /etc/sysconfig/redis ] && . /etc/sysconfig/redis

		LOCKFILE=/var/lock/redis/sentinel


		start() {
		    [ -x $REDIS_EXEC ] || exit 5
		    [ -f $REDIS_CONF_FILE ] || exit 6
		    echo -n $"Starting $PROG: "
		    nohup $REDIS_EXEC /etc/redis/sentinel.conf --sentinel > /var/log/redis/monitor.log 2>&1 &
		    echo [ OK ] && touch $LOCKFILE
		    return
		}

		stop() {
		    pid=`ps -ef|grep $REDIS_EXEC|grep -v grep|awk '{print $2}'`
		    if [ ! $pid ]; then
		        echo $"$PROG is stoped"
		    else
		        echo -n $"Stopping $PROG: "
		        kill -9 $pid
		        echo [ OK ] && rm -f $LOCKFILE
		    fi
		    return
		}


		rh_status() {
		    status $PROG
		}

		rh_status_q() {
		    rh_status >/dev/null 2>&1
		}

		restart() {
		    stop
		    start
		}

		exit_a(){
		    echo $"$PROG is running"
		    exit 0
		}

		exit_b(){
		    echo $"$PROG is stopped"
		    exit 0
		}


		case "$1" in
		    start)
		        rh_status_q && exit_a
		        $1
		        ;;
		    stop)
		        rh_status_q || exit_b
		        $1
		        ;;
		    restart|configtest)
		        $1
		        ;;
		    status)
		        rh_status
		        ;;
		    *)
		        echo $"Usage: $0 {start|stop|status|restart|condrestart|try-restart|reload|force-reload}"
		        exit 2
		esac
```

* 赋予此脚本可执行权限
```
		sudo chmod u+x redis-monitor
```
* 添加系统启动服务
```
		sudo chkconfig --add redis-monitor
		sudo chkconfig --level 345 redis-monitor on
```
* 启动服务
```
		sudo service redis-monitor start
```
* 验证服务正确启动



