import fs from "fs";
import path from "path";

const repoRoot = path.resolve(__dirname, "../..");

describe("DM21 frontend routing law", () => {
  test("root law assigns DM21 to frontend and DM02 to backend", () => {
    const law = fs.readFileSync(path.join(repoRoot, "AGENTS.md"), "utf8");

    expect(law).toContain("DM21 owns this repo");
    expect(law).toContain("DM02/Taksha owns backend architecture");
    expect(law).toContain("/api/dm21/security");
    expect(law).toContain("/api/dm02/security");
  });

  test("security badge copy does not assert certifications", () => {
    const source = fs.readFileSync(path.join(repoRoot, "components/splash-screen-security.tsx"), "utf8");

    expect(source).not.toContain('label: "SOC 2 TYPE II"');
    expect(source).not.toContain('label: "ISO 27001"');
    expect(source).toContain('label: "SOC 2-STYLE CONTROLS"');
    expect(source).toContain('label: "GDPR PRIVACY GATES"');
  });

  test("frontend proxy routes consume DM02 backend security endpoints", () => {
    const postureRoute = fs.readFileSync(path.join(repoRoot, "app/api/dm21/security/route.ts"), "utf8");
    const exposureRoute = fs.readFileSync(path.join(repoRoot, "app/api/dm21/security/exposure/route.ts"), "utf8");

    expect(postureRoute).toContain("/api/dm02/security/posture");
    expect(exposureRoute).toContain("/api/dm02/security/exposure/evaluate");
  });
});
