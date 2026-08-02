import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type ContactRequest = {
  name?: unknown;
  email?: unknown;
  project?: unknown;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

    const { data, error } =
      await resend.emails.send({
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

        const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;

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
        console.error("Telegram notification error:", telegramError);
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