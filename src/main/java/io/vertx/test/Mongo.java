package io.vertx.test;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.http.HttpServer;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;

import java.util.ArrayList;
import java.util.List;


public class Mongo extends AbstractVerticle
{
    private MongoClient mongoClient;
    private static final String COLLECTION_DB = "vertx_test";
    private static final String COLLECTION_BOOK = "books";

    @Override
    public void start(Future<Void> startFuture) {
        // Create a Mongo client
        mongoClient = MongoClient.createShared(vertx, new JsonObject()
                .put("connection_string", "mongodb://localhost:27017")
                .put("db_name", COLLECTION_DB)
        );

        final Router router = Router.router(vertx);

        router.get("/mongo").handler((RoutingContext req) -> req.response().end("Testing mongo"));

        // List all collection
        router.get("/mongo/books").handler((RoutingContext routingContext) -> mongoClient.find(COLLECTION_BOOK, new JsonObject(), results -> {
            List<JsonObject> books = new ArrayList<>(results.result());
            routingContext.response()
                    .putHeader("content-type", "application/json; charset=utf-8")
                    .end(Json.encodePrettily(books));
        }));

        // Add item
        router.post("/mongo/books").handler((RoutingContext routingContext) -> {
            JsonObject document = new JsonObject()
                    .put("title", "The Hobbit");
            mongoClient.save(COLLECTION_BOOK, document, res -> {
                if (res.succeeded()) {
                    String id = res.result();
                    routingContext.response().end("Saved book with id " + id);
                } else {
                    routingContext.response().end("Saved book with error " + res.cause().getMessage());
                }
            });
        });

        // Remove item
        router.delete("/mongo/books/:id").handler((RoutingContext routingContext) -> {
            String id = routingContext.request().getParam("id");
            if(id != null) {
                mongoClient.removeDocument(
                        COLLECTION_BOOK,
                        new JsonObject().put("_id", id),
                        ar -> routingContext.response().setStatusCode(204).end()
                );
            }else {
                routingContext.response().setStatusCode(404).end("Books not found");
            }
        });


        vertx
                .createHttpServer()
                .requestHandler(router::accept)
                .listen(4003, (AsyncResult<HttpServer> result) -> {
                    if (result.succeeded()) {
                        startFuture.complete();
                    } else {
                        startFuture.fail(result.cause());
                    }
                });
    }

}