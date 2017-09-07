layout: post
title: guavacache
date: 2015-08-12 16:20:59
categories: java
tag: [ guava , cache, java]
---
缓存的主要作用是暂时在内存中保存业务系统的数据处理结果，并且等待下次访问时再次使用。在很多场景下对于经常会请求并且实时性要求不高的数缓存是很有必要的。
当redis可以实现缓存，并且是基于第三方服务的缓存，也是比较常用的。这里来说明一下基于全内存的本地缓存实现，常用到基于内存的缓存有1、mybatis框架缓存2、guava cache缓存
### 一、mytabis框架缓存
mytabis框架缓存可用于数据库查找等数据的缓存
#### 1、添加缓存依赖
<!-- more -->
```xml
<dependency>
            <groupId>com.googlecode.ehcache-spring-annotations</groupId>
            <artifactId>ehcache-spring-annotations</artifactId>
            <version>1.2.0</version>
            <exclusions>
                <exclusion>
                    <groupId>org.springframework</groupId>
                    <artifactId>spring-aop</artifactId>
                </exclusion>
                <exclusion>
                    <groupId>org.springframework</groupId>
                    <artifactId>spring-core</artifactId>
                </exclusion>
            </exclusions>
        </dependency>

        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context-support</artifactId>
            <version>4.1.6.RELEASE</version>
        </dependency>
```
这里需要注意jar的冲突，如果有jar包冲突就如上解决冲突jar，如果没有就不用
#### 2、整合合spring配置如下
```xml
<ehcache:annotation-driven cache-manager="cacheManager" proxy-target-class="true"/>

	<ehcache:config cache-manager="cacheManager">
		<ehcache:evict-expired-elements
			interval="60" />
	</ehcache:config>

	<bean id="cacheManager" class="org.springframework.cache.ehcache.EhCacheManagerFactoryBean">
        <property name="configLocation"  value="classpath:ehcache.xml"/>
    </bean>
```
其中ehcache.xml如下：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<ehcache xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:noNamespaceSchemaLocation="http://ehcache.org/ehcache.xsd"
	updateCheck="false">
	<diskStore path="java.io.tmpdir" />

    <defaultCache maxElementsInMemory="10000" eternal="false" timeToIdleSeconds="30" timeToLiveSeconds="30" overflowToDisk="false"/>
    <!--
        配置自定义缓存
        maxElementsInMemory：缓存中允许创建的最大对象数
        eternal：缓存中对象是否为永久的，如果是，超时设置将被忽略，对象从不过期。
        timeToIdleSeconds：缓存数据的钝化时间，也就是在一个元素消亡之前，
                    两次访问时间的最大时间间隔值，这只能在元素不是永久驻留时有效，
                    如果该值是 0 就意味着元素可以停顿无穷长的时间。
        timeToLiveSeconds：缓存数据的生存时间，也就是一个元素从构建到消亡的最大时间间隔值，
                    这只能在元素不是永久驻留时有效，如果该值是0就意味着元素可以停顿无穷长的时间。
        overflowToDisk：内存不足时，是否启用磁盘缓存。
        memoryStoreEvictionPolicy：缓存满了之后的淘汰算法。
    -->
	<cache name="preCache"
		eternal="false"
		maxElementsInMemory="50"
		overflowToDisk="false"
		diskPersistent="false"
		timeToIdleSeconds="0"
		timeToLiveSeconds="30"
		memoryStoreEvictionPolicy="LRU" />
    </ehcache>
```
#### 3、代码中运用
可以在需要缓存的方法前加cache注解，如在一个service方法上添加@Cacheable
```java
@Cacheable(cacheName = "preCache")
    public Test getType(String type){
        Test test = mapper.getType(type);
        //to do something
        return test;
    }
```
#### 4、测试
可以用test类来调用getType 类2次，以debug日志级别观察sql语句打印次数，发现几次调用只有一次sql的执行。
### 二、guava cache缓存
可用于数据库数据结果集缓存，或常用接口数据缓存
#### 1、先引入guava依赖
```xml
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>19.0</version>
</dependency>
```
#### 2、以登录后缓存登录用户信息为例
功能描述：当用户登录后，需要根据用户id获取用户信息，并且用户信息使用频繁，可用guava缓存
```java
@Component
public class AccountCache {
    @Autowired
    private Mapper mapper;
    @Autowired private EnvService envService;

    //定义缓存变量
    private final LoadingCache<String, Account> cache;

    @Autowired
    public AccountCache(final MyHttpClient myHttpClient) {
        //定义写入缓存的方法
        this.cache = CacheBuilder.newBuilder().expireAfterAccess(30L, TimeUnit.MINUTES).maximumSize(100000).
                build(new CacheLoader<String, Account>() {
                    @Override
                    public Account load(String id) throws Exception {
                        Map<String, Object> map=new HashMap<String, Object>();
                            map.put("id", id);
                            User user=mapper.getUserInfo(map);
                            if (user!=null) {
                                account.setName(user.getName());
                            }else{
                               return null;
                            }
                           String Url="/AccountInfo/"+ URLEncoder.encode(user.getName, "UTF-8");
                           Account account;
                           try {
                               String result=myHttpClient.readContentFromGet(envService.getRoot()+Url);
                               account = JSON.parseObject(result, Account.class);
                           } catch (Exception e) {
                               return null;
                           }
                           if (StringUtils.isEmpty(account.getId())) {
                               return null;
                           }
                           return account;
                    }
                });
    }
    //获取用户信息时调用这个方法
    public Account getAccountById(String roleName){
       return  this.cache.getUnchecked(roleName);
    }
}
```
可以用test类，连续几次调用`getAccountById`方法，发现短是时间为在，只有一次调用，其它都是直接从缓存获取
#### 3、以不常更新数据为例
##### a、新建一个缓存变量类
```java
public class TeamInfoCache {
    //可以定义各种不同的缓存变量，用于需要缓存的数据,参数可根据需求再定,Cache泛型第一个参数表示：获取不同缓存关键值类型，第二个参数表示：缓存结果集类型
    public static final Cache<String,Map<String,Map<String,List<Test>>>> TestCache = CacheBuilder.newBuilder()
            .expireAfterAccess(10, TimeUnit.MINUTES)
            .build();
}
```
##### b、缓存调用及实现
```java
public  Map<String,Map<String,List<TeamInfo>>>  getTestInfo(String areaId,String level){
        final  Map<String,Map<String,List<Test>>> arealMap = new HashMap<String,Map<String,List<Test>>>();
        try {
            TeamInfoCache.TeamInfoCache.get("testInfo", new Callable<Map<String,Map<String,List<Test>>>>() {
                @Override
                public Map<String,Map<String,List<Test>>> call() throws Exception {
                    for(Type a:Type.values()){
                        String area = a.getCode();
                        Map<String,List<Test>> levelMap = new HashMap<String,List<Test>>();
                        for (level c : level.values()) {
                            String l = c.getCode();
                            List<TeamInfo> listt = mainMapper.getTestInfo(area,l);
                            levelMap.put(area+l,listt);
                        }
                        arealMap.put(area,levelMap);
                    }
                    return arealMap;
                }
            });
        } catch (ExecutionException e) {
            e.printStackTrace();
            return null;
        }
        return arealMap;
    }
```
##### c、测试
可用一个test类，连续调用`getTestInfo`缓存方法，可观察结果


