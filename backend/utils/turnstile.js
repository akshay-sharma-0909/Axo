import "dotenv/config";

// -----------------------------------
// Verify Cloudflare Turnstile
// -----------------------------------

const verifyTurnstile = async (token, remoteIp) => {
  try {
    // Check token
    if (!token) {
      return {
        success: false,
        errorCodes: ["missing-input-response"],
      };
    }

    // Get secret key
    const secretKey =
      process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

    // Debug - do NOT print the actual secret
    console.log(
      "CLOUDFLARE_TURNSTILE_SECRET_KEY loaded:",
      !!secretKey
    );

    console.log(
      "Secret length:",
      secretKey?.length
    );

    // Check secret key
    if (!secretKey) {
      console.error(
        "CLOUDFLARE_TURNSTILE_SECRET_KEY is not configured"
      );

      return {
        success: false,
        errorCodes: ["server-configuration-error"],
      };
    }

    // Prepare request body
    const body = new URLSearchParams({
      secret: secretKey,
      response: token,
    });

    // remoteip is optional
    if (remoteIp) {
      body.append("remoteip", remoteIp);
    }

    // Send token to Cloudflare
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body,
      }
    );

    // Check HTTP status
    if (!response.ok) {
      console.error(
        "Turnstile API error:",
        response.status,
        response.statusText
      );

      return {
        success: false,
        errorCodes: ["turnstile-request-failed"],
      };
    }

    // Parse Cloudflare response
    const result = await response.json();

    console.log("Turnstile result:", result);

    // Verification failed
    if (!result.success) {
      return {
        success: false,
        errorCodes: result["error-codes"] || [],
      };
    }

    // Verification successful
    return {
      success: true,
      errorCodes: [],
    };
  } catch (error) {
    console.error(
      "Turnstile verification error:",
      error
    );

    return {
      success: false,
      errorCodes: ["turnstile-request-failed"],
    };
  }
};

export default verifyTurnstile;
