package io.vertx.test;

import io.vertx.core.AbstractVerticle;

public class App extends AbstractVerticle {

    @Override
    public void start() {

        // Deploy sample verticle
        vertx.deployVerticle(Socket.class.getCanonicalName());

    }
}
