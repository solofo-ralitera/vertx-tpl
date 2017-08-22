package io.vertx.test;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Future;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.templ.ThymeleafTemplateEngine;


public class Socket extends AbstractVerticle {

    @Override
    public void start(final Future<Void> startFuture) {
        Router router = Router.router(vertx);

        router.get("/socket").handler((RoutingContext req) -> {
            req.response().end("Hello world!");
        });

        vertx
                .createHttpServer()
                .requestHandler(router::accept)
                .listen(4002, res -> {
                    if (res.succeeded()) {
                        startFuture.complete();
                    } else {
                        startFuture.fail(res.cause());
                    }
                });
    }
}
