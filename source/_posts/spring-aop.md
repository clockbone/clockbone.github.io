layout: post
title: spring-aop基本概念及配置
date: 2014-06-28 13:31:52
categories: java
tag: spring
---
#### 官方文档给出的一些aop概念：
`切面（Aspect）`：我们加入的切面类（比如log类）,在Spring AOP中，切面可以使用基于模式）或者基于Aspect注解方式来实现。
`连接点（Joinpoint）`：在程序执行过程中某个特定的点，比如某方法调用的时候或者处理异常的时候。
在Spring AOP中，一个连接点总是表示一个方法的执行。连接点就是告诉aop切面需要在哪些具体地方执行
`通知（Advice）`：在切面的某个特定的连接点上执行的动作。其中包括了“around”、“before”和“after”等不同类型的通知（通知的类型将在后面部分进行讨论）。许多AOP框架（包括Spring）都是以拦截器做通知模型，并维护一个以连接点为中心的拦截器链。
`切入点（Pointcut）`：匹配连接点的断言。是指一系列连接点的集合，通常用一个表达式表示
`引入（Introduction）`：用来给一个类型声明额外的方法或属性（也被称为连接类型声明（inter-type declaration））。Spring允许引入新的接口（以及一个对应的实现）到任何被代理的对象。例如，你可以使用引入来使一个bean实现IsModified接口，以便简化缓存机制。
`目标对象（Target Object）`： 被一个或者多个切面所通知的对象。也被称做被通知（advised）对象。 既然Spring AOP是通过运行时代理实现的，这个对象永远是一个被代理（proxied）对象。
`AOP代理（AOP Proxy）`：AOP框架创建的对象，用来实现切面契约（例如通知方法执行等等）。在Spring中，AOP代理可以是JDK动态代理或者CGLIB代理。
`织入（Weaving）`：把切面连接到其它的应用程序类型或者对象上，并创建一个被通知的对象。这些可以在编译时（例如使用AspectJ编译器），类加载时和运行时完成。Spring和其他纯Java AOP框架一样，在运行时完成织入。

#### 通知类型：
`前置通知（Before advice）`：在某连接点之前执行的通知，但这个通知不能阻止连接点之前的执行流程（除非它抛出一个异常）。
`后置通知（After returning advice）`：在某连接点正常完成后执行的通知：例如，一个方法没有抛出任何异常，正常返回。
`异常通知（After throwing advice）`：在方法抛出异常退出时执行的通知。
`最终通知（After (finally) advice）`：当某连接点退出的时候执行的通知（不论是正常返回还是异常退出）。
`环绕通知（Around Advice）`：包围一个连接点的通知，如方法调用。这是最强大的一种通知类型。环绕通知可以在方法调用前后完成自定义的行为。它也会选择是否继续执行连接点或直接返回它自己的返回值或抛出异常来结束执行。
环绕通知是最常用的通知类型。和AspectJ一样，Spring提供所有类型的通知，我们推荐你使用尽可能简单的通知类型来实现需要的功能。例如，如果你只是需要一个方法的返回值来更新缓存，最好使用后置通知而不是环绕通知，尽管环绕通知也能完成同样的事情。用最合适的通知类型可以使得编程模型变得简单，并且能够避免很多潜在的错误。比如，你不需要在JoinPoint上调用用于环绕通知的proceed()方法，就不会有调用的问题。

```
public class RegisterServiceImpl implements RegisterService {
    private  RegisterDao registerDao;
    public RegisterServiceImpl() {}
    /** 带参数的构造方法 */
    public RegisterServiceImpl(RegisterDao  registerDao){
        this.registerDao =registerDao;
    }
    public void save(String loginname, String password) {
        registerDao.save(userName, password);
        throw new RuntimeException("在这里抛出一个异常。。。。");
    }
      /** set方法 */
    public void setRegisterDao(RegisterDao registerDao) {
        this.registerDao = registerDao;
    }
}
```
对于业务系统来说，`RegisterServiceImpl`类就是目标实现类，它的业务方法，如`save()`方法的前后或代码会出现异常的地方都是AOP的连接点。
下面新建一个切面类，我们需要将切面类放到目标类方法连接点上执行
```
public class LogAspect {
    //任何通知方法都可以将第一个参数定义为 org.aspectj.lang.JoinPoint类型
    public void before(JoinPoint call) {
        //获取目标对象对应的类名
        String className = call.getTarget().getClass().getName();
        //获取目标对象上正在执行的方法名
        String methodName = call.getSignature().getName();
        System.out.println("前置通知:" + className + "类的" + methodName + "方法开始了");
    }
    public void afterReturn() {
        System.out.println("后置通知:方法正常结束了");
    }
    public void after(){
        System.out.println("最终通知:不管方法有没有正常执行完成，一定会返回的");
    }
    public void afterThrowing() {
        System.out.println("异常抛出后通知:方法执行时出异常了");
    }
    //用来做环绕通知的方法可以第一个参数定义为org.aspectj.lang.ProceedingJoinPoint类型
    public Object doAround(ProceedingJoinPoint call) throws Throwable {
        Object result = null;
        this.before(call);//相当于前置通知
        try {
            //call.proceed()表示执行目标类（用反射机制）
            result = call.proceed();
            this.afterReturn(); //相当于后置通知
        } catch (Throwable e) {
            this.afterThrowing();  //相当于异常抛出后通知
            throw e;
        }finally{
            this.after();  //相当于最终通知
        }
        return result;
    }
}

```

 这个类属于业务服务类，如果用AOP的术语来说，它就是一个切面类，它定义了许多通知。`Before()`、`afterReturn()`、`after()`和`afterThrowing()`这些方法都是通知。

####  下面是aop配置：
 ```
 <?xml version="1.0" encoding="UTF-8"?>
 <beans xmlns="http://www.springframework.org/schema/beans"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns:aop="http://www.springframework.org/schema/aop"
         xsi:schemaLocation="
             http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.5.xsd
             http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop-2.5.xsd>
     <bean id="registerDaoImpl" class="com.test.dao.RegisterDaoImpl"/>
     <bean id="registerService" class="com.test.service.RegisterServiceImpl">
         <property name=" registerDaoImpl " ref=" RegisterDaoImpl "/>
     </bean>
     <!-- 日志切面类 -->
     <bean id="logAspectBean" class="com.test.aspect.LogAspect"/>
     <!-- 第1步： AOP的配置 -->
     <aop:config>
         <!-- 第2步：配置一个切面 -->
         <aop:aspect id="logAspect" ref="logAspectBean">
             <!-- 第3步：定义切入点,指定切入点表达式 -->
             <aop:pointcut id="allMethod"
                 expression="execution(* com.test.service.*.*(..))"/>
             <!-- 第4步：应用前置通知 -->
             <aop:before method="before" pointcut-ref="allMethod" />
             <!-- 第4步：应用后置通知 -->
             <aop:after-returning method="afterReturn" pointcut-ref="allMethod"/>
             <!-- 第4步：应用最终通知 -->
             <aop:after method="after" pointcut-ref="allMethod"/>
             <!-- 第4步：应用抛出异常后通知 -->
             <aop:after-throwing method="afterThrowing" pointcut-ref="allMethod"/>
             <!-- 第4步：应用环绕通知 -->
             <!--
             <aop:around method="doAround" pointcut-ref="allMethod" />
              -->
         </aop:aspect>
     </aop:config>
 </beans>
 ```
 上述配置针对切入点应用了前置、后置、最终，以及抛出异常后通知。这样在测试执行RegisterServiceImpl类的save()方法时，控制台会有如下结果输出：


  `前置通知：com.zxf.service.RegisterServiceImpl类的save方法开始了。`
 `针对MySQL的RegisterDao实现中的save()方法。`
 `后置通知:方法正常结束了。`
 `最终通知:不管方法有没有正常执行完成，一定会返回的。 `

 #### spring-aop事物的配置



 > 1、配置事物管理器
 ```
 <bean id=”txManager” class=”org.springframework.jdbc.datasource.DataSourceTransactionManager”>
        <property name=”dataSource” ref=”spring中配置的数据源bean的id”/>
 </bean>
 ```
 >2、 支持注解方式的事务配置项
 ```
 <tx:annotation-driventransaction-managertx:annotation-driventransaction-manager=”txManager(spri
 ```
 > 3、配置注解的事务管理
 ```
 <bean id=”txManager” class=”org.springframework.jdbc.datasource.DataSourceTransactionManager”>
        <property name=”dataSource” ref=”spring中配置的数据源bean的id”/>
 </bean>
 ```
 > 4、配置事物管理的切面
 ```
 <aop:config>
        <!--配置事务切入点-->
        <aop:pointcut id=”transactionPointcut”
 Expression=”execution(* com.test.service..*.*(..))”/>
 <!--配置事务通知-->
 <aop:advisor advice-ref=”txAdvice” pointcut-ref=”transactionPointcut”/>
 </aop:config>
 ```
 > 5、为事务通知添加事物处理特性
 ```
 <tx:advice id=”txAdvice” transactionManager=”txManager”>
        <tx:attributes>
               <!--这里举例将以get开头的查询方法设置为只读，不支持事务-->
               <tx:method name=”get*” read-only=”true” propagation=”NOT_SUPPORTED”/>
               <!--其他的方法设置为spring默认的事物行为-->
               <tx:method name=”*”/>
        </tx:attributes>
 </tx:advice>
 ```







