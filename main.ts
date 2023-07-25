import { serve } from "https://deno.land/std@0.195.0/http/server.ts";

const handler = async (request: Request): Promise<Response> => {
  const path = request.url.split("://")[1].split("/")[1];
  console.log(path);

  await Promise.resolve();

  switch (path) {
    case "signup":
      return new Response("signup");
    case "users":
      return new Response("users");
    default:
      return new Response("default");
  }
};

serve(handler);
