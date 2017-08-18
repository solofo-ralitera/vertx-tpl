package io.vertx.test;

import io.vertx.core.AbstractVerticle;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.StaticHandler;

public class App extends AbstractVerticle {

    @Override
    public void start() {
        Router router = Router.router(vertx);

        router.get("/").handler((RoutingContext req) -> req.response().end("Hello world!"));

        vertx
                .createHttpServer()
                .requestHandler(router::accept)
                .listen(4000);
    }
}
