import { describe, expect, it } from "vitest";

import { landingTarget } from "./landing-route";

describe("landingTarget", () => {
  it("serves the landing page on the www host", () => {
    expect(landingTarget(new URL("https://www.evchargeops.com.br/"))).toEqual({
      rewrite: "https://www.evchargeops.com.br/landing/index.html",
    });
    expect(
      landingTarget(
        new URL("https://www.evchargeops.com.br/assets/css/site.css"),
      ),
    ).toEqual({
      rewrite: "https://www.evchargeops.com.br/landing/assets/css/site.css",
    });
  });

  it("redirects the apex domain to www", () => {
    expect(landingTarget(new URL("https://evchargeops.com.br/?a=1"))).toEqual({
      redirect: "https://www.evchargeops.com.br/?a=1",
    });
  });

  it("leaves the portal host untouched", () => {
    expect(
      landingTarget(new URL("https://app.evchargeops.com.br/login")),
    ).toBeNull();
  });
});
