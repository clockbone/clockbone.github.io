layout: post
title: 在打包时就推送项目到远程服务器的maven插件wagon-maven-plugin
date: 2015-11-14 13:44:47
categories: maven
tag: maven
---
wagon-maven-plugin 让你运行`mvn package`时就可以将项目部署远程服务器的插件，只需在你的pom.xml文件中添加：
```bash
<build>
    <finalName>${finalName.name}</finalName>
     <extensions>
        <extension>
            <groupId>org.apache.maven.wagon</groupId>
            <artifactId>wagon-ssh</artifactId>
            <version>2.8</version>
        </extension>
    </extensions>
    <plugins>
         <plugin>
            <groupId>org.codehaus.mojo</groupId>
            <artifactId>wagon-maven-plugin</artifactId>
            <version>1.0</version>
            <executions>
                <execution>
                    <id>upload-deploy</id>
                    <!--运行package打包的同时运行upload-single和sshexec-->
                    <phase>package</phase>
                    <goals>
                        <goal>upload-single</goal>
                        <goal>sshexec</goal>
                    </goals>
                    <configuration>
                        <fromFile>target/${finalName.name}.war</fromFile>
                        <url>scp://username:password@127.0.0.1/usr/local/tomcat/webapps</url>
                        <commands>
                            <command>sh /usr/local/tomcat/webapps/bash.sh ${finalName.name}</command>
                        </commands>
                        <!-- 显示运行命令的输出结果 -->
                        <displayCommandOutputs>true</displayCommandOutputs>
                    </configuration>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```
以后只需要在执行`mvn clean package -P proFileId` 打包命令就可以将打包好的war或jar包上传到指定的远程服务器。
`<commands>`标签中可根据需要执行脚本。
