import { describe, it, expect, vi } from "vitest";
import {
  BaseComClient,
  BaseLinkerApiError,
  ReadOnlyViolationError,
} from "./client";

describe("BaseComClient (Strict Read-Only & Official API Specification)", () => {
  const dummyToken = "test_bl_token_12345";

  it("blokuje wszelkie próby wykonania metod modyfikujących / niedozwolonych (Read-Only Enforcement)", async () => {
    const client = new BaseComClient({ token: dummyToken });

    // Destructive methods must immediately throw ReadOnlyViolationError
    await expect(client.callMethod("setOrderFields", {})).rejects.toThrow(
      ReadOnlyViolationError
    );
    await expect(client.callMethod("addOrder", {})).rejects.toThrow(
      ReadOnlyViolationError
    );
    await expect(client.callMethod("deleteProduct", {})).rejects.toThrow(
      ReadOnlyViolationError
    );
    await expect(client.callMethod("setInventoryProductStock", {})).rejects.toThrow(
      ReadOnlyViolationError
    );
  });

  it("wysyła nagłówek X-BLToken oraz method/parameters zgodnie ze specyfikacją connector.php", async () => {
    let capturedHeaders: Record<string, string> = {};
    let capturedBody = "";

    const mockFetch = vi.fn().mockImplementation(async (url, init) => {
      capturedHeaders = init.headers;
      capturedBody = init.body;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          status: "SUCCESS",
          inventories: [{ inventory_id: 1, name: "Katalog główny" }],
        }),
      };
    });

    const client = new BaseComClient({
      token: dummyToken,
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    const result = await client.getInventories();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Katalog główny");

    expect(capturedHeaders["X-BLToken"]).toBe(dummyToken);
    expect(capturedHeaders["Content-Type"]).toBe(
      "application/x-www-form-urlencoded"
    );

    const bodyParams = new URLSearchParams(capturedBody);
    expect(bodyParams.get("method")).toBe("getInventories");
    expect(bodyParams.get("parameters")).toBe("{}");
  });

  it("rzuca BaseLinkerApiError, gdy Base.com zwróci status ERROR", async () => {
    const mockFetch = vi.fn().mockImplementation(async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          status: "ERROR",
          error_code: "ERROR_AUTH",
          error_message: "No user token provided or token expired",
        }),
      };
    });

    const client = new BaseComClient({
      token: dummyToken,
      fetchFn: mockFetch as unknown as typeof fetch,
    });

    await expect(client.getInventories()).rejects.toThrow(BaseLinkerApiError);
  });
});
