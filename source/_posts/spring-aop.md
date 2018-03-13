layout: post
title: spring-aop基本概念及配置
date: 2014-06-28 13:31:52
categories: java
tag: spring
---

###  一、给出的一些aop概念：
`切面（Aspect）`：我们加入的切面类（比如log类）,在Spring AOP中，切面可以使用基于模式）或者基于Aspect注解方式来实现。
`连接点（Joinpoint）`：在程序执行过程中某个特定的点，比如某方法调用的时候或者处理异常的时候。
在Spring AOP中，一个连接点总是表示一个方法的执行。连接点就是告诉aop切面需要在哪些具体地方执行
`通知（Advice）`：在切面的某个特定的连接点上执行的动作。其中包括了“around”、“before”和“after”等不同类型的通知（通知的类型将在后面部分进行讨论）。许多AOP框架（包括Spring）都是以拦截器做通知模型，并维护一个以连接点为中心的拦截器链。
`切入点（Pointcut）`：匹配连接点的断言。是指一系列连接点的集合，通常用一个表达式表示
<!-- more -->
`引入（Introduction）`：用来给一个类型声明额外的方法或属性（也被称为连接类型声明（inter-type declaration））。Spring允许引入新的接口（以及一个对应的实现）到任何被代理的对象。例如，你可以使用引入来使一个bean实现IsModified接口，以便简化缓存机制。
`目标对象（Target Object）`： 被一个或者多个切面所通知的对象。也被称做被通知（advised）对象。 既然Spring AOP是通过运行时代理实现的，这个对象永远是一个被代理（proxied）对象。
`AOP代理（AOP Proxy）`：AOP框架创建的对象，用来实现切面契约（例如通知方法执行等等）。在Spring中，AOP代理可以是JDK动态代理或者CGLIB代理。
`织入（Weaving）`：把切面连接到其它的应用程序类型或者对象上，并创建一个被通知的对象。这些可以在编译时（例如使用AspectJ编译器），类加载时和运行时完成。Spring和其他纯Java AOP框架一样，在运行时完成织入。

###  二、通知类型：
`前置通知（Before advice）`：在某连接点之前执行的通知，但这个通知不能阻止连接点之前的执行流程（除非它抛出一个异常）。
`后置通知（After returning advice）`：在某连接点正常完成后执行的通知：例如，一个方法没有抛出任何异常，正常返回。
`异常通知（After throwing advice）`：在方法抛出异常退出时执行的通知。
`最终通知（After (finally) advice）`：当某连接点退出的时候执行的通知（不论是正常返回还是异常退出）。
`环绕通知（Around Advice）`：包围一个连接点的通知，如方法调用。这是最强大的一种通知类型。环绕通知可以在方法调用前后完成自定义的行为。它也会选择是否继续执行连接点或直接返回它自己的返回值或抛出异常来结束执行。
环绕通知是最常用的通知类型。和AspectJ一样，Spring提供所有类型的通知，我们推荐你使用尽可能简单的通知类型来实现需要的功能。例如，如果你只是需要一个方法的返回值来更新缓存，最好使用后置通知而不是环绕通知，尽管环绕通知也能完成同样的事情。用最合适的通知类型可以使得编程模型变得简单，并且能够避免很多潜在的错误。比如，你不需要在JoinPoint上调用用于环绕通知的proceed()方法，就不会有调用的问题。

```java
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
```java
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

###   三、下面是aop配置：
 ```xml
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

 ### 四、spring-aop事物的配置

 #### 1、配置事物管理器
 ```xml
 <bean id=”txManager” class=”org.springframework.jdbc.datasource.DataSourceTransactionManager”>
        <property name=”dataSource” ref=”spring中配置的数据源bean的id”/>
 </bean>
 ```
 #### 2、 支持注解方式的事务配置项
 ```xml
 <tx:annotation-driventransaction-managertx:annotation-driventransaction-manager=”txManager(spri
 ```
 ####  3、配置注解的事务管理
 ```xml
 <bean id=”txManager” class=”org.springframework.jdbc.datasource.DataSourceTransactionManager”>
        <property name=”dataSource” ref=”spring中配置的数据源bean的id”/>
 </bean>
 ```
 ####  4、配置事物管理的切面
 ```xml
 <aop:config>
        <!--配置事务切入点-->
        <aop:pointcut id=”transactionPointcut”
 Expression=”execution(* com.test.service..*.*(..))”/>
 <!--配置事务通知-->
 <aop:advisor advice-ref=”txAdvice” pointcut-ref=”transactionPointcut”/>
 </aop:config>
 ```
 ####  5、为事务通知添加事物处理特性
 ```xml
 <tx:advice id=”txAdvice” transactionManager=”txManager”>
        <tx:attributes>
               <!--这里举例将以get开头的查询方法设置为只读，不支持事务-->
               <tx:method name=”get*” read-only=”true” propagation=”NOT_SUPPORTED”/>
               <!--其他的方法设置为spring默认的事物行为-->
               <tx:method name=”*”/>
        </tx:attributes>
 </tx:advice>
 ```
 ### 五、spring事物原理
 ####  1、spring事物的传播类型
 spring事物的传播属性:多个事物同时存在(事物方法A中调用事物方法B),spring如何处理这些事物.

 | 事物传播类型        |                                                      |
 | --------   | -----:            |
 | PROPAGATION_REQUIRED   | 支持当前事物,如果当前没有事物,新建一个事物,spring默认传播类型 |
 | PROPAGATION_REQUIRES_NEW       |   新建事物,如果当前事物存在,把当前事物挂起.新建事物和挂起事物没有关系,外层事物回滚不能回滚内层事物,内层事物失败,抛出异常,外层事物也可不作处理  |
 | PROPAGATION_SUPPORTS        |    支持当前事物,如果当前没有事物,以非事物执行(方法A调用事物方法B)|
  | PROPAGATION_MANDATORY        |   支持当前事务，如果当前没有事务，就抛出异常。|
  | PROPAGATION_NOT_SUPPORTED     |  以非事务方式执行操作，如果当前存在事务，就把当前事务挂起。 |
   | PROPAGATION_NEVER    |  以非事务方式执行，如果当前存在事务，则抛出异常。 |
    | PROPAGATION_NESTED     |  以非事务方式执行操作，如果当前存在事务，就把当前事务挂起。 |

 ####  2、Spring中的隔离级别
 | 隔离级别类型        |                                                      |
  | --------   | -----:            |
  | ISOLATION_DEFAULT   |  |
  | ISOLATION_READ_UNCOMMITTED       |  事务最低的隔离级别，充许另外一个事务可以看到这个事务未提交的数据。这种隔离级别会产生脏读，不可重复读和幻像读。  |
  | ISOLATION_READ_COMMITTED       |   保证一个事务修改的数据提交后才能被另外一个事务读取。另外一个事务不能读取该事务未提交的数据。|
   | ISOLATION_REPEATABLE_READ       |  防止脏读，不可重复读。但是可能出现幻像读。|
   | ISOLATION_SERIALIZABLE    | 这是花费最高代价但是最可靠的事务隔离级别。事务被处理为顺序执行。 |
 ####  3、事务嵌套场景
 假设外层事务ServiceA的MethodA()调用内层ServiceB的MethodB()
  #####  1、PROPAGATION_REQUIRED(spring 默认)
  如果`serviceB.methodB()`事物级别定义`PROPAGATION_REQUIRED`,那么执行`serviceA.methodA()`的时候起事物,调用`serviceB.methodB()`时,`serviceB.methodB()`看到自己运行在`serviceA.methodA()`里面,不再起新事物.
   假如`serviceB.methodB()`运行时没发现自己不在事物中,就会开启一个事物.当`serviceA.methodA()`或`serviceB.methodB()`出现任何异常,事物都会回滚.
  #####  2、PROPAGATION_REQUIRES_NEW
 比如`ServiceA.methodA()` 的事务级别为 `PROPAGATION_REQUIRED`，`ServiceB.methodB()` 的事务级别为 `PROPAGATION_REQUIRES_NEW`。
 执行到 `ServiceB.methodB()` 的时候，`ServiceA.methodA()` 所在的事务就会挂起，`ServiceB.methodB()` 会起一个新的事务，等待 `ServiceB.methodB()`` 的事务完成以后，它才继续执行。
 #####  3、PROPAGATION_SUPPORTS
  `serviceB.methodB()` 的事务级别为 `PROPAGATION_SUPPORTS`,当执行`serviceB.methodB()`,如果serviceA.methodA()开启了一个事物,则自己也不开启事物.这种时候，内部方法的事务性完全依赖于最外层的事务。
  #####  4、PROPAGATION_NESTED
  `serviceB.methodB()` 的事务属性被配置为 `PROPAGATION_NESTED`,`serviceB.methodB()` rollback,回滚到savepoint的外部事物`serviceA.methodA()`
  可以有2种处理:
  a 捕获异常，执行异常分支逻辑
  ```java
  void methodA() {
      try {
          ServiceB.methodB();
      } catch (SomeException) {
          // 执行其他业务, 如 ServiceC.methodC();
      }
  }
  ```
  b 外部事务回滚/提交 代码不做任何修改, 那么如果内部事务serviceB.methodB() rollback, 那么首先 serviceB.methodB 回滚到它执行之前的 SavePoint(在任何情况下都会如此), 外部事务serviceA.methodA 将根据具体的配置决定自己是 commit 还是 rollback

### 六、AOP 代理的两种实现
####  1、Java 动态代理
代码参考:
```java
//代理类实现ProxyHandler,重写invoke方法(代理方法)
public class ProxyHandler implements InvocationHandler{
    // 真实业务对象
    private Object target;
    public ProxyHandler(Class clazz){
        try {
          this.target = clazz.newInstance();
        } catch (InstantiationException | IllegalAccessException ex) {
          LOG.error("Create proxy for {} failed", clazz.getName());
        }
    }
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        // 增强逻辑
        System.out.println("PROXY : " + proxy.getClass().getName());
        // 反射调用，目标方法
        Object result = method.invoke(target, args);
        // 增强逻辑
        System.out.println(method.getName() + " : " + result);
        return result;
    }

}

public class JDKDynamicProxyClient {
  public static void main(String[] args) {
    InvocationHandler handler = new ProxyHandler(ConcreteSubject.class);
    ISubject proxy =
        (ISubject) Proxy.newProxyInstance(JDKDynamicProxyClient.class.getClassLoader(),
            new Class[] {ISubject.class}, handler);
    proxy.action();
  }
}

```
####  2、GCLIB代理代理
 ### 七、补充理解
 1、AOP是一种面向切面编程的思想类似于oop(面向对象编程)，spring aop运用aop的编程思想，aspectj是spring aop的具体实现方案，spring整合了aspectj，使得在spring框架中可以运用aspectj语法来实现aop。
 2、spring aop拦截器，只拦截spring管理bean的访问（业务层service）
 3、srping mvc里的Interceptor拦截器，需要定义到springmvc-servlet.xml文件中，去拦截url请求资源
 一个具体配置如下：
 ```xml
 //用来用户访问权限的控制，当请求admin匹配的url时会执行AdminInterceptor，此方法中获取用户信息，对用户进行校验，只有admin权限用户才可以执行相应操作
 <mvc:interceptors>
         <!-- 使用bean定义一个Interceptor，直接定义在mvc:interceptors根下面的Interceptor将拦截所有的请求 -->
         <!--<bean class="com.test.clockbone.interceptor.AdminInterceptor"/>-->
         <mvc:interceptor>
             <mvc:mapping path="/admin/*"/>
             <!-- 定义在mvc:interceptor下面的表示是对特定的请求才进行拦截的 -->
             <bean class="com.test.clockbone.interceptor.AdminInterceptor"/>
         </mvc:interceptor>
     </mvc:interceptors>
 ```
 AdminInterceptor：
 ```java
 public class AdminInterceptor  implements HandlerInterceptor {

     @Autowired
     private LoginService loginService;
     @Override
     public boolean preHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o) throws Exception {
         String userName=loginService.getUsername(httpServletRequest);//获取用户名
         if(StringUtils.isEmpty(userName)){
             return false;
         }
         if(Constant.adminAccount.contains(userName)){
             return true;
         }else{
             return false;
         }
     }
     @Override
     public void postHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, ModelAndView modelAndView) throws Exception {
     }
     @Override
     public void afterCompletion(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, Exception e) throws Exception {

     }

 }
 ```

 spring事物原理参考:
 https://www.jianshu.com/p/99f8787f9eaa







