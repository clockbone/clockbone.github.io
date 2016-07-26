layout: post
title: spring-ws-core调用webservice客户端
date: 2016-07-26 10:49:46
categories: spring
tags: spring
---
spring-ws-core不需要生成webservice客户端就能调用webservice也是一种很方便的方式。
#### 1、先加spring-ws-core依赖
```
<dependency>
    <groupId>org.springframework.ws</groupId>
    <artifactId>spring-ws-core</artifactId>
    <version>2.1.4.RELEASE</version>
</dependency>
```
当spring-ws-core整合spring-webmvc 4.1.2时会出现一个异常如下：
```
java.lang.ClassNotFoundException: org.springframework.aop.interceptor
```
是因为aop的jar包冲突，需要将spring-ws-core的依赖去掉aop的引用，将以上的依赖修改如下:
```
<dependency>
    <groupId>org.springframework.ws</groupId>
    <artifactId>spring-ws-core</artifactId>
    <version>2.1.4.RELEASE</version>
    <exclusions>
        <exclusion>
            <groupId>org.springframework</groupId>
            <artifactId>spring-aop</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```
#### 2、application.xml中添加webservice配置
```
<bean id="webServiceTemplate" class="org.springframework.ws.client.core.WebServiceTemplate">
    <property name="defaultUri"
              value="http://testclock.bone/WebService/services/GWWS" />
</bean>
```
> 注意这里不定不能加`?wsdl`
否则会抛出一个异常如下：
```
Java Spring WS org.springframework.ws.soap.saaj.SaajSoapEnvelopeException: Could not access envelope
```
#### 3、如何调用webServiceTemplate
```
 public String getUserInfoResult(String username)throws UnsupportedEncodingException{
        String requestMessage = getUserInfo(username);
        System.out.println("参数:\r\n"+ requestMessage);
        StreamSource request_source = new StreamSource(new StringReader(requestMessage));
        ByteArrayOutputStream channel_out = new ByteArrayOutputStream();
        StreamResult response_result = new StreamResult(channel_out);
        webServiceTemplate.sendSourceAndReceiveToResult(request_source, response_result);
        String channel_content = channel_out.toString("UTF-8");
        System.out.println("结果:\r\n"+channel_content);
        return channel_content;
}
public String getUserInfo(String userAccount){
    String md5_element=Md5Util.Md5(userAccount).toLowerCase();
    md5_element=Md5Util.Md5(md5_element).toLowerCase();
    String MESSAGE =
            "<interfaceName xmlns=\"http://WSInterface.project.sin.com\">" +
                    "<parameter1>"+userAccount+"</parameter1>"+
                    "<parameter2>"+md5_element+"</parameter2>" +
                    "</interfaceName>";
    return MESSAGE;

}
```
得到返回报文可再解析

