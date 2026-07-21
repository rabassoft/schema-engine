# Security policy

Schema Engine is Public + Experimental software. Security reports are welcome,
but no response-time, remediation-time or support SLA is currently offered.

## Supported release line

Security fixes are evaluated for the current Experimental line:

- `@rabassoft/schema-engine@0.4.x`;
- `@rabassoft/schema-engine-angular@0.4.x`; and
- `@rabassoft/schema-engine-angular-aria@0.2.x`.

Older releases remain immutable and may receive a documented upgrade path
rather than a backport. This policy does not promote any API to Stable.

## Reporting a vulnerability

Do not disclose a suspected vulnerability in a public Issue, Discussion or pull
request. Use GitHub private vulnerability reporting when it is enabled for this
repository. Until that channel is available, email `ricard@rabassoft.com` with:

- the affected package/version and environment;
- reproduction steps or a minimal proof of concept;
- the expected and observed security impact; and
- any suggested mitigation or disclosure constraints.

Do not include live credentials, personal data or third-party confidential
material. Use synthetic values wherever possible. Receipt will be acknowledged
when practical, the report will be validated privately, and disclosure timing
will be coordinated before a public advisory or fix is announced.

## Scope

Reports about Schema Engine source, published packages, build/release integrity
or the official Rabassoft repository are in scope. Vulnerabilities in unrelated
consumer applications, unsupported framework versions, social engineering and
denial-of-service testing against third-party services are out of scope unless
they demonstrate a defect in Schema Engine itself.

Testing must comply with applicable law and must not access data or systems you
do not own or have permission to test.
