layout: post
title: mybatis使用PageHelper分页插件原理
date: 2017-01-11 12:22:06
tags:
---

1、官方介绍：
https://github.com/pagehelper/Mybatis-PageHelper/blob/master/README_zh.md
官方介绍文档中已经说明了详细的配置方法和使用方法，这里不再详细介绍。
2、简单说一下本项目的配置案例。
a、spring配置文 件

```
<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
  <!-- 注意其他配置 -->
  <property name="plugins">
    <array>
      <bean class="com.github.pagehelper.PageInterceptor">
        <property name="properties">
          <!--使用下面的方式配置参数，一行配置一个 -->
          <value>
            params=value1
          </value>
        </property>
      </bean>
    </array>
  </property>
</bean>
```
<!-- more -->
b、代码中使用
在使用前需要仔细查看官方一些使用提示如：
https://github.com/pagehelper/Mybatis-PageHelper/blob/master/wikis/zh/Important.md
```
//获取第1页，10条内容，默认查询总数count
PageHelper.startPage(1, 10);
//紧跟着的第一个select方法会被分页
List<Country> list = countryMapper.selectIf(1);
//分页时，实际返回的结果list类型是Page<E>，如果想取出分页信息，需要强制转换为Page<E>
Page page = (Page)list;
page.getPageNum();
page.getPageSize();
page.getPages();
page.getTotal();
page.size();
assertEquals(182, ((Page) list).getTotal());
```
3、重要提示：
> 需要注意什么时候会导致不安全的分页?

4、PageHelper分页实现原理说明
```
//设置分页信息保存到threadlocal中
PageHelper.startPage(1, 10);
//紧跟着的第一个select方法会被分页，contryMapper会被PageInterceptor截拦,截拦器会从threadlocal中取出分页信息，把分页信息加到sql语句中，实现了分页查旬
List<Country> list = countryMapper.selectIf(1);
```



