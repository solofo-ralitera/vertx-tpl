package io.vertx.test;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Future;
import io.vertx.core.http.HttpHeaders;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.StaticHandler;
import io.vertx.ext.web.handler.sockjs.BridgeEventType;
import io.vertx.ext.web.handler.sockjs.BridgeOptions;
import io.vertx.ext.web.handler.sockjs.PermittedOptions;
import io.vertx.ext.web.handler.sockjs.SockJSHandler;
import io.vertx.ext.web.templ.ThymeleafTemplateEngine;


public class Socket extends AbstractVerticle {

    @Override
    public void start(final Future<Void> startFuture) {
        Router router = Router.router(vertx);

        final ThymeleafTemplateEngine engine = ThymeleafTemplateEngine.create();

        // Static file
        router.route("/templates/*").handler(StaticHandler.create("templates"));

        // EventBus
        SockJSHandler sockJSHandler = SockJSHandler.create(vertx);
        BridgeOptions options = new BridgeOptions()
                .addInboundPermitted(new PermittedOptions().setAddress("board-message"))
                .addOutboundPermitted(new PermittedOptions().setAddress("board-message"))
                .addInboundPermitted(new PermittedOptions().setAddress("board-language"))
                .addOutboundPermitted(new PermittedOptions().setAddress("board-language"))
                .addInboundPermitted(new PermittedOptions().setAddress("board-textselection"))
                .addOutboundPermitted(new PermittedOptions().setAddress("board-textselection"))
        ;
        sockJSHandler.bridge(options, event -> {
            if (event.type() == BridgeEventType.SOCKET_CREATED) {
                //System.out.println("A socket was created");
            }
            else if (event.type() == BridgeEventType.RECEIVE) {
                //System.out.println(event.socket().writeHandlerID());
            }
            event.complete(true);
        });
        router.route("/eventbus/*").handler(sockJSHandler);

        // Index
        router.route().pathRegex("/.*").handler((RoutingContext ctx) -> {
            ctx.put("path", ctx.request().path());
            String[] languages = {"none", "html", "javascript", "css", "json", "python", "php"};
            ctx.put("languages", languages);
            // change to templates/
            engine.render(ctx, "templates/", "index.html", res -> {
                if (res.succeeded()) {
                    ctx.response()
                            .putHeader(HttpHeaders.CONTENT_TYPE, "text/html")
                            .end(res.result());
                } else {
                    ctx.fail(res.cause());
                }
            });
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
