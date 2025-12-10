import type { EntryContext } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { PassThrough } from "stream";
import * as isbot from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { Readable } from "stream";

const ABORT_DELAY = 5000;

function nodeStreamToWeb(stream: Readable) {
  return new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => controller.enqueue(chunk));
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    },
  });
}

export default function handleRequest(
  request: Request,
  status: number,
  headers: Headers,
  context: EntryContext
) {
  const ua = request.headers.get("user-agent") || "";
  const callbackName = isbot.isbot(ua) ? "onAllReady" : "onShellReady";

  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={context} url={request.url} />,
      {
        [callbackName]: () => {
          const body = new PassThrough();
          headers.set("Content-Type", "text/html");

          const webStream = nodeStreamToWeb(body);

          resolve(
            new Response(webStream, {
              status: didError ? 500 : status,
              headers,
            })
          );

          pipe(body);
        },
        onShellError(err: unknown) {
          reject(err);
        },
        onError(error: unknown) {
          didError = true;
          console.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
