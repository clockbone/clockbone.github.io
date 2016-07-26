layout: post
title: spring4实现xml零配置，jpa作为持久层
date: 2015-07-04 16:12:31
categories: java
tag: [spring , jpa]
---
### 一、spring4中提供了大量的注解来支持零配置，简要说明如下：

`@Configuration `： 类似于spring配置文件，负责注册bean，对应的提供了@Bean注解。需要org.springframework.web.context.support.AnnotationConfigWebApplicationContext注册到容器中。
`@ComponentScan `： 注解类查找规则定义 <context:component-scan/>
`@EnableAspectJAutoProxy `： 激活Aspect自动代理 <aop:aspectj-autoproxy/>
`@Import @ImportResource`: 关联其它spring配置  <import resource="" />
`@EnableCaching `：启用缓存注解  <cache:annotation-driven/>
`@EnableTransactionManagement` ： 启用注解式事务管理 <tx:annotation-driven />
`@EnableWebMvcSecurity `： 启用springSecurity安全验证
### 二、结合jpa作为数据库持久层，一个具体的`JpaSourceConfig`类如下：
```
@Configuration()
@ComponentScan("")
@ImportResource(
        {     "classpath:datasource-config.xml",
                "classpath:applicationContext.xml" //运行jetty时，需要把这里加载的applicationContext.xml文注释，因为只能加载一个app.xml配置文件
                                                     //运行这里的测试方法再打开注释
        })
@EnableJpaRepositories("com.clockbone.jpadao")
@EnableTransactionManagement
public class JpaSourceConfig {
    @Autowired
    DataSource dataSource;
    //@Bean负责注册bean对象
    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource, JpaVendorAdapter jpaVendorAdapter) {
        LocalContainerEntityManagerFactoryBean lef = new LocalContainerEntityManagerFactoryBean();
        lef.setDataSource(dataSource);
        lef.setJpaVendorAdapter(jpaVendorAdapter);
        //设置扫描的jpa的model类为jpadomain包下的
        lef.setPackagesToScan("com.clockbone.jpadomain");
        //配置orm，orm配置持久层是jpa
        lef.setMappingResources("orm.xml");
        Map<String, Object> jpaProperties = new HashMap<String, Object>();
        jpaProperties.put(Environment.HBM2DDL_AUTO, "none");
        lef.setJpaPropertyMap(jpaProperties);
        return lef;
    }
    @Bean
    public JpaVendorAdapter jpaVendorAdapter() {
        HibernateJpaVendorAdapter hibernateJpaVendorAdapter = new HibernateJpaVendorAdapter();
        hibernateJpaVendorAdapter.setShowSql(false);
        hibernateJpaVendorAdapter.setGenerateDdl(false);
        hibernateJpaVendorAdapter.setDatabase(Database.MYSQL);
        return hibernateJpaVendorAdapter;
    }
    @Primary
    @Bean
    public PlatformTransactionManager transactionManager() {
        return new JpaTransactionManager();
    }
    @Bean
    public EntityManager entityManager(EntityManagerFactory entityManagerFactory) {
        return entityManagerFactory.createEntityManager();
    }
    public static void main(String[] args) {
        AbstractApplicationContext context = new AnnotationConfigApplicationContext(JpaSourceConfig.class);
        persionRepTest(context);
        context.close();
    }
        public static void itemRepositoryTest(AbstractApplicationContext context){
            ItemRepository repository = context.getBean(ItemRepository.class);
            //测试自有方法
            List<Test> test1 = repository.findByKey("Jack");
            List<Test> test2 = repository.findByName("Jack");
            //测试自定义sql语句方法
            Boolean b = repository.exists(1);

            List<Test> test = repository.findByFirstnameEndsWith("Bauer");

            System.out.println(test);
        }
}

```
### 三、一个具体的实现体的定义
```
/**
 注意：
  * 1、这里的一定要注明表名@Table,
  * 2、注明主键 其中：@Id 如果是自增一定要注明是自增 @GeneratedValue
 */
@Entity
@Table(name = "t_test")
//这里定义别名
@AttributeOverrides({
        @AttributeOverride(name="key", column=@Column(name="mkey",unique=true))
})
public class Test {
    protected Test(){
    }
    public Test(String key,String name){
        this.key=key;
        this.name=name;
    }
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Integer id;
    @Column(length = 11,name="mkey")
    private String key;
    private String name;
    public Integer getId() {
        return id;
    }
    public void setId(Integer id) {
        this.id = id;
    }
    public String getKey() {
        return key;
    }
    public void setKey(String key) {
        this.key = key;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
}

```
### 四、一个具体的repository类,即dao层类
```
   public interface ItemRepository extends JpaRepository<Test, Integer> {
	 public List<Test> findByKey(String key);
        public List<Test> findByName(String name);
        @Query(value = "select * from t_test u where u.name like %?1", nativeQuery = true)
        List<Test> findByFirstnameEndsWith(String name);
     }
   }
```
### 五、orm.xml配置
```
<?xml version="1.0" encoding="UTF-8"?>
<entity-mappings xmlns="http://java.sun.com/xml/ns/persistence/orm"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xsi:schemaLocation="http://java.sun.com/xml/ns/persistence/orm http://java.sun.com/xml/ns/persistence/orm_2_0.xsd"
                 version="2.0">
    <persistence-unit-metadata>
        <persistence-unit-defaults>
            <entity-listeners>
                <entity-listener class="org.springframework.data.jpa.domain.support.AuditingEntityListener"/>
            </entity-listeners>
        </persistence-unit-defaults>
    </persistence-unit-metadata>
</entity-mappings>

```
