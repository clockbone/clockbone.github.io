layout: post
title: MyBatisGenerator 实现Model、sqlMap、dao自动生成
date: 2015-07-04 15:32:25
categories: java
tag: mybatis
---
MyBatis Generator是一个用来根据表结构自动生成对应model、sqlmapper、dao层代码的工具。当表结构比较复杂、sql语句比较多的时候，用这个工具可以节省开发时间
同时也降低了手动编写sql时出现的一些错误。下面看看MyBatis Generator如何使用。
### 一、传统的实现方法
   #### 1、引入`mybatis-generator-core jar`包
   #### 2、新建`generatorConfig.xml`文件，内容参考官方文档： http://www.mybatis.org/generator/configreference/xmlconfig.html
   #### 3、执行命令(可根据实际情况自定义文件路径),内容参考官方文档：http://www.mybatis.org/generator/quickstart.html
   ```
   java -jar E:\repository\org\mybatis\generator\mybatis-generator-core\1.3.2\mybatis-generator-core-1.3.2.jar -configfile src\main\resources\generatorConfig.xml -overwrite
   ```
   #### 4、给出一个具体的`generatorConfig.xml`文件如下：
   ```
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE generatorConfiguration
           PUBLIC "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN"
           "http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd">
   <generatorConfiguration>
       <!-- mysql-connector-java-5.1.34.jar 包的路径-->
       <classPathEntry location="E:\repository\mysql\mysql-connector-java\5.1.34\mysql-connector-java-5.1.34.jar" />

       <context id="DB2Tables" targetRuntime="MyBatis3">
           <jdbcConnection driverClass="com.mysql.jdbc.Driver"
                           connectionURL="jdbc:mysql://localhost:3306/ssi_spring_security"
                           userId="root"
                           password="root">
           </jdbcConnection>

           <!--  <javaTypeResolver >
                 <property name="forceBigDecimals" value="false" />
             </javaTypeResolver>-->

            <!-- 生成model-->
           <javaModelGenerator targetPackage="com.clockpone.dynamicdao" targetProject="src/main/java">
               <!--<property name="enableSubPackages" value="true" />
               <property name="trimStrings" value="true" />-->
           </javaModelGenerator>

           <!-- 生成mapper文件-->
           <sqlMapGenerator targetPackage="com.clockpone.dynamicdao"  targetProject="src/main/resources">
               <!-- <property name="enableSubPackages" value="true" />-->
           </sqlMapGenerator>

           <!-- 生成dao层代码文件-->
           <javaClientGenerator type="XMLMAPPER" targetPackage="com.clockpone.dynamicdao"  targetProject="src/main/java">
               <!-- <property name="enableSubPackages" value="true" />-->
           </javaClientGenerator>

           <table schema="user" tableName="user" domainObjectName="User"> <!--domainObjectName="Customer" -->
               <!--  <property name="useActualColumnNames" value="true"/>
                 <generatedKey column="ID" sqlStatement="DB2" identity="true" />-->
               <columnOverride column="UserId" property="UserId" />
               <columnOverride column="userName" property="userName" />
               <columnOverride column="userPassword" property="userPassword" />
               <columnOverride column="userNickName" property="userNickName" />
               <columnOverride column="userAge" property="userAge" />
               <columnOverride column="userSex" property="userSex" />
               <columnOverride column="userAddress" property="userAddress" />
               <columnOverride column="userPhone" property="userPhone" />
               <columnOverride column="userMail" property="userMail" />
               <columnOverride column="userQQ" property="userQQ" />
               <columnOverride column="regTime" property="regTime" />
               <columnOverride column="lastLogintime" property="lastLogintime" />
               <columnOverride column="level" property="level" />
               <columnOverride column="province" property="province" />

               <!-- <ignoreColumn column="FRED" />
                <columnOverride column="LONG_VARCHAR_FIELD" jdbcType="VARCHAR" />-->
           </table>
       </context>
   </generatorConfiguration>

   ```

###  二、结合maven插件生成

#### 1、引入`mybatis-generator-core jar`包
#### 2、新建`generatorConfig.xml`文件，内容参考官方文档： http://www.mybatis.org/generator/configreference/xmlconfig.html
#### 3、引入`maven`插件，参考：http://www.mybatis.org/generator/running/runningWithMaven.html
```
  <!--自动生成mybatis xml文件插件-->
            <plugin>
                <groupId>org.mybatis.generator</groupId>
                <artifactId>mybatis-generator-maven-plugin</artifactId>
                <version>1.3.1</version>
                <configuration>
                    <verbose>true</verbose>
                    <overwrite>false</overwrite>
                </configuration>


                <executions>
                    <execution>
                        <id>Generate MyBatis Artifacts</id>
                        <goals>
                            <goal>generate</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
```
#### 4、运行`mvn mybatis-generator:generate`命令来生成代码。







