import {
  isIngestionAdapter,
  parseIngestionAdapter,
} from "./source-adapters.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function equal<T>(actual: T, expected: T, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

function expectThrows(run: () => unknown, expectedMessage: string) {
  let thrown: unknown;
  try {
    run();
  } catch (error) {
    thrown = error;
  }
  assert(thrown instanceof Error, `Expected an error containing "${expectedMessage}"`);
  assert(thrown.message.includes(expectedMessage), `Unexpected error: ${thrown.message}`);
}

Deno.test("adapter registry only accepts known source-specific parsers", () => {
  assert(isIngestionAdapter("feni_official_html"), "official adapter should be registered");
  assert(isIngestionAdapter("health_registry_html"), "health adapter should be registered");
  assert(isIngestionAdapter("smartfeni_partner_json"), "Smart Feni partner adapter should be registered");
  assert(!isIngestionAdapter("generic_html"), "generic HTML should stay on the legacy path");
  assert(!isIngestionAdapter("arbitrary_code"), "unknown parser must never be executed");
});

Deno.test("official Feni adapter stages text and only same-host links", () => {
  const sourceUrl = "https://feni.gov.bd/en";
  const html = `<!doctype html>
    <html><head><title>Feni District</title></head>
    <body>
      <header><a href="/en">Home</a></header>
      <main>
        <h1>Feni District Administration</h1>
        <p>Official public information and citizen services for Feni district.</p>
        <a href="/pages/tourist-spot">Tourist spots</a>
        <a href="https://example.net/collect">External Link</a>
      </main>
    </body></html>`;
  const snapshot = parseIngestionAdapter("feni_official_html", html, sourceUrl);
  equal(snapshot.review_required, true, "official data must still enter review");
  assert(snapshot.page_title.includes("Feni District"), "official page title should be extracted");
  assert(snapshot.excerpt.includes("citizen services"), "main page text should be extracted");
  assert(snapshot.discovery_links.some((item) => item.url === "https://feni.gov.bd/pages/tourist-spot"), "same-host discovery link should be retained");
  assert(!snapshot.discovery_links.some((item) => item.url.includes("example.net")), "cross-host links must be excluded");
  assert(snapshot.record_count > 0, "record count should describe staged headings/links");
});

Deno.test("directory adapter stages JSON-LD records and candidate links without contacts", () => {
  const sourceUrl = "https://bizhubfeni.com/";
  const html = `<html><head><title>BizHub Feni</title>
      <script type="application/ld+json">
      {"@context":"https://schema.org","@type":"LocalBusiness","name":"Example Pharmacy","url":"https://bizhubfeni.com/business/example-pharmacy","telephone":"+8801000000000","address":{"addressLocality":"Feni"}}
      </script>
    </head><body><main>
      <h1>Feni Business Directory</h1>
      <a href="/business/example-pharmacy">Example Pharmacy</a>
      <a href="/about">About</a>
    </main></body></html>`;
  const snapshot = parseIngestionAdapter("bizhub_feni_html", html, sourceUrl);
  assert(snapshot.items.some((item) => item.name === "Example Pharmacy"), "JSON-LD business should be discovered");
  assert(snapshot.items.every((item) => !("telephone" in item) && !("phone" in item) && !("email" in item)), "contact fields must not be copied");
  assert(snapshot.discovery_links.every((link) => new URL(link.url).hostname === "bizhubfeni.com"), "only source-host listing links are allowed");
  assert(snapshot.review_required, "directory facts must require verification");
});

Deno.test("health adapter keeps only explicitly Feni facility rows", () => {
  const sourceUrl = "https://hris.mohfw.gov.bd/public/facility-registry/reports/organization-list";
  const html = `<html><head><title>Public Facility Registry</title></head><body>
    <h1>Organization List</h1>
    <table>
      <tr><th>ID</th><th>Name</th><th>Name (Bangla)</th><th>Code</th><th>Type</th><th>Division</th><th>District</th><th>Upazila</th><th>Phone</th></tr>
      <tr><td>101</td><td>Feni Sadar Health Complex</td><td>ফেনী সদর স্বাস্থ্য কমপ্লেক্স</td><td>FENI-101</td><td>Hospital</td><td>Chattogram</td><td>Feni</td><td>Feni Sadar</td><td>0123456789</td></tr>
      <tr><td>202</td><td>Dhaka Example Clinic</td><td>ঢাকা উদাহরণ ক্লিনিক</td><td>DHA-202</td><td>Clinic</td><td>Dhaka</td><td>Dhaka</td><td>Dhaka</td><td>0199999999</td></tr>
    </table>
  </body></html>`;
  const snapshot = parseIngestionAdapter("health_registry_html", html, sourceUrl);
  equal(snapshot.record_count, 1, "only Feni row should survive the geographic filter");
  equal(snapshot.items[0].name, "Feni Sadar Health Complex", "Feni facility name should be retained");
  equal(snapshot.items[0].district, "Feni", "canonical district label should be Feni");
  assert(!JSON.stringify(snapshot).includes("0123456789"), "personal/public contact fields are not copied into review snapshots");
  assert(snapshot.review_required, "health facts require human verification");

  const noFeniRows = html.replace(/<tr><td>101[\\s\\S]*?<\\/tr>/, "").replace("Feni Sadar Health Complex", "Another Facility");
  expectThrows(
    () => parseIngestionAdapter("health_registry_html", noFeniRows, sourceUrl),
    "health_registry_feni_filter_required",
  );
});

Deno.test("Smart Feni adapter requires explicit Feni district and drops sensitive/non-business records", () => {
  const sourceUrl = "https://smartfeni.com/api/authorized-businesses.json";
  const json = JSON.stringify({
    data: [
      {
        business_name: "Feni Example Pharmacy", type: "business", category: "pharmacy",
        district: "Feni", upazila: "Feni Sadar", public_url: "https://example.org/pharmacy",
        phone: "+8801000000000", email: "owner@example.org", private_note: "never copy",
      },
      { business_name: "Dhaka Pharmacy", type: "business", category: "pharmacy", district: "Dhaka" },
      { business_name: "Unlabelled Area Pharmacy", type: "business", category: "pharmacy" },
      { business_name: "Feni Donor", type: "blood donor", category: "blood donor", district: "Feni" },
      { business_name: "Feni Job Applicant", type: "job applicant", category: "job applicant", district: "Feni" },
    ],
  });
  const snapshot = parseIngestionAdapter("smartfeni_partner_json", json, sourceUrl);
  equal(snapshot.record_count, 1, "only the explicit Feni business row should be retained");
  equal(snapshot.items[0].name, "Feni Example Pharmacy", "business name should be retained");
  equal(snapshot.items[0].source_url, sourceUrl, "record provenance must reference the authorized feed");
  equal(snapshot.items[0].public_url, "https://example.org/pharmacy", "public business link may be retained separately");
  assert(!("phone" in snapshot.items[0]) && !("email" in snapshot.items[0]), "contact fields must not be copied");
  assert(!JSON.stringify(snapshot).includes("private_note"), "unapproved private fields must be dropped");
  assert(snapshot.review_required, "partner-feed results must be queued for manual review");
});

Deno.test("Smart Feni adapter rejects public HTML and invalid JSON", () => {
  expectThrows(
    () => parseIngestionAdapter("smartfeni_partner_json", "<html><body>Public homepage</body></html>", "https://smartfeni.com/"),
    "smartfeni_partner_feed_invalid_json",
  );
  expectThrows(
    () => parseIngestionAdapter("health_registry_html", "<html><body><p>No facility table</p></body></html>", "https://hris.mohfw.gov.bd/public/facility-registry/reports/organization-list"),
    "health_registry_schema_changed",
  );
});
