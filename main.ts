import { ConnInfo, serve } from "https://deno.land/std@0.195.0/http/server.ts";

const handler = async (
  request: Request,
  connInfo: ConnInfo
): Promise<Response> => {
  const path = request.url.split("://")[1].split("/")[1];
  console.log(`New request: ${path}`);

  await Promise.resolve();

  switch (path) {
    case "signup": {
      if (connInfo.remoteAddr.transport === "tcp") {
        if (connInfo.remoteAddr.hostname !== Deno.env.get("AUTHENTIK_IP")) {
          console.log("Request not from Authentik");
          return new Response("not authentik");
        }
      } else {
        console.log("Request not TCP");
        return new Response("not tcp");
      }

      const { username, ssh }: { username: string; ssh: string } =
        await request.json();

      const passwdCommand = new Deno.Command("getent", {
        args: ["passwd"],
      });
      const { passwdStdout } = await passwdCommand.output();
      const passwd = new TextDecoder().decode(passwdStdout);
      if (passwd.includes(username)) {
        console.log(`Username ${username} already exists`);
        return new Response("user exists");
      }

      console.log(`Creating user ${username}`);
      const createCommand = new Deno.Command("./create.sh", {
        args: [username, ssh],
      });

      const { code } = await createCommand.output();
      if (code !== 0) {
        console.log(
          `Failed to create user ${username}, script exited with code ${code}`
        );
      }

      console.log(`Created user ${username}`);
      return new Response("signup");
    }
    case "users":
      return new Response("users");
    default:
      return new Response("default");
  }
};

serve(handler, { port: 3000 });
