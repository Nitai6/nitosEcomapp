# Code Templates - WhatsApp Integration

## 1. Webhook Signature Verification

```typescript
import { createHmac, timingSafeEqual } from "crypto";

export function verifyMetaSignature(
  rawBody: string | Buffer,
  signature: string | null,
  appSecret: string
): boolean {
  if (!signature) return false;

  const expectedSig = createHmac("sha256", appSecret)
    .update(typeof rawBody === "string" ? rawBody : rawBody)
    .digest("hex");

  const providedSig = signature.replace("sha256=", "");

  if (expectedSig.length !== providedSig.length) return false;

  return timingSafeEqual(
    Buffer.from(expectedSig, "hex"),
    Buffer.from(providedSig, "hex")
  );
}
```

## 2. Webhook Handler (Next.js App Router)

```typescript
import { NextResponse } from "next/server";
import { verifyMetaSignature } from "@/lib/webhooks/verify-signature";

// GET - Webhook verification
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST - Process webhook events
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    if (!verifyMetaSignature(rawBody, signature, process.env.FACEBOOK_APP_SECRET!)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ error: "Unknown object" }, { status: 400 });
    }

    // Process entries
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;
        const field = change.field;

        switch (field) {
          case "messages":
            // Handle incoming messages
            if (value.messages) {
              for (const message of value.messages) {
                await handleIncomingMessage(message, value.metadata, value.contacts);
              }
            }
            // Handle status updates
            if (value.statuses) {
              for (const status of value.statuses) {
                await handleStatusUpdate(status);
              }
            }
            break;

          case "message_template_status_update":
            await handleTemplateStatusUpdate(value);
            break;

          case "account_update":
            await handleAccountUpdate(value);
            break;

          case "phone_number_quality_update":
            await handleQualityUpdate(value);
            break;

          case "phone_number_name_update":
            await handleNameUpdate(value);
            break;
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json({ status: "ok" }); // Always return 200 to avoid retries
  }
}
```

## 3. WhatsApp Cloud API Client

```typescript
const GRAPH_API_BASE_URL = "https://graph.facebook.com/v24.0";

export class WhatsAppClient {
  private phoneNumberId: string;
  private accessToken: string;

  constructor(phoneNumberId: string, accessToken: string) {
    this.phoneNumberId = phoneNumberId;
    this.accessToken = accessToken;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${GRAPH_API_BASE_URL}/${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "API request failed");
    }
    return data;
  }

  // Send text message
  async sendTextMessage(to: string, text: string) {
    return this.request(`${this.phoneNumberId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body: text },
      }),
    });
  }

  // Send template message
  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string,
    components?: any[]
  ) {
    return this.request(`${this.phoneNumberId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components,
        },
      }),
    });
  }

  // Send media message
  async sendMediaMessage(
    to: string,
    type: "image" | "video" | "audio" | "document",
    mediaUrl: string,
    caption?: string
  ) {
    return this.request(`${this.phoneNumberId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type,
        [type]: {
          link: mediaUrl,
          ...(caption && { caption }),
        },
      }),
    });
  }

  // Mark message as read
  async markAsRead(messageId: string) {
    return this.request(`${this.phoneNumberId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      }),
    });
  }

  // Set two-step verification PIN
  async setTwoStepPin(pin: string) {
    return this.request(this.phoneNumberId, {
      method: "POST",
      body: JSON.stringify({ pin }),
    });
  }

  // Remove two-step verification PIN
  async removeTwoStepPin() {
    return this.request(this.phoneNumberId, {
      method: "POST",
      body: JSON.stringify({ pin: "" }),
    });
  }

  // Get business profile
  async getProfile() {
    return this.request(
      `${this.phoneNumberId}/whatsapp_business_profile?fields=about,address,description,email,profile_picture_url,websites,vertical`
    );
  }

  // Update business profile
  async updateProfile(data: Record<string, any>) {
    return this.request(`${this.phoneNumberId}/whatsapp_business_profile`, {
      method: "POST",
      body: JSON.stringify({
        messaging_product: "whatsapp",
        ...data,
      }),
    });
  }
}
```

## 4. Token Encryption (AES-256-GCM)

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

export function encryptToken(plaintext: string): string {
  const key = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY!, "hex");
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decryptToken(ciphertext: string): string {
  const key = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY!, "hex");
  const [ivHex, authTagHex, encrypted] = ciphertext.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
```

## 5. Data Deletion Callback

```typescript
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.formData();
    const signedRequest = body.get("signed_request") as string;

    if (!signedRequest) {
      return NextResponse.json({ error: "Missing signed_request" }, { status: 400 });
    }

    const [encodedSig, payload] = signedRequest.split(".");
    const sig = Buffer.from(encodedSig.replace(/-/g, "+").replace(/_/g, "/"), "base64");
    const data = JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
    );

    // Verify signature
    const expectedSig = crypto
      .createHmac("sha256", process.env.FACEBOOK_APP_SECRET!)
      .update(payload)
      .digest();

    if (!crypto.timingSafeEqual(sig, expectedSig)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const userId = data.user_id;
    const confirmationCode = crypto.randomUUID();

    // TODO: Delete all data for this Facebook user ID
    // - Search integration_tokens by metadata.facebook_user_id
    // - Delete matching records
    // - Log to audit_logs

    return NextResponse.json({
      url: `https://yourdomain.com/api/webhooks/meta/data-deletion?id=${confirmationCode}`,
      confirmation_code: confirmationCode,
    });
  } catch (error) {
    console.error("[Data Deletion] Error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

// GET - Check deletion status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing confirmation ID" }, { status: 400 });
  }

  // TODO: Look up deletion request by confirmation code
  return NextResponse.json({
    id,
    status: "completed",
    message: "All user data has been deleted",
  });
}
```

## 6. Deauthorization Callback

```typescript
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let userId: string | undefined;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const body = await request.formData();
      const signedRequest = body.get("signed_request") as string;

      if (signedRequest) {
        const [, payload] = signedRequest.split(".");
        const data = JSON.parse(
          Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
        );
        userId = data.user_id;
      }
    } else {
      const body = await request.json();
      userId = body.user_id;
    }

    if (!userId) {
      return NextResponse.json({ error: "No user ID" }, { status: 400 });
    }

    // TODO: Revoke all tokens for this user
    // - Find integration_tokens by metadata.facebook_user_id
    // - Delete matching records
    // - Log to audit_logs

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Deauthorize] Error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
```

## 7. Embedded Signup - Server (Token Exchange)

```typescript
import { NextResponse } from "next/server";
import { encryptToken } from "@/lib/crypto/tokens";

const GRAPH_API = "https://graph.facebook.com/v24.0";

export async function POST(request: Request) {
  try {
    // TODO: Verify user is authenticated and is tenant_admin

    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ message: "Missing code" }, { status: 400 });
    }

    const appId = process.env.FACEBOOK_APP_ID!;
    const appSecret = process.env.FACEBOOK_APP_SECRET!;

    // Step 1: Exchange code for access token
    const tokenRes = await fetch(
      `${GRAPH_API}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}`
    );
    const tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error.message);

    const accessToken = tokenData.access_token;

    // Step 2: Debug token to find WABA ID
    const debugRes = await fetch(
      `${GRAPH_API}/debug_token?input_token=${accessToken}&access_token=${appId}|${appSecret}`
    );
    const debugData = await debugRes.json();

    const granularScopes = debugData?.data?.granular_scopes || [];
    const wabaScope = granularScopes.find(
      (s: any) => s.scope === "whatsapp_business_management" || s.scope === "whatsapp_business_messaging"
    );
    const wabaId = wabaScope?.target_ids?.[0];

    if (!wabaId) {
      return NextResponse.json({ message: "No WABA found" }, { status: 400 });
    }

    // Step 3: Fetch phone numbers
    const phonesRes = await fetch(
      `${GRAPH_API}/${wabaId}/phone_numbers?access_token=${accessToken}`
    );
    const phonesData = await phonesRes.json();

    if (!phonesData.data?.length) {
      return NextResponse.json({ message: "No phone numbers found" }, { status: 400 });
    }

    const phone = phonesData.data[0];

    // Step 4: Store encrypted token and config
    const encryptedToken = encryptToken(accessToken);
    const webhookVerifyToken = crypto.randomUUID();

    // TODO: Store in database:
    // {
    //   tenant_id, phone_number: phone.display_phone_number,
    //   phone_number_id: phone.id, business_account_id: wabaId,
    //   access_token: encryptedToken, webhook_verify_token: webhookVerifyToken,
    //   app_id: appId, status: "active"
    // }

    return NextResponse.json({
      success: true,
      phone_number: phone.display_phone_number,
      business_account_id: wabaId,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
```

## 8. Embedded Signup - Client Component

```tsx
"use client";

import { useState, useCallback, useEffect } from "react";

declare global {
  interface Window {
    FB?: {
      init: (params: Record<string, unknown>) => void;
      login: (callback: (response: any) => void, options: Record<string, unknown>) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export default function EmbeddedSignup() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

  useEffect(() => {
    if (!appId || window.FB) {
      if (window.FB) setSdkLoaded(true);
      return;
    }

    window.fbAsyncInit = () => {
      window.FB!.init({ appId, cookie: true, xfbml: false, version: "v24.0" });
      setSdkLoaded(true);
    };

    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [appId]);

  const handleSignup = useCallback(() => {
    if (!window.FB) return;
    setIsConnecting(true);

    window.FB.login(
      (response: any) => {
        if (response.authResponse?.code) {
          fetch("/api/tenant/whatsapp/embedded-signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: response.authResponse.code }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                // Success! Refresh or redirect
              } else {
                // Show error
              }
            })
            .finally(() => setIsConnecting(false));
        } else {
          setIsConnecting(false);
        }
      },
      {
        config_id: process.env.NEXT_PUBLIC_FB_LOGIN_CONFIG_ID || "",
        response_type: "code",
        override_default_response_type: true,
        extras: { setup: {}, featureType: "", sessionInfoVersion: 2 },
      }
    );
  }, []);

  if (!appId) return null;

  return (
    <button onClick={handleSignup} disabled={isConnecting || !sdkLoaded}>
      {isConnecting ? "Connecting..." : "Connect WhatsApp"}
    </button>
  );
}
```

## 9. Meta Error Code Map

```typescript
export const META_ERROR_CODES: Record<number, {
  title: string;
  message: string;
  retryable: boolean;
  action: string;
}> = {
  130429: { title: "Rate Limit", message: "Too many messages sent", retryable: true, action: "Wait and retry" },
  131031: { title: "Account Locked", message: "Business account is locked", retryable: false, action: "Check account status" },
  131047: { title: "Re-engagement Required", message: "24-hour window expired", retryable: false, action: "Use template message" },
  131048: { title: "Spam Rate Limit", message: "Too many spam reports", retryable: false, action: "Review message quality" },
  131026: { title: "Not on WhatsApp", message: "Recipient not on WhatsApp", retryable: false, action: "Verify phone number" },
  131021: { title: "Not WhatsApp User", message: "Number not registered", retryable: false, action: "Remove from list" },
  132000: { title: "Template Missing Params", message: "Template parameter count mismatch", retryable: false, action: "Fix template params" },
  132001: { title: "Template Not Found", message: "Template does not exist", retryable: false, action: "Check template name" },
  132005: { title: "Template Hydration Error", message: "Template variable error", retryable: false, action: "Fix variable values" },
  132007: { title: "Template Format Error", message: "Template format mismatch", retryable: false, action: "Match format to template" },
  132012: { title: "Template Paused", message: "Template is paused", retryable: false, action: "Resume or use different template" },
  132015: { title: "Template Disabled", message: "Template was disabled", retryable: false, action: "Create new template" },
  131000: { title: "Server Error", message: "WhatsApp service temporarily unavailable", retryable: true, action: "Retry after delay" },
  131005: { title: "Access Denied", message: "Permission denied for this action", retryable: false, action: "Check token permissions" },
  131009: { title: "Invalid Parameter", message: "Request has invalid parameters", retryable: false, action: "Fix request params" },
  131016: { title: "Service Unavailable", message: "Service temporarily down", retryable: true, action: "Retry after delay" },
  131053: { title: "Media Upload Failed", message: "Media could not be uploaded", retryable: true, action: "Retry upload" },
  131056: { title: "Business Rate Limit", message: "Too many messages to this number", retryable: true, action: "Wait and retry" },
  133010: { title: "Phone Registered", message: "Number already registered elsewhere", retryable: false, action: "Deregister first" },
  136025: { title: "2FA Required", message: "Two-step verification PIN needed", retryable: false, action: "Provide PIN" },
};
```
