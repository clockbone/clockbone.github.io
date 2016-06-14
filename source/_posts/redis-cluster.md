layout: post
title: redis-cluster
date: 2016-06-03 00:18:04
categories: redis
tags: redis
---

![](http://redis.io/images/redis-small.png) Redis-Server 集群指南
================================================================


---------------------------

### 前置条件

* 服务器清单(主从):
```
		从机1 	-> 	172.17.121.31
		从机2 	-> 	172.17.121.32
		主机		-> 	172.17.121.33
		监控		->	172.17.121.34
```

* 服务器拓扑图

	![](/documentation/raw/master/snapshot/deploy/redis/cluster.jpg)



* `SLAVE` 及 `MASTER` 都已按单机模式安装启动成功

	单机安装教程请参考 [这里](/documentation/blob/master/deploy/redis/install.md )

* `MONITOR` 已安装并成功启动

	监控安装教程请参考 [这里](/documentation/blob/master/deploy/redis/monitor.md )


### Redis MASTER(主机)配置

* 创建主机的服务启动脚本 `/etc/init.d/redis-session`、`/etc/init.d/redis-site`
```
		sudo touch /etc/init.d/redis-session
		sudo touch /etc/init.d/redis-site
```
* `redis-session` 脚本如下
```
		#!/bin/sh
		#
		# redis - this script starts and stops the redis-server daemon
		#
		# chkconfig:   - 85 15
		# description:  Redis is a persistent key-value database
		# processname: redis-server
		# config:      /etc/redis/redis.conf
		# config:      /etc/sysconfig/redis
		# pidfile:     /var/run/redis.pid

		# Source function library.
		. /etc/rc.d/init.d/functions

		# Source networking configuration.
		. /etc/sysconfig/network

		# Check that networking is up.
		[ "$NETWORKING" = "no" ] && exit 0

		redis="/usr/local/bin/redis-session"
		prog=$(basename $redis)

		REDIS_CONF_FILE="/etc/redis/session.conf"

		[ -f /etc/sysconfig/redis ] && . /etc/sysconfig/redis

		lockfile=/var/lock/redis/session

		start() {
		    [ -x $redis ] || exit 5
		    [ -f $REDIS_CONF_FILE ] || exit 6
		    echo -n $"Starting $prog: "
		    daemon $redis $REDIS_CONF_FILE
		    retval=$?
		    echo
		    [ $retval -eq 0 ] && touch $lockfile
		    return $retval
		}

		stop() {
		    echo -n $"Stopping $prog: "
		    killproc $prog -QUIT
		    retval=$?
		    echo
		    [ $retval -eq 0 ] && rm -f $lockfile
		    return $retval
		}

		restart() {
		    stop
		    start
		}

		reload() {
		    echo -n $"Reloading $prog: "
		    killproc $redis -HUP
		    RETVAL=$?
		    echo
		}

		force_reload() {
		    restart
		}

		rh_status() {
		    status $prog
		}

		rh_status_q() {
		    rh_status >/dev/null 2>&1
		}

		case "$1" in
		    start)
		        rh_status_q && exit 0
		        $1
		        ;;
		    stop)
		        rh_status_q || exit 0
		        $1
		        ;;
		    restart|configtest)
		        $1
		        ;;
		    reload)
		        rh_status_q || exit 7
		        $1
		        ;;
		    force-reload)
		        force_reload
		        ;;
		    status)
		        rh_status
		        ;;
		    condrestart|try-restart)
		        rh_status_q || exit 0
		        ;;
		    *)
		        echo $"Usage: $0 {start|stop|status|restart|condrestart|try-restart|reload|force-reload}"
		        exit 2
		esac
```

* `redis-site` 脚本如下
```
		#!/bin/sh
		#
		# redis - this script starts and stops the redis-server daemon
		#
		# chkconfig:   - 85 15
		# description:  Redis is a persistent key-value database
		# processname: redis-server
		# config:      /etc/redis/redis.conf
		# config:      /etc/sysconfig/redis
		# pidfile:     /var/run/redis.pid

		# Source function library.
		. /etc/rc.d/init.d/functions

		# Source networking configuration.
		. /etc/sysconfig/network

		# Check that networking is up.
		[ "$NETWORKING" = "no" ] && exit 0

		redis="/usr/local/bin/redis-site"
		prog=$(basename $redis)

		REDIS_CONF_FILE="/etc/redis/site.conf"

		[ -f /etc/sysconfig/redis ] && . /etc/sysconfig/redis

		lockfile=/var/lock/redis/site

		start() {
		    [ -x $redis ] || exit 5
		    [ -f $REDIS_CONF_FILE ] || exit 6
		    echo -n $"Starting $prog: "
		    daemon $redis $REDIS_CONF_FILE
		    retval=$?
		    echo
		    [ $retval -eq 0 ] && touch $lockfile
		    return $retval
		}

		stop() {
		    echo -n $"Stopping $prog: "
		    killproc $prog -QUIT
		    retval=$?
		    echo
		    [ $retval -eq 0 ] && rm -f $lockfile
		    return $retval
		}

		restart() {
		    stop
		    start
		}

		reload() {
		    echo -n $"Reloading $prog: "
		    killproc $redis -HUP
		    RETVAL=$?
		    echo
		}

		force_reload() {
		    restart
		}

		rh_status() {
		    status $prog
		}

		rh_status_q() {
		    rh_status >/dev/null 2>&1
		}

		case "$1" in
		    start)
		        rh_status_q && exit 0
		        $1
		        ;;
		    stop)
		        rh_status_q || exit 0
		        $1
		        ;;
		    restart|configtest)
		        $1
		        ;;
		    reload)
		        rh_status_q || exit 7
		        $1
		        ;;
		    force-reload)
		        force_reload
		        ;;
		    status)
		        rh_status
		        ;;
		    condrestart|try-restart)
		        rh_status_q || exit 0
		        ;;
		    *)
		        echo $"Usage: $0 {start|stop|status|restart|condrestart|try-restart|reload|force-reload}"
		        exit 2
		esac
```

* 添加启动服务
```
		sudo chkconfig --add redis-session
		sudo chkconfig --add redis-site
		sudo chkconfig --level redis-site on
		sudo chkconfig --level redis-session on
```
* 启动服务
```
		sudo service redis-session start
		sudo service redis-site start
```

* 验证服务是否启动



### Redis SLAVE(从机)配置

* 启动从机前请确保`MASTER`已正常启动并能在从机中使用`redis-cli`访问

	**input:**
```
		# 访问 redis-session 的 master 主机
		redis-cli -h 172.17.121.33 -p 6379
```
	**output:**
```
		redis 172.17.121.33:6379>
```
	**input:**
```
		# 访问 redis-site 的 master 主机
		redis-cli -h 172.17.121.33 -p 1221
```
	**output:**
```
		redis 172.17.121.33:1221>
```


* 创建从机的服务启动脚本 `/etc/init.d/redis-session`、`/etc/init.d/redis-site`
```
		sudo touch /etc/init.d/redis-session
		sudo touch /etc/init.d/redis-site
```
* `redis-session` 脚本如下
```
		#!/bin/sh
		#
		# redis - this script starts and stops the redis-server daemon
		#
		# chkconfig:   - 85 15
		# description:  Redis is a persistent key-value database
		# processname: redis-server
		# config:      /etc/redis/redis.conf
		# config:      /etc/sysconfig/redis
		# pidfile:     /var/run/redis.pid

		# Source function library.
		. /etc/rc.d/init.d/functions

		# Source networking configuration.
		. /etc/sysconfig/network


		# Check that networking is up.
		[ "$NETWORKING" = "no" ] && exit 0

		redis="/usr/local/bin/redis-session"
		redis_port=6379
		monitor_host=172.17.121.34
		monitor_port=26379
		cluster_name="portal-session"

		prog=$(basename $redis)
		REDIS_CONF_FILE="/etc/redis/session.conf"

		[ -f /etc/sysconfig/redis ] && . /etc/sysconfig/redis

		lockfile=/var/lock/redis/session

		start() {
		    [ -x $redis ] || exit 5
		    [ -f $REDIS_CONF_FILE ] || exit 6
		    echo -n $"Starting $prog: "
		    daemon $redis $REDIS_CONF_FILE
		    retval=$?
		    echo
		    [ $retval -eq 0 ] && touch $lockfile
		    status=`redis-cli -h $monitor_host -p $monitor_port  info sentinel|grep $cluster_name| awk -F ',' '/status/ {print $2}'| awk -F
		'=' '{print $2}'`
		    if [ "$status"x = "ok"x ]; then
		        echo "Cluster is ok"
		        master_host=`redis-cli  -h $monitor_host -p $monitor_port  info sentinel|grep $cluster_name| awk -F ',' '/status/ {print $3}
		'| awk -F '=' '{print $2}'| awk -F ':' '{print $1}'`
		        master_port=`redis-cli  -h $monitor_host -p $monitor_port  info sentinel|grep $cluster_name| awk -F ',' '/status/ {print $3}
		'| awk -F '=' '{print $2}'| awk -F ':' '{print $2}'`
		        echo $"Get the cluster master $master_host:$master_port"
		        echo -n $"Mount to the master $master_host:$master_port: "
		        result=`redis-cli -p $redis_port slaveof $master_host $master_port`
		        echo $result
		    else
		        echo "Cluster has dead, this slave will run in standalone mode"
		    fi
		    return $retval
		}

		stop() {
		    echo -n $"Stopping $prog: "
		    killproc $prog -QUIT
		    retval=$?
		    echo
		    [ $retval -eq 0 ] && rm -f $lockfile
		    return $retval
		}

		restart() {
		    stop
		    start
		}

		reload() {
		    echo -n $"Reloading $prog: "
		    killproc $redis -HUP
		    RETVAL=$?
		    echo
		}

		force_reload() {
		    restart
		}

		rh_status() {
		    status $prog
		}

		rh_status_q() {
		    rh_status >/dev/null 2>&1
		}

		case "$1" in
		    start)
		        rh_status_q && exit 0
		        $1
		        ;;
		    stop)
		        rh_status_q || exit 0
		        $1
		        ;;
		    restart|configtest)
		        $1
		        ;;
		    reload)
		        rh_status_q || exit 7
		        $1
		        ;;
		    force-reload)
		        force_reload
		        ;;
		    status)
		        rh_status
		        ;;
		    condrestart|try-restart)
		        rh_status_q || exit 0
		        ;;
		    *)
		        echo $"Usage: $0 {start|stop|status|restart|condrestart|try-restart|reload|force-reload}"
		        exit 2
		esac
```

* 当服务启动时，代码片段
```
		 status=`redis-cli -h $monitor_host -p $monitor_port  info sentinel|grep $cluster_name| awk -F ',' '/status/ {print $2}'| awk -F
		'=' '{print $2}'`
		    if [ "$status"x = "ok"x ]; then
		        echo "Cluster is ok"
		        master_host=`redis-cli  -h $monitor_host -p $monitor_port  info sentinel|grep $cluster_name| awk -F ',' '/status/ {print $3}
		'| awk -F '=' '{print $2}'| awk -F ':' '{print $1}'`
		        master_port=`redis-cli  -h $monitor_host -p $monitor_port  info sentinel|grep $cluster_name| awk -F ',' '/status/ {print $3}
		'| awk -F '=' '{print $2}'| awk -F ':' '{print $2}'`
		        echo $"Get the cluster master $master_host:$master_port"
		        echo -n $"Mount to the master $master_host:$master_port: "
		        result=`redis-cli -p $redis_port slaveof $master_host $master_port`
		        echo $result
		    else
		        echo "Cluster has dead, this slave will run in standalone mode"
		    fi
```

	会查询当前的集群状态，将从机的 `redis` 挂载到集群中去



* `redis-site` 脚本雷同 session , 这里不再赘述

```
		#!/bin/sh
		#
		# redis - this script starts and stops the redis-server daemon
		#
		# chkconfig:   - 85 15
		# description:  Redis is a persistent key-value database
		# processname: redis-server
		# config:      /etc/redis/redis.conf
		# config:      /etc/sysconfig/redis
		# pidfile:     /var/run/redis.pid

		# Source function library.
		. /etc/rc.d/init.d/functions

		# Source networking configuration.
		. /etc/sysconfig/network


		# Check that networking is up.
		[ "$NETWORKING" = "no" ] && exit 0

		redis="/usr/local/bin/redis-site"
		redis_port=1221
		monitor_host=172.17.121.34
		monitor_port=26379
		cluster_name="portal-site"

		prog=$(basename $redis)
		REDIS_CONF_FILE="/etc/redis/site.conf"

		[ -f /etc/sysconfig/redis ] && . /etc/sysconfig/redis

		lockfile=/var/lock/redis/site

		start() {
		    [ -x $redis ] || exit 5
		    [ -f $REDIS_CONF_FILE ] || exit 6
		    echo -n $"Starting $prog: "
		    daemon $redis $REDIS_CONF_FILE
		    retval=$?
		    echo
		    [ $retval -eq 0 ] && touch $lockfile
		    status=`redis-cli -h $monitor_host -p $monitor_port  info sentinel|grep $cluster_name| awk -F ',' '/status/ {print $2}'| awk -F
		'=' '{print $2}'`
		    if [ "$status"x = "ok"x ]; then
		        echo "Cluster is ok"
		        master_host=`redis-cli  -h $monitor_host -p $monitor_port  info sentinel|grep $cluster_name| awk -F ',' '/status/ {print $3}
		'| awk -F '=' '{print $2}'| awk -F ':' '{print $1}'`
		        master_port=`redis-cli  -h $monitor_host -p $monitor_port  info sentinel|grep $cluster_name| awk -F ',' '/status/ {print $3}
		'| awk -F '=' '{print $2}'| awk -F ':' '{print $2}'`
		        echo $"Get the cluster master $master_host:$master_port"
		        echo -n $"Mount to the master $master_host:$master_port: "
		        result=`redis-cli -p $redis_port slaveof $master_host $master_port`
		        echo $result
		    else
		        echo "Cluster has dead, this slave will run in standalone mode"
		    fi
		    return $retval
		}

		stop() {
		    echo -n $"Stopping $prog: "
		    killproc $prog -QUIT
		    retval=$?
		    echo
		    [ $retval -eq 0 ] && rm -f $lockfile
		    return $retval
		}

		restart() {
		    stop
		    start
		}

		reload() {
		    echo -n $"Reloading $prog: "
		    killproc $redis -HUP
		    RETVAL=$?
		    echo
		}

		force_reload() {
		    restart
		}

		rh_status() {
		    status $prog
		}

		rh_status_q() {
		    rh_status >/dev/null 2>&1
		}

		case "$1" in
		    start)
		        rh_status_q && exit 0
		        $1
		        ;;
		    stop)
		        rh_status_q || exit 0
		        $1
		        ;;
		    restart|configtest)
		        $1
		        ;;
		    reload)
		        rh_status_q || exit 7
		        $1
		        ;;
		    force-reload)
		        force_reload
		        ;;
		    status)
		        rh_status
		        ;;
		    condrestart|try-restart)
		        rh_status_q || exit 0
		        ;;
		    *)
		        echo $"Usage: $0 {start|stop|status|restart|condrestart|try-restart|reload|force-reload}"
		        exit 2
		esac
```


* 添加启动服务
```
		sudo chkconfig --add redis-session
		sudo chkconfig --add redis-site
		sudo chkconfig --level redis-site on
		sudo chkconfig --level redis-session on
```
* 启动服务
```
		sudo service redis-session start
		sudo service redis-site start
```
* 验证服务是否启动


### 启动 `REDIS` 监控

* 确保监控正确安装配置，详细步骤请参考[这里](/
*
*
*
*
*
*
* /blob/master/deploy/redis/monitor.md)

* 创建主机的服务启动脚本 `/etc/redis/redis-monitor`

* `redis-monitor` 脚本内容如下:
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

* 配置及启动 `monitor`　服务
```
		sudo chkconfig --add redis-monitor
		sudo chkconfig --level 345 redis-monitor on
		sudo service redis-monitor start
```



### 验证集群状态

* 使用管理员用户登陆到`MASTER`,查看当前集群状态

  + 查看`session`集群状态

		**input:**
```
			redis-cli -h 127.0.0.1 -p 6379 info Replication
```
		**output:**
```
			# Replication
			role:master
			connected_slaves:2
			slave0:172.17.121.32,6379,online
			slave1:172.17.121.31,6379,online
```
  + 查看`site`集群状态

		**input:**
```
			redis-cli -h 127.0.0.1 -p 1221 info Replication
```
		**output:**
```
			# Replication
			role:master
			connected_slaves:2
			slave0:172.17.121.32,1221,online
			slave1:172.17.121.31,1221,online
```

* 使用管理员用户登陆到`SLAVE`,查看当前集群状态(示例中使用172.17.121.33)

	+ 查询`session`集群状态

		**input:**
```
			redis-cli -h 127.0.0.1 -p 6379 info Replication
```
		**output:**
```
			# Replication
			role:slave
			master_host:172.17.121.33
			master_port:6379
			master_link_status:up
			master_last_io_seconds_ago:3
			master_sync_in_progress:0
			slave_priority:100
			slave_read_only:1
			connected_slaves:0
```

	+ 查看`site`集群状态

		**input:**
```
			redis-cli -h 127.0.0.1 -p 1221 info Replication
```
		**output:**
```
			# Replication
			role:slave
			master_host:172.17.121.33
			master_port:1221
			master_link_status:up
			master_last_io_seconds_ago:3
			master_sync_in_progress:0
			slave_priority:100
			slave_read_only:1
			connected_slaves:0
```

* 使用管理员登陆到`MONITOR`机上

	+ 查看集群状态

		**input:**
```
			redis-cli  -h 127.0.0.1 -p 26379  info sentinel
```
		**output:**
```
			# Sentinel
			sentinel_masters:2
			sentinel_tilt:0
			sentinel_running_scripts:0
			sentinel_scripts_queue_length:0
			master0:name=portal-session,status=ok,address=172.17.121.33:6379,slaves=2,sentinels=1
			master1:name=portal-site,status=ok,address=172.17.121.33:1221,slaves=2,sentinels=1
```
		**可查看到当前的集群状态**

