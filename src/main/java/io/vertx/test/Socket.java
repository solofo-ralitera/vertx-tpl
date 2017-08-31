package io.vertx.test;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Future;
import io.vertx.core.eventbus.SendContext;
import io.vertx.core.http.HttpHeaders;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.StaticHandler;
import io.vertx.ext.web.handler.sockjs.BridgeEventType;
import io.vertx.ext.web.handler.sockjs.BridgeOptions;
import io.vertx.ext.web.handler.sockjs.PermittedOptions;
import io.vertx.ext.web.handler.sockjs.SockJSHandler;
import io.vertx.ext.web.templ.ThymeleafTemplateEngine;

import java.util.HashMap;
import java.util.Map;


public class Socket extends AbstractVerticle {
    private Map<String, String> Msg_LastMessage = new HashMap<>();
    private Map<String, String> Msg_CurrentLanguage = new HashMap<>();
    private Map<String, String> Msg_TextSelection = new HashMap<>();

    @Override
    public void start(final Future<Void> startFuture) {
        Router router = Router.router(vertx);

        final ThymeleafTemplateEngine engine = ThymeleafTemplateEngine.create();

        // Static file
        router.route("/templates/*").handler(StaticHandler.create("templates"));

        // EventBus
        vertx.eventBus().addInterceptor((SendContext ctx) -> {
            String address = ctx.message().address();
            String key = address.substring(address.lastIndexOf('-') + 1);
            if(address.startsWith("board-message")) {
                Msg_LastMessage.put(key, ctx.message().body().toString());
            }
            else if(address.startsWith("board-language")) {
                Msg_CurrentLanguage.put(key, ctx.message().body().toString());
            }
            else if(address.startsWith("board-textselection")) {
                Msg_TextSelection.put(key, ctx.message().body().toString());
            }
            ctx.next();
        });

        SockJSHandler sockJSHandler = SockJSHandler.create(vertx);
        BridgeOptions options = new BridgeOptions()
                .addInboundPermitted(new PermittedOptions().setAddressRegex("board\\-(.{0,})"))
                .addOutboundPermitted(new PermittedOptions().setAddressRegex("board\\-(.{0,})"));

        sockJSHandler.bridge(options, event -> {
            if (event.type() == BridgeEventType.SOCKET_CREATED) {
                String key = event.socket().uri().split("/")[2].replace("-", "");
                event.socket().write(new JsonObject()
                        .put("address", "board-newconnection")
                        .put("body", "init board")
                        .put("lastmessage", Msg_LastMessage.getOrDefault(key, ""))
                        .put("language", Msg_CurrentLanguage.getOrDefault(key, ""))
                        .put("textselection", Msg_TextSelection.getOrDefault(key, ""))
                        .encode()
                );
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
