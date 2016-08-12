layout: post
title: maven profile打包时实现可指定不同环境配置文件
date: 2015-11-14 14:08:30
categories: maven
tag: maven
---
通常项目部署环境可以有多个，需不同环境的配置文件参数有所不同，需要我们在打包时就可以指定打包不同环境的配置文件。
只需要通过maven插件就可以实现
### 一、第一种方式
#### 1、pom.xml中需要添加：
<!-- more -->
```bash
<build>
    <!-- 可以把属性写到文件里,用属性文件里定义的属性做替换
    Maven提供了一种过滤机制，可以在资源文件被复制到目标目录的同时，替换其中的placeholders。
    可实现将src/main/resources下的所有.xml文件过滤，用src/main/resources下的xxx.properties中的配置属性替换.xml中${xx.xx.xx}.
    -->
    <resources>
        <resource>
            <directory>src/main/resources</directory>
            <filtering>true</filtering>
        </resource>
    </resources>
      <!-- 指定不同环境的profile
        -->
    <profiles>
        <profile>
            <id>local</id>
            <activation>
                <activeByDefault>true</activeByDefault>
            </activation>
            <properties>
                <env>local</env>
            </properties>
            <build>
                <filters>
                    <filter>${basedir}/src/main/java/filter/local.properties</filter>
                </filters>
            </build>
        </profile>
        <profile>
            <id>test</id>
            <properties>
                <env>test</env>
            </properties>
            <build>
                <filters>
                    <filter>${basedir}/src/main/java/filter/test.properties</filter>
                </filters>
            </build>
        </profile>
    </profiles>
</build>
```
#### 2、applicationContext.xml中需要添加
```bash
   <util:properties id="config" location="classpath:config.properties"/>
```
#### 3、需要在src/main/java下新建filter包，包中放各环境的配置文件源文件
   结构如下：
   src/main/java/filter/
         `local.properties`
         `test.properties`
        ` product.properties`
   等等。文件中内容格式示例：
   `db.url=jdbc:mysql://127.0.0.1:3306/basename?useUnicode=true&amp;characterEncoding=UTF-8`
                         `db.user=root`
                         `db.password=12345678`
   resources目录下建立config.properties文件，用于替换xxx.Xml文件中#{config.value}值。
   config.properties中文件内容标例:
   `dbUrl=${db.url}`
                                ` dbUser=${db.user}`
                                 `dbPassword=${db.password}`
#### 4、resource目录下xxx.Xml文件应该如何使用，求例mybatis.xml
```bash
<!-- MyBatis数据库连接配置 -->
<bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource" init-method="init" destroy-method="close">
    <!-- 基本属性 url、user、password -->
    <property name="url" value="#{config.dbUrl}" />
    <property name="username" value="#{config.dbUser}" />
    <property name="password" value="#{config.dbPassword}" />
</bean>
```

>总结：
>   1、打包时，执行mvn clean package -Ptest 即是指定filter包下test.properties中的内容替换config.properties中对应的值
>      打包完成后，config.properties中的内容应该为：
>      `dbUrl=jdbc:mysql://127.0.0.1:3306/basename?useUnicode=true&amp;characterEncoding=UTF-8`
>                                               `dbUser=root`
>                                               `dbPassword=12345678`
>   2、applicationContext.xml中`<util:properties id="config" location="classpath:config.properties"/>`作用就是将config.properties中的替换xxx.Xml中的placeholders。


### 二、第二种 maven profile打包时实现可指定不同环境配置文件用`maven-antrun-plugin`插件实现
在Maven项目的pom.xml中加入以下配置：
```
<profiles>
    <profile>
        <id>product</id>
        <build>
            <plugins>
                <plugin>
                    <artifactId>maven-antrun-plugin</artifactId>
                    <version>1.8</version>
                    <executions>
                        <execution>
                            <phase>compile</phase>
                            <configuration>
                                <target>
                                    <copy todir="${basedir}/target/classes/" overwrite="true">
                                        <fileset dir="${basedir}/src/main/resources/distribute/product/" />
                                    </copy>
                                </target>
                            </configuration>
                            <goals>
                                <goal>run</goal>
                            </goals>
                        </execution>
                    </executions>
                </plugin>
            </plugins>
        </build>
    </profile>
	<profile>
		<id>test</id>
		<build>
			<plugins>
				<plugin>
					<artifactId>maven-antrun-plugin</artifactId>
					<version>1.8</version>
					<executions>
						<execution>
							<phase>compile</phase>
							<configuration>
								<target>
									<copy todir="${basedir}/target/classes/" overwrite="true">
										<fileset dir="${basedir}/src/main/resources/distribute/test/" />
									</copy>
								</target>
							</configuration>
							<goals>
								<goal>run</goal>
							</goals>
						</execution>
					</executions>
				</plugin>
			</plugins>
		</build>
	</profile>
</profiles>
```
>总结：
>上面的配置中加入了id为`product`、`test`两个profile，分别表示正式环境和测试环境，两块的配置基本相同，
>只看其中之一即可。其中profile的id可以自定义，如果除了这两个环境外还有其他环境的话可以自行添加。
>在每个profile中使用了`maven-antrun-plugin`插件，
>`<phase>compile</phase>`表示在编译阶段，`<target>...</target>`表示要执行的任务。
>即在编译是将`dir="${basedir}/src/main/resources/distribute/product/"`目录下的文件拷贝到
`todir="${basedir}/target/classes/"`目录中，`overwrite="true"`表示如果文件重复则覆盖。
>resource目录下新建`distribute/test`,`distribute/product`目录里面存放需要替换的整个配置文件即可。


