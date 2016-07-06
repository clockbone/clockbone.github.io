layout: post
title: DynamicDataSource添加动态数据库连接
date: 2015-17-06 10:59:04
categories: java
tags: mybatis
---

一、为什么引进动态数据库配置？
      随着网站的业务不断扩展，数据不断增加，用户越来越多，数据库的压力也就越来越大，采用传统的方式，
      比如：数据库或者SQL的优化基本已达不到要求，这个时候可以采用读写分离的策 略来改变现状。
二、通常做法
      一个Master数据库，多个Slave数据库。Master库负责数据更新和实时数据查询，Slave库当然负责非实时数据查询。
      把查询从主库中抽取出来，采用多个从库，使用负载均衡，减轻每个从库的查询压力。
三、开发中具体实现
第一种：定义2个数据源主库和从库，主库更新和时实查询，从库用于非实时查询
这种方式直接在mybatis配置文件中定义2个dataSource分别扫描不同的包即可，或者写2个mybatis配置文件分别在其中配置不同的数据源即可
给一个简单的写法如下：
```
    <!-- MyBatis数据库第一个连接配置 -->
    <bean id="dataSourceOne" class="com.alibaba.druid.pool.DruidDataSource" init-method="init" destroy-method="close">
    ……  ……  ……
    </bean>

    <bean id="sqlSessionFactoryOne" class="org.mybatis.spring.SqlSessionFactoryBean">
        <property name="dataSource" ref="dataSourceOne" />
       <!-- <property name="mapperLocations" value="classpath:com/clockbone/mapper/*.xml" />-->
        <!-- xxxMapper.xml中返回值就可以直接写成实体名 -->
        <property name="typeAliasesPackage" value="com.clockbone.domain"/>
    </bean>
    <bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
        <property name="basePackage" value="com.clockbone.mapper" />
        <property name="sqlSessionFactoryBeanName" value="sqlSessionFactoryOne"/>
    </bean>
    <!-- MyBatis数据库连接配置  第二个数据源-->
        <bean id="dataSourceMyBatis" class="com.alibaba.druid.pool.DruidDataSource" init-method="init" destroy-method="close">
          ……  ……  ……
        </bean>
        <!-- define the SqlSessionFactory -->
        <bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
            <property name="dataSource" ref="dataSourceMyBatis" />
            <property name="typeAliasesPackage" value="com.clockpone.domain" />
        </bean>
        <!-- scan for mappers and let them be autowired -->
        <bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
            <property name="basePackage" value="com.clockpone.mapper" />
            <property name="sqlSessionFactoryBeanName" value="sqlSessionFactory"/>
        </bean>
```
第二种：动态切换数据源，在程序运行时，把数据源动态织入到程序中从而选择读从库或主库，如：annotation，Spring AOP ，反射
下面给出配置文件：
1、mybatis数据源配置
```

    <!-- MyBatis数据库连接配置  main-->
    <bean id="dataSourceMain" class="com.alibaba.druid.pool.DruidDataSource" init-method="init" destroy-method="close">
     …… …… ……
    </bean>

    <!-- MyBatis数据库连接配置 Back-->
    <bean id="dataSourceBack" class="com.alibaba.druid.pool.DruidDataSource" init-method="init" destroy-method="close">
     …… …… ……
    </bean>

    <!--动态数据源配置-->
    <bean id="dynamicDataSource" class="com.clockbone.filter.DynamicDataSource" >
        <!-- 通过key-value的形式来关联数据源 -->
        <property name="targetDataSources">
            <map>
                <entry value-ref="dataSourceMain" key="dataSourceMain"></entry>
                <entry value-ref="dataSourceBack" key="dataSourceBack"></entry>
            </map>
        </property>
        <property name="defaultTargetDataSource" ref="dataSourceMain" />
    </bean>

    <bean id="sqlSessionFactoryDynamic" class="org.mybatis.spring.SqlSessionFactoryBean">
        <property name="dataSource" ref="dynamicDataSource" />
        <property name="typeAliasesPackage" value="com.clockpone.domain" />
    </bean>

    <!-- scan for mappers and let them be autowired -->
    <bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
        <property name="basePackage" value="com.clockpone.dynamicdao" />
        <property name="sqlSessionFactoryBeanName" value="sqlSessionFactoryDynamic"/>
    </bean>
```
DynamicDtaSource类的实现：
```
//动态数据源配置类
public class DynamicDataSource extends AbstractRoutingDataSource {
    @Override
    protected Object determineCurrentLookupKey() {
        //返回数据库源key值
        return DBContextHolder.getDBType();
    }
}

//置和获取数据库源
public class DBContextHolder {
    private static final ThreadLocal<String> contextHolder = new ThreadLocal<String>();
    /**
     * 设置数据库源方法，在程序运行时调用
     * @param dbType
     */
    public static void setDBType(String dbType) {
        contextHolder.set(dbType);
    }
    /**
     * 动态获取数据库源
     */
    public static String getDBType() {
        return contextHolder.get();
    }
    public static void clearDBType() {
        contextHolder.remove();
    }
}
```
2、通过aop方式动态织入需要添加aop配置：
```
<!-- 配置数据库注解aop -->
<aop:aspectj-autoproxy></aop:aspectj-autoproxy>
<bean id="manyDataSourceAspect" class="com.clockbone.filter.DataSourceAspect" />
<aop:config>
    <aop:aspect id="c" ref="manyDataSourceAspect">
        <!--dynamicdao包下的所有类，所有方法，任意参数类型、个数，任意返回值-->
        <aop:pointcut id="tx" expression="execution(* com.clockpone.dynamicdao.*.*(..))"/>
        <aop:before pointcut-ref="tx" method="before"/>
    </aop:aspect>
</aop:config>
```
DataSourceAspect类的实现：
```
public class DataSourceAspect {
    public void before(JoinPoint point){
        Object target = point.getTarget();
        String method = point.getSignature().getName();
        Class<?>[] classz = target.getClass().getInterfaces();
        Class<?>[] parameterTypes = ((MethodSignature) point.getSignature())
                .getMethod().getParameterTypes();
        try {
            Method m = classz[0].getMethod(method, parameterTypes);
            if (m != null && m.isAnnotationPresent(DataSource.class)) {
                DataSource data = m
                        .getAnnotation(DataSource.class);
                //设置数据源
                DBContextHolder.setDBType(data.value());
                System.out.println(data.value());
            }
        } catch (Exception e) {
            // TODO: handle exception
        }
    }
}
```
3、一个dynamicdao层的具体例子：
```
public interface UserNewMapper {
    @DataSource(Constant.DATA_SOURCE_MAIN)
    int deleteByPrimaryKey(Integer UserId);
    @DataSource(Constant.DATA_SOURCE_MAIN)
    int insert(UserNew record);
    @DataSource(Constant.DATA_SOURCE_BACK)
    UserNew selectByPrimaryKey(Integer UserId);
    @DataSource(Constant.DATA_SOURCE_MAIN)
    int updateByPrimaryKeySelective(UserNew record);
}
```
@DataSource的实现：
```
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public  @interface DataSource {
    String value();
}
```
到此就完了动态aop织入的配置，当执行dao层中注解为`Constant.DATA_SOURCE_MAIN`时就会读主库；

除了以上的那种配置外，xml中动态织入数据源的另一种拦截器配置：
```
<!--另一种方式的数据源选择 拦截器配置-->
    <!--配置拦截器  dataSourceMain  dataSourceBack-->
    <bean id="dynamicDsInterceptor_galaxy" class="com.clockbone.interceptor.DynamicDataSourceInterceptor">
        <property name="attributeSource">
            <list>
                <value>query*,dataSourceBack</value>
                <value>count*,dataSourceBack</value>
                <value>find*,dataSourceBack</value>
                <value>get*,dataSourceBack</value>
                <value>list*,dataSourceBack</value>
                <value>*,dataSourceMain</value>
            </list>
        </property>
    </bean>
    <aop:config>
        <!--切入点:设置service下的所有类，所有方法，public 所有类型返回值 -->
        <aop:pointcut id="loginPoint"
                      expression="execution(public * com.clockbone.service.impl.*.*(..)) "/>
        <!--在该切入点使用自定义拦截器-->
        <aop:advisor pointcut-ref="loginPoint" advice-ref="dynamicDsInterceptor_galaxy"/>
    </aop:config>
```
DynamicDataSourceInterceptor拦截器类的实现：
```
//设置数据源key的拦截器
public class DynamicDataSourceInterceptor implements MethodInterceptor {
    //方法和使用数据源key的对应关系
    private List<String> attributeSource = new ArrayList<String>();

    public void setAttributeSource(List<String> attributeSource) {
        this.attributeSource = attributeSource;
    }
    @Override
    public Object invoke(MethodInvocation methodInvocation) throws Throwable {
        final String methodName = methodInvocation.getMethod().getName();
        String key = null;
        for (String value : attributeSource) {
            String mappedName = value.split(",")[0];
            if(isMatch(methodName, mappedName)) {
                key = value.split(",")[1];
                break;
            }
        }
        if (null != key) {
            DBContextHolder.setDBType(key);
        }
        return methodInvocation.proceed();
    }
    private boolean isMatch(String methodName, String mappedName) {
        return PatternMatchUtils.simpleMatch(mappedName, methodName);
    }
}
```

