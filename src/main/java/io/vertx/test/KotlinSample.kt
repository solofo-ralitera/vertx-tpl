package io.vertx.test

import io.vertx.core.AbstractVerticle
import io.vertx.ext.web.Router


class KotlinSample : AbstractVerticle() {
    override fun start(){
        val router = Router.router(vertx)

        router.get("/").handler { it.response().end("Hello Kotlin!") }

        vertx.createHttpServer().requestHandler { router.accept(it) }.listen(4001) {
            if (it.succeeded()) println("Server listening at 4001")
            else println(it.cause())
        }

        // vertx.eventBus().publish("test-channel","hello world")
    }
}