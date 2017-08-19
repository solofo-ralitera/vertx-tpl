package io.vertx.test;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Future;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;

public class VerticleJavaSample extends AbstractVerticle {

    @Override
    public void start(final Future<Void> startFuture) {
        Router router = Router.router(vertx);

        router.get("/").handler((RoutingContext req) -> req.response().end("Hello world!"));

        vertx
                .createHttpServer()
                .requestHandler(router::accept)
                .listen(4000, res -> {
                    if (res.succeeded()) {
                        System.out.println(this.getClass().getName() + " deployed successfully");
                        startFuture.complete();
                    } else {
                        System.out.println(this.getClass().getName() + " deployement failed");
                        startFuture.fail(res.cause());
                    }
                });
    }
}
