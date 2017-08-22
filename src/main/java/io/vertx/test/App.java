package io.vertx.test;

import io.vertx.core.AbstractVerticle;

public class App extends AbstractVerticle {

    @Override
    public void start() {

        // Port 4000
        vertx.deployVerticle(VerticleJavaSample.class.getCanonicalName());
        // Port 4001
        vertx.deployVerticle(KotlinSample.class.getCanonicalName());
        // Port 4002
        vertx.deployVerticle(Socket.class.getCanonicalName());
        // Port 4003
        vertx.deployVerticle(Mongo.class.getCanonicalName());

    }
}
