import { describe, it, expect } from "vitest";
import { MAX_QUERY_LENGTH, MAX_REQUESTS_PER_MINUTE } from "@/app/api/chat/route";

describe("Keamanan Chatbot & Proteksi Rate Limit", () => {
  it("harus memiliki batas panjang maksimum pertanyaan", () => {
    expect(MAX_QUERY_LENGTH).toBe(1000);
    expect(MAX_QUERY_LENGTH).toBeGreaterThan(0);
  });

  it("harus memiliki batas rate limit per menit per client IP", () => {
    expect(MAX_REQUESTS_PER_MINUTE).toBe(15);
  });

  it("harus mendeteksi teks pertanyaan yang melebihi batas 1000 karakter", () => {
    const longQuery = "a".repeat(1001);
    const isExceeded = longQuery.trim().length > MAX_QUERY_LENGTH;
    expect(isExceeded).toBe(true);

    const normalQuery = "Bagaimana cara mengatur suhu kandang closed house?";
    const isNormalExceeded = normalQuery.trim().length > MAX_QUERY_LENGTH;
    expect(isNormalExceeded).toBe(false);
  });
});
