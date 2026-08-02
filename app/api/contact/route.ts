import { Resend } from "resend";

type ContactRequest = {
  name?: unknown;
  email?: unknown;
  project?: unknown;
  companyFax?: unknown;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;

const rateLimitStore = new Map<string, RateLimitEntry>();

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getClientIp(request: Request) {
  const forwardedFor =
    request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return request.headers.get("x-real-ip");
}

function checkRateLimit(ip: string | null) {
  if (!ip) {
    return {
      limited: false,
      retryAfter: 0,
    };
  }

  const now = Date.now();
  const existingEntry = rateLimitStore.get(ip);

  if (!existingEntry || existingEntry.resetAt <= now) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });

    return {
      limited: false,
      retryAfter: 0,
    };
  }

  if (existingEntry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      limited: true,
      retryAfter: Math.ceil(
        (existingEntry.resetAt - now) / 1000,
      ),
    };
  }

  existingEntry.count += 1;

  return {
    limited: false,
    retryAfter: 0,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactRequest;

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim()
        : "";

    const project =
      typeof body.project === "string"
        ? body.project.trim()
        : "";

    const companyFax =
  typeof body.companyFax === "string"
    ? body.companyFax.trim()
    : "";

    /*
     * Honeypot.
     * Реальный пользователь этого поля не видит.
     * Боту отвечаем успехом, но ничего не отправляем.
     */
    if (companyFax) {
  return Response.json({
    success: true,
  });
}

    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp);

    if (rateLimit.limited) {
      return Response.json(
        {
          error:
            "Too many messages. Please try again in a few minutes.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter),
          },
        },
      );
    }

    if (!name || !email || !project) {
      return Response.json(
        {
          error: "Please complete all fields.",
        },
        {
          status: 400,
        },
      );
    }

    if (!email.includes("@")) {
      return Response.json(
        {
          error: "Please enter a valid email address.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      name.length > 100 ||
      email.length > 320 ||
      project.length > 5000
    ) {
      return Response.json(
        {
          error: "One or more fields are too long.",
        },
        {
          status: 400,
        },
      );
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error("Missing RESEND_API_KEY");

      return Response.json(
        {
          error: "Email service is not configured.",
        },
        {
          status: 500,
        },
      );
    }

    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: "EZ Made <contact@mail.ezmade.pro>",
      to: ["eggrezgrigorev@gmail.com"],
      replyTo: email,
      subject: `New project enquiry from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
          <h1 style="font-size: 24px; margin-bottom: 24px;">
            New project enquiry
          </h1>

          <p>
            <strong>Name:</strong><br />
            ${escapeHtml(name)}
          </p>

          <p>
            <strong>Email:</strong><br />
            ${escapeHtml(email)}
          </p>

          <p>
            <strong>Project:</strong><br />
            ${escapeHtml(project).replaceAll("\n", "<br />")}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);

      return Response.json(
        {
          error: "Failed to send message.",
        },
        {
          status: 500,
        },
      );
    }

    const telegramBotToken =
      process.env.TELEGRAM_BOT_TOKEN;

    const telegramChatId =
      process.env.TELEGRAM_CHAT_ID;

    if (telegramBotToken && telegramChatId) {
      try {
        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: telegramChatId,
              text: [
                "New project enquiry",
                "",
                `Name: ${name}`,
                `Email: ${email}`,
                "",
                "Project:",
                project,
              ].join("\n"),
            }),
          },
        );

        if (!telegramResponse.ok) {
          console.error(
            "Telegram error:",
            telegramResponse.status,
            await telegramResponse.text(),
          );
        }
      } catch (telegramError) {
        console.error(
          "Telegram notification error:",
          telegramError,
        );
      }
    }

    return Response.json({
      success: true,
      id: data?.id,
    });
  } catch (error) {
    console.error("Contact route error:", error);

    return Response.json(
      {
        error: "Something went wrong.",
      },
      {
        status: 500,
      },
    );
  }
}