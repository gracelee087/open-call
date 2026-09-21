# Screenshots

Judges cannot open the Studio or the Context app — `open-call-eu.sanity.studio` redirects
non-members to a login, and the Context screens are behind the organisation. These images are
the only way anyone sees that half of the work, which is most of criterion 3.

Save each as `NN-short-name.png` in this folder.

| # | Shot | Where to take it | Status |
|---|---|---|---|
| 1 | Studio blocks a stated value with no source | | `01-validation.png` |
| 2 | Event form, both field groups | | `02-event-form.png` |
| 3 | Several statements disagreeing on one event | | `03-statements.png` |
| 4 | An event where most claims are "not stated" | | skipped |
| 5 | KB Sources tab | Context → open-call → Sources | `05-kb-sources.png` |
| 6 | KB Entries tab, the outline | Context → open-call → Entries | `06-kb-entries.png` |
| 7 | KB Issues, the Odoo conflict | Context → Issues → Resolved | `07-kb-issues-resolved.png` |
| 8 | The issue in detail: both dates side by side | click into that issue | `08-kb-issue-detail.png` |
| 9 | Instructions tab, all seven active | Context → Instructions | `09-kb-instructions.png` |
| 10 | Agent tool-call trace | localhost:3000, click an example | `10-agent-trace.png`, `10b-agent-queries.png` |
| 11 | An answer citing its sources | same, scroll to the citations | `11-agent-answer.png` |
| 12 | Deployed Studio + Dashboard listing it | manage.sanity.io | `12-sanity-project.png` |

## How to take the ones that need a note

**1 — the validation error.** Studio → Events → Junction 2026 → the *Free to enter* claim. Set
the value to **Yes** and clear the *Where this was read* reference. The form refuses to publish:

> A stated value needs a source. Either set it to "Not stated in the source", or say where you
> read it.

Screenshot the red message, then press undo. This is the schema enforcing the product's one
promise, so it is the single most useful image in the set.

**4 — the silences.** Open **Hackathon Power of Europe — Amsterdam**. Four of its five claims are
*Not stated in the source*, each still pointing at the Luma page it was read on. That is the
three-value design doing its job: the page was read, and it was silent.

**7 to 9 — the Context app.** Earlier I said a resolved issue disappears. It does not — it moves
to **Resolved** and carries a "Reopen and change your mind" button, so these are not urgent. The
Odoo issue is the one the build found on its own: the registration page contradicts itself about
the cancellation cut-off, 13 November in one place and 14 November in another.

**10 and 11 — the agent.** The four examples on the front page are recordings and open instantly,
so no API key is needed for these. Expand *the queries it ran* underneath an answer before
shooting 10 — the GROQ is the evidence that the answer did not come from a keyword search.

**12 — the deployment.** Both the Studio URL and the Dashboard entry showing this project, so it
is clear the dataset is real and hosted rather than local.
