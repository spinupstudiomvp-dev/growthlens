import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Store audit
http.route({
  path: "/api/store-audit",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.json();
    const id = await ctx.runMutation(api.audits.store, body);
    return new Response(JSON.stringify({ id }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }),
});

// Get audit by ID
http.route({
  path: "/api/get-audit",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return new Response("Missing id", { status: 400 });
    const audit = await ctx.runQuery(api.audits.getById, { id: id as any });
    if (!audit) return new Response("Not found", { status: 404 });
    return new Response(JSON.stringify(audit), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }),
});

// List audits
http.route({
  path: "/api/list-audits",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const audits = await ctx.runQuery(api.audits.list, { limit });
    return new Response(JSON.stringify(audits), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }),
});

// Store comparison
http.route({
  path: "/api/store-comparison",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.json();
    const id = await ctx.runMutation(api.comparisons.store, body);
    return new Response(JSON.stringify({ id }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }),
});

// Get comparison by ID
http.route({
  path: "/api/get-comparison",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return new Response("Missing id", { status: 400 });
    const comp = await ctx.runQuery(api.comparisons.getById, { id: id as any });
    if (!comp) return new Response("Not found", { status: 404 });
    return new Response(JSON.stringify(comp), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }),
});

// List comparisons
http.route({
  path: "/api/list-comparisons",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const comps = await ctx.runQuery(api.comparisons.list, { limit });
    return new Response(JSON.stringify(comps), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }),
});

// CORS preflight
http.route({
  path: "/api/store-audit",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, {
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type" },
  })),
});

http.route({
  path: "/api/store-comparison",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, {
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type" },
  })),
});

export default http;
